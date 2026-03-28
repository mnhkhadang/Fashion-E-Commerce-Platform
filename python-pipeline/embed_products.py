"""
embed_products.py — chạy 1 lần để:
1. Extract attributes từ product descriptions bằng OpenRouter (free)
2. Insert vào bảng product_attributes (MySQL)
3. Generate embeddings bằng HuggingFace API (768 dims) -> upsert lên Pinecone

Requirements:
    pip install pinecone mysql-connector-python python-dotenv requests
"""

import os
import json
import time
import uuid
import requests
import mysql.connector
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

# ===== Setup clients =====
openrouter_key = os.getenv("OPENROUTER_API_KEY")
hf_key = os.getenv("HF_API_KEY")
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(host=os.getenv("PINECONE_INDEX_HOST"))

conn = mysql.connector.connect(
    host=os.getenv("DB_HOST", "localhost"),
    database=os.getenv("DB_NAME", "WebBanHang"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", "123456Aa"),
    charset="utf8mb4"
)
cursor = conn.cursor(dictionary=True)

# ===== Step 1: Lấy products chưa embed =====
cursor.execute("""
    SELECT HEX(p.id) as id, p.name, p.description, c.name as category_name
    FROM products p JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_attributes pa ON pa.product_id = p.id
    WHERE pa.id IS NULL AND p.active = 1
""")
products = cursor.fetchall()

# ===== TEST MODE =====
TEST_MODE = False
if TEST_MODE:
    products = products[:5]
    print(f"TEST MODE: chỉ xử lý {len(products)} sản phẩm")
else:
    print(f"Found {len(products)} products to embed")

# ===== Config =====
# 768 dims — khớp với Pinecone index
HF_MODEL = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL}/pipeline/feature-extraction"

OPENROUTER_MODELS = [
    "openrouter/free",
]


# ===== Helper: Extract attributes =====
def extract_attributes(name: str, description: str, category: str) -> dict:
    prompt = f"""Phan tich san pham thoi trang sau va tra ve JSON hop le (khong markdown, khong giai thich):
{{
  "material": "chat lieu chinh (cotton/polyester/linen/denim/...)",
  "style": "phong cach (casual/formal/sport/vintage/...)",
  "occasion": "dip mac (di lam/di bien/dao pho/tiec/...)",
  "season": "mua (he/dong/all-season)",
  "ai_summary": "1 cau mo ta ngan cho chatbot tu van"
}}
Ten: {name}
Danh muc: {category}
Mo ta: {description or 'Khong co mo ta'}"""

    last_error = None

    for model in OPENROUTER_MODELS:
        for attempt in range(5):
            try:
                res = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {openrouter_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:9090",
                        "X-Title": "Fashion Shop Pipeline"
                    },
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 400,
                        "temperature": 0.3
                    },
                    timeout=30
                )

                if res.status_code == 429:
                    wait = 30 * (attempt + 1)
                    print(f"  Rate limited ({model}), waiting {wait}s... (attempt {attempt+1}/5)")
                    time.sleep(wait)
                    last_error = f"429 from {model}"
                    continue

                if res.status_code != 200:
                    print(f"  Error ({model}): {res.status_code} {res.text[:100]}")
                    last_error = f"{res.status_code} from {model}"
                    break

                choices = res.json().get("choices", [])
                if not choices:
                    print(f"  Empty choices ({model}), retrying...")
                    last_error = "empty choices"
                    time.sleep(5)
                    continue

                content = choices[0].get("message", {}).get("content")
                if not content:
                    print(f"  Null content ({model}), retrying...")
                    last_error = "null content"
                    time.sleep(8)
                    continue

                content = content.strip()
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]

                return json.loads(content.strip())

            except json.JSONDecodeError as e:
                print(f"  JSON parse error ({model}): {e}")
                last_error = e
                time.sleep(3)
                continue
            except requests.exceptions.Timeout:
                print(f"  Timeout ({model}), retrying...")
                last_error = "timeout"
                time.sleep(5)
            except Exception as e:
                print(f"  Unexpected error ({model}): {e}")
                last_error = e
                break

        if last_error:
            print(f"  Switching from {model}...")
            time.sleep(5)
            continue

    raise Exception(f"All models failed: {last_error}")


# ===== Helper: Embed text (768 dims) =====
def get_embedding(text: str) -> list:
    for attempt in range(3):
        try:
            headers = {"Content-Type": "application/json"}
            if hf_key:
                headers["Authorization"] = f"Bearer {hf_key}"

            res = requests.post(
                HF_API_URL,
                headers=headers,
                json={"inputs": text},
                timeout=60
            )

            if res.status_code == 503:
                print(f"  HF model loading, waiting 20s...")
                time.sleep(20)
                continue

            if res.status_code != 200:
                raise Exception(f"HF API error: {res.status_code} {res.text[:150]}")

            result = res.json()

            if isinstance(result, list):
                if len(result) > 0 and isinstance(result[0], list):
                    if isinstance(result[0][0], list):
                        # [[[tokens, dims]]] → mean pool
                        tokens = result[0]
                        dims = len(tokens[0])
                        return [sum(t[i] for t in tokens) / len(tokens)
                                for i in range(dims)]
                    return result[0]  # [[embedding]]
                return result  # [embedding]

            raise Exception(f"Unexpected HF format: {type(result)}")

        except Exception as e:
            if attempt < 2:
                print(f"  Embedding error (attempt {attempt+1}): {e}")
                time.sleep(5)
            else:
                raise


# ===== Main pipeline =====
success_count = 0
error_count = 0

for i, product in enumerate(products):
    product_id_hex = product["id"]
    product_uuid = str(uuid.UUID(product_id_hex.lower()))
    name = product["name"]
    description = product["description"] or ""
    category = product["category_name"]

    print(f"[{i+1}/{len(products)}] Processing: {name[:50]}...")

    try:
        # 1. Extract attributes
        attrs = extract_attributes(name, description, category)

        # 2. Insert vào MySQL
        pinecone_id = f"product-{product_id_hex.lower()}"
        cursor.execute("""
            INSERT INTO product_attributes
                (product_id, material, style, occasion, season, ai_summary, pinecone_id, embedded_at)
            VALUES (UNHEX(%s), %s, %s, %s, %s, %s, %s, NOW())
            ON DUPLICATE KEY UPDATE
                material=VALUES(material), style=VALUES(style),
                occasion=VALUES(occasion), season=VALUES(season),
                ai_summary=VALUES(ai_summary), pinecone_id=VALUES(pinecone_id),
                embedded_at=NOW()
        """, (
            product_id_hex,
            attrs.get("material"), attrs.get("style"),
            attrs.get("occasion"), attrs.get("season"),
            attrs.get("ai_summary"), pinecone_id
        ))
        conn.commit()

        # 3. Generate embedding (768 dims)
        embed_text = (
            f"{name}. {category}. "
            f"{attrs.get('ai_summary', '')}. "
            f"{description[:200]}"
        )
        vector = get_embedding(embed_text)

        # 4. Upsert Pinecone
        index.upsert(vectors=[{
            "id": pinecone_id,
            "values": vector,
            "metadata": {
                "product_id": product_uuid,
                "name": name,
                "category": category,
                "occasion": attrs.get("occasion", ""),
                "season": attrs.get("season", "")
            }
        }])

        success_count += 1
        print(f"  OK: {attrs.get('ai_summary', '')[:60]}")
        time.sleep(3)

    except Exception as e:
        error_count += 1
        print(f"  FAILED: {e}")
        conn.rollback()
        continue

cursor.close()
conn.close()
print(f"\nDone! Success: {success_count}, Error: {error_count}")