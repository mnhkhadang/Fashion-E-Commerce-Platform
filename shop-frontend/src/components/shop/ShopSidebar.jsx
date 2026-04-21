import { Link, useLocation } from 'react-router-dom'

export default function ShopSidebar() {
  const location = useLocation()
  
  const menuItems = [
    { name: 'Tổng quan', path: '/shop', icon: '📊' },
    { name: 'Sản phẩm', path: '/shop/products', icon: '📦' },
    { name: 'Đơn hàng', path: '/shop/orders', icon: '🛒' },
    { name: 'Khuyến mãi & Sales', path: '/shop/sales', icon: '💰' }, // Cập nhật
    { name: 'Đổi trả', path: '/shop/returns', icon: '🔄' },
    { name: 'Thông tin shop', path: '/shop/profile', icon: '🏪' },
  ]

  return (
    <div className="w-[260px] bg-white border-r border-slate-100 min-h-screen p-6 flex flex-col shrink-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl">🏪</div>
        <div>
          <h1 className="text-slate-900 font-black text-sm tracking-tight uppercase">Shop Manager</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl text-[13px] font-bold transition-all no-underline ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-slate-50">
        <Link to="/" className="flex items-center gap-4 px-5 py-3 text-slate-400 hover:text-slate-700 text-xs font-bold no-underline transition">
           🏠 Trang chủ
        </Link>
      </div>
    </div>
  )
}