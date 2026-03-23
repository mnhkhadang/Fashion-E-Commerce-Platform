import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.confirmPassword !== form.password) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    setLoading(true)
    try {
      // FIX: bỏ prefix /api
      await api.post('/auth/register/user', {
        username: form.username,
        email: form.email,
        password: form.password,
      })
      navigate('/login', { state: { message: 'Đăng ký thành công. Vui lòng đăng nhập.' } })
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data || 'Đăng ký thất bại, vui lòng thử lại.'
      )
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
          <h2 className="text-2xl font-bold text-gray-700">Đăng ký tài khoản</h2>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Tên người dùng', key: 'username', type: 'text',     placeholder: 'Nguyễn Văn A' },
            { label: 'Email',          key: 'email',    type: 'email',    placeholder: 'example@gmail.com' },
            { label: 'Mật khẩu',       key: 'password', type: 'password', placeholder: '••••••••' },
            { label: 'Xác nhận mật khẩu', key: 'confirmPassword', type: 'password', placeholder: '••••••••' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder={placeholder}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition border-0 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-orange-500 hover:underline font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}