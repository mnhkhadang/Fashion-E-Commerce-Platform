import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/home/ProductCard'

export default function CategoryPage() {
  const { categoryName } = useParams()
  const navigate = useNavigate()
  const decoded = decodeURIComponent(categoryName || '')

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('default')

  useEffect(() => {
    console.log('categoryName from params:', categoryName)
    console.log('decoded:', decoded)
    const fetchData = async () => {
      setLoading(true)
      try {
        const url = `/api/products/category?categoryName=${encodeURIComponent(decoded)}`
        console.log('fetching URL:', url)
        const [productsRes, categoriesRes] = await Promise.all([
          api.get(url),
          api.get('/api/categories/tree'),
        ])
        console.log('products:', productsRes.data)
        console.log('categories:', categoriesRes.data)
        setProducts(productsRes.data)
        setCategories(categoriesRes.data)
      } catch(e) {
        console.error('Lỗi:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
}, [decoded])

  const sorted = [...products]
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'sold') return b.sold - a.sold
      return 0
    })

  return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="max-w-6xl mx-auto px-4 py-5 flex gap-4">

        {/* Sidebar */}
        <aside className="w-56 shrink-0">
          {/* Danh mục */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <p className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>☰</span> Tất Cả Danh Mục
            </p>
            <ul className="list-none m-0 p-0 space-y-1">
              {categories.map(parent => (
                <li key={parent.id}>
                  {/* Category cha */}
                  <p
                    className={`text-xs font-bold uppercase tracking-wider mt-3 mb-1 px-2 cursor-pointer transition ${
                      decoded === parent.name
                        ? 'text-orange-500'
                        : 'text-gray-500 hover:text-orange-500'
                    }`}
                    onClick={() => navigate(`/category/${encodeURIComponent(parent.name)}`)}
                  >
                    {parent.name}
                  </p>
                  {/* Category con */}
                  <ul className="list-none m-0 p-0">
                    {parent.children?.map(child => (
                      <li key={child.id}>
                        <button
                          onClick={() => navigate(`/category/${encodeURIComponent(child.name)}`)}
                          className={`w-full text-left px-3 py-1.5 rounded text-sm transition cursor-pointer border-0 ${
                            decoded === child.name
                              ? 'text-orange-500 font-semibold bg-orange-50'
                              : 'text-gray-600 hover:text-orange-500 hover:bg-gray-50 bg-transparent'
                          }`}
                        >
                          {decoded === child.name && <span className="text-orange-500 mr-1">›</span>}
                          {child.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          {/* Bộ lọc sắp xếp */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="font-bold text-gray-700 mb-3">▼ Bộ Lọc Tìm Kiếm</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sắp xếp theo</p>
            <ul className="list-none m-0 p-0 space-y-1">
              {[
                { value: 'default', label: 'Mặc định' },
                { value: 'sold', label: 'Bán chạy nhất' },
                { value: 'price_asc', label: 'Giá: Thấp → Cao' },
                { value: 'price_desc', label: 'Giá: Cao → Thấp' },
              ].map(opt => (
                <li key={opt.value}>
                  <button
                    onClick={() => setSortBy(opt.value)}
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

        {/* Main content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm px-4 py-3 mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500 m-0">
              Kết quả cho <strong className="text-gray-800">{decoded}</strong>
              <span className="ml-2 text-orange-500">({sorted.length} sản phẩm)</span>
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Sắp xếp theo</span>
              {['Phổ Biến', 'Mới Nhất', 'Bán Chạy'].map(label => (
                <button
                  key={label}
                  className="px-3 py-1 rounded border border-gray-200 hover:border-orange-400 hover:text-orange-500 transition text-xs cursor-pointer bg-white"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Products */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <span className="text-5xl block mb-4">🔍</span>
              <p>Không có sản phẩm nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {sorted.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}