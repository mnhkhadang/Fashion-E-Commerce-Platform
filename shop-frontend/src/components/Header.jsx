
// import { useState } from 'react'
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
    logout(),
    navigate('/login')
  }

  return (
    <header className='sticky top-0 z-50 bg-gradient-to-r from-red-600 to-orange-500 shadow-lg shadow-red-500/50'>
      <div className='max-w-6xl mx-auto px-4'>
        {/* top row */}
        <div className='flex items-center gap-3 py-3'>
          <Link to="/" className="flex items-center gap-2 shrink-0 no-underLine" aria-label="ShopVN">
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
                className='flex-1 px-4 py-2 text-sm text-gray-800 ountline-none placeholder-gray-300 bg-transparent border-0' 
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
                <span className='text-white text-xs px-3 py-2 '>Xin chào, <strong>{user.username}</strong></span>
                {
                  user.roles.includes('ROLE_SHOP') && (
                    <Link to="/shop" className='text-white bg-white/15 hover:bg-white/25 rounded px-3 py-2 text-xs font-semibold no-underline'>
                      🏪 Shop
                    </Link>                    
                  )
                }
                {
                  user.roles.includes('ROLE_ADMIN') && (
                    <Link to="/admin" className='text-white bg-white/15 hover:bg-white/25 rounded px-3 py-2 text-xs font-semibold no-underline'>
                      ⚙ Admin
                    </Link>
                  )
                }
                {user.roles.includes('ROLE_USER') && (
                  <Link to="/cart" className='text-white bg-white/15 hover:bg-white/25 rounded px-3 py-2 text-xs font-semibold no-underline'>
                    🛒 Giỏ hàng
                  </Link>
                )}
                <button onClick={handleLogout} className='text-white bg-white/15 hover:bg-white/25 rounded px-3 py-2 text-xs font-semibold no-underline'>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className='text-white bg-white/15 hover:bg-white/25 rounded px-3 py-2 text-xs font-semibold no-underline'>Đăng nhập</Link>
                <Link to="/register" className='text-white bg-white/15 hover:bg-white/25 rounded px-3 py-2 text-xs font-semibold no-uderline'>Đăng ký</Link>
              </>
            )}      
          </div>
        </div>
        {/* sub-navigation */}
        <nav className='border-t border-white/20 py-1.5'>
          <ul className='flex gap-1 list-none m-0 p-0 overflow-x-auto'>
            {
              NAV_LINKS.map(({ label, hot}) => (
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