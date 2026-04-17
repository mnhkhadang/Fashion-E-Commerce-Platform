import { useState, useEffect } from 'react'
import ShopSidebar from '../../components/shop/ShopSidebar'
// FIX: import chữ thường — tránh crash trên Linux/Mac (case-sensitive filesystem)
import shopService from '../../services/shopService'

export default function ShopProfile() {
  const [shop, setShop] = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', address: '', phone: '', avatar: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    shopService.getMyShop()
      .then(res => {
        setShop(res.data)
        setForm({
          name: res.data.name || '',
          description: res.data.description || '',
          address: res.data.address || '',
          phone: res.data.phone || '',
          avatar: res.data.avatar || '',
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!form.name.trim()) { alert('Tên shop không được để trống'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await shopService.updateShop(form)
      setShop(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Có lỗi xảy ra khi cập nhật hồ sơ')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ShopSidebar />
        <div className="flex-1 flex justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"></div>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ShopSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-10 py-10">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8">Thiết Lập Hồ Sơ</h2>

          <div className="bg-white rounded-2xl shadow-md p-8 mb-8 border border-gray-100">

            {/* Avatar Section */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
              <div className="w-24 h-24 rounded-full bg-orange-100 overflow-hidden shrink-0 flex items-center justify-center border-4 border-white shadow-md">
                {form.avatar
                  ? <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-4xl">🏪</span>
                }
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-800">{shop?.name || 'Cửa hàng của bạn'}</h3>
                <p className="text-base text-gray-400 font-medium">{shop?.ownerEmail}</p>
                <span className={`text-xs px-3 py-1 rounded-full mt-2 inline-block font-black uppercase tracking-wider ${
                  shop?.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                }`}>
                  {shop?.active ? '● Đang hoạt động' : '● Tạm ngưng'}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Form */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">Tên cửa hàng *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-gray-600 mb-2 block">Số điện thoại</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-600 mb-2 block">URL ảnh đại diện</label>
                  <input
                    type="text"
                    value={form.avatar}
                    onChange={e => setForm(p => ({ ...p, avatar: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">Địa chỉ kinh doanh</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">Giới thiệu shop</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={4}
                  placeholder="Chia sẻ câu chuyện hoặc phương châm bán hàng..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-orange-500 hover:bg-orange-600 text-white text-base font-bold px-10 py-3.5 rounded-xl transition shadow-lg shadow-orange-100 cursor-pointer border-0 disabled:opacity-50"
              >
                {submitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
              </button>
              {saved && (
                <div className="flex items-center gap-2 text-green-600 font-bold">
                  <span>✓</span> Cập nhật thành công!
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-50">
              <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Ngày gia nhập</p>
              <p className="text-xl font-black text-gray-700">
                {shop?.createdAt
                  ? new Date(shop.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-50">
              <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Email quản trị</p>
              <p className="text-xl font-black text-gray-700 truncate">{shop?.ownerEmail || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}