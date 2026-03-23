import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import adminService from '../../services/adminService'

export default function AdminDashboard() {
  // FIX: khởi tạo đúng tên field activeShops (có s)
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
          // FIX: đúng tên field activeShops
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
    { label: 'Tổng người dùng',     value: stats.users,       icon: '👥', color: 'text-blue-600',   link: '/admin/users' },
    { label: 'Tổng cửa hàng',       value: stats.shops,       icon: '🏪', color: 'text-orange-500', link: '/admin/shops' },
    { label: 'Shop đang hoạt động', value: stats.activeShops, icon: '✅', color: 'text-green-600',  link: '/admin/shops' },
    { label: 'Tài khoản bị khóa',   value: stats.lockedUsers, icon: '🔒', color: 'text-red-500',    link: '/admin/users' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 px-6 py-5">
        <h2 className="text-lg font-bold text-gray-700 mb-5">Tổng quan hệ thống</h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {STAT_CARDS.map((s, i) => (
              <Link
                key={i}
                to={s.link}
                className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition no-underline block"
              >
                <p className="text-3xl mb-2">{s.icon}</p>
                {/* FIX: font-bold thay vì font-bol */}
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </Link>
            ))}
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Đơn đăng ký shop', desc: 'Xem và duyệt đơn đăng ký mở shop', link: '/admin/registrations', icon: '📋' },
            { label: 'Quản lý users',    desc: 'Khóa/mở tài khoản, phân quyền role',  link: '/admin/users',         icon: '👥' },
            { label: 'Quản lý shops',    desc: 'Khóa/mở cửa hàng trên hệ thống',      link: '/admin/shops',         icon: '🏪' },
          ].map((item, i) => (
            <Link
              key={i}
              to={item.link}
              className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition no-underline block"
            >
              <p className="text-2xl mb-2">{item.icon}</p>
              <p className="text-sm font-semibold text-gray-700">{item.label}</p>
              <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}