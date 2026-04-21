import { useState, useEffect } from 'react'
import ShopSidebar from '../../components/shop/ShopSidebar'
import api from '../../services/api'

const EMPTY_FORM = { name: '', discountPercent: '', startAt: '', endAt: '' }

const STATUS_BADGE = {
  UPCOMING: { label: 'Sắp diễn ra', cls: 'bg-yellow-100 text-yellow-700' },
  ACTIVE:   { label: 'Đang chạy',   cls: 'bg-green-100 text-green-600' },
  ENDED:    { label: 'Đã kết thúc', cls: 'bg-gray-100 text-gray-500' },
}

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

export default function ShopSales() {
  const [tab, setTab] = useState('my') // 'my' | 'platform'
  const [mySales, setMySales] = useState([])
  const [platformSales, setPlatformSales] = useState([])
  const [myProducts, setMyProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  // Opt-in state
  const [optInSaleId, setOptInSaleId] = useState(null)
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [optInSubmitting, setOptInSubmitting] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [mySalesRes, platformRes, productsRes] = await Promise.all([
        api.get('/shop/sales'),
        api.get('/shop/sales/platform'),
        api.get('/products/my'),
      ])
      setMySales(mySalesRes.data)
      setPlatformSales(platformRes.data)
      setMyProducts(productsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSale = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        discountPercent: Number(form.discountPercent),
        startAt: form.startAt,
        endAt: form.endAt,
        productIds: null,
      }
      await api.post('/shop/sales', payload)
      showSuccess('Tạo chương trình sale thành công')
      setShowForm(false)
      setForm(EMPTY_FORM)
      const res = await api.get('/shop/sales')
      setMySales(res.data)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOptIn = async () => {
    if (selectedProductIds.length === 0) return
    setOptInSubmitting(true)
    try {
      await api.post(`/shop/sales/${optInSaleId}/opt-in`, selectedProductIds)
      showSuccess(`Đã thêm ${selectedProductIds.length} sản phẩm vào sale`)
      setOptInSaleId(null)
      setSelectedProductIds([])
      const res = await api.get('/shop/sales/platform')
      setPlatformSales(res.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setOptInSubmitting(false)
    }
  }

  const handleOptOut = async (saleId, productId, productName) => {
    if (!window.confirm(`Xóa "${productName}" khỏi sale?`)) return
    try {
      await api.delete(`/shop/sales/${saleId}/products/${productId}`)
      showSuccess('Đã xóa sản phẩm khỏi sale')
      fetchAll()
    } catch (err) {
      alert(err.response?.data || 'Có lỗi xảy ra')
    }
  }

  const toggleProduct = (id) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <ShopSidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Quản Lý Sale</h2>
          {tab === 'my' && (
            <button
              onClick={() => { setShowForm(true); setError('') }}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg border-0 cursor-pointer transition"
            >
              + Tạo sale riêng
            </button>
          )}
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl mb-4">
            ✅ {successMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6 w-fit">
          {[
            { key: 'my', label: `Sale của tôi (${mySales.length})` },
            { key: 'platform', label: `Sale Platform (${platformSales.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-sm px-4 py-2 rounded-lg border-0 cursor-pointer transition ${
                tab === t.key
                  ? 'bg-orange-500 text-white font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 bg-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form tạo sale riêng */}
        {showForm && tab === 'my' && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">➕ Tạo sale riêng</h3>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateSale} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tên chương trình *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="VD: Sale cuối tuần"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Giảm giá (%) *</label>
                  <input
                    type="number"
                    value={form.discountPercent}
                    onChange={e => setForm(p => ({ ...p, discountPercent: e.target.value }))}
                    placeholder="1 - 100"
                    min={1} max={100}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Bắt đầu *</label>
                  <input
                    type="datetime-local"
                    value={form.startAt}
                    onChange={e => setForm(p => ({ ...p, startAt: e.target.value }))}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Kết thúc *</label>
                  <input
                    type="datetime-local"
                    value={form.endAt}
                    onChange={e => setForm(p => ({ ...p, endAt: e.target.value }))}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">* Sản phẩm thêm vào sale qua trang Sản phẩm sau khi tạo.</p>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-5 py-2 rounded-lg border-0 cursor-pointer disabled:opacity-50 transition"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo sale'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError('') }}
                  className="border border-gray-300 text-gray-500 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 cursor-pointer bg-white transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Opt-in modal */}
        {optInSaleId && (
          <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">
                Chọn sản phẩm tham gia sale
              </h3>
              <button
                onClick={() => { setOptInSaleId(null); setSelectedProductIds([]) }}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer text-lg"
              >✕</button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5 mb-4">
              {myProducts.filter(p => p.active).map(p => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">
                      {p.price?.toLocaleString('vi-VN')}đ
                      {p.salePrice && (
                        <span className="ml-2 text-green-500">
                          → {p.salePrice?.toLocaleString('vi-VN')}đ (đang sale)
                        </span>
                      )}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleOptIn}
                disabled={selectedProductIds.length === 0 || optInSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-5 py-2 rounded-lg border-0 cursor-pointer disabled:opacity-50 transition"
              >
                {optInSubmitting ? 'Đang thêm...' : `Thêm ${selectedProductIds.length} sản phẩm`}
              </button>
              <p className="text-xs text-gray-400">Đã chọn {selectedProductIds.length} sản phẩm</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Tab: Sale của tôi */}
            {tab === 'my' && (
              <div className="space-y-3">
                {mySales.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <p className="text-4xl mb-3">🏷️</p>
                    <p className="text-gray-400 text-sm">Chưa có sale nào. Tạo sale riêng cho shop của bạn!</p>
                  </div>
                ) : (
                  mySales.map(sale => (
                    <div key={sale.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className="w-14 h-14 rounded-xl bg-orange-50 flex flex-col items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-orange-500">-{sale.discountPercent}%</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-gray-800 text-sm">{sale.name}</p>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[sale.status]?.cls}`}>
                              {STATUS_BADGE[sale.status]?.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{formatDate(sale.startAt)} → {formatDate(sale.endAt)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{sale.products?.length || 0} sản phẩm</p>
                        </div>
                        <button
                          onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
                          className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer bg-white transition"
                        >
                          {expandedId === sale.id ? 'Ẩn' : 'Xem SP'}
                        </button>
                      </div>
                      {expandedId === sale.id && (
                        <div className="border-t border-gray-50 px-5 py-3 bg-gray-50/50">
                          {!sale.products || sale.products.length === 0 ? (
                            <p className="text-xs text-gray-400 py-1">Chưa có sản phẩm. Thêm từ trang Sản phẩm.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {sale.products.map(p => (
                                <div key={p.productId} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">{p.productName}</span>
                                  <button
                                    onClick={() => handleOptOut(sale.id, p.productId, p.productName)}
                                    className="text-red-400 hover:text-red-500 bg-transparent border-0 cursor-pointer"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Platform sale */}
            {tab === 'platform' && (
              <div className="space-y-3">
                {platformSales.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <p className="text-4xl mb-3">🎯</p>
                    <p className="text-gray-400 text-sm">Hiện không có sale platform nào đang chạy.</p>
                  </div>
                ) : (
                  platformSales.map(sale => (
                    <div key={sale.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className="w-14 h-14 rounded-xl bg-green-50 flex flex-col items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-green-500">-{sale.discountPercent}%</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-gray-800 text-sm">{sale.name}</p>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                              PLATFORM
                            </span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[sale.status]?.cls}`}>
                              {STATUS_BADGE[sale.status]?.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{formatDate(sale.startAt)} → {formatDate(sale.endAt)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{sale.products?.length || 0} sản phẩm tham gia</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setOptInSaleId(sale.id)
                              setSelectedProductIds([])
                            }}
                            className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg border-0 cursor-pointer transition"
                          >
                            + Opt-in SP
                          </button>
                          <button
                            onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
                            className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer bg-white transition"
                          >
                            {expandedId === sale.id ? 'Ẩn' : 'Xem SP'}
                          </button>
                        </div>
                      </div>
                      {expandedId === sale.id && sale.products?.length > 0 && (
                        <div className="border-t border-gray-50 px-5 py-3 bg-gray-50/50">
                          <p className="text-xs font-semibold text-gray-500 mb-2">SP đang tham gia ({sale.products.length})</p>
                          <div className="space-y-1.5">
                            {sale.products.map(p => (
                              <div key={p.productId} className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">{p.productName}</span>
                                <button
                                  onClick={() => handleOptOut(sale.id, p.productId, p.productName)}
                                  className="text-red-400 hover:text-red-500 bg-transparent border-0 cursor-pointer"
                                >
                                  Opt-out
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}