import { useState } from 'react'
import { AuthContext } from './AuthContextProvider'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
        const saved = localStorage.getItem('user')
        return saved ? JSON.parse(saved) : null
    } catch {
        return null
    }
})

  const login = (userData, accessToken, refreshToken) => {
    // userData đã chứa roles từ response
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  const isAuthenticated = () => !!user

  const hasRole = (role) => user?.roles?.includes(role)

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}