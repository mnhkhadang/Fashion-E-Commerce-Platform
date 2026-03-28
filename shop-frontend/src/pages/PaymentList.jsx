import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import paymentService from '../services/paymentService'

const METHOD_LABEL = {
  COD:   '💵 Thanh toán khi nhận hàng',
  VNPAY: '💳 VNPay',
}

const TABS = ['Tất cả', 'Chờ thanh toán', 'Thành công', 'Thất bại', 'Đã hủy']
const TAB_STATUS = {
  'Tất cả':          null,
  'Chờ thanh toán':  ['PENDING'],
  'Thành công':      ['COMPLETED'],
  'Thất bại':        ['FAILED'],
  'Đã hủy':          ['CANCELLED'],
}

export default function PaymentList() {
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [expandedPayment, setExpandedPayment] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    paymentService.getMyPayments()
      .then(res => setPayments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = payments.filter(p => {
    const statusFilter = TAB_STATUS[activeTab]
    return !statusFilter || statusFilter.includes(p.status)
  })

  const formatDate = (date) => date
    ? new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—'

  if (loading)
    return <LoadingSpinner fullPage searchQuery={searchQuery} onSearchChange={setSearchQuery} />

  return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="max-w-3xl mx-auto px-4 py-5">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Lịch Sử Thanh Toán</h2>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4 flex overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition cursor-pointer bg-white ${
                activeTab === tab
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500 hover:text-orange-400'
              }`}
            >
              {tab}
              <span className="ml-1 text-xs text-gray-400">
                ({tab === 'Tất cả'
                  ? payments.length
                  : payments.filter(p => TAB_STATUS[tab]?.includes(p.status)).length})
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">💳</p>
            <p className="text-gray-400 text-sm">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(payment => {
              const isExpanded = expandedPayment === payment.paymentCode
              return (
                <div key={payment.paymentCode} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Mã thanh toán</p>
                      <p className="text-sm font-semibold text-gray-700 font-mono">
                        {payment.paymentCode}
                      </p>
                    </div>
                    <StatusBadge status={payment.status} type="payment" />
                  </div>

                  {/* Body */}
                  <div className="px-5 py-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Phương thức</span>
                        <span className="text-gray-700">{METHOD_LABEL[payment.method] || payment.method}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Tổng tiền</span>
                        <span className="text-orange-500 font-bold text-base">
                          {Number(payment.totalAmount).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Ngày tạo</span>
                        <span className="text-gray-600">{formatDate(payment.createdAt)}</span>
                      </div>
                      {payment.paidAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Thanh toán lúc</span>
                          <span className="text-green-600">{formatDate(payment.paidAt)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Số đơn hàng</span>
                        <span className="text-gray-600">{payment.orders?.length || 0} đơn</span>
                      </div>
                    </div>

                    {/* Orders expanded */}
                    {isExpanded && payment.orders?.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Chi tiết đơn hàng
                        </p>
                        {payment.orders.map(order => (
                          <div key={order.orderCode} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-mono text-gray-500">{order.orderCode}</p>
                              <StatusBadge status={order.orderStatus} type="order" />
                            </div>
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-gray-600 py-1 border-b border-gray-100 last:border-0">
                                <span className="flex-1 truncate pr-2">{item.productName} × {item.quantity}</span>
                                <span className="shrink-0 font-medium">
                                  {Number(item.subTotal).toLocaleString('vi-VN')}₫
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between text-xs font-bold text-gray-700 mt-2 pt-1">
                              <span>Tổng đơn</span>
                              <span>{Number(order.totalPrice).toLocaleString('vi-VN')}₫</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setExpandedPayment(isExpanded ? null : payment.paymentCode)}
                        className="flex-1 border border-gray-300 text-gray-500 text-sm py-2 rounded-lg hover:bg-gray-50 transition cursor-pointer bg-white"
                      >
                        {isExpanded ? '▲ Thu gọn' : '▼ Xem đơn hàng'}
                      </button>
                      <button
                        onClick={() => navigate('/orders')}
                        className="flex-1 border border-orange-300 text-orange-500 text-sm py-2 rounded-lg hover:bg-orange-50 transition cursor-pointer bg-white"
                      >
                        Xem đơn hàng
                      </button>
                    </div>
                  </div>
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