import  { useState, useEffect} from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import adminService from '../../services/adminService'


export default function AdminDashboard(){
    const [stats, setStats] = useState({users:0, shops:0, activeShop:0, lockedUsers:0})
    const [loading, setLoading] = useState(true)

    useEffect ( ()=> {
        const fetchAll = async ()=> {
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
                    lockedUsers: users.filter(u => !u.enable).length
                })
            } catch (err){
                console.error(err)
            }   finally {
                setLoading(false)
            }
        }
        fetchAll()
    },[])

     const STAT_CARDS = [
        { label: 'Tổng người dùng', value: stats.users, icon: '👥', color: 'text-blue-600' },
        { label: 'Tổng cửa hàng', value: stats.shops, icon: '🏪', color: 'text-orange-500' },
        { label: 'Shop đang hoạt động', value: stats.activeShops, icon: '✅', color: 'text-green-600' },
        { label: 'Tài khoản bị khóa', value: stats.lockedUsers, icon: '🔒', color: 'text-red-500' },
    ]

    return (
        <div className='flex min-h-screen bg-gray-100'>
            <AdminSidebar/>
            <div className='flex-1 px-6 py-5'>
                <h2 className='text-lg font-bold text-gray-700 mb-5'>Tổng quan hệ thống</h2>

                {loading ? (
                    <div className='flex justify-center py-20'>
                        <div className='w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin'>

                        </div>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        {STAT_CARDS.map((s, i) => (
                            <div key={i} className='bg-white rounded-lg shadow-sm p-5'>
                                <p className='text-3xl b-2'>{s.icon}</p>
                                <p className={`text-2xl font-bol ${s.color}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}