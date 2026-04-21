import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../services/api'

const EMPTY_FORM = {
  name: '',
  discountPercent: '',
  startAt: '',
  endAt: '',
  productIds: [],
}

const STATUS_BADGE = {
  UPCOMING: { label: 'Sắp diễn ra', cls: 'bg-yellow-100 text-yellow-700' },
  ACTIVE:   { label: 'Đang chạy',   cls: 'bg-green-100 text-green-600' },
  ENDED:    { label: 'Đã kết thúc', cls: 'bg-gray-100 text-gray-500' },
}

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

export default function AdminSales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => { fetchSales() }, [])

  const fetchSales = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/sales')
      setSales(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        discountPercent: Number(form.discountPercent),
        startAt: form.startAt,
        endAt: form.endAt,
        productIds: form.productIds.length > 0 ? form.productIds : null,
      }
      await api.post('/admin/sales', payload)
      showSuccess('Tạo chương trình sale thành công')
      setShowForm(false)
      setForm(EMPTY_FORM)
      fetchSales()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa sale "${name}"?`)) return
    try {
      await api.delete(`/admin/sales/${id}`)
      showSuccess('Đã xóa sale')
      fetchSales()
    } catch (err) {
      alert(err.response?.data || 'Không thể xóa sale này')
    }
  }

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const stats = {
    total: sales.length,
    active: sales.filter(s => s.status === 'ACTIVE').length,
    upcoming: sales.filter(s => s.status === 'UPCOMING').length,
    ended: sales.filter(s => s.status === 'ENDED').length,
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Quản Lý Sale Platform</h2>
          <button
            onClick={() => { setShowForm(true); setError('') }}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg border-0 cursor-pointer transition"
          >
            + Tạo sale mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng sale', value: stats.total, cls: 'bg-gray-700' },
            { label: 'Đang chạy', value: stats.active, cls: 'bg-green-500' },
            { label: 'Sắp diễn ra', value: stats.upcoming, cls: 'bg-yellow-500' },
            { label: 'Đã kết thúc', value: stats.ended, cls: 'bg-gray-400' },
          ].map((s, i) => (
            <div key={i} className={`${s.cls} text-white rounded-xl p-4`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs opacity-80 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl mb-4">
            ✅ {successMsg}
          </div>
        )}

        {/* Form tạo sale */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">➕ Tạo chương trình sale mới</h3>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tên chương trình *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="VD: Flash Sale 12.12"
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
              <p className="text-xs text-gray-400">
                * Sản phẩm có thể thêm sau khi tạo sale. Shop sẽ opt-in sản phẩm của mình vào sale này.
              </p>
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

        {/* Danh sách sale */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
          </div>
        ) : sales.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">🏷️</p>
            <p className="text-gray-400 text-sm">Chưa có chương trình sale nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sales.map(sale => (
              <div key={sale.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Discount badge */}
                  <div className="w-14 h-14 rounded-xl bg-orange-50 flex flex-col items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-orange-500">-{sale.discountPercent}%</span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-800 text-sm">{sale.name}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[sale.status]?.cls}`}>
                        {STATUS_BADGE[sale.status]?.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDate(sale.startAt)} → {formatDate(sale.endAt)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {sale.products?.length || 0} sản phẩm tham gia
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
                      className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer bg-white transition"
                    >
                      {expandedId === sale.id ? 'Ẩn' : 'Xem SP'}
                    </button>
                    <button
                      onClick={() => handleDelete(sale.id, sale.name)}
                      className="text-xs border border-red-200 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer bg-white transition"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                {/* Expanded product list */}
                {expandedId === sale.id && (
                  <div className="border-t border-gray-50 px-5 py-3 bg-gray-50/50">
                    {!sale.products || sale.products.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">Chưa có sản phẩm tham gia. Shop sẽ tự opt-in.</p>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Sản phẩm tham gia ({sale.products.length})</p>
                        {sale.products.map(p => (
                          <div key={p.productId} className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="text-gray-300">•</span>
                            <span>{p.productName}</span>
                            <span className="text-gray-400 font-mono">/products/{p.productSlug}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}   