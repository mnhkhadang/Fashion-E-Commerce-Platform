import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import StatusBadge from '../../components/ui/StatusBadge'
import api from '../../services/api'

export default function AdminRegistrations() {
  const [regs, setRegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('PENDING')
  const [processing, setProcessing] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    api.get('/shop-registrations')
      .then(res => setRegs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleApprove = async (id) => {
    if (!window.confirm('Duyệt đơn đăng ký này? Shop sẽ được khởi tạo ngay lập tức.')) return
    setProcessing(id + '_approve')
    try {
      const res = await api.put(`/shop-registrations/${id}/approve`)
      setRegs(prev => prev.map(r => r.id === id ? res.data : r))
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert('Vui lòng nhập lý do từ chối'); return }
    setProcessing(rejectModal.id + '_reject')
    try {
      const res = await api.put(
        `/shop-registrations/${rejectModal.id}/reject?reason=${encodeURIComponent(rejectReason)}`
      )
      setRegs(prev => prev.map(r => r.id === rejectModal.id ? res.data : r))
      setRejectModal(null)
      setRejectReason('')
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra')
    } finally {
      setProcessing(null)
    }
  }

  const filtered = regs.filter(r => filterStatus === 'ALL' || r.status === filterStatus)

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-10 py-10">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[3px] mb-1">Thẩm định đối tác</p>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Đơn Đăng Ký Shop</h2>
            </div>
            <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
                <span className="text-indigo-600 font-black text-lg">
                    {regs.filter(r => r.status === 'PENDING').length}
                </span>
                <span className="ml-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Đơn đang chờ duyệt</span>
            </div>
          </div>

          {/* Tabs - Modern Navigation */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8 flex p-1.5 border border-slate-100 overflow-x-auto">
            {[
              ['PENDING',  'Chờ duyệt'],
              ['APPROVED', 'Đã duyệt'],
              ['REJECTED', 'Từ chối'],
              ['ALL',      'Tất cả đơn'],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterStatus(val)}
                className={`flex-1 flex-shrink-0 px-8 py-3 text-[11px] font-extrabold rounded-xl transition-all duration-300 border-0 cursor-pointer uppercase tracking-widest ${
                  filterStatus === val
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {label}
                <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] ${filterStatus === val ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                   {val === 'ALL' ? regs.length : regs.filter(r => r.status === val).length}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-40">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-24 text-center">
              <p className="text-5xl mb-6 opacity-20 grayscale">📄</p>
              <p className="text-slate-400 text-lg font-bold italic">Không tìm thấy yêu cầu nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filtered.map(reg => (
                <div key={reg.id} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 p-8 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-300 group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    
                    {/* Shop Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                            🏪
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{reg.shopName}</h3>
                            <StatusBadge status={reg.status} type="shop" />
                          </div>
                          <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
                             Chủ sở hữu: {reg.ownerUsername}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-50">
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-slate-400">📧</span>
                            <span className="font-semibold text-slate-600">{reg.ownerEmail}</span>
                        </div>
                        {reg.phone && (
                          <div className="flex items-center gap-3 text-sm">
                              <span className="text-slate-400">📞</span>
                              <span className="font-semibold text-slate-600">{reg.phone}</span>
                          </div>
                        )}
                        {reg.address && (
                          <div className="flex items-center gap-3 text-sm md:col-span-2">
                              <span className="text-slate-400">📍</span>
                              <span className="font-medium text-slate-500">{reg.address}</span>
                          </div>
                        )}
                        {reg.description && (
                          <div className="md:col-span-2 mt-2 pt-3 border-t border-slate-100">
                             <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Mô tả định hướng</p>
                             <p className="text-sm italic text-slate-500 leading-relaxed">"{reg.description}"</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline & Actions */}
                    <div className="lg:w-72 flex flex-col justify-between items-end gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Ngày gửi đơn</p>
                        <p className="text-sm font-bold text-slate-400">
                          {new Date(reg.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {reg.rejectReason && (
                        <div className="w-full bg-rose-50 p-4 rounded-xl border border-rose-100 border-dashed">
                           <p className="text-[10px] font-black text-rose-400 uppercase mb-1 tracking-wider">Lý do từ chối</p>
                           <p className="text-xs text-rose-600 font-bold italic">{reg.rejectReason}</p>
                        </div>
                      )}

                      {reg.status === 'PENDING' && (
                        <div className="flex gap-3 w-full">
                          <button
                            onClick={() => handleApprove(reg.id)}
                            disabled={processing === reg.id + '_approve'}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black px-6 py-4 rounded-xl transition-all shadow-lg shadow-emerald-100 border-0 cursor-pointer uppercase tracking-widest disabled:opacity-50"
                          >
                            {processing === reg.id + '_approve' ? '...' : 'Duyệt đơn'}
                          </button>
                          <button
                            onClick={() => { setRejectModal({ id: reg.id, shopName: reg.shopName }); setRejectReason('') }}
                            className="flex-1 bg-white border border-rose-200 text-rose-500 text-[11px] font-black px-4 py-4 rounded-xl hover:bg-rose-50 transition-all cursor-pointer uppercase tracking-widest"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modern Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
             onClick={e => { if (e.target === e.currentTarget) setRejectModal(null) }}>
          <div className="bg-white rounded-[2rem] shadow-2xl p-10 w-full max-w-md mx-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-rose-500 rounded-full"></div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Từ chối đối tác</h3>
            </div>
            
            <p className="text-[11px] font-bold text-slate-400 mb-6 bg-slate-50 px-4 py-2 rounded-lg inline-block">
              Shop: {rejectModal.shopName}
            </p>

            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Lý do từ chối duyệt *</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Giải thích lý do shop chưa đủ điều kiện (Ví dụ: Địa chỉ không hợp lệ, hình ảnh vi phạm...)"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-rose-400 focus:bg-white transition-all shadow-inner resize-none mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={processing?.includes('_reject')}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-black px-6 py-4 rounded-xl transition-all shadow-lg shadow-rose-100 border-0 cursor-pointer uppercase tracking-widest disabled:opacity-50"
              >
                {processing?.includes('_reject') ? '...' : 'Xác nhận từ chối'}
              </button>
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 bg-white border border-slate-200 text-slate-400 text-[11px] font-black px-6 py-4 rounded-xl hover:bg-slate-50 transition-all cursor-pointer uppercase tracking-widest"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}