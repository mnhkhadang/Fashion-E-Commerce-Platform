import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import api from '../services/api'

const EMPTY_FORM = {
  shopName: '', description: '', address: '', phone: '', avatar: '',
}

export default function RegisterShop() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSubmit = async () => {
    if (!form.shopName) { alert('Vui lòng nhập tên shop'); return }
    setSubmitting(true)
    try {
      await api.post('/api/shop-registrations', form)
      setSubmitted(true)
    } catch (err) {
      alert(err.response?.data || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="text-lg font-bold text-gray-700 mb-2">Đơn đăng ký đã được gửi!</h2>
        <p className="text-sm text-gray-500 mb-6">
          Chúng tôi sẽ xem xét đơn của bạn trong vòng 1-3 ngày làm việc.
          Bạn có thể kiểm tra trạng thái đơn trong trang hồ sơ.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/')}
            className="border border-gray-300 text-gray-500 text-sm px-5 py-2 rounded hover:bg-gray-50 cursor-pointer bg-white">
            Về trang chủ
          </button>
          <button onClick={() => navigate('/register-shop/status')}
            className="bg-orange-500 text-white text-sm px-5 py-2 rounded hover:bg-orange-600 cursor-pointer border-0">
            Xem trạng thái
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="max-w-2xl mx-auto px-4 py-5">
        <h2 className="text-lg font-bold text-gray-700 mb-1">Đăng Ký Bán Hàng</h2>
        <p className="text-sm text-gray-400 mb-4">Điền thông tin để gửi đơn đăng ký. Admin sẽ xem xét và phê duyệt.</p>

        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tên shop *</label>
              <input type="text" value={form.shopName}
                onChange={e => setForm(p => ({ ...p, shopName: e.target.value }))}
                placeholder="Tên shop của bạn..."
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Số điện thoại</label>
                <input type="text" value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="0901234567"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">URL Avatar</label>
                <input type="text" value={form.avatar}
                  onChange={e => setForm(p => ({ ...p, avatar: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Địa chỉ</label>
              <input type="text" value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                placeholder="Địa chỉ shop..."
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Mô tả shop</label>
              <textarea value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3} placeholder="Giới thiệu về shop của bạn..."
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none" />
            </div>
          </div>

          <div className="mt-4 p-3 bg-orange-50 rounded text-xs text-orange-600">
            ℹ️ Đơn đăng ký sẽ được admin xem xét trong vòng 1-3 ngày làm việc.
            Sau khi được duyệt, tài khoản của bạn sẽ được cấp quyền bán hàng.
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded text-sm font-semibold transition cursor-pointer border-0 disabled:opacity-50">
            {submitting ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}