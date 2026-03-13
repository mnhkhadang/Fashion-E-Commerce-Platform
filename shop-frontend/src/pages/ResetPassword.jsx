import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Link không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu lại.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    if (form.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/auth/reset-password', {
        token,
        newPassword: form.newPassword,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data || 'Token không hợp lệ hoặc đã hết hạn')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 no-underline mb-4">
            <span className="w-9 h-9 rounded-lg bg-orange-500 grid place-items-center text-xl">🛍</span>
            <span className="text-orange-500 font-black text-xl">ShopVN</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-700">Đặt lại mật khẩu</h2>
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4 text-sm">
              Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...
            </div>
            <Link to="/login" className="text-orange-500 hover:underline text-sm font-medium no-underline">
              Đăng nhập ngay
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
            )}
            {!token ? null : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition border-0 cursor-pointer disabled:opacity-50">
                  {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
                </button>
              </form>
            )}
            <p className="text-center text-sm text-gray-500 mt-4">
              <Link to="/login" className="text-orange-500 hover:underline font-medium no-underline">
                ← Quay lại đăng nhập
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}