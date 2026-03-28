import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ShopSidebar from '../../components/shop/ShopSidebar'
import StatusBadge from '../../components/ui/StatusBadge'
import orderService from '../../services/orderService'

const STATUS_CONFIG = {
  PENDING:          { next: 'CONFIRMED', nextLabel: 'Xác nhận đơn' },
  CONFIRMED:        { next: 'SHIPPING',  nextLabel: 'Giao hàng ngay' },
  SHIPPING:         { next: 'DELIVERED', nextLabel: 'Đã giao hàng' },
  DELIVERED:        { next: null },
  CANCELLED:        { next: null },
  RETURN_REQUESTED: { next: null },
  RETURNING:        { next: null },
  RETURNED:         { next: null },
}

const TABS = ['Tất cả', 'Chờ xác nhận', 'Đang giao', 'Đã giao', 'Trả hàng', 'Đã hủy']
const TAB_STATUS = {
  'Tất cả':       null,
  'Chờ xác nhận': ['PENDING', 'CONFIRMED'],
  'Đang giao':    ['SHIPPING'],
  'Đã giao':      ['DELIVERED'],
  'Trả hàng':     ['RETURN_REQUESTED', 'RETURNING', 'RETURNED'],
  'Đã hủy':       ['CANCELLED'],
}

const RETURN_STATUSES = ['RETURN_REQUESTED', 'RETURNING', 'RETURNED']

export default function ShopOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    orderService.getShopOrders()
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleUpdateStatus = async (orderCode, newStatus) => {
    setUpdating(orderCode)
    try {
      const res = await orderService.updateStatus(orderCode, newStatus)
      setOrders(prev => prev.map(o => o.orderCode === orderCode ? res.data : o))
    } catch {
      alert('Không thể cập nhật trạng thái')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = orders.filter(order => {
    const statusFilter = TAB_STATUS[activeTab]
    if (!statusFilter) return true
    return statusFilter.includes(order.orderStatus)
  })

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ShopSidebar />
        <div className="flex-1 flex justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"></div>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ShopSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8">Quản Lý Đơn Hàng</h2>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Tổng đơn hàng',   value: orders.length,                                                             color: 'bg-gray-800' },
              { label: 'Cần xử lý',       value: orders.filter(o => ['PENDING','CONFIRMED'].includes(o.orderStatus)).length, color: 'bg-yellow-500' },
              { label: 'Đang vận chuyển', value: orders.filter(o => o.orderStatus === 'SHIPPING').length,                   color: 'bg-orange-500' },
              { label: 'Thành công',      value: orders.filter(o => o.orderStatus === 'DELIVERED').length,                  color: 'bg-green-500' },
            ].map((s, i) => (
              <div key={i} className={`${s.color} text-white rounded-2xl p-6 shadow-md`}>
                <p className="text-4xl font-black">{s.value}</p>
                <p className="text-base font-medium opacity-90 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm mb-6 flex p-1 border border-gray-100 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex-shrink-0 px-4 py-3 text-sm font-bold rounded-xl transition cursor-pointer border-0 ${
                  activeTab === tab
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-transparent text-gray-500 hover:text-orange-500'
                }`}
              >
                {tab}
                <span className={`ml-1.5 text-xs ${activeTab === tab ? 'text-orange-100' : 'text-gray-400'}`}>
                  ({tab === 'Tất cả'
                    ? orders.length
                    : orders.filter(o => TAB_STATUS[tab]?.includes(o.orderStatus)).length})
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm p-20 text-center border border-gray-100">
              <p className="text-6xl mb-4">📋</p>
              <p className="text-gray-400 text-lg font-medium">Không tìm thấy đơn hàng nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(order => {
                const statusCfg = STATUS_CONFIG[order.orderStatus] || {}
                const isExpanded = expandedOrder === order.orderCode
                const hasReturn = RETURN_STATUSES.includes(order.orderStatus)

                return (
                  <div
                    key={order.orderCode}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mã vận đơn</p>
                          <p className="text-base font-black text-gray-800">{order.orderCode}</p>
                        </div>
                        <div className="h-10 w-px bg-gray-100"></div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ngày đặt</p>
                          <p className="text-sm font-bold text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={order.orderStatus} type="order" />
                    </div>

                    {/* Items */}
                    <div className="px-6 py-5">
                      {order.items
                        .slice(0, isExpanded ? order.items.length : 2)
                        .map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 mb-4 last:mb-0">
                            <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 shrink-0 border border-gray-100 text-2xl">
                              📦
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-bold text-gray-700 truncate">{item.productName}</p>
                              <p className="text-sm font-bold text-gray-400">
                                Số lượng: <span className="text-gray-600">{item.quantity}</span>
                              </p>
                            </div>
                            <p className="text-lg font-black text-gray-800 shrink-0">
                              {Number(item.subTotal).toLocaleString('vi-VN')}₫
                            </p>
                          </div>
                        ))}
                      {order.items.length > 2 && (
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.orderCode)}
                          className="text-sm font-bold text-orange-500 mt-2 cursor-pointer bg-transparent border-0 p-0 hover:underline"
                        >
                          {isExpanded ? '▲ Thu gọn' : `▼ Xem thêm ${order.items.length - 2} sản phẩm`}
                        </button>
                      )}
                    </div>

                    {/* Shipping info (expanded) */}
                    {isExpanded && (
                      <div className="px-6 py-5 bg-orange-50 border-t border-orange-100 flex gap-8">
                        <div className="flex-1">
                          <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-2">
                            📍 Thông tin nhận hàng
                          </p>
                          <p className="text-base font-black text-gray-800">
                            {order.shippingFullName} — {order.shippingPhone}
                          </p>
                          <p className="text-base text-gray-600 mt-1 font-medium">
                            {order.shippingStreetAddress}, {order.shippingDistrict}, {order.shippingProvince}
                          </p>
                        </div>
                        {order.note && (
                          <div className="flex-1 border-l border-orange-200 pl-8">
                            <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-2">
                              💬 Ghi chú
                            </p>
                            <p className="text-base italic text-gray-600">"{order.note}"</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                      <p className="text-lg font-bold text-gray-700">
                        Tổng:{' '}
                        <span className="text-2xl font-black text-orange-500 ml-2">
                          {Number(order.totalPrice).toLocaleString('vi-VN')}₫
                        </span>
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.orderCode)}
                          className="text-sm font-bold border-2 border-gray-200 text-gray-500 px-5 py-2.5 rounded-xl hover:bg-gray-100 transition cursor-pointer bg-white"
                        >
                          {isExpanded ? 'Đóng' : 'Chi tiết'}
                        </button>

                        {/* Có return request → link sang ShopReturns */}
                        {hasReturn && (
                          <button
                            onClick={() => navigate('/shop/returns')}
                            className="text-sm font-bold border-2 border-purple-400 text-purple-500 px-5 py-2.5 rounded-xl hover:bg-purple-50 transition cursor-pointer bg-white"
                          >
                            ↩️ Xem trả hàng
                          </button>
                        )}

                        {statusCfg.next && (
                          <button
                            onClick={() => handleUpdateStatus(order.orderCode, statusCfg.next)}
                            disabled={updating === order.orderCode}
                            className="text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl transition shadow-lg shadow-orange-100 cursor-pointer border-0 disabled:opacity-50"
                          >
                            {updating === order.orderCode ? 'Đang xử lý...' : statusCfg.nextLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}