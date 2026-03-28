import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import StatusBadge from '../../components/ui/StatusBadge'
import reportService from '../../services/reportService'

const TARGET_LABEL = {
  REVIEW: { icon: '⭐', label: 'Đánh giá' },
  SHOP:   { icon: '🏪', label: 'Cửa hàng' },
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
    if (!window.confirm('Xác nhận vi phạm và xử lý report này?')) return
    setProcessing(id + '_resolve')
    try {
      const res = await reportService.resolveReport(id)
      setReports(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setProcessing(null)
    }
  }

  const handleDismiss = async (id) => {
    if (!window.confirm('Bỏ qua report này (không vi phạm)?')) return
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
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản Lý Báo Cáo</h2>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Tổng báo cáo',  value: reports.length,                                     color: 'bg-gray-700' },
            { label: 'Báo cáo Review', value: reports.filter(r => r.reportTargetType === 'REVIEW').length, color: 'bg-yellow-500' },
            { label: 'Báo cáo Shop',  value: reports.filter(r => r.reportTargetType === 'SHOP').length,   color: 'bg-orange-500' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} text-white rounded-xl p-4`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs opacity-80 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-4 flex">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition cursor-pointer bg-white border-l-0 border-r-0 border-t-0 ${
                activeTab === tab
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500 hover:text-orange-400'
              }`}
            >
              {tab}
              <span className="ml-1.5 text-xs text-gray-400">
                ({tab === 'Tất cả' ? reports.length
                  : tab === 'Review' ? reports.filter(r => r.reportTargetType === 'REVIEW').length
                  : reports.filter(r => r.reportTargetType === 'SHOP').length})
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-400">Không có báo cáo nào cần xử lý</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(report => {
              const target = TARGET_LABEL[report.reportTargetType] || {}
              const isProcessing = processing?.startsWith(String(report.id))
              return (
                <div key={report.id} className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Type badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                          report.reportTargetType === 'REVIEW'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          {target.icon} {target.label}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          ID: {report.targetId}
                        </span>
                      </div>

                      {/* Reporter */}
                      <div className="flex gap-2 text-sm mb-2">
                        <span className="text-gray-400 shrink-0">Người báo cáo:</span>
                        <span className="text-gray-700 font-medium">{report.reporterEmail}</span>
                      </div>

                      {/* Reason */}
                      <div className="text-sm mb-2">
                        <span className="text-gray-400 block mb-1">Lý do:</span>
                        <p className="bg-gray-50 rounded-lg p-3 text-gray-700">{report.reason}</p>
                      </div>

                      <p className="text-xs text-gray-400">
                        Báo cáo lúc: {new Date(report.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleResolve(report.id)}
                        disabled={isProcessing}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg cursor-pointer border-0 disabled:opacity-50 whitespace-nowrap"
                      >
                        {processing === report.id + '_resolve' ? '...' : '⚠️ Vi phạm'}
                      </button>
                      <button
                        onClick={() => handleDismiss(report.id)}
                        disabled={isProcessing}
                        className="border border-gray-300 text-gray-500 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer bg-white disabled:opacity-50 whitespace-nowrap"
                      >
                        {processing === report.id + '_dismiss' ? '...' : '✓ Bỏ qua'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}