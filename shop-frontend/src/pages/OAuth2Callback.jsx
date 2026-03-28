import { useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'

export default function OAuth2Callback() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const hasRun = useRef(false)
  const errorRef = useRef(null) // null = loading, string = error message

  const { token, refreshToken, email, username, hasError } = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    const err = params.get('error')
    return {
      token: t,
      refreshToken: params.get('refreshToken'),
      email: params.get('email'),
      username: params.get('username')
        ? decodeURIComponent(params.get('username'))
        : null,
      hasError: !!(err || !t),
    }
  }, [])

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const redirectError = () => setTimeout(() => navigate('/login'), 2000)

    if (hasError) {
      redirectError()
      return
    }

    sessionStorage.setItem('accessToken', token)
    sessionStorage.setItem('refreshToken', refreshToken)

    api.post('/auth/refresh', { refreshToken })
      .then(async (res) => {
        const { roles } = res.data

        let shopName = null
        if (roles.includes('ROLE_SHOP')) {
          try {
            const shopRes = await api.get('/shop/profile')
            shopName = shopRes.data?.name || null
          } catch {
            // không block
          }
        }

        login({ email, username, roles, shopName }, token, refreshToken)

        if (roles.includes('ROLE_ADMIN')) navigate('/admin')
        else if (roles.includes('ROLE_SHOP')) navigate('/shop')
        else navigate('/')
      })
      .catch(() => redirectError())
  }, [])

  // Luôn hiển thị loading — navigate sẽ unmount component khi xong
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md text-center">
        <div className="text-4xl mb-4 animate-spin inline-block">⏳</div>
        <p className="text-gray-700 font-medium">Đang xử lý đăng nhập...</p>
        <p className="text-gray-500 text-sm mt-1">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  )
}