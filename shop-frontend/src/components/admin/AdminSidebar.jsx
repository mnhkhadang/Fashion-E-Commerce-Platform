import { Link, useLocation } from 'react-router-dom'

export default function AdminSidebar() {
  const location = useLocation()
  
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Người dùng', path: '/admin/users', icon: '👥' },
    { name: 'Cửa hàng', path: '/admin/shops', icon: '🏪' },
    { name: 'Đơn đăng ký', path: '/admin/registrations', icon: '📝' },
    { name: 'Danh mục', path: '/admin/categories', icon: '📂' },
    { name: 'Báo cáo vi phạm', path: '/admin/reports', icon: '⚠️' },
    { name: 'Mở khóa', path: '/admin/unlock-requests', icon: '🔓' },
    { name: 'Khuyến mãi & Sales', path: '/admin/sales', icon: '💰' }, // Cập nhật
  ]

  return (
    <div className="w-[280px] bg-slate-900 min-h-screen p-6 flex flex-col shrink-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl">🛡️</div>
        <div>
          <h1 className="text-white font-black text-lg tracking-tight">ADMIN PANEL</h1>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">ShopVN System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all no-underline ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <Link to="/" className="flex items-center gap-4 px-5 py-3 text-slate-500 hover:text-white text-xs font-bold no-underline transition">
           🏠 Quay về trang chủ
        </Link>
      </div>
    </div>
  )
}   