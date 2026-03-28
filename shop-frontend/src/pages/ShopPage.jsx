import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/home/ProductCard'
import StatusBadge from '../components/ui/StatusBadge'
import reportService from '../services/reportService'
import shopService from '../services/shopService'
import productService from '../services/productService'
import { useAuth } from '../context/useAuth'

export default function ShopPage() {
  const { shopName } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const decoded = decodeURIComponent(shopName || '')

  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [reportModal, setReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reporting, setReporting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [shopRes, productsRes] = await Promise.all([
          shopService.getByName(decoded),
          productService.getByShop(decoded),
        ])
        setShop(shopRes.data)
        setProducts(productsRes.data)
      } catch (e) {
        console.error('Lỗi tải shop:', e)
      } finally {
        setLoading(false)
      }
    }
    if (decoded) fetchData()
  }, [decoded])

  const handleReport = async () => {
    if (!reportReason.trim()) { alert('Vui lòng nhập lý do báo cáo'); return }
    setReporting(true)
    try {
      await reportService.reportShop(shop.id, reportReason.trim())
      setReportModal(false)
      setReportReason('')
      alert('Đã gửi báo cáo thành công')
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setReporting(false)
    }
  }

  const sorted = [...products]
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'sold') return b.sold - a.sold
      if (sortBy === 'rating') return (b.averageRating ?? 0) - (a.averageRating ?? 0)
      return 0
    })

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
        </div>
      </div>
    )

  if (!shop)
    return (
      <div className="min-h-screen bg-gray-100">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="text-center py-20 text-gray-400">Không tìm thấy shop</div>
        <Footer />
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Shop banner */}
      <div className="bg-white shadow-sm mb-4">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-orange-500 border-2 border-orange-200 shrink-0 overflow-hidden">
              {shop.avatar
                ? <img src={shop.avatar} alt={shop.name} className="w-full h-full object-cover" />
                : shop.name?.charAt(0).toUpperCase()
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-800">{shop.name}</h1>
                {!shop.active && (
                  <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">
                    Tạm đóng cửa
                  </span>
                )}
              </div>

              {shop.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{shop.description}</p>
              )}

              <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                {shop.address && (
                  <span className="flex items-center gap-1">
                    📍 {shop.address}
                  </span>
                )}
                {shop.phone && (
                  <span className="flex items-center gap-1">
                    📞 {shop.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  📦 {products.length} sản phẩm
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              {user && user.roles?.includes('ROLE_USER') && (
                <button
                  onClick={() => { setReportModal(true); setReportReason('') }}
                  className="text-xs border border-red-300 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer bg-white transition"
                >
                  🚩 Báo cáo shop
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {/* Filter bar */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <strong className="text-gray-700">{sorted.length}</strong> sản phẩm
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Sắp xếp:</span>
            {[
              { value: 'default',    label: 'Mặc định' },
              { value: 'sold',       label: 'Bán chạy' },
              { value: 'rating',     label: 'Đánh giá' },
              { value: 'price_asc',  label: 'Giá ↑' },
              { value: 'price_desc', label: 'Giá ↓' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                  sortBy === opt.value
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-orange-400 hover:text-orange-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-400 text-sm">Shop chưa có sản phẩm nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {sorted.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Modal báo cáo shop */}
      {reportModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={e => { if (e.target === e.currentTarget) setReportModal(false) }}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold text-gray-700 mb-1">Báo cáo shop</h3>
            <p className="text-xs text-gray-400 mb-3">
              Báo cáo shop <strong>{shop.name}</strong> vi phạm
            </p>
            <label className="text-xs text-gray-500 mb-1 block">Lý do *</label>
            <textarea
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              rows={3}
              placeholder="Ví dụ: Hàng giả, lừa đảo, nội dung không phù hợp..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReport}
                disabled={reporting}
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-5 py-2 rounded-lg cursor-pointer border-0 disabled:opacity-50"
              >
                {reporting ? '...' : 'Gửi báo cáo'}
              </button>
              <button
                onClick={() => setReportModal(false)}
                className="border border-gray-300 text-gray-500 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 cursor-pointer bg-white"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}