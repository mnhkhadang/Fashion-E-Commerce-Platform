import { useState, useEffect } from 'react'
import ShopSidebar from '../../components/shop/ShopSidebar'
import StatusBadge from '../../components/ui/StatusBadge'
import returnService from '../../services/returnService'

const TABS = ['Tất cả', 'Chờ duyệt', 'Đang trả', 'Hoàn thành', 'Từ chối']
const TAB_STATUS = {
  'Tất cả':   null,
  'Chờ duyệt':['REQUESTED'],
  'Đang trả': ['APPROVED', 'RETURNING'],
  'Hoàn thành':['RETURNED'],
  'Từ chối':  ['REJECTED'],
}

export default function ShopReturns() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Chờ duyệt')
  const [processing, setProcessing] = useState(null)

  // Modal từ chối
  const [rejectModal, setRejectModal] = useState(null) 
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    returnService.getShopReturns()
      .then(res => setReturns(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateReturn = (orderCode, updated) => {
    setReturns(prev => prev.map(r => r.orderCode === orderCode ? { ...r, ...updated } : r))
  }

  const handleApprove = async (orderCode) => {
    setProcessing(orderCode + '_approve')
    try {
      const res = await returnService.approveReturn(orderCode)
      updateReturn(orderCode, res.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể duyệt yêu cầu này')
    } finally {
      setProcessing(null)
    }
  }

  const handleConfirmReceived = async (orderCode) => {
    if (!window.confirm('Xác nhận đã nhận được hàng trả về?')) return
    setProcessing(orderCode + '_received')
    try {
      const res = await returnService.confirmReceived(orderCode)
      updateReturn(orderCode, res.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xác nhận nhận hàng')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert('Vui lòng nhập lý do từ chối'); return }
    setProcessing(rejectModal + '_reject')
    try {
      const res = await returnService.rejectReturn(rejectModal, rejectReason.trim())
      updateReturn(rejectModal, res.data)
      setRejectModal(null)
      setRejectReason('')
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể từ chối yêu cầu này')
    } finally {
      setProcessing(null)
    }
  }

  const filtered = returns.filter(r => {
    const statusFilter = TAB_STATUS[activeTab]
    return !statusFilter || statusFilter.includes(r.status)
  })

  if (loading)
    return (
      <div className="min-h-screen bg-[#f8fafc] flex">
        <ShopSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      <ShopSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-10 py-10">
          
          {/* Header */}
          <div className="mb-10">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[3px] mb-1">Chăm sóc khách hàng</p>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Quản Lý Trả Hàng</h2>
          </div>

          {/* Stats - Đồng bộ Bento Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Tổng yêu cầu',  value: returns.length, color: 'from-slate-700 to-slate-800', icon: '📋' },
              { label: 'Chờ xử lý',     value: returns.filter(r => r.status === 'REQUESTED').length, color: 'from-amber-400 to-orange-500', icon: '⏳' },
              { label: 'Đang trả hàng', value: returns.filter(r => ['APPROVED','RETURNING'].includes(r.status)).length, color: 'from-indigo-500 to-blue-600', icon: '🚚' },
              { label: 'Hoàn thành',    value: returns.filter(r => r.status === 'RETURNED').length, color: 'from-emerald-500 to-teal-600', icon: '✅' },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-6 shadow-xl flex flex-col`}>
                <span className="text-xl mb-3">{s.icon}</span>
                <p className="text-2xl font-black tracking-tighter">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs - Modern Minimal */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8 flex p-1.5 border border-slate-100 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex-shrink-0 px-6 py-3 text-[11px] font-extrabold rounded-xl transition-all duration-300 border-0 cursor-pointer uppercase tracking-widest ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
                <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {tab === 'Tất cả' ? returns.length : returns.filter(r => TAB_STATUS[tab]?.includes(r.status)).length}
                </span>
              </button>
            ))}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-[2rem] shadow-sm p-24 text-center border border-slate-100">
              <p className="text-5xl mb-6 grayscale opacity-30">🤝</p>
              <p className="text-slate-400 text-lg font-bold italic">Không có yêu cầu trả hàng nào</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map(ret => (
                <div key={ret.id} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
                  {/* Header */}
                  <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mã đơn hàng</p>
                        <p className="text-sm font-black text-slate-800">#{ret.orderCode}</p>
                      </div>
                      <div className="h-8 w-px bg-slate-100"></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Khách hàng</p>
                        <p className="text-sm font-bold text-indigo-600 uppercase tracking-tight">
                          {ret.username || ret.userEmail || 'Khách hàng ẩn danh'}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>
                      <div className="hidden sm:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ngày yêu cầu</p>
                        <p className="text-sm font-bold text-slate-600">
                          {new Date(ret.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={ret.status} type="return" />
                  </div>

                  {/* Body - Reason Box */}
                  <div className="px-8 py-6 bg-slate-50/30">
                    <div className="flex gap-4">
                      <div className="w-1.5 h-auto bg-slate-200 rounded-full"></div>
                      <div className="py-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lý do khách trả hàng</p>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed italic">"{ret.reason}"</p>
                      </div>
                    </div>

                    {ret.rejectReason && (
                      <div className="mt-6 flex gap-4">
                        <div className="w-1.5 h-auto bg-rose-200 rounded-full"></div>
                        <div className="py-1">
                          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Phản hồi từ shop</p>
                          <p className="text-sm text-rose-500 font-bold leading-relaxed italic">"{ret.rejectReason}"</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="px-8 py-5 bg-white flex items-center justify-end gap-3 border-t border-slate-50">
                    {ret.status === 'REQUESTED' && (
                      <>
                        <button
                          onClick={() => handleApprove(ret.orderCode)}
                          disabled={processing === ret.orderCode + '_approve'}
                          className="text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-100 border-0 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                        >
                          {processing === ret.orderCode + '_approve' ? '...' : 'Duyệt yêu cầu'}
                        </button>
                        <button
                          onClick={() => { setRejectModal(ret.orderCode); setRejectReason('') }}
                          className="text-[11px] font-bold border border-rose-200 text-rose-500 px-6 py-3 rounded-xl hover:bg-rose-50 transition-all cursor-pointer bg-white uppercase tracking-wider"
                        >
                          Từ chối
                        </button>
                      </>
                    )}

                    {(ret.status === 'APPROVED' || ret.status === 'RETURNING') && (
                      <button
                        onClick={() => handleConfirmReceived(ret.orderCode)}
                        disabled={processing === ret.orderCode + '_received'}
                        className="text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-100 border-0 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                      >
                        {processing === ret.orderCode + '_received' ? '...' : '📦 Xác nhận đã nhận hàng'}
                      </button>
                    )}

                    {(ret.status === 'RETURNED' || ret.status === 'REJECTED') && (
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[2px] py-3">Đã hoàn tất hồ sơ</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modern Modal Từ chối */}
      {rejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
             onClick={e => { if (e.target === e.currentTarget) setRejectModal(null) }}>
          <div className="bg-white rounded-[2rem] shadow-2xl p-10 w-full max-w-md mx-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-rose-500 rounded-full"></div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Từ chối yêu cầu</h3>
            </div>
            
            <p className="text-[11px] font-bold text-slate-400 mb-6 bg-slate-50 px-4 py-2 rounded-lg inline-block">
              Mã đơn: #{rejectModal}
            </p>

            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Lý do từ chối *</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Giải thích lý do cho khách hàng (Ví dụ: Sản phẩm đã qua sử dụng, mất tag...)"
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