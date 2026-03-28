import { useNavigate } from 'react-router-dom'

const TOP_KEYWORDS = [
  'Áo thun', 'Quần jeans', 'Giày sneaker', 'Túi xách',
  'Váy đầm', 'Áo khoác', 'Phụ kiện', 'Đồng hồ',
]

/**
 * TopSearch — danh sách từ khóa tìm kiếm nổi bật
 * Nhận onSearch prop để trigger search ở parent (Home.jsx)
 */
export default function TopSearch({ onSearch }) {
  const navigate = useNavigate()

  const handleClick = (keyword) => {
    if (onSearch) {
      onSearch(keyword)
    } else {
      navigate(`/category/${encodeURIComponent(keyword)}`)
    }
  }

  return (
    <div className="bg-white rounded-lg px-5 py-3 mb-4 shadow-sm flex items-center gap-3 flex-wrap">
      <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase shrink-0">
        Tìm kiếm phổ biến:
      </span>
      {TOP_KEYWORDS.map(kw => (
        <button
          key={kw}
          onClick={() => handleClick(kw)}
          className="text-xs text-gray-600 bg-gray-100 hover:bg-orange-100 hover:text-orange-600 px-3 py-1 rounded-full transition cursor-pointer border-0"
        >
          {kw}
        </button>
      ))}
    </div>
  )
}