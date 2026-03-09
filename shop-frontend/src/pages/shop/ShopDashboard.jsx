import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AreaChart, Area, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import ShopSidebar from '../../components/shop/ShopSidebar'
import ShopService from '../../services/ShopService'
import productService from '../../services/productService'
import orderService from '../../services/orderService'

const MONTH_LABELS = ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12']

const STATUS_LABEL = {
    PENDING:   { label: 'Chờ xác nhận', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    CONFIRMED: { label: 'Đã xác nhận',  color: 'text-blue-700 bg-blue-50 border-blue-200' },
    SHIPPING:  { label: 'Đang giao',    color: 'text-orange-700 bg-orange-50 border-orange-200' },
    DELIVERED: { label: 'Đã giao',      color: 'text-green-700 bg-green-50 border-green-200' },
    CANCELLED: { label: 'Đã hủy',       color: 'text-red-600 bg-red-50 border-red-200' },
}

export default function ShopDashboard() {
    const navigate = useNavigate()
    const [shop, setShop] = useState(null)
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0, cancelled: 0, delivered: 0 })
    const [recentOrders, setRecentOrders] = useState([])
    const [revenueData, setRevenueData] = useState([])
    const [topProducts, setTopProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [shopRes, productsRes, ordersRes] = await Promise.all([
                    ShopService.getMyShop(),
                    productService.getMyProducts(),
                    orderService.getShopOrders(),
                ])
                setShop(shopRes.data)
                const orders = ordersRes.data
                const products = productsRes.data

                const revenue = orders
                    .filter(o => o.orderStatus === 'DELIVERED')
                    .reduce((sum, o) => sum + Number(o.totalPrice), 0)

                setStats({
                    products: products.length,
                    orders: orders.length,
                    revenue,
                    pending: orders.filter(o => o.orderStatus === 'PENDING').length,
                    cancelled: orders.filter(o => o.orderStatus === 'CANCELLED').length,
                    delivered: orders.filter(o => o.orderStatus === 'DELIVERED').length,
                })

                const byMonth = Array(12).fill(0)
                orders.filter(o => o.orderStatus === 'DELIVERED').forEach(o => {
                    const month = new Date(o.createdAt).getMonth()
                    byMonth[month] += Number(o.totalPrice)
                })
                setRevenueData(MONTH_LABELS.map((label, i) => ({ label, value: byMonth[i] })))

                const sorted = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 4)
                setTopProducts(sorted)
                setRecentOrders(orders.slice(0, 5))
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    if (loading) return (
        <div className='min-h-screen bg-gray-50 flex'>
            <ShopSidebar />
            <div className='flex-1 flex justify-center py-20'>
                <div className='w-12 h-12 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin'></div>
            </div>
        </div>
    )

    return (
        <div className='min-h-screen bg-gray-50 flex'>
            <ShopSidebar />

            <div className='flex-1 overflow-auto'>
                <div className='max-w-7xl mx-auto px-8 py-8'>

                    {/* Header */}
                    <div className='flex items-center justify-between mb-8'>
                        <div>
                            <p className='text-sm font-bold text-gray-400 uppercase tracking-widest'>Bảng điều khiển</p>
                            <h1 className='text-3xl font-black text-gray-800'>Chào buổi tối, {shop?.name} 👋</h1>
                        </div>
                        <div className='w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden'>
                            {shop?.avatar
                                ? <img src={shop.avatar} className='w-full h-full object-cover' alt="avatar" />
                                : <span className='text-2xl'>🏪</span>
                            }
                        </div>
                    </div>

                    {/* Stats cards */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                        {[
                            { label: 'Doanh thu (vnđ)', value: stats.revenue.toLocaleString('vi-VN'), icon: '💰', color: 'bg-indigo-600', link: null },
                            { label: 'Tổng đơn đặt hàng', value: stats.orders, icon: '🛍', color: 'bg-orange-500', link: '/shop/orders' },
                            { label: 'Đơn giao thành công', value: stats.delivered, icon: '✅', color: 'bg-green-600', link: '/shop/orders' },
                            { label: 'Đơn hàng đã hủy', value: stats.cancelled, icon: '❌', color: 'bg-red-500', link: '/shop/orders' },
                        ].map((s, i) => (
                            <div
                                key={i}
                                onClick={() => s.link && navigate(s.link)}
                                className={`rounded-2xl p-6 text-white shadow-lg ${s.color} ${s.link ? 'cursor-pointer hover:scale-[1.02]' : ''} transition-all`}
                            >
                                <div className='flex items-center justify-between mb-4'>
                                    <p className='text-xs font-black uppercase tracking-widest opacity-80'>{s.label}</p>
                                    <span className='text-2xl bg-white/20 w-10 h-10 flex items-center justify-center rounded-xl'>{s.icon}</span>
                                </div>
                                <p className='text-3xl font-black truncate'>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
                        {/* Area Chart Doanh Thu */}
                        <div className='lg:col-span-2 bg-white rounded-3xl shadow-sm p-8 border border-gray-100'>
                            <div className='flex items-center justify-between mb-6'>
                                <div>
                                    <h3 className='font-black text-gray-800 text-lg uppercase'>Biểu đồ doanh thu</h3>
                                    <p className='text-sm font-bold text-gray-400'>Thống kê theo tháng trong năm</p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-2xl font-black text-indigo-600'>{stats.revenue.toLocaleString('vi-VN')}₫</p>
                                    <p className='text-xs font-bold text-green-500 uppercase'>Thanh toán hoàn tất</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        formatter={v => [v.toLocaleString('vi-VN') + '₫', 'Doanh thu']} 
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={4} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bar Chart Bán chạy */}
                        <div className='bg-white rounded-3xl shadow-sm p-8 border border-gray-100'>
                            <h3 className='font-black text-gray-800 text-lg uppercase mb-1'>Sản phẩm hot</h3>
                            <p className='text-sm font-bold text-gray-400 mb-6'>Top sản phẩm bán nhiều nhất</p>
                            
                            {topProducts.length === 0 ? (
                                <div className='h-[200px] flex items-center justify-center text-gray-400 font-bold italic'>Chưa có dữ liệu</div>
                            ) : (
                                <div className='space-y-6'>
                                    {topProducts.map((p, i) => (
                                        <div key={p.id} className='flex items-center gap-4'>
                                            <div className='w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-gray-400 shrink-0'>
                                                {i + 1}
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                                <p className='text-sm font-black text-gray-700 truncate uppercase'>{p.name}</p>
                                                <div className='w-full bg-gray-100 h-2 rounded-full mt-2'>
                                                    <div 
                                                        className='bg-orange-500 h-full rounded-full' 
                                                        style={{ width: `${(p.sold / topProducts[0].sold) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <p className='text-sm font-black text-gray-800'>{p.sold} <span className='text-[10px] text-gray-400'>SL</span></p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent orders table */}
                    <div className='bg-white rounded-3xl shadow-sm p-8 border border-gray-100'>
                        <div className='flex items-center justify-between mb-8'>
                            <div>
                                <h3 className='font-black text-gray-800 text-lg uppercase'>Giao dịch mới nhất</h3>
                                <p className='text-sm font-bold text-gray-400'>Theo dõi 5 đơn hàng gần đây</p>
                            </div>
                            <Link to='/shop/orders' className='text-sm font-black text-orange-500 hover:text-orange-600 bg-orange-50 px-5 py-2.5 rounded-xl transition no-underline uppercase'>
                                Xem tất cả đơn hàng
                            </Link>
                        </div>

                        <div className='overflow-x-auto'>
                            <table className='w-full text-left border-collapse'>
                                <thead>
                                    <tr className='text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50'>
                                        <th className='pb-4 pl-2 font-black'>Mã đơn hàng</th>
                                        <th className='pb-4 font-black'>Thời gian đặt</th>
                                        <th className='pb-4 font-black'>Sản phẩm mua</th>
                                        <th className='pb-4 text-right font-black'>Giá trị</th>
                                        <th className='pb-4 text-right font-black'>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => {
                                        const s = STATUS_LABEL[order.orderStatus] || {}
                                        return (
                                            <tr key={order.orderCode} className='border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition group'>
                                                <td className='py-5 pl-2 font-black text-gray-800'>{order.orderCode}</td>
                                                <td className='py-5 text-sm font-bold text-gray-500'>
                                                    {new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </td>
                                                <td className='py-5 text-sm font-bold text-gray-600'>
                                                    <span className='group-hover:text-orange-500 transition-colors'>
                                                        {order.items?.[0]?.productName?.slice(0, 30)}
                                                        {order.items?.length > 1 && <span className='text-orange-400 ml-1'>+{order.items.length - 1} món</span>}
                                                    </span>
                                                </td>
                                                <td className='py-5 text-right font-black text-gray-800'>
                                                    {Number(order.totalPrice).toLocaleString('vi-VN')}₫
                                                </td>
                                                <td className='py-5 text-right'>
                                                    <span className={`text-[11px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-wider ${s.color}`}>
                                                        {s.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {recentOrders.length === 0 && (
                            <div className='text-center py-10 font-black text-gray-300 italic'>Chưa có dữ liệu giao dịch</div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}