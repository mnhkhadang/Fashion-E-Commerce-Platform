import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/useAuth"
import Login from "./pages/Login"
import Home from "./pages/Home"
import CategoryPage from "./pages/CategoryPage"
import ProductDetail from "./pages/ProductDetail"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import Orders from "./pages/Orders"
import AddressManager from "./pages/AddressManager"
import ShopDashboard from "./pages/shop/ShopDashboard"
import ShopOrders from "./pages/shop/ShopOrders"
import ShopProducts from "./pages/shop/ShopProducts"
import ShopProfile from "./pages/shop/ShopProfile"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminShops from "./pages/admin/AdminShops"

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

      {/* User */}
      <Route path="/orders" element={
        <ProtectedRoute roles={["ROLE_USER", "ROLE_ADMIN"]}>
          <Orders />
        </ProtectedRoute>
      } />
      <Route path="/profile/address" element={
        <ProtectedRoute roles={["ROLE_USER", "ROLE_ADMIN"]}>
          <AddressManager />
        </ProtectedRoute>
      } />

      {/* Shop */}
      <Route path="/shop" element={
        <ProtectedRoute roles={["ROLE_SHOP"]}>
          <ShopDashboard />
        </ProtectedRoute>
      } />
      <Route path="/shop/products" element={
        <ProtectedRoute roles={["ROLE_SHOP"]}>
          <ShopProducts />
        </ProtectedRoute>
      } />
      <Route path="/shop/orders" element={
        <ProtectedRoute roles={["ROLE_SHOP"]}>
          <ShopOrders />
        </ProtectedRoute>
      } />
      <Route path="/shop/profile" element={
        <ProtectedRoute roles={["ROLE_SHOP"]}>
          <ShopProfile />
        </ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={["ROLE_ADMIN"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={["ROLE_ADMIN"]}>
          <AdminUsers />
        </ProtectedRoute>
      } />
      <Route path="/admin/shops" element={
        <ProtectedRoute roles={["ROLE_ADMIN"]}>
          <AdminShops />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}