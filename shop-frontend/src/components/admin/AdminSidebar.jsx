import {NavLink} from 'react-router-dom'
import AdminNav from './AdminNav'

export default function AdminSidebar() {
    return (
        <aside className='w-56 min-h-screen bg-white shadow-sm shrink-0'>
            <div className='px-5 py-4 border-b border-gray-100'>
                <p className='text-xs text-gray-400 uppercase tracking-wider'>Admin Panel</p>
                <p className='text-base font-bold text-orange-500 mt-0.5'>Quản trị viên</p>
            </div>
            <nav className='py-3'>
                {AdminNav.map(item => (
                    <NavLink
                        key={item.path}
                        to ={item.path}
                        end={item.end}
                        className={({isActive}) => 
                            `flex items-center gap-3 px-5 py-2.5 text-sm transition ${
                                isActive
                                    ? `bg-orange-50 text-orange-500 font-medium border-r-2 border-orange-500`
                                    : `text-gray-600 hover:bg-gray-50 hover:text-orange-400`
                            }`
                        }
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}