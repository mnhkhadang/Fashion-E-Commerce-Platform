import { Link, useLocation, useNavigate } from 'react-router-dom'
import { NAV_ITEMS } from './shopNav'

export default function ShopSidebar() {
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <aside className='w-100 shrink-0 bg-white shadow-sm min-h-screen flex flex-col py-6 px-3'>
            <div className='flex items-center gap-2 px-3 mb-8'>
                <span className='text-sm'>🏪</span>
                <span className='font-bold text-gray-800 text-lg'>Shop Manager</span>
            </div>
            <p className='text-[11px] text-gray-400 uppercase tracking-widest px-3 mb-2'>Main Menu</p>
            <nav className='flex flex-col gap-1'>
                {NAV_ITEMS.map(item => (
                    <Link
                        key={item.label}
                        to={item.link}
                        className={`flex items-center gap-3 px-3 py-5 rounded-lg text-base font-medium transition no-underline ${
                            location.pathname === item.link
                                ? 'bg-orange-50 text-orange-500'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                    >
                        <span className='text-base'>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className='mt-auto'>
                <button
                    onClick={() => navigate('/')}
                    className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 w-full cursor-pointer bg-transparent border-0'
                >
                    <span>🚪</span> Về trang chủ
                </button>
            </div>
        </aside>
    )
}