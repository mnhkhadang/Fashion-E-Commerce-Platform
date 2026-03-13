import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import api from '../services/api'
import { useAuth } from '../context/useAuth'

const ROLE_LABEL = {
    'ROLE_USER':  { label: 'Người dùng', color: 'bg-blue-100 text-blue-600' },
    'ROLE_SHOP':  { label: 'Shop',        color: 'bg-orange-100 text-orange-600' },
    'ROLE_ADMIN': { label: 'Admin',       color: 'bg-red-100 text-red-600' },
}

export default function Profile() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const { user: authUser, login } = useAuth()

    const [editingUsername, setEditingUsername] = useState(false)
    const [newUsername, setNewUsername] = useState('')
    const [savingUsername, setSavingUsername] = useState(false)
    const [usernameSuccess, setUsernameSuccess] = useState('')

    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [pwError, setPwError] = useState('')
    const [pwSuccess, setPwSuccess] = useState('')
    const [savingPw, setSavingPw] = useState(false)

    useEffect(() => {
        api.get('/api/user/profile')
            .then(res => {
                setProfile(res.data)
                setNewUsername(res.data.username)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleUpdateUsername = async () => {
        if (!newUsername.trim()) { alert('Tên không được để trống'); return }
        setSavingUsername(true)
        setUsernameSuccess('')
        try {
            await api.put('/api/user/profile', { username: newUsername })
            
            // Update context với username mới
            login(
                { ...authUser, username: newUsername },
                localStorage.getItem('accessToken'),
                localStorage.getItem('refreshToken')
            )
            setProfile(p => ({ ...p, username: newUsername }))
            setEditingUsername(false)
            setUsernameSuccess('Đổi tên thành công!')
            setTimeout(() => setUsernameSuccess(''), 3000)
        } catch (err) {
            alert(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra')
        } finally {
            setSavingUsername(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setPwError('')
        setPwSuccess('')
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwError('Mật khẩu xác nhận không khớp')
            return
        }
        if (pwForm.newPassword.length < 6) {
            setPwError('Mật khẩu mới phải có ít nhất 6 ký tự')
            return
        }
        setSavingPw(true)
        try {
            await api.put('/api/user/change-password', {
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            })
            setPwSuccess('Đổi mật khẩu thành công!')
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            setPwError(err.response?.data || 'Mật khẩu hiện tại không đúng')
        } finally {
            setSavingPw(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-100">
            <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"></div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-100">
            <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <div className="max-w-2xl mx-auto px-4 py-5">
                <h2 className="text-lg font-bold text-gray-700 mb-4">Tài Khoản Của Tôi</h2>

                {/* Thông tin cơ bản */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
                    <h3 className="font-semibold text-gray-700 mb-4 text-sm">Thông tin cá nhân</h3>

                    {usernameSuccess && (
                        <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-4 text-sm">
                            ✓ {usernameSuccess}
                        </div>
                    )}

                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl shrink-0">
                            👤
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700">{authUser?.username}</p>
                            <p className="text-xs text-gray-400">{authUser?.email}</p>
                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                {profile?.roles?.map(role => {
                                    const r = ROLE_LABEL[role] || { label: role, color: 'bg-gray-100 text-gray-500' }
                                    return (
                                        <span key={role} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.color}`}>
                                            {r.label}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Email - readonly */}
                    <div className="mb-3">
                        <label className="text-xs text-gray-500 mb-1 block">Email</label>
                        <input
                            type="text"
                            value={authUser?.email || ''}
                            disabled
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-400"
                        />
                    </div>

                    {/* Username - editable */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Tên người dùng</label>
                        {editingUsername ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={e => setNewUsername(e.target.value)}
                                    className="flex-1 border border-orange-400 rounded px-3 py-2 text-sm outline-none"
                                    autoFocus
                                />
                                <button onClick={handleUpdateUsername} disabled={savingUsername}
                                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded cursor-pointer border-0 disabled:opacity-50">
                                    {savingUsername ? '...' : 'Lưu'}
                                </button>
                                <button onClick={() => { setEditingUsername(false); setNewUsername(authUser?.username) }}
                                    className="border border-gray-300 text-gray-500 text-sm px-4 py-2 rounded hover:bg-gray-50 cursor-pointer bg-white">
                                    Hủy
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={authUser?.username || ''}
                                    disabled
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-500"
                                />
                                <button onClick={() => setEditingUsername(true)}
                                    className="border border-blue-300 text-blue-500 text-sm px-4 py-2 rounded hover:bg-blue-50 cursor-pointer bg-white">
                                    Sửa
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Đổi mật khẩu */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <h3 className="font-semibold text-gray-700 mb-4 text-sm">Đổi mật khẩu</h3>

                    {pwError && (
                        <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-3 text-sm">{pwError}</div>
                    )}
                    {pwSuccess && (
                        <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-3 text-sm">✓ {pwSuccess}</div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                value={pwForm.currentPassword}
                                onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                                placeholder="••••••••"
                                required
                                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Mật khẩu mới</label>
                            <input
                                type="password"
                                value={pwForm.newPassword}
                                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                                placeholder="••••••••"
                                required
                                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                value={pwForm.confirmPassword}
                                onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                placeholder="••••••••"
                                required
                                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400"
                            />
                        </div>
                        <button type="submit" disabled={savingPw}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded text-sm font-semibold transition cursor-pointer border-0 disabled:opacity-50">
                            {savingPw ? 'Đang lưu...' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    )
}