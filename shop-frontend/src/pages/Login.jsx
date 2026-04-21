import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.message

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/auth/login', { email, password })
      const { accessToken, refreshToken, username, roles } = response.data

      sessionStorage.setItem('accessToken', accessToken)
      sessionStorage.setItem('refreshToken', refreshToken)

      let shopName = null
      if (roles.includes('ROLE_SHOP')) {
        try {
          const shopRes = await api.get('/shop/profile')
          shopName = shopRes.data?.name || null
        } catch { /* ignore */ }
      }

      login({ email, username, roles, shopName }, accessToken, refreshToken)

      if (roles.includes('ROLE_ADMIN')) navigate('/admin')
      else if (roles.includes('ROLE_SHOP')) navigate('/shop')
      else navigate('/')
    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.message || ''
      if (status === 403 && message.includes('khóa')) {
        navigate('/blocked')
        return
      }
      setError(message || 'Email hoặc mật khẩu không chính xác')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Left Side: Illustration & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20"></div>
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="inline-flex items-center gap-3 mb-8 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
             <span className="text-3xl">🛍️</span>
             <span className="text-white font-black text-2xl tracking-tighter">ShopVN</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-6 uppercase tracking-tighter">
            Trải nghiệm mua sắm <span className="text-indigo-400">thông minh</span> với AI
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            Hệ thống quản trị bán hàng hiện đại, tích hợp trợ lý ảo RAG giúp bạn tối ưu hóa doanh thu và chăm sóc khách hàng tự động.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-indigo-400 font-black text-2xl">01.</p>
                <p className="text-white font-bold text-sm uppercase">Phân tích dòng tiền</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-indigo-400 font-black text-2xl">02.</p>
                <p className="text-white font-bold text-sm uppercase">AI Chatbot 24/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20 bg-[#f8fafc]">
        <div className="w-full max-w-[440px]">
          {/* Logo mobile only */}
          <div className="lg:hidden text-center mb-8">
             <Link to="/" className="inline-flex items-center gap-2 no-underline">
                <span className="text-2xl bg-indigo-600 w-10 h-10 flex items-center justify-center rounded-xl shadow-lg shadow-indigo-200">🛍️</span>
                <span className="text-slate-900 font-black text-2xl tracking-tighter">ShopVN</span>
             </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-3">Chào mừng trở lại!</h2>
            <p className="text-slate-400 font-medium">Vui lòng nhập thông tin để truy cập hệ thống</p>
          </div>

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 animate-fadeIn">
              <span>✨</span> {successMessage}
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 animate-fadeIn">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Địa chỉ Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-[1.25rem] px-5 py-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mật khẩu</label>
                <Link to="/forgot-password" size="sm" className="text-[11px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-wider no-underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-[1.25rem] px-5 py-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-[1.25rem] transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Đang xác thực...</span>
                </div>
              ) : 'Đăng nhập ngay'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 font-medium text-sm">
              Bạn chưa có tài khoản?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-wider text-xs ml-1 no-underline">
                Tạo tài khoản mới
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}