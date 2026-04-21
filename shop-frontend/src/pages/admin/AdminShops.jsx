import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import StatusBadge from '../../components/ui/StatusBadge'
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
    if (!window.confirm('Xác nhận thay đổi trạng thái hoạt động của cửa hàng này?')) return
    setProcessing(ownerEmail)
    try {
      await adminService.toggleShop(ownerEmail)
      setShops(prev => prev.map(s => s.ownerEmail === ownerEmail ? { ...s, active: !s.active } : s))
    } catch { alert('Có lỗi xảy ra khi cập nhật trạng thái') }
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
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-10 py-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[3px] mb-1">Kiểm soát đối tác</p>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Quản Lý Cửa Hàng</h2>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                <div className="px-4 py-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tổng hệ thống</p>
                    <p className="text-xl font-black text-indigo-600 tracking-tighter">{shops.length} <span className="text-xs text-slate-400">Shop</span></p>
                </div>
            </div>
          </div>

          {/* Filter & Search Bar - Modern Style */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1 relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm tên shop, email chủ sở hữu..."
                className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium outline-none focus:border-indigo-400 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.05)] transition-all shadow-sm"
              />
            </div>
            
            <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex overflow-hidden">
              {[
                ['all', 'Tất cả'],
                ['active', 'Đang hoạt động'],
                ['locked', 'Đang khóa']
              ].map(([val, label]) => (
                <button 
                  key={val} 
                  onClick={() => setFilterActive(val)}
                  className={`px-8 py-3 text-[11px] font-extrabold rounded-xl transition-all duration-300 border-0 cursor-pointer uppercase tracking-widest ${
                    filterActive === val 
                      ? 'bg-slate-900 text-white shadow-lg' 
                      : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-40">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-24 text-center shadow-sm">
                  <p className="text-5xl mb-6 opacity-20 grayscale">🏪</p>
                  <p className="text-slate-400 text-lg font-bold italic">Không tìm thấy cửa hàng phù hợp</p>
                </div>
              ) : filtered.map(shop => (
                <div key={shop.id} className={`bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 flex items-center gap-6 border border-slate-100 hover:border-indigo-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-300 group ${!shop.active ? 'bg-slate-50/50 grayscale-[0.3]' : ''}`}>
                  
                  {/* Avatar Section */}
                  <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    {shop.avatar
                      ? <img src={shop.avatar} alt={shop.name} className="w-full h-full object-cover" />
                      : <span className="text-3xl">🏪</span>}
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate">{shop.name}</h3>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                        shop.active 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-500 border border-rose-100'
                      }`}>
                        {shop.active ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                        <p className="text-xs font-bold text-indigo-500 flex items-center gap-2">
                            <span className="opacity-40">👤</span> {shop.ownerEmail}
                        </p>
                        {shop.phone && (
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                <span className="opacity-40">📞</span> {shop.phone}
                            </p>
                        )}
                        {shop.address && (
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-2 truncate max-w-md">
                                <span className="opacity-40">📍</span> {shop.address}
                            </p>
                        )}
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="shrink-0 pl-6 border-l border-slate-50">
                    <button
                      onClick={() => handleToggle(shop.ownerEmail)}
                      disabled={processing === shop.ownerEmail}
                      className={`text-[11px] font-black px-8 py-3 rounded-xl transition-all duration-300 shadow-md border-0 cursor-pointer uppercase tracking-widest active:scale-95 disabled:opacity-30 ${
                        shop.active
                          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-100'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100'
                      }`}
                    >
                      {processing === shop.ownerEmail ? '...' : shop.active ? 'Khóa Shop' : 'Mở khóa'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}