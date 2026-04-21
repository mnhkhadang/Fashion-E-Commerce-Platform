import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function BlockedPage() {
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post(`/auth/unlock-request?email=${encodeURIComponent(email)}&reason=${encodeURIComponent(reason)}`)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 no-underline mb-4">
            <span className="w-9 h-9 rounded-lg bg-orange-500 grid place-items-center text-xl">🛍</span>
            <span className="text-orange-500 font-black text-xl">ShopVN</span>
          </Link>
        </div>

        {/* Icon + tiêu đề */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Tài khoản bị khóa</h2>
          <p className="text-sm text-gray-500">
            Tài khoản của bạn đã bị khóa bởi quản trị viên.
            Vui lòng gửi yêu cầu mở khóa bên dưới.
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <span className="text-3xl block mb-2">✅</span>
            <p className="text-green-700 font-semibold mb-1">Yêu cầu đã được gửi!</p>
            <p className="text-sm text-green-600">
              Quản trị viên sẽ xem xét và phản hồi sớm nhất có thể.
            </p>
            <Link
              to="/login"
              className="inline-block mt-4 text-sm text-orange-500 hover:underline"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email tài khoản</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do yêu cầu mở khóa
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Giải thích lý do bạn muốn mở khóa tài khoản..."
                rows={4}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition border-0 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu mở khóa'}
            </button>

            <p className="text-center text-sm text-gray-400">
              <Link to="/login" className="text-orange-500 hover:underline">
                ← Quay lại đăng nhập
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}