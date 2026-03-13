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
            const response = await api.post('/api/auth/login', { email, password })
            const { accessToken, refreshToken, username, roles } = response.data
            login({ email, username, roles }, accessToken, refreshToken)
            if (roles.includes('ROLE_ADMIN')) navigate('/admin')
            else if (roles.includes('ROLE_SHOP')) navigate('/shop')
            else navigate('/')
        } catch (error) {
            setError(error.response?.data?.message || 'Email hoặc mật khẩu không đúng')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-orange-500 mb-6">Đăng nhập</h2>

                {successMessage && (
                    <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-4 text-sm">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="example@gmail.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50">
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-orange-500 hover:underline font-medium">
                        Đăng ký
                    </Link>
                </p>
                <p className="text-center text-sm text-gray-500 mt-4">
                    <Link to="/forgot-password" className="text-orange-500 hover:underline font-medium">
                        Quên mật khẩu?
                    </Link>
                </p>
            </div>
        </div>
    )
}