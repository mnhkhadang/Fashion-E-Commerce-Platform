import {Link, useNavigate} from 'react-router-dom'
import {useAuth} from '../context/useAuth'

const NAV_LINKS = [
  { label: '⚡ Flash Sale', hot: true },
  { label: 'Hàng mới về' },
  { label: 'Bán chạy nhất' },
  { label: '🚚 Miễn phí ship' },
  { label: 'Voucher hôm nay' },
]

export default function Header({searchQuery, onSearchChange}){
  const { user, logout} = useAuth()
  const navigate = useNavigate()

  const handleLogout = () =>{
    logout()
    navigate('/login')
  }

  return (
    <header className='sticky top-0 z-50 bg-gradient-to-r from-red-600 to-orange-500 shadow-lg shadow-red-500/50'>
      <div className='max-w-6xl mx-auto px-4'>
        {/* top row */}
        <div className='flex items-center gap-3 py-3'>
          <Link to="/" className="flex items-center gap-2 shrink-0 no-underline" aria-label="ShopVN">
            <span className='w-9 h-9 rounded-lg bg-white/20 grid place-items-center text-xl select-none'>🛍</span>
            <span>
              <p className='text-white font-black text-xl leading-none tracking-tight m-0'>ShopVN</p>
              <p className='text-white/70 text-[10px] font-semibold tracking-widest uppercase leading-none mt-0.5 m-0.5'>Mua sắm thông minh</p>
            </span>
          </Link>

          {/* search */}
          <div className='flex-1 max-w-xl'>
            <div className='flex items-center bg-white rounded overflow-hidden shadow-md'>
              <input 
                type="text"
                autoComplete="off"
                placeholder="Tìm kiếm sản phẩm, thương hiệu...."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className='flex-1 px-4 py-2 text-sm text-gray-800 outline-none placeholder-gray-300 bg-transparent border-0' 
              />
              <button className='flex items-center gap-1.5 bg-orange-500 hover:bg-red-600 transition-colors text-white px-5 py-2.5 text-sm font-semibold shrink-0 border-0 cursor-pointer'>
                🔍 Tìm
              </button>              
            </div>
          </div>

          {/* Actions */}
          <div className='hidden sm:flex items-center gap-1 shrink-0 ml-auto'>
            {user ? (
              <>
                {/* Giỏ hàng - chỉ USER */}
                {user.roles.includes('ROLE_USER') && (
                  <Link to="/cart" className='text-white bg-white/15 hover:bg-white/25 rounded px-3 py-2 text-xs font-semibold no-underline'>
                    🛒 Giỏ hàng
                  </Link>
                )}

                {/* Dropdown user */}
                <div className='relative group'>
                  <button className='flex items-center gap-2 text-white bg-white/15 hover:bg-white/25 rounded px-3 py-2 text-xs font-semibold border-0 cursor-pointer'>
                    👤 {user.username} ▾
                  </button>
                  <div className='absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50'>

                    {/* USER links */}
                    {user.roles.includes('ROLE_USER') && (
                      <>
                        <Link to="/profile" className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 no-underline'>
                          👤 Tài khoản của tôi
                        </Link>
                        <Link to="/orders" className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 no-underline'>
                          📦 Đơn mua
                        </Link>
                        <Link to="/profile/address" className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 no-underline'>
                          📍 Địa chỉ của tôi
                        </Link>
                        {!user.roles.includes('ROLE_SHOP') && (
                          <Link to="/register-shop" className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 no-underline'>
                            🏪 Đăng ký bán hàng
                          </Link>
                        )}
                        <Link to="/register-shop/status" className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 no-underline'>
                        📋 Trạng thái đăng ký shop
                      </Link>
                      </>
                    )}

                    {/* SHOP links */}
                    {user.roles.includes('ROLE_SHOP') && (
                      <>
                        <div className='px-4 py-1.5 text-[10px] text-gray-400 uppercase tracking-wider font-semibold bg-gray-50'>
                          Quản lý shop
                        </div>
                        <Link to="/shop" className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 no-underline'>
                          🏪 Dashboard
                        </Link>
                        <Link to="/shop/products" className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 no-underline'>
                          📦 Sản phẩm
                        </Link>
                        <Link to="/shop/orders" className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 no-underline'>
                          🛍 Đơn hàng
                        </Link>
                      </>
                    )}

                    {/* ADMIN links */}
                    {user.roles.includes('ROLE_ADMIN') && (
                      <>
                        <div className='px-4 py-1.5 text-[10px] text-gray-400 uppercase tracking-wider font-semibold bg-gray-50'>
                          Quản trị
                        </div>
                        <Link to="/admin" className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 no-underline'>
                          ⚙️ Admin Panel
                        </Link>
                        <Link to="/admin/registrations" className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 no-underline'>
                          📋 Đơn đăng ký shop
                        </Link>
                      </>
                    )}

                    <div className='border-t border-gray-100'></div>
                    <button onClick={handleLogout} className='w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer bg-transparent border-0'>
                      🚪 Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className='text-white bg-white/15 hover:bg-white/25 rounded px-3 py-2 text-xs font-semibold no-underline'>Đăng nhập</Link>
                <Link to="/register" className='text-white bg-white/15 hover:bg-white/25 rounded px-3 py-2 text-xs font-semibold no-underline'>Đăng ký</Link>
              </>
            )}      
          </div>
        </div>

        {/* sub-navigation */}
        <nav className='border-t border-white/20 py-1.5'>
          <ul className='flex gap-1 list-none m-0 p-0 overflow-x-auto'>
            {NAV_LINKS.map(({ label, hot}) => (
              <li key={label}>
                <a href="#" onClick={e => e.preventDefault()}
                  className={`block px-3 py-1 rounded-full text-[13px] whitespace-nowrap transition-colors no-underline ${hot ? 'text-white font-bold hover:bg-white/20' : 'text-white/80 font-medium hover:text-white hover:bg-white/15'}`}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}