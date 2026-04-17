import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import adminService from '../../services/adminService'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0, shops: 0, activeShops: 0, lockedUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersRes, shopsRes] = await Promise.all([
          adminService.getAllUsers(),
          adminService.getAllShops(),
        ])
        const users = usersRes.data
        const shops = shopsRes.data
        setStats({
          users: users.length,
          shops: shops.length,
          activeShops: shops.filter(s => s.active).length,
          lockedUsers: users.filter(u => !u.enable).length,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const STAT_CARDS = [
    { label: 'Tổng người dùng',     value: stats.users,       icon: '👥', color: 'from-blue-600 to-indigo-700', shadow: 'shadow-blue-200',  link: '/admin/users' },
    { label: 'Tổng cửa hàng',       value: stats.shops,       icon: '🏪', color: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-200', link: '/admin/shops' },
    { label: 'Shop đang hoạt động', value: stats.activeShops, icon: '✅', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200', link: '/admin/shops' },
    { label: 'Tài khoản bị khóa',   value: stats.lockedUsers, icon: '🔒', color: 'from-slate-700 to-slate-900', shadow: 'shadow-slate-300',    link: '/admin/users' },
  ]

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        {/* Đồng bộ max-width và padding với ShopDashboard */}
        <div className="max-w-[1600px] mx-auto px-10 py-10">
          
          {/* Header */}
          <div className="mb-10">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[3px] mb-1">Hệ thống quản trị trung tâm</p>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tổng quan hệ thống</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-40">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards - Style Bento Gradient */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                {STAT_CARDS.map((s, i) => (
                  <Link
                    key={i}
                    to={s.link}
                    className={`group relative overflow-hidden bg-gradient-to-br ${s.color} rounded-[2rem] p-8 text-white shadow-xl ${s.shadow} transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl no-underline block`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-2xl bg-white/20 backdrop-blur-md w-12 h-12 flex items-center justify-center rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">
                          {s.icon}
                        </span>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Thống kê</p>
                      </div>
                      <p className="text-4xl font-black tracking-tighter mb-1">{s.value}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">{s.label}</p>
                    </div>
                    {/* Decorative Element */}
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                  </Link>
                ))}
              </div>

              {/* Quick Actions Section */}
              <div className="mb-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Lối tắt quản lý</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Đơn đăng ký shop', desc: 'Xem và duyệt đơn đăng ký mở shop', link: '/admin/registrations', icon: '📋', accent: 'border-orange-200' },
                    { label: 'Quản lý người dùng', desc: 'Khóa/mở tài khoản, phân quyền role', link: '/admin/users', icon: '👥', accent: 'border-indigo-200' },
                    { label: 'Quản lý cửa hàng', desc: 'Khóa/mở cửa hàng trên hệ thống', link: '/admin/shops', icon: '🏪', accent: 'border-emerald-200' },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.link}
                      className={`bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:border-indigo-100 transition-all duration-300 no-underline group block`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl mb-6 group-hover:bg-indigo-50 transition-colors">
                        {item.icon}
                      </div>
                      <p className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">
                        {item.label}
                      </p>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed">
                        {item.desc}
                      </p>
                      <div className="mt-6 flex items-center text-[10px] font-bold text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                        Truy cập ngay →
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}