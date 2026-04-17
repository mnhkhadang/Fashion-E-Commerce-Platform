import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../services/api'

export default function AdminUnlockRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    api.get('/admin/unlock-requests')
      .then(res => setRequests(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleApprove = async (id, email) => {
    if (!window.confirm(`Xác nhận mở khóa tài khoản ${email}? Người dùng sẽ có thể đăng nhập lại ngay lập tức.`)) return
    setProcessing(id + '_approve')
    try {
      await api.post(`/admin/unlock-requests/${id}/approve`)
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Từ chối yêu cầu mở khóa này?')) return
    setProcessing(id + '_reject')
    try {
      await api.post(`/admin/unlock-requests/${id}/reject`)
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-10 py-10">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[3px] mb-1">Hỗ trợ khôi phục</p>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Yêu Cầu Mở Khóa</h2>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-slate-800 font-black text-lg">{requests.length}</span>
                <span className="ml-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đơn chờ xử lý</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-40">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-24 text-center shadow-sm">
              <p className="text-5xl mb-6 grayscale opacity-20">🔓</p>
              <p className="text-slate-400 text-lg font-bold italic">Không có yêu cầu mở khóa nào cần xử lý</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {requests.map(req => (
                <div key={req.id} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 p-8 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 group">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
                    
                    {/* Thông tin yêu cầu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-xl shadow-inner group-hover:bg-rose-100 transition-colors">
                            🔒
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Tài khoản yêu cầu</p>
                          <h3 className="text-lg font-black text-slate-800 tracking-tight">{req.email}</h3>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-50 relative overflow-hidden">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span> Lý do khôi phục
                        </p>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed italic relative z-10">
                          "{req.reason}"
                        </p>
                        <span className="absolute -right-4 -bottom-6 text-7xl opacity-[0.03] select-none pointer-events-none">📝</span>
                      </div>

                      <div className="mt-6">
                         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                            Yêu cầu gửi lúc: {new Date(req.createdAt).toLocaleDateString('vi-VN', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                         </p>
                      </div>
                    </div>

                    {/* Các nút hành động */}
                    <div className="lg:w-48 flex flex-col gap-3 shrink-0 pt-2">
                      <button
                        onClick={() => handleApprove(req.id, req.email)}
                        disabled={processing?.startsWith(req.id)}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black px-6 py-4 rounded-xl transition-all shadow-lg shadow-emerald-100 border-0 cursor-pointer uppercase tracking-widest disabled:opacity-50 active:scale-[0.98]"
                      >
                        {processing === req.id + '_approve' ? '...' : '✓ Duyệt mở khóa'}
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={processing?.startsWith(req.id)}
                        className="w-full bg-white border border-slate-200 text-slate-400 text-[11px] font-black px-6 py-4 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-all cursor-pointer uppercase tracking-widest disabled:opacity-50"
                      >
                        {processing === req.id + '_reject' ? '...' : '✕ Từ chối đơn'}
                      </button>
                    </div>

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