import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

const OAUTH2_BASE = 'http://localhost:9090/oauth2/authorization'

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
    <div className="min-h-screen bg-white flex font-sans">
      {/* Left Side: Illustration & Branding (Đồng bộ với Login) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20"></div>
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="inline-flex items-center gap-3 mb-8 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
             <span className="text-3xl">🛍️</span>
             <span className="text-white font-black text-2xl tracking-tighter">ShopVN</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-6 uppercase tracking-tighter">
            Gia nhập cộng đồng <span className="text-indigo-400">mua sắm</span> 4.0
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            Kiến tạo không gian bán hàng chuyên nghiệp và trải nghiệm mua sắm cá nhân hóa với công nghệ RAG AI tiên tiến nhất.
          </p>
          
          <div className="mt-12 space-y-4 text-left inline-block">
            <div className="flex items-center gap-4 text-white">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">✓</span>
                <p className="font-bold text-sm uppercase tracking-wider">Tạo cửa hàng chỉ trong 30 giây</p>
            </div>
            <div className="flex items-center gap-4 text-white">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">✓</span>
                <p className="font-bold text-sm uppercase tracking-wider">Tích hợp AI hỗ trợ bán hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20 bg-[#f8fafc] overflow-y-auto">
        <div className="w-full max-w-[480px] py-10">
          {/* Logo mobile only */}
          <div className="lg:hidden text-center mb-8">
             <Link to="/" className="inline-flex items-center gap-2 no-underline">
                <span className="text-2xl bg-indigo-600 w-10 h-10 flex items-center justify-center rounded-xl shadow-lg">🛍️</span>
                <span className="text-slate-900 font-black text-2xl tracking-tighter">ShopVN</span>
             </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-3">Tạo tài khoản mới</h2>
            <p className="text-slate-400 font-medium">Bắt đầu hành trình mua sắm thông minh của bạn ngay hôm nay</p>
          </div>

          {/* OAuth2 buttons - Tinh chỉnh lại style cho sang hơn */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <a
              href={`${OAUTH2_BASE}/google`}
              className="flex items-center justify-center gap-2 py-3.5 border border-slate-200 bg-white rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all no-underline shadow-sm uppercase tracking-wider"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Google
            </a>
            <a
              href={`${OAUTH2_BASE}/facebook`}
              className="flex items-center justify-center gap-2 py-3.5 border border-slate-200 bg-white rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all no-underline shadow-sm uppercase tracking-wider"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px]">hoặc dùng email</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 animate-fadeIn">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              {[
                { label: 'Tên người dùng', key: 'username', type: 'text', placeholder: 'Nguyễn Văn A' },
                { label: 'Địa chỉ Email', key: 'email', type: 'email', placeholder: 'name@example.com' },
                { label: 'Mật khẩu', key: 'password', type: 'password', placeholder: '••••••••' },
                { label: 'Xác nhận mật khẩu', key: 'confirmPassword', type: 'password', placeholder: '••••••••' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-[1.25rem] px-5 py-3.5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                    placeholder={placeholder}
                    required
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-[1.25rem] transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs mt-6 border-0 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Đang khởi tạo...</span>
                </div>
              ) : 'Đăng ký ngay'}
            </button>
          </form>

          <div className="mt-10 text-center pb-10">
            <p className="text-slate-400 font-medium text-sm">
              Bạn đã có tài khoản?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-wider text-xs ml-1 no-underline">
                Đăng nhập tại đây
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}