import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ShopSidebar from '../../components/shop/ShopSidebar'
import StatusBadge from '../../components/ui/StatusBadge'
import orderService from '../../services/orderService'

const STATUS_CONFIG = {
  PENDING:          { next: 'CONFIRMED', nextLabel: 'Xác nhận đơn', color: 'from-amber-500 to-orange-600' },
  CONFIRMED:        { next: 'SHIPPING',  nextLabel: 'Giao hàng ngay', color: 'from-blue-500 to-indigo-600' },
  SHIPPING:         { next: 'DELIVERED', nextLabel: 'Đã giao hàng', color: 'from-emerald-500 to-teal-600' },
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
      <div className="min-h-screen bg-[#f8fafc] flex">
        <ShopSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      <ShopSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-10 py-10">
          
          {/* Header */}
          <div className="mb-10">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[3px] mb-1">Quản trị vận hành</p>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Quản Lý Đơn Hàng</h2>
          </div>

          {/* Stats - Đồng bộ Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Tổng đơn hàng',   value: orders.length, color: 'from-slate-700 to-slate-800', shadow: 'shadow-slate-200' },
              { label: 'Cần xử lý',       value: orders.filter(o => ['PENDING','CONFIRMED'].includes(o.orderStatus)).length, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-200' },
              { label: 'Đang vận chuyển', value: orders.filter(o => o.orderStatus === 'SHIPPING').length, color: 'from-indigo-500 to-blue-600', shadow: 'shadow-indigo-200' },
              { label: 'Thành công',       value: orders.filter(o => o.orderStatus === 'DELIVERED').length, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.color} ${s.shadow} text-white rounded-2xl p-6 shadow-xl`}>
                <p className="text-3xl font-black tracking-tighter">{s.value}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs - Modern Minimal */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8 flex p-1.5 border border-slate-100 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex-shrink-0 px-6 py-3 text-xs font-extrabold rounded-xl transition-all duration-300 border-0 cursor-pointer uppercase tracking-wider ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab}
                <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {tab === 'Tất cả'
                    ? orders.length
                    : orders.filter(o => TAB_STATUS[tab]?.includes(o.orderStatus)).length}
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-[2rem] shadow-sm p-24 text-center border border-slate-100">
              <div className="text-5xl mb-6 grayscale opacity-50">📦</div>
              <p className="text-slate-400 text-lg font-bold italic">Không tìm thấy đơn hàng nào trong mục này</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map(order => {
                const statusCfg = STATUS_CONFIG[order.orderStatus] || {}
                const isExpanded = expandedOrder === order.orderCode
                const hasReturn = RETURN_STATUSES.includes(order.orderStatus)

                return (
                  <div
                    key={order.orderCode}
                    className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-8">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mã vận đơn</p>
                          <p className="text-base font-black text-slate-800 tracking-tight">#{order.orderCode}</p>
                        </div>
                        <div className="h-8 w-px bg-slate-100"></div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thời gian đặt</p>
                          <p className="text-sm font-bold text-slate-600">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={order.orderStatus} type="order" />
                    </div>

                    {/* Items List */}
                    <div className="px-8 py-6 space-y-5">
                      {order.items
                        .slice(0, isExpanded ? order.items.length : 2)
                        .map((item, idx) => (
                          <div key={idx} className="flex items-center gap-5 group">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 shrink-0 border border-slate-100 text-xl group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                              📦
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-slate-700 truncate uppercase tracking-tight">{item.productName}</p>
                              <p className="text-xs font-bold text-slate-400 mt-1">
                                Số lượng: <span className="text-slate-600 font-extrabold">{item.quantity}</span>
                              </p>
                            </div>
                            <p className="text-lg font-black text-slate-800">
                              {Number(item.subTotal).toLocaleString('vi-VN')}₫
                            </p>
                          </div>
                        ))}
                      
                      {order.items.length > 2 && (
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.orderCode)}
                          className="text-xs font-bold text-indigo-500 mt-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-lg border-0 hover:bg-indigo-50 transition-colors"
                        >
                          {isExpanded ? '▲ Thu gọn' : `▼ Xem thêm ${order.items.length - 2} sản phẩm`}
                        </button>
                      )}
                    </div>

                    {/* Shipping Info - Styled as "Bento" */}
                    {isExpanded && (
                      <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex flex-col md:flex-row gap-8 animate-fadeIn">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[2px] mb-3 flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span> Địa chỉ nhận hàng
                          </p>
                          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-sm font-black text-slate-800">
                              {order.shippingFullName} — {order.shippingPhone}
                            </p>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed font-medium">
                              {order.shippingStreetAddress}, {order.shippingDistrict}, {order.shippingProvince}
                            </p>
                          </div>
                        </div>
                        {order.note && (
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-[2px] mb-3 flex items-center gap-2">
                               <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span> Ghi chú đơn hàng
                            </p>
                            <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 border-dashed">
                                <p className="text-sm italic text-slate-600 font-medium">"{order.note}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="px-8 py-5 bg-white flex flex-col sm:flex-row items-center justify-between border-t border-slate-50 gap-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Tổng thanh toán:</span>
                        <span className="text-2xl font-black text-indigo-600 tracking-tighter">
                          {Number(order.totalPrice).toLocaleString('vi-VN')}₫
                        </span>
                      </div>

                      <div className="flex gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.orderCode)}
                          className="flex-1 sm:flex-none text-xs font-bold border border-slate-200 text-slate-500 px-6 py-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer bg-white"
                        >
                          {isExpanded ? 'Đóng' : 'Chi tiết'}
                        </button>

                        {hasReturn && (
                          <button
                            onClick={() => navigate('/shop/returns')}
                            className="flex-1 sm:flex-none text-xs font-bold border border-purple-200 text-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50 transition-all cursor-pointer bg-white"
                          >
                            ↩️ Trả hàng
                          </button>
                        )}

                        {statusCfg.next && (
                          <button
                            onClick={() => handleUpdateStatus(order.orderCode, statusCfg.next)}
                            disabled={updating === order.orderCode}
                            className={`flex-1 sm:flex-none text-xs font-bold bg-gradient-to-r ${statusCfg.color} text-white px-8 py-3 rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed`}
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