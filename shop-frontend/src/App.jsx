import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './context/useAuth'

import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import CategoryPage from './pages/CategoryPage'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import AddressManager from './pages/AddressManager'
import RegisterShop from './pages/RegisterShop'
import RegisterShopStatus from './pages/RegisterShopStatus'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

// FIX: thêm 2 page mới cần tạo
import PaymentResult from './pages/PaymentResult'
import Returns from './pages/Returns'

import ShopDashboard from './pages/shop/ShopDashboard'
import ShopOrders from './pages/shop/ShopOrders'
import ShopProducts from './pages/shop/ShopProducts'
import ShopProfile from './pages/shop/ShopProfile'
import ShopReturns from './pages/shop/ShopReturns'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminShops from './pages/admin/AdminShops'
import AdminRegistrations from './pages/admin/AdminRegistrations'

// ─── Protected Route ─────────────────────────────────────────────────────────

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.some(role => user.roles?.includes(role))) {
    return <Navigate to="/" replace />
  }
  return children
}

// ─── Floating Switcher ────────────────────────────────────────────────────────

function FloatingSwitcher() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (!user) return null

  const isShopArea  = location.pathname.startsWith('/shop')
  const isAdminArea = location.pathname.startsWith('/admin')
  const isMainArea  = !isShopArea && !isAdminArea

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      {user.roles?.includes('ROLE_SHOP') && !isShopArea && (
        <button
          onClick={() => navigate('/shop')}
          title="Shop Dashboard"
          className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xl shadow-lg transition cursor-pointer border-0 flex items-center justify-center"
        >
          🏪
        </button>
      )}
      {user.roles?.includes('ROLE_ADMIN') && !isAdminArea && (
        <button
          onClick={() => navigate('/admin')}
          title="Admin Panel"
          className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-900 text-white text-xl shadow-lg transition cursor-pointer border-0 flex items-center justify-center"
        >
          ⚙️
        </button>
      )}
      {!isMainArea && (
        <button
          onClick={() => navigate('/')}
          title="Về trang chủ"
          className="w-12 h-12 rounded-full bg-white hover:bg-gray-50 text-xl shadow-lg border border-gray-200 transition cursor-pointer flex items-center justify-center"
        >
          🏠
        </button>
      )}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
        <Route path="/"                element={<Home />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/products/:slug"  element={<ProductDetail />} />

        {/* FIX: VNPay redirect về đây sau khi thanh toán */}
        <Route path="/payment/result" element={<PaymentResult />} />

        {/* FIX: Cart + Checkout cần đăng nhập */}
        <Route path="/cart" element={
          <ProtectedRoute roles={['ROLE_USER', 'ROLE_SHOP', 'ROLE_ADMIN']}>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute roles={['ROLE_USER']}>
            <Checkout />
          </ProtectedRoute>
        } />

        {/* User */}
        <Route path="/orders" element={
          <ProtectedRoute roles={['ROLE_USER', 'ROLE_ADMIN']}>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="/returns" element={
          <ProtectedRoute roles={['ROLE_USER']}>
            <Returns />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute roles={['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SHOP']}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/profile/address" element={
          <ProtectedRoute roles={['ROLE_USER', 'ROLE_ADMIN']}>
            <AddressManager />
          </ProtectedRoute>
        } />
        <Route path="/register-shop" element={
          <ProtectedRoute roles={['ROLE_USER']}>
            <RegisterShop />
          </ProtectedRoute>
        } />
        <Route path="/register-shop/status" element={
          <ProtectedRoute roles={['ROLE_USER']}>
            <RegisterShopStatus />
          </ProtectedRoute>
        } />

        {/* Shop */}
        <Route path="/shop" element={
          <ProtectedRoute roles={['ROLE_SHOP']}>
            <ShopDashboard />
          </ProtectedRoute>
        } />
        <Route path="/shop/products" element={
          <ProtectedRoute roles={['ROLE_SHOP']}>
            <ShopProducts />
          </ProtectedRoute>
        } />
        <Route path="/shop/orders" element={
          <ProtectedRoute roles={['ROLE_SHOP']}>
            <ShopOrders />
          </ProtectedRoute>
        } />
        <Route path="/shop/profile" element={
          <ProtectedRoute roles={['ROLE_SHOP']}>
            <ShopProfile />
          </ProtectedRoute>
        } />
        {/* FIX: thêm route shop returns */}
        <Route path="/shop/returns" element={
          <ProtectedRoute roles={['ROLE_SHOP']}>
            <ShopReturns />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['ROLE_ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['ROLE_ADMIN']}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/shops" element={
          <ProtectedRoute roles={['ROLE_ADMIN']}>
            <AdminShops />
          </ProtectedRoute>
        } />
        <Route path="/admin/registrations" element={
          <ProtectedRoute roles={['ROLE_ADMIN']}>
            <AdminRegistrations />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <FloatingSwitcher />
    </>
  )
}