import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import paymentService from '../services/paymentService'
import cartService from '../services/cartService'
import shippingAddressService from '../services/shippingAddressService'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CheckoutAddressSection from '../components/checkout/CheckoutAddressSection'
import CheckoutProductSection from '../components/checkout/CheckoutProductSection'

export default function Checkout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const slugs = state?.slugs || []

  const [cart, setCart] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (slugs.length === 0) {
      navigate('/cart')
      return
    }
    const fetchData = async () => {
      try {
        const [cartRes, addressRes] = await Promise.all([
          cartService.getCart(),
          shippingAddressService.getAll(),
        ])
        setCart(cartRes.data)
        setAddresses(addressRes.data)
        const defaultAddress =
          addressRes.data.find(a => a.isDefault) || addressRes.data[0]
        if (defaultAddress) setSelectedAddress(defaultAddress)
      } catch {
        console.error('Lỗi khi tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const selectedItems = cart?.items?.filter(item => slugs.includes(item.productSlug))
  const totalPrice =
    selectedItems?.reduce(
      (sum, item) => sum + (item.currentPrice ?? item.price) * item.quantity,
      0
    ) || 0

  const handleSubmit = async () => {
    if (!selectedAddress) {
      setError('Vui lòng chọn địa chỉ giao hàng!')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await paymentService.checkout({
        slugs,
        shippingAddressId: selectedAddress.id,
        paymentMethod,
        note,
      })

      // Response: { payment: {...}, reservationExpiredAt, vnpayUrl }
      const { payment, vnpayUrl, reservationExpiredAt } = res.data

      if (paymentMethod === 'VNPAY' && vnpayUrl) {
        // Lưu countdown để hiển thị trên trang VNPay hoặc PaymentResult
        if (reservationExpiredAt) {
          sessionStorage.setItem('reservationExpiredAt', reservationExpiredAt)
        }
        // Redirect ra ngoài sang cổng VNPay
        window.location.href = vnpayUrl
      } else {
        // COD — vào trang orders, truyền paymentCode để highlight
        navigate('/orders', {
          state: { paymentCode: payment?.paymentCode, success: true },
        })
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        'Đặt hàng thất bại, vui lòng thử lại'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

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

      <div className="max-w-4xl mx-auto px-4 py-5">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Thanh Toán</h2>

        <CheckoutAddressSection
          addresses={addresses}
          setAddresses={setAddresses}
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
        />

        <CheckoutProductSection
          selectedItems={selectedItems}
          note={note}
          setNote={setNote}
        />

        {/* Phương thức thanh toán */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
          <h3 className="font-semibold text-gray-700 mb-3">💳 Phương Thức Thanh Toán</h3>
          <div className="flex gap-3">
            {[
              { value: 'COD', label: '💵 Thanh toán khi nhận hàng' },
              { value: 'VNPAY', label: '🏦 VNPay' },
            ].map(method => (
              <div
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition ${
                  paymentMethod === method.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center shrink-0">
                  {paymentMethod === method.value && (
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  )}
                </div>
                <span className="text-sm">{method.label}</span>
              </div>
            ))}
          </div>

          {/* Ghi chú VNPay */}
          {paymentMethod === 'VNPAY' && (
            <p className="text-xs text-gray-400 mt-3">
              ⏱ Sau khi đặt hàng, bạn có <strong>15 phút</strong> để hoàn tất thanh toán trên VNPay.
            </p>
          )}
        </div>

        {/* Tổng tiền + đặt hàng */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Tổng tiền hàng</span>
            <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>Phí vận chuyển</span>
            <span className="text-green-500">Miễn phí</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 mb-5 pt-3 border-t border-gray-100">
            <span>Tổng thanh toán</span>
            <span className="text-orange-500 text-xl">
              {totalPrice.toLocaleString('vi-VN')}₫
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedAddress}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-sm font-semibold transition cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}