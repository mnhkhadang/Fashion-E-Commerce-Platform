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
import PaymentResult from './pages/PaymentResult'
import Returns from './pages/Returns'
import BlockedPage from './pages/BlockedPage'
import PaymentList from './pages/PaymentList'
import ShopPage from './pages/ShopPage'
import OAuth2Callback from './pages/OAuth2Callback'

import ShopDashboard from './pages/shop/ShopDashboard'
import ShopOrders from './pages/shop/ShopOrders'
import ShopProducts from './pages/shop/ShopProducts'
import ShopProfile from './pages/shop/ShopProfile'
import ShopReturns from './pages/shop/ShopReturns'
import ShopSales from './pages/shop/ShopSales'


import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminShops from './pages/admin/AdminShops'
import AdminRegistrations from './pages/admin/AdminRegistrations'
import AdminUnlockRequests from './pages/admin/AdminUnlockRequests'
import AdminReports from './pages/admin/AdminReports'
import AdminCategories from './pages/admin/AdminCategories'
import AdminSales from './pages/admin/AdminSales'
// FIX: dùng AiChatWidget — floating button, không cần route riêng
import AiChatWidget from './components/AiChatWidget'

// ─── Protected Route ──────────────────────────────────────────────────────────
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

  const isShopArea  = location.pathname.startsWith('/shop') && location.pathname !== '/shop/' + location.pathname.split('/shop/')[1]?.split('/')[0]
  const isAdminArea = location.pathname.startsWith('/admin')
  const isShopDashboard = location.pathname.startsWith('/shop') && !location.pathname.match(/^\/shop\/[^/]+$/)

  return (
    <div className="fixed bottom-24 right-6 flex flex-col gap-2 z-40">
      {user.roles?.includes('ROLE_SHOP') && !isShopDashboard && (
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
      {(isShopDashboard || isAdminArea) && (
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
        <Route path="/blocked"         element={<BlockedPage />} />
        <Route path="/"                element={<Home />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/products/:slug"  element={<ProductDetail />} />
        <Route path="/shop/:shopName"  element={<ShopPage />} />
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />
        <Route path="/payment/result"  element={<PaymentResult />} />

        {/* Cart + Checkout */}
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
        <Route path="/payments" element={
          <ProtectedRoute roles={['ROLE_USER']}>
            <PaymentList />
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
          <ProtectedRoute roles={['ROLE_SHOP']}><ShopDashboard /></ProtectedRoute>
        } />
        <Route path="/shop/products" element={
          <ProtectedRoute roles={['ROLE_SHOP']}><ShopProducts /></ProtectedRoute>
        } />
        <Route path="/shop/orders" element={
          <ProtectedRoute roles={['ROLE_SHOP']}><ShopOrders /></ProtectedRoute>
        } />
        <Route path="/shop/profile" element={
          <ProtectedRoute roles={['ROLE_SHOP']}><ShopProfile /></ProtectedRoute>
        } />
        <Route path="/shop/returns" element={
          <ProtectedRoute roles={['ROLE_SHOP']}><ShopReturns /></ProtectedRoute>
        } />
        <Route path="/shop/sales" element={<ProtectedRoute roles={['ROLE_SHOP']}><ShopSales /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['ROLE_ADMIN']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['ROLE_ADMIN']}><AdminUsers /></ProtectedRoute>
        } />
        <Route path="/admin/shops" element={
          <ProtectedRoute roles={['ROLE_ADMIN']}><AdminShops /></ProtectedRoute>
        } />
        <Route path="/admin/registrations" element={
          <ProtectedRoute roles={['ROLE_ADMIN']}><AdminRegistrations /></ProtectedRoute>
        } />
        <Route path="/admin/unlock-requests" element={
          <ProtectedRoute roles={['ROLE_ADMIN']}><AdminUnlockRequests /></ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute roles={['ROLE_ADMIN']}><AdminReports /></ProtectedRoute>
        } />
        <Route path="/admin/categories" element={
          <ProtectedRoute roles={['ROLE_ADMIN']}><AdminCategories /></ProtectedRoute>
        } />
        <Route path="/admin/sales" element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminSales /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating buttons — hiển thị trên tất cả trang */}
      <FloatingSwitcher />
      <AiChatWidget />  {/* ← floating chat widget, không cần route */}
    </>
  )
}