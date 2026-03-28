import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Sidebar({ categories, selectedCategory, sortBy, onSortChange }) {
  const navigate = useNavigate()

  // Mặc định mở category cha nào đang chứa selectedCategory
  const [openParents, setOpenParents] = useState(() => {
    const initial = {}
    categories.forEach(parent => {
      const hasSelected =
        parent.name === selectedCategory ||
        parent.children?.some(c => c.name === selectedCategory)
      if (hasSelected) initial[parent.id] = true
    })
    return initial
  })

  const toggleParent = (id) => {
    setOpenParents(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const SORT_OPTIONS = [
    { value: 'default',    label: 'Mặc định' },
    { value: 'sold',       label: 'Bán chạy nhất' },
    { value: 'price_asc',  label: 'Giá: Thấp → Cao' },
    { value: 'price_desc', label: 'Giá: Cao → Thấp' },
  ]

  return (
    <aside className="w-56 shrink-0">
      {/* Danh mục */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <p className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span>☰</span> Tất Cả Danh Mục
        </p>
        <ul className="list-none m-0 p-0 space-y-1">
          {categories.map(parent => {
            const isOpen = !!openParents[parent.id]
            const isParentActive = selectedCategory === parent.name
            const hasChildren = parent.children?.length > 0

            return (
              <li key={parent.id}>
                {/* Category cha — click tên để navigate, click arrow để toggle */}
                <div className="flex items-center justify-between mt-2">
                  <p
                    onClick={() => navigate(`/category/${encodeURIComponent(parent.name)}`)}
                    className={`text-xs font-bold uppercase tracking-wider px-2 cursor-pointer transition flex-1 ${
                      isParentActive
                        ? 'text-orange-500'
                        : 'text-gray-500 hover:text-orange-500'
                    }`}
                  >
                    {parent.name}
                  </p>

                  {/* Toggle arrow — chỉ hiện khi có children */}
                  {hasChildren && (
                    <button
                      onClick={() => toggleParent(parent.id)}
                      className="text-gray-400 hover:text-orange-500 cursor-pointer bg-transparent border-0 px-1 text-xs transition"
                    >
                      {isOpen ? '▲' : '▼'}
                    </button>
                  )}
                </div>

                {/* Category con — chỉ hiện khi isOpen */}
                {hasChildren && isOpen && (
                  <ul className="list-none m-0 p-0 mt-1">
                    {parent.children.map(child => (
                      <li key={child.id}>
                        <button
                          onClick={() => navigate(`/category/${encodeURIComponent(child.name)}`)}
                          className={`w-full text-left px-3 py-1.5 rounded text-sm transition cursor-pointer border-0 ${
                            selectedCategory === child.name
                              ? 'text-orange-500 font-semibold bg-orange-50'
                              : 'text-gray-600 hover:text-orange-500 hover:bg-gray-50 bg-transparent'
                          }`}
                        >
                          {selectedCategory === child.name && (
                            <span className="text-orange-500 mr-1">›</span>
                          )}
                          {child.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Bộ lọc sắp xếp */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <p className="font-bold text-gray-700 mb-3">▼ Bộ Lọc Tìm Kiếm</p>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sắp xếp theo</p>
        <ul className="list-none m-0 p-0 space-y-1">
          {SORT_OPTIONS.map(opt => (
            <li key={opt.value}>
              <button
                onClick={() => onSortChange(opt.value)}
                className={`w-full text-left px-3 py-1.5 rounded text-sm transition cursor-pointer border-0 ${
                  sortBy === opt.value
                    ? 'text-orange-500 font-semibold bg-orange-50'
                    : 'text-gray-600 hover:text-orange-500 hover:bg-gray-50 bg-transparent'
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}