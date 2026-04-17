import requests, os
from dotenv import load_dotenv
load_dotenv()

res = requests.get(
    "https://openrouter.ai/api/v1/models",
    headers={"Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}"}
)

models = res.json().get("data", [])
free_models = [m["id"] for m in models if ":free" in m["id"]]
print(f"Free models available ({len(free_models)}):")
for m in free_models:
    print(f"  - {m}")