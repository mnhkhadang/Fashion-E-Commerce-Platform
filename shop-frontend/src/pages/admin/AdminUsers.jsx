import { useState, useEffect } from 'react'
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
    setProcessing(email + '_toggle')
    try {
      await adminService.toggleUser(email)
      setUsers(prev =>
        prev.map(u => u.email === email ? { ...u, enable: !u.enable } : u)
      )
    } catch {
      alert('Có lỗi xảy ra')
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
          // FIX: dùng u.roles (có s) — khớp với BE UserResponse
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
          // FIX: dùng u.roles (có s)
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
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 px-6 py-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-700">Quản lý người dùng</h2>
          <span className="text-sm text-gray-400">{users.length} người dùng</span>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo email hoặc tên..."
            className="w-full max-w-sm border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Người dùng</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Roles</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Trạng thái</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <>
                    <tr key={user.email} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-700">{user.username}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {/* FIX: dùng user.roles (có s), thêm optional chaining */}
                          {user.roles?.map(r => (
                            <span
                              key={r}
                              className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded"
                            >
                              {r.replace('ROLE_', '')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          user.enable
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {user.enable ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setExpandedUser(
                              expandedUser === user.email ? null : user.email
                            )}
                            className="text-xs border border-blue-300 text-blue-500 px-2.5 py-1 rounded hover:bg-blue-50 transition cursor-pointer bg-white"
                          >
                            {expandedUser === user.email ? 'Đóng' : 'Roles'}
                          </button>
                          <button
                            onClick={() => handleToggle(user.email)}
                            disabled={processing === user.email + '_toggle'}
                            className={`text-xs border px-2.5 py-1 rounded transition cursor-pointer bg-white disabled:opacity-50 ${
                              user.enable
                                ? 'border-red-300 text-red-400 hover:bg-red-50'
                                : 'border-green-300 text-green-500 hover:bg-green-50'
                            }`}
                          >
                            {processing === user.email + '_toggle'
                              ? '...'
                              : user.enable ? 'Khóa' : 'Mở khóa'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded role manager */}
                    {expandedUser === user.email && (
                      <tr key={user.email + '_roles'} className="bg-blue-50">
                        <td colSpan={4} className="px-5 py-3">
                          <p className="text-xs font-semibold text-gray-600 mb-2">
                            Quản lý role cho:{' '}
                            <span className="text-blue-600">{user.email}</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {AVAILABLE_ROLES.map(role => {
                              // FIX: dùng user.roles (có s)
                              const hasRole = user.roles?.includes(role)
                              const isProcessing = processing === user.email + '_' + role
                              return (
                                <button
                                  key={role}
                                  onClick={() =>
                                    hasRole
                                      ? handleRemoveRole(user.email, role)
                                      : handleAssignRole(user.email, role)
                                  }
                                  disabled={isProcessing}
                                  className={`text-xs px-3 py-1.5 rounded border transition cursor-pointer disabled:opacity-50 ${
                                    hasRole
                                      ? 'bg-blue-500 text-white border-blue-500 hover:bg-red-500 hover:border-red-500'
                                      : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400 hover:text-blue-500'
                                  }`}
                                >
                                  {isProcessing
                                    ? '...'
                                    : hasRole
                                    ? `✓ ${role.replace('ROLE_', '')}`
                                    : `+ ${role.replace('ROLE_', '')}`}
                                </button>
                              )
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                Không tìm thấy người dùng nào
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}