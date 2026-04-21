import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, YAxis } from 'recharts'
import ShopSidebar from '../../components/shop/ShopSidebar'
import StatusBadge from '../../components/ui/StatusBadge'
import shopService from '../../services/shopService'
import productService from '../../services/productService'
import orderService from '../../services/orderService'

const MONTH_LABELS = ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12']

export default function ShopDashboard() {
  const navigate = useNavigate()
  const [shop, setShop] = useState(null)
  const [stats, setStats] = useState({
    products: 0, orders: 0, revenue: 0, pending: 0, cancelled: 0, delivered: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [shopRes, productsRes, ordersRes] = await Promise.all([
          shopService.getMyShop(),
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
        orders
          .filter(o => o.orderStatus === 'DELIVERED')
          .forEach(o => {
            const month = new Date(o.createdAt).getMonth()
            byMonth[month] += Number(o.totalPrice)
          })
        setRevenueData(MONTH_LABELS.map((label, i) => ({ label, value: byMonth[i] })))

        const sorted = [...products]
          .sort((a, b) => (b.sold || 0) - (a.sold || 0))
          .slice(0, 4)
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
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <ShopSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-10 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[3px] mb-1">Hệ thống quản trị</p>
              <h1 className="text-3xl font-extrabold text-slate-800">Chào, {shop?.name} 👋</h1>
            </div>
            <div className="group relative">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-300">
                {shop?.avatar
                    ? <img src={shop.avatar} className="w-full h-full object-cover" alt="avatar" />
                    : <span className="text-2xl">🏪</span>
                }
                </div>
            </div>
          </div>

          {/* Stats - Cập nhật Gradient và Hiệu ứng */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Doanh thu (vnđ)', value: stats.revenue.toLocaleString('vi-VN'), icon: '💰', color: 'from-indigo-600 to-indigo-700', shadow: 'shadow-indigo-200', link: null },
              { label: 'Tổng đơn hàng',   value: stats.orders,     icon: '🛍',  color: 'from-amber-500 to-orange-600', shadow: 'shadow-orange-200', link: '/shop/orders' },
              { label: 'Giao thành công', value: stats.delivered, icon: '✅',  color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200',  link: '/shop/orders' },
              { label: 'Đơn đã hủy',      value: stats.cancelled, icon: '❌',  color: 'from-slate-700 to-slate-800', shadow: 'shadow-slate-200',    link: '/shop/orders' },
            ].map((s, i) => (
              <div
                key={i}
                onClick={() => s.link && navigate(s.link)}
                className={`group relative overflow-hidden rounded-2xl p-6 text-white shadow-xl transition-all duration-300 bg-gradient-to-br ${s.color} ${s.shadow} ${s.link ? 'cursor-pointer hover:-translate-y-1' : ''}`}
              >
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{s.label}</p>
                        <span className="text-xl bg-white/20 backdrop-blur-md w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 group-hover:scale-110 transition-transform">
                            {s.icon}
                        </span>
                    </div>
                    <p className="text-2xl font-black tracking-tight">{s.value}</p>
                </div>
                {/* Decorative circle */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Area Chart - Cập nhật màu Indigo dịu hơn */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight">Biểu đồ doanh thu</h3>
                  <p className="text-sm text-slate-400 font-medium">Phân tích dòng tiền hàng tháng</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600 tracking-tighter">
                    {stats.revenue.toLocaleString('vi-VN')}₫
                  </p>
                  <span className="inline-block px-2 py-1 bg-emerald-50 text-[10px] font-bold text-emerald-600 rounded-md uppercase">Tăng trưởng tốt</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    dy={15}
                  />
                  <YAxis hide domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 800, color: '#4338ca' }}
                    formatter={v => [v.toLocaleString('vi-VN') + '₫', 'Doanh thu']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products - Cập nhật màu Orange tinh tế */}
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight mb-1">Sản phẩm hot</h3>
              <p className="text-sm text-slate-400 font-medium mb-8">Thị hiếu người dùng</p>
              {topProducts.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-slate-300 font-medium italic">
                  Chưa có dữ liệu bán hàng
                </div>
              ) : (
                <div className="space-y-7">
                  {topProducts.map((p, i) => (
                    <div key={p.id} className="group flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-400 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors uppercase">{p.name}</p>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-orange-400 to-amber-500 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${topProducts[0].sold > 0 ? (p.sold / topProducts[0].sold) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-slate-800">{p.sold}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Đã bán</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders - Cập nhật Table tinh giản */}
          <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight">Giao dịch mới nhất</h3>
                <p className="text-sm text-slate-400 font-medium">Theo dõi các hoạt động vừa diễn ra</p>
              </div>
              <Link
                to="/shop/orders"
                className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 bg-slate-50 px-6 py-3 rounded-xl transition-all no-underline uppercase tracking-wider"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-[2px] border-b border-slate-50">
                    <th className="pb-5 pl-2">Mã đơn</th>
                    <th className="pb-5">Thời gian</th>
                    <th className="pb-5">Sản phẩm</th>
                    <th className="pb-5 text-right">Giá trị</th>
                    <th className="pb-5 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map(order => (
                    <tr
                      key={order.orderCode}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-5 pl-2 font-bold text-slate-700">#{order.orderCode}</td>
                      <td className="py-5 text-[13px] font-medium text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                        })}
                      </td>
                      <td className="py-5 text-sm font-semibold text-slate-600">
                        {order.items?.[0]?.productName?.slice(0, 30)}
                        {order.items?.length > 1 && (
                          <span className="inline-block bg-orange-50 text-orange-500 text-[10px] px-2 py-0.5 rounded ml-2 font-bold">
                            +{order.items.length - 1} món
                          </span>
                        )}
                      </td>
                      <td className="py-5 text-right font-bold text-slate-800">
                        {Number(order.totalPrice).toLocaleString('vi-VN')}₫
                      </td>
                      <td className="py-5 text-right">
                        <StatusBadge status={order.orderStatus} type="order" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {recentOrders.length === 0 && (
              <div className="text-center py-16 font-medium text-slate-300 italic bg-slate-50/30 rounded-2xl mt-4">
                Hiện tại chưa có giao dịch nào được ghi lại
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}