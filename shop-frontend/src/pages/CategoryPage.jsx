import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/home/ProductCard'
import Sidebar from '../components/category/Sidebar'
import productService from '../services/productService'
import categoryService from '../services/categoryService'

export default function CategoryPage() {
  const { categoryName } = useParams()
  const decoded = decodeURIComponent(categoryName || '')

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('default')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productService.getByCategory(decoded),
          categoryService.getTree(),
        ])
        setProducts(productsRes.data)
        setCategories(categoriesRes.data)
      } catch (e) {
        console.error('Lỗi tải category:', e)
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

        {/* Sidebar — load toàn bộ categories từ getTree()
            Khi click bất kỳ danh mục nào → navigate /category/:name
            được xử lý trong Sidebar.jsx */}
        <Sidebar
          categories={categories}
          selectedCategory={decoded}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Main content */}
        <div className="flex-1">
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

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <span className="text-5xl block mb-4">🔍</span>
              <p>Không có sản phẩm nào trong danh mục này</p>
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