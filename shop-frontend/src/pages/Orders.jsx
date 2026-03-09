import { useState, useEffect } from "react"
import { useNavigate} from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import orderService from "../services/orderService"

const STATUS_CONFIG = {
    PENDING:   { label: 'Chờ xác nhận', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    CONFIRMED: { label: 'Đã xác nhận',  color: 'text-blue-600 bg-blue-50 border-blue-200' },
    SHIPPING:  { label: 'Đang giao',    color: 'text-orange-600 bg-orange-50 border-orange-200' },
    DELIVERED: { label: 'Đã giao',      color: 'text-green-600 bg-green-50 border-green-200' },
    CANCELLED: { label: 'Đã hủy',       color: 'text-red-500 bg-red-50 border-red-200' },
}

const TAB = ['Tất cả', 'Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy']
const TAB_STATUS = {
    'Tất cả': null,
    'Chờ xác nhận': ['PENDING'],
    'Đã xác nhận': ['CONFIRMED'],
    'Đang giao': ['SHIPPING'],
    'Đã giao': ['DELIVERED'],
    'Đã hủy': ['CANCELLED'],
}

export default function Orders() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('Tất cả')
    const [expandedOrder, setExpandedOrder] = useState(null)
    const [cancelling, setCancelling] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const res = await orderService.getMyOrders()
            setOrders(res.data)
        } catch {
            console.error("Lỗi khi tải đơn hàng")
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (orderCode) => {
        if (!confirm("Bạn có chắc muốn hủy đơn hàng này?"))
            return
        setCancelling(orderCode)
        try {
            const res = await orderService.cancelOrder(orderCode)
            setOrders(prev => prev.map(o => o.orderCode === orderCode ? res.data : o))
        } catch {
            alert("Không thể hủy đơn hàng này.")
        } finally {
            setCancelling(null)
        }
    }

    const filteredOrders = orders.filter(order => {
        const statusFilter = TAB_STATUS[activeTab]
        if (statusFilter && !statusFilter.includes(order.orderStatus))
            return false
        return true
    })

    if (loading) return (
        <div className="min-h-screen bg-gray-100">
            <Header searchQuery={searchQuery} onSearchChange={setSearchQuery}/>
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"></div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-100">
            <Header searchQuery={searchQuery} onSearchChange={setSearchQuery}/>
            <div className="max-w-4xl mx-auto px-4 py-5">
                <h2 className="text-lg font-bold text-gray-700 mb-4">Đơn hàng của tôi</h2>

                {/* Tab */}
                <div className="bg-white rounded-lg shadow-sm mb-4 flex overflow-x-auto">
                    {TAB.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-shrink-0 px-5 py-3 text-sm font-medium border-2 transition cursor-pointer bg-white border-l-0 border-r-0 border-t-0 ${
                                activeTab === tab
                                    ? 'border-orange-500 text-orange-500'
                                    : 'border-transparent text-gray-500 hover:text-orange-400'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* order list */}
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
                            const status = STATUS_CONFIG[order.orderStatus] || {}
                            const isExpanded = expandedOrder === order.orderCode
                            const canCancel = order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED'

                            return (
                                <div key={order.orderCode} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    {/* order header */}
                                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-0.5">Mã đơn hàng</p>
                                            <p className="text-sm font-semibold text-gray-700">{order.orderCode}</p>
                                        </div>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    {/* Order items preview */}
                                    <div className="px-5 py-4">
                                        {order.items.slice(0, isExpanded ? order.items.length : 2).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 mb-3 last:mb-0">
                                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs shrink-0">
                                                    📦
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-700 truncate">{item.productName}</p>
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
                                                onClick={() => setExpandedOrder(isExpanded ? null : order.orderCode)}
                                                className="text-xs text-orange-500 mt-1 cursor-pointer bg-transparent border-0 p-0"
                                            >
                                                {isExpanded ? 'Thu gọn ▲' : `Xem thêm ${order.items.length - 2} sản phẩm ▼`}
                                            </button>
                                        )}
                                    </div>

                                    {/* order footer */}
                                    <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                            <p className="text-sm font-bold text-gray-700 mt-0.5">
                                                Tổng: <span className="text-orange-500">{Number(order.totalPrice).toLocaleString('vi-VN')}₫</span>
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {canCancel && (
                                                <button
                                                    onClick={() => handleCancel(order.orderCode)}
                                                    disabled={cancelling === order.orderCode}
                                                    className="text-xs border border-gray-300 text-gray-500 px-3 py-1.5 rounded hover:border-red-400 hover:text-red-400 transition cursor-pointer bg-white disabled:opacity-50"
                                                >
                                                    {cancelling === order.orderCode ? 'Đang hủy...' : 'Hủy đơn'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setExpandedOrder(isExpanded ? null : order.orderCode)}
                                                className="text-xs border border-orange-500 text-orange-500 px-3 py-1.5 rounded hover:bg-orange-50 transition cursor-pointer bg-white"
                                            >
                                                Chi tiết
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded detail: shipping info */}
                                    {isExpanded && (
                                        <div className="px-5 py-4 border-t border-gray-100 bg-orange-50">
                                            <p className="text-xs font-semibold text-gray-600 mb-2">📍 Địa chỉ giao hàng</p>
                                            <p className="text-sm text-gray-700">{order.shippingFullName} | {order.shippingPhone}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {order.shippingStreetAddress}, {order.shippingDistrict}, {order.shippingProvince}
                                            </p>
                                            {order.note && (
                                                <p className="text-xs text-gray-500 mt-2">💬 Ghi chú: {order.note}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <Footer/>
        </div>
    )
}