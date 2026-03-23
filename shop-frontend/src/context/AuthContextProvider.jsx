import { useState } from 'react'
import { AuthContext } from './AuthContext'   // createContext nằm ở AuthContext.jsx
import api from '../services/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  /**
   * Gọi sau khi BE trả về AuthResponse thành công.
   * userData: { email, username, roles }
   * roles ví dụ: ['ROLE_USER'] | ['ROLE_SHOP'] | ['ROLE_ADMIN']
   */
  const login = (userData, accessToken, refreshToken) => {
    setUser(userData)
    sessionStorage.setItem('user', JSON.stringify(userData))
    sessionStorage.setItem('accessToken', accessToken)
    sessionStorage.setItem('refreshToken', refreshToken)
  }

  /**
   * Gọi BE xóa refreshToken trước, sau đó clear sessionStorage.
   * Dùng async để component có thể await nếu cần.
   */
  const logout = async () => {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken')
      if (refreshToken) {
        // Báo BE invalidate refreshToken — bỏ qua lỗi nếu token đã hết hạn
        await api.post('/auth/logout', { refreshToken })
      }
    } catch {
      // Không block logout dù BE lỗi
    } finally {
      setUser(null)
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('refreshToken')
    }
  }

  /** true nếu đang đăng nhập */
  const isAuthenticated = () => !!user

  /**
   * Kiểm tra role.
   * Dùng: hasRole('ROLE_ADMIN'), hasRole('ROLE_SHOP'), hasRole('ROLE_USER')
   */
  const hasRole = (role) => user?.roles?.includes(role)

  const isAdmin = () => hasRole('ROLE_ADMIN')
  const isShop = () => hasRole('ROLE_SHOP')
  const isUser = () => hasRole('ROLE_USER')

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        hasRole,
        isAdmin,
        isShop,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}