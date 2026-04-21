import React, { useState, useEffect } from 'react' // Đã thêm React để sửa lỗi
import AdminSidebar from '../../components/admin/AdminSidebar'
import adminService from '../../services/adminService'

const AVAILABLE_ROLES = ['ROLE_USER', 'ROLE_SHOP', 'ROLE_ADMIN']

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [processing, setProcessing] = useState(null)
  const [expandedUser, setExpandedUser] = useState(null)

  useEffect(() => {
    adminService.getAllUsers()
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async (email) => {
    if (!window.confirm(`Thay đổi trạng thái tài khoản ${email}?`)) return
    setProcessing(email + '_toggle')
    try {
      await adminService.toggleUser(email)
      setUsers(prev =>
        prev.map(u => u.email === email ? { ...u, enable: !u.enable } : u)
      )
    } catch {
      alert('Có lỗi xảy ra khi cập nhật trạng thái')
    } finally {
      setProcessing(null)
    }
  }

  const handleAssignRole = async (email, role) => {
    setProcessing(email + '_' + role)
    try {
      await adminService.assignRole(email, role)
      setUsers(prev =>
        prev.map(u =>
          u.email === email ? { ...u, roles: [...(u.roles || []), role] } : u
        )
      )
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra')
    } finally {
      setProcessing(null)
    }
  }

  const handleRemoveRole = async (email, role) => {
    setProcessing(email + '_' + role)
    try {
      await adminService.removeRole(email, role)
      setUsers(prev =>
        prev.map(u =>
          u.email === email ? { ...u, roles: (u.roles || []).filter(r => r !== role) } : u
        )
      )
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra')
    } finally {
      setProcessing(null)
    }
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-10 py-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[3px] mb-1">Cơ sở dữ liệu định danh</p>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Quản Lý Người Dùng</h2>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="text-right border-r border-slate-100 pr-4">
                    <p className="text-[9px] font-black text-slate-300 uppercase">Tổng tài khoản</p>
                    <p className="text-xl font-black text-slate-800 tracking-tighter">{users.length}</p>
                </div>
                <div>
                    <p className="text-[9px] font-black text-rose-400 uppercase">Đang khóa</p>
                    <p className="text-xl font-black text-rose-500 tracking-tighter">{users.filter(u => !u.enable).length}</p>
                </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8 relative group max-w-md">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo email hoặc tên người dùng..."
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium outline-none focus:border-indigo-400 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.05)] transition-all shadow-sm"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-40">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden transition-all">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-50">
                    <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người dùng</th>
                    <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vai trò (Roles)</th>
                    <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                    <th className="text-right px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(user => (
                    <React.Fragment key={user.email}>
                      <tr className={`group transition-colors hover:bg-slate-50/30 ${!user.enable ? 'bg-rose-50/10' : ''}`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                {user.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{user.username}</p>
                                <p className="text-xs font-bold text-slate-400 lowercase tracking-tight">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-wrap gap-1.5">
                            {user.roles?.map(r => (
                              <span
                                key={r}
                                className="text-[9px] font-black bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-tighter"
                              >
                                {r.replace('ROLE_', '')}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`inline-block text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${
                            user.enable
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-rose-50 text-rose-500 border-rose-100'
                          }`}>
                            {user.enable ? 'Active' : 'Locked'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => setExpandedUser(expandedUser === user.email ? null : user.email)}
                              className={`text-[11px] font-black px-5 py-2.5 rounded-xl transition-all border cursor-pointer uppercase tracking-widest shadow-sm ${
                                expandedUser === user.email 
                                ? 'bg-slate-800 text-white border-slate-800' 
                                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'
                              }`}
                            >
                              {expandedUser === user.email ? 'Đóng' : 'Sửa Roles'}
                            </button>
                            <button
                              onClick={() => handleToggle(user.email)}
                              disabled={processing === user.email + '_toggle'}
                              className={`text-[11px] font-black px-5 py-2.5 rounded-xl transition-all border-0 cursor-pointer shadow-md uppercase tracking-widest active:scale-95 disabled:opacity-30 ${
                                user.enable
                                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-100'
                                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100'
                              }`}
                            >
                              {processing === user.email + '_toggle' ? '...' : user.enable ? 'Khóa' : 'Mở khóa'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Phân quyền Role Row */}
                      {expandedUser === user.email && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={4} className="px-8 py-8 animate-fadeIn">
                            <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-inner">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
                                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                                        Đặc quyền hệ thống: <span className="text-indigo-500">{user.email}</span>
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {AVAILABLE_ROLES.map(role => {
                                      const hasRole = user.roles?.includes(role)
                                      const isProcessing = processing === user.email + '_' + role
                                      return (
                                        <button
                                          key={role}
                                          onClick={() => hasRole ? handleRemoveRole(user.email, role) : handleAssignRole(user.email, role)}
                                          disabled={isProcessing}
                                          className={`text-[11px] font-bold px-6 py-3 rounded-xl border-2 transition-all cursor-pointer uppercase tracking-widest active:scale-95 disabled:opacity-30 ${
                                            hasRole
                                              ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-rose-500 hover:border-rose-500 shadow-lg shadow-indigo-100'
                                              : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200 hover:text-indigo-500'
                                          }`}
                                        >
                                          {isProcessing ? '...' : hasRole ? `✓ ${role.replace('ROLE_', '')}` : `+ ${role.replace('ROLE_', '')}`}
                                        </button>
                                      )
                                    })}
                                </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-24 text-slate-300 font-bold italic border-t border-slate-50">
                  <span className="text-4xl block mb-4 grayscale opacity-20">🔎</span>
                  Không tìm thấy tài khoản nào phù hợp
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}