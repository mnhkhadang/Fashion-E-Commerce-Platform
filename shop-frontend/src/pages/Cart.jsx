import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import cartService from '../services/cartService'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Cart() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const res = await cartService.getCart()
      setCart(res.data)
      // Tự động bỏ chọn các item hết hàng hoặc đã ẩn
      const validSlugs = res.data.items
        ?.filter(item => !item.outOfStock && !item.inactive)
        .map(item => item.productSlug) || []
      setSelectedItems(validSlugs)
    } catch {
      console.error('Lỗi khi tải giỏ hàng')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (slug, quantity) => {
    if (quantity < 1) return
    try {
      await cartService.updateItem(slug, quantity)
      setCart(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.productSlug === slug ? { ...item, quantity } : item
        ),
      }))
    } catch {
      console.error('Lỗi khi cập nhật số lượng')
    }
  }

  const removeItem = async (slug) => {
    try {
      await cartService.removeItem(slug)
      setSelectedItems(prev => prev.filter(s => s !== slug))
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item.productSlug !== slug),
      }))
    } catch {
      console.error('Lỗi khi xóa sản phẩm')
    }
  }

  const toggleSelect = (slug) => {
    setSelectedItems(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  const toggleSelectAll = () => {
    if (!cart?.items) return
    const validSlugs = cart.items
      .filter(item => !item.outOfStock && !item.inactive)
      .map(item => item.productSlug)
    if (selectedItems.length === validSlugs.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(validSlugs)
    }
  }

  // Dùng currentPrice (giá hiện tại) để tính tổng — tránh dùng addedPrice (giá cũ)
  const totalPrice =
    cart?.items
      ?.filter(item => selectedItems.includes(item.productSlug))
      ?.reduce((sum, item) => sum + (item.currentPrice ?? item.price) * item.quantity, 0) || 0

  const handleCheckout = () => {
    if (selectedItems.length === 0) return
    navigate('/checkout', { state: { slugs: selectedItems } })
  }

  const validItems = cart?.items?.filter(i => !i.outOfStock && !i.inactive) || []

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"></div>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="max-w-6xl mx-auto px-4 py-5">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          Giỏ hàng ({cart?.items?.length || 0} sản phẩm)
        </h2>

        {/* Banner cảnh báo hasWarnings */}
        {cart?.hasWarnings && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg px-4 py-3 mb-4 text-sm flex items-start gap-2">
            <span className="text-lg leading-none">⚠️</span>
            <div>
              <p className="font-semibold mb-0.5">Một số sản phẩm trong giỏ hàng có thay đổi</p>
              <p className="text-yellow-700">Vui lòng kiểm tra lại trước khi đặt hàng.</p>
            </div>
          </div>
        )}

        {!cart?.items?.length ? (
          <div className="bg-white rounded-lg shadow-sm p-20 text-center text-gray-400">
            <span className="text-6xl block mb-4">🛒</span>
            <p className="text-lg mb-4">Giỏ hàng trống</p>
            <Link
              to="/"
              className="bg-orange-500 text-white px-6 py-2 rounded-sm hover:bg-orange-600 no-underline"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex gap-4">
            {/* Cart items */}
            <div className="flex-1">
              {/* Header row */}
              <div className="bg-white rounded-lg shadow-sm px-4 py-3 mb-2 flex items-center gap-4 text-sm text-gray-500">
                <input
                  type="checkbox"
                  checked={
                    validItems.length > 0 && selectedItems.length === validItems.length
                  }
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="flex-1">Sản Phẩm</span>
                <span className="w-24 text-center">Đơn Giá</span>
                <span className="w-28 text-center">Số Lượng</span>
                <span className="w-24 text-center">Số Tiền</span>
                <span className="w-16 text-center">Thao Tác</span>
              </div>

              {cart.items.map(item => {
                const isUnavailable = item.outOfStock || item.inactive
                const currentPrice = item.currentPrice ?? item.price

                return (
                  <div
                    key={item.productSlug}
                    className={`bg-white rounded-lg shadow-sm px-4 py-4 mb-2 flex items-center gap-4 ${
                      isUnavailable ? 'opacity-60' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.productSlug)}
                      onChange={() => toggleSelect(item.productSlug)}
                      disabled={isUnavailable}
                      className="w-4 h-4 accent-orange-500 disabled:cursor-not-allowed"
                    />

                    {/* Product info */}
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={item.productImage || 'https://picsum.photos/80/80'}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded border border-gray-100"
                      />
                      <div>
                        <Link
                          to={`/products/${item.productSlug}`}
                          className="text-sm text-gray-700 hover:text-orange-500 no-underline line-clamp-2"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs text-gray-400 mt-1">{item.shopName}</p>

                        {/* Warning badges */}
                        {item.inactive && (
                          <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded mt-1 inline-block">
                            Sản phẩm đã ngừng bán
                          </span>
                        )}
                        {item.outOfStock && !item.inactive && (
                          <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded mt-1 inline-block">
                            Hết hàng
                          </span>
                        )}
                        {item.priceChanged && !isUnavailable && (
                          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded mt-1 inline-block">
                            Giá đã thay đổi
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price — hiển thị giá cũ nếu đã thay đổi */}
                    <div className="w-24 text-center">
                      {item.priceChanged ? (
                        <div>
                          <p className="text-orange-500 text-sm font-medium">
                            {currentPrice.toLocaleString('vi-VN')}₫
                          </p>
                          <p className="text-gray-400 text-xs line-through">
                            {item.addedPrice?.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      ) : (
                        <p className="text-orange-500 text-sm font-medium">
                          {currentPrice.toLocaleString('vi-VN')}₫
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="w-28 flex items-center justify-center">
                      <div className="flex items-center border border-gray-200 rounded">
                        <button
                          onClick={() => updateQuantity(item.productSlug, item.quantity - 1)}
                          disabled={isUnavailable}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer bg-transparent border-0 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productSlug, item.quantity + 1)}
                          disabled={isUnavailable}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer bg-transparent border-0 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="w-24 text-center text-orange-500 font-semibold text-sm">
                      {isUnavailable
                        ? '—'
                        : (currentPrice * item.quantity).toLocaleString('vi-VN') + '₫'}
                    </div>

                    {/* Remove */}
                    <div className="w-16 text-center">
                      <button
                        onClick={() => removeItem(item.productSlug)}
                        className="text-gray-400 hover:text-red-500 text-sm cursor-pointer bg-transparent border-0"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="w-80 shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                  Tóm tắt đơn hàng
                </h3>
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Sản phẩm đã chọn</span>
                  <span>{selectedItems.length}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>Tổng tiền hàng</span>
                  <span className="text-orange-500 font-semibold">
                    {totalPrice.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 mb-5 pt-2 border-t border-gray-100">
                  <span>Tổng thanh toán</span>
                  <span className="text-orange-500 text-lg">
                    {totalPrice.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-sm font-semibold transition cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mua Hàng ({selectedItems.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}   