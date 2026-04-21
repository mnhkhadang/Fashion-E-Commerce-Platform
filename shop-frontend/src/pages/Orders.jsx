import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import orderService from '../services/orderService'
import returnService from '../services/returnService'

const TABS = [
  { label: 'Tất cả',        status: null },
  { label: 'Chờ xác nhận',  status: ['PENDING'] },
  { label: 'Đã xác nhận',   status: ['CONFIRMED'] },
  { label: 'Đang giao',     status: ['SHIPPING'] },
  { label: 'Đã giao',       status: ['DELIVERED'] },
  { label: 'Trả hàng',      status: ['RETURN_REQUESTED', 'RETURNING', 'RETURNED'] },
  { label: 'Đã hủy',        status: ['CANCELLED'] },
]

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [returning, setReturning] = useState(null)
  const [returnReason, setReturnReason] = useState('')
  const [showReturnForm, setShowReturnForm] = useState(null) // orderCode
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await orderService.getMyOrders()
      setOrders(res.data)
    } catch {
      console.error('Lỗi khi tải đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (orderCode) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
    setCancelling(orderCode)
    try {
      const res = await orderService.cancelOrder(orderCode, 'Hủy bởi người dùng')
      setOrders(prev => prev.map(o => o.orderCode === orderCode ? res.data : o))
    } catch {
      alert('Không thể hủy đơn hàng này.')
    } finally {
      setCancelling(null)
    }
  }

  const handleRequestReturn = async (orderCode) => {
    if (!returnReason.trim()) {
      alert('Vui lòng nhập lý do trả hàng')
      return
    }
    setReturning(orderCode)
    try {
      await returnService.requestReturn(orderCode, returnReason.trim())
      setShowReturnForm(null)
      setReturnReason('')
      await fetchOrders()
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tạo yêu cầu trả hàng')
    } finally {
      setReturning(null)
    }
  }

  const activeTabObj = TABS.find(t => t.label === activeTab)
  const filteredOrders = orders.filter(order => {
    if (!activeTabObj?.status) return true
    return activeTabObj.status.includes(order.orderStatus)
  })

  if (loading)
    return (
      <LoadingSpinner
        fullPage
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    )

  return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="max-w-4xl mx-auto px-4 py-5">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Đơn hàng của tôi</h2>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4 flex overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer bg-white ${
                activeTab === tab.label
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500 hover:text-orange-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order list */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">🛍</p>
            <p className="text-gray-400 text-sm">Chưa có đơn hàng nào</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-orange-500 text-sm border border-orange-500 px-5 py-2 rounded hover:bg-orange-50 cursor-pointer bg-white"
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => {
              const isExpanded = expandedOrder === order.orderCode
              const canCancel =
                order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED'
              const canReturn = order.orderStatus === 'DELIVERED'
              const isShowingReturnForm = showReturnForm === order.orderCode

              return (
                <div
                  key={order.orderCode}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Order header */}
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Mã đơn hàng</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {order.orderCode}
                      </p>
                    </div>
                    {/* Dùng StatusBadge thay vì hardcode */}
                    <StatusBadge status={order.orderStatus} type="order" />
                  </div>

                  {/* Order items preview */}
                  <div className="px-5 py-4">
                    {order.items
                      .slice(0, isExpanded ? order.items.length : 2)
                      .map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 mb-3 last:mb-0">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs shrink-0">
                            📦
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 truncate">
                              {item.productName}
                            </p>
                            <p className="text-xs text-gray-400">{item.shopName}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm text-orange-500 font-medium">
                              {Number(item.price).toLocaleString('vi-VN')}₫
                            </p>
                            <p className="text-xs text-gray-400">x{item.quantity}</p>
                          </div>
                        </div>
                      ))}

                    {order.items.length > 2 && (
                      <button
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : order.orderCode)
                        }
                        className="text-xs text-orange-500 mt-1 cursor-pointer bg-transparent border-0 p-0"
                      >
                        {isExpanded
                          ? 'Thu gọn ▲'
                          : `Xem thêm ${order.items.length - 2} sản phẩm ▼`}
                      </button>
                    )}
                  </div>

                  {/* Order footer */}
                  <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm font-bold text-gray-700 mt-0.5">
                        Tổng:{' '}
                        <span className="text-orange-500">
                          {Number(order.totalPrice).toLocaleString('vi-VN')}₫
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2 flex-wrap justify-end">
                      {/* Nút hủy đơn */}
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(order.orderCode)}
                          disabled={cancelling === order.orderCode}
                          className="text-xs border border-gray-300 text-gray-500 px-3 py-1.5 rounded hover:border-red-400 hover:text-red-400 transition cursor-pointer bg-white disabled:opacity-50"
                        >
                          {cancelling === order.orderCode ? 'Đang hủy...' : 'Hủy đơn'}
                        </button>
                      )}

                      {/* Nút trả hàng — chỉ hiện khi DELIVERED */}
                      {canReturn && !isShowingReturnForm && (
                        <button
                          onClick={() => {
                            setShowReturnForm(order.orderCode)
                            setReturnReason('')
                          }}
                          className="text-xs border border-purple-400 text-purple-500 px-3 py-1.5 rounded hover:bg-purple-50 transition cursor-pointer bg-white"
                        >
                          Trả hàng
                        </button>
                      )}

                      {/* Chi tiết */}
                      <button
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : order.orderCode)
                        }
                        className="text-xs border border-orange-500 text-orange-500 px-3 py-1.5 rounded hover:bg-orange-50 transition cursor-pointer bg-white"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>

                  {/* Form trả hàng */}
                  {isShowingReturnForm && (
                    <div className="px-5 py-4 border-t border-purple-100 bg-purple-50">
                      <p className="text-sm font-semibold text-purple-700 mb-2">
                        📦 Yêu cầu trả hàng
                      </p>
                      <textarea
                        value={returnReason}
                        onChange={e => setReturnReason(e.target.value)}
                        rows={3}
                        placeholder="Nhập lý do trả hàng (bắt buộc)..."
                        className="w-full border border-purple-200 rounded px-3 py-2 text-sm outline-none focus:border-purple-400 resize-none bg-white"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleRequestReturn(order.orderCode)}
                          disabled={returning === order.orderCode}
                          className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-4 py-2 rounded cursor-pointer border-0 disabled:opacity-50"
                        >
                          {returning === order.orderCode ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>
                        <button
                          onClick={() => {
                            setShowReturnForm(null)
                            setReturnReason('')
                          }}
                          className="border border-gray-300 text-gray-500 text-xs px-4 py-2 rounded hover:bg-gray-50 cursor-pointer bg-white"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded detail — địa chỉ giao hàng */}
                  {isExpanded && (
                    <div className="px-5 py-4 border-t border-gray-100 bg-orange-50">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        📍 Địa chỉ giao hàng
                      </p>
                      <p className="text-sm text-gray-700">
                        {order.shippingFullName} | {order.shippingPhone}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {order.shippingStreetAddress}, {order.shippingDistrict},{' '}
                        {order.shippingProvince}
                      </p>
                      {order.note && (
                        <p className="text-xs text-gray-500 mt-2">
                          💬 Ghi chú: {order.note}
                        </p>
                      )}
                      {order.cancelReason && (
                        <p className="text-xs text-red-400 mt-2">
                          ❌ Lý do hủy: {order.cancelReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}