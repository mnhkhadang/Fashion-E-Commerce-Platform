import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import StatusBadge from '../../components/ui/StatusBadge'
import reportService from '../../services/reportService'

const TARGET_LABEL = {
  REVIEW: { icon: '⭐', label: 'Đánh giá sản phẩm', color: 'bg-amber-100 text-amber-600 border-amber-200' },
  SHOP:   { icon: '🏪', label: 'Cửa hàng vi phạm', color: 'bg-rose-100 text-rose-600 border-rose-200' },
}

const TABS = ['Tất cả', 'Review', 'Shop']

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [activeTab, setActiveTab] = useState('Tất cả')

  useEffect(() => {
    reportService.getPendingReports()
      .then(res => setReports(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleResolve = async (id) => {
    if (!window.confirm('Xác nhận vi phạm? Đối tượng bị báo cáo sẽ bị xử lý theo quy định.')) return
    setProcessing(id + '_resolve')
    try {
      await reportService.resolveReport(id)
      setReports(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setProcessing(null)
    }
  }

  const handleDismiss = async (id) => {
    if (!window.confirm('Bỏ qua báo cáo này nếu bạn thấy không có dấu hiệu vi phạm?')) return
    setProcessing(id + '_dismiss')
    try {
      await reportService.dismissReport(id)
      setReports(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setProcessing(null)
    }
  }

  const filtered = reports.filter(r => {
    if (activeTab === 'Review') return r.reportTargetType === 'REVIEW'
    if (activeTab === 'Shop') return r.reportTargetType === 'SHOP'
    return true
  })

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-10 py-10">
          
          {/* Header */}
          <div className="mb-10">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[3px] mb-1">Kiểm duyệt nội dung</p>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Quản Lý Báo Cáo</h2>
          </div>

          {/* Stats - Đồng bộ Bento Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Tổng báo cáo chờ',  value: reports.length, color: 'from-slate-700 to-slate-800', icon: '🔔' },
              { label: 'Báo cáo Review', value: reports.filter(r => r.reportTargetType === 'REVIEW').length, color: 'from-amber-400 to-orange-500', icon: '⭐' },
              { label: 'Báo cáo Cửa hàng',  value: reports.filter(r => r.reportTargetType === 'SHOP').length, color: 'from-rose-500 to-red-600', icon: '🏪' },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-6 shadow-xl flex items-center justify-between`}>
                <div>
                  <p className="text-3xl font-black tracking-tighter">{s.value}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mt-1">{s.label}</p>
                </div>
                <span className="text-2xl bg-white/20 w-12 h-12 flex items-center justify-center rounded-xl backdrop-blur-sm">{s.icon}</span>
              </div>
            ))}
          </div>

          {/* Tabs - Modern Navigation */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8 flex p-1.5 border border-slate-100 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex-shrink-0 px-8 py-3 text-[11px] font-extrabold rounded-xl transition-all duration-300 border-0 cursor-pointer uppercase tracking-widest ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab}
                <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                   {tab === 'Tất cả' ? reports.length : reports.filter(r => (tab === 'Review' ? r.reportTargetType === 'REVIEW' : r.reportTargetType === 'SHOP')).length}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-40">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-24 text-center">
              <p className="text-5xl mb-6 grayscale opacity-30">✨</p>
              <p className="text-slate-400 text-lg font-bold italic tracking-tight">Hệ thống sạch sẽ, không có báo cáo chờ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filtered.map(report => {
                const target = TARGET_LABEL[report.reportTargetType] || {}
                const isProcessing = processing?.startsWith(String(report.id))
                return (
                  <div key={report.id} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 p-8 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 group">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
                      
                      {/* Left: Report Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-6">
                          <span className={`inline-flex items-center gap-2 text-[10px] font-black px-4 py-1.5 rounded-full border ${target.color} uppercase tracking-widest shadow-sm`}>
                            {target.icon} {target.label}
                          </span>
                          <span className="text-[11px] font-bold text-slate-300 font-mono tracking-tighter bg-slate-50 px-3 py-1 rounded-md">
                            TARGET_ID: {report.targetId}
                          </span>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs">👤</span>
                            <div>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Người gửi báo cáo</p>
                                <p className="text-sm font-bold text-slate-600 tracking-tight">{report.reporterEmail}</p>
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-50 relative overflow-hidden">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                               <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span> Nội dung vi phạm
                            </p>
                            <p className="text-sm font-medium text-slate-700 leading-relaxed italic relative z-10">
                              "{report.reason}"
                            </p>
                            <span className="absolute -right-4 -bottom-6 text-7xl opacity-[0.03] select-none pointer-events-none">💬</span>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Báo cáo được gửi vào: {new Date(report.createdAt).toLocaleDateString('vi-VN', {
                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                })}
                            </p>
                        </div>
                      </div>

                      {/* Right: Decision Actions */}
                      <div className="lg:w-48 flex flex-col gap-3 shrink-0 pt-2">
                        <button
                          onClick={() => handleResolve(report.id)}
                          disabled={isProcessing}
                          className="w-full bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-black px-6 py-4 rounded-xl transition-all shadow-lg shadow-rose-100 border-0 cursor-pointer uppercase tracking-widest disabled:opacity-50 active:scale-[0.98]"
                        >
                          {processing === report.id + '_resolve' ? '...' : '⚠️ XÁC NHẬN VI PHẠM'}
                        </button>
                        <button
                          onClick={() => handleDismiss(report.id)}
                          disabled={isProcessing}
                          className="w-full bg-white border border-slate-200 text-slate-400 text-[11px] font-black px-6 py-4 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-all cursor-pointer uppercase tracking-widest disabled:opacity-50"
                        >
                          {processing === report.id + '_dismiss' ? '...' : '✓ Bỏ qua report'}
                        </button>
                        <p className="text-center text-[9px] font-bold text-slate-300 uppercase mt-2 tracking-tighter">
                            Hành động không thể hoàn tác
                        </p>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}