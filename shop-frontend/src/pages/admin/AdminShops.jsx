import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import adminService from '../../services/adminService'

export default function AdminShops() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [processing, setProcessing] = useState(null)
  const [filterActive, setFilterActive] = useState('all')

  useEffect(() => {
    adminService.getAllShops()
      .then(res => setShops(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async (ownerEmail) => {
    setProcessing(ownerEmail)
    try {
      await adminService.toggleShop(ownerEmail)
      setShops(prev => prev.map(s => s.ownerEmail === ownerEmail ? { ...s, active: !s.active } : s))
    } catch { alert('Có lỗi xảy ra') }
    finally { setProcessing(null) }
  }

  const filtered = shops.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.ownerEmail?.toLowerCase().includes(search.toLowerCase())
    if (filterActive === 'active') return matchSearch && s.active
    if (filterActive === 'locked') return matchSearch && !s.active
    return matchSearch
  })

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 px-6 py-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-700">Quản Lý Cửa Hàng</h2>
          <span className="text-sm text-gray-400">{shops.length} cửa hàng</span>
        </div>

        {/* Filter + Search */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên shop hoặc email..."
            className="flex-1 max-w-sm border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400"
          />
          <div className="flex bg-white rounded border border-gray-200 overflow-hidden text-sm">
            {[['all', 'Tất cả'], ['active', 'Hoạt động'], ['locked', 'Bị khóa']].map(([val, label]) => (
              <button key={val} onClick={() => setFilterActive(val)}
                className={`px-3 py-2 transition cursor-pointer border-0 ${filterActive === val ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-400 text-sm">
                Không tìm thấy cửa hàng nào
              </div>
            ) : filtered.map(shop => (
              <div key={shop.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {shop.avatar
                    ? <img src={shop.avatar} alt={shop.name} className="w-full h-full object-cover" />
                    : <span className="text-xl">🏪</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-700">{shop.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${shop.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                      {shop.active ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">👤 {shop.ownerEmail}</p>
                  {shop.address && <p className="text-xs text-gray-400">📍 {shop.address}</p>}
                  {shop.phone && <p className="text-xs text-gray-400">📞 {shop.phone}</p>}
                </div>
                <button
                  onClick={() => handleToggle(shop.ownerEmail)}
                  disabled={processing === shop.ownerEmail}
                  className={`text-xs border px-3 py-1.5 rounded transition cursor-pointer bg-white disabled:opacity-50 shrink-0 ${
                    shop.active
                      ? 'border-red-300 text-red-400 hover:bg-red-50'
                      : 'border-green-300 text-green-500 hover:bg-green-50'
                  }`}
                >
                  {processing === shop.ownerEmail ? '...' : shop.active ? 'Khóa shop' : 'Mở khóa'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}