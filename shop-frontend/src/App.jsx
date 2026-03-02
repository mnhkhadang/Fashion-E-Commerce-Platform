import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/useAuth'
import Login from './pages/Login'
import Home  from './pages/Home'
import CategoryPage from './pages/CategoryPage'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
// Protected Route
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.some(role => user.roles.includes(role))) {
    return <Navigate to="/" />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/category/:categoryName" element={<CategoryPage />} />
      <Route path="/products/:slug" element={<ProductDetail />} />  
      <Route path="/cart" element={<Cart />} />    
      <Route path="/checkout" element={<Checkout />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}