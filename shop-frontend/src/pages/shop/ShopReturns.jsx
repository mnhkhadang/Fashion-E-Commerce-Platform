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
  const [rejectModal, setRejectModal] = useState(null) // orderCode
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
      <div className="min-h-screen bg-gray-50 flex">
        <ShopSidebar />
        <div className="flex-1 flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ShopSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Quản Lý Trả Hàng</h2>

          {/* Stats nhanh */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Tổng yêu cầu',  value: returns.length,                                            color: 'bg-gray-700' },
              { label: 'Chờ xử lý',     value: returns.filter(r => r.status === 'REQUESTED').length,      color: 'bg-yellow-500' },
              { label: 'Đang trả hàng', value: returns.filter(r => ['APPROVED','RETURNING'].includes(r.status)).length, color: 'bg-blue-500' },
              { label: 'Hoàn thành',    value: returns.filter(r => r.status === 'RETURNED').length,       color: 'bg-green-500' },
            ].map((s, i) => (
              <div key={i} className={`${s.color} text-white rounded-xl p-4`}>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-xs opacity-80 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-4 flex overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer bg-white ${
                  activeTab === tab
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-500 hover:text-orange-400'
                }`}
              >
                {tab}
                <span className="ml-1.5 text-xs text-gray-400">
                  ({tab === 'Tất cả'
                    ? returns.length
                    : returns.filter(r => TAB_STATUS[tab]?.includes(r.status)).length})
                </span>
              </button>
            ))}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-16 text-center">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-400 text-sm">Không có yêu cầu trả hàng nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(ret => (
                <div key={ret.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Mã đơn hàng</p>
                        <p className="text-sm font-bold text-gray-800">{ret.orderCode}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Khách hàng</p>
                        <p className="text-sm font-medium text-gray-700">
                          {ret.username || ret.userEmail || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Ngày tạo</p>
                        <p className="text-sm text-gray-600">
                          {new Date(ret.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={ret.status} type="return" />
                  </div>

                  {/* Body */}
                  <div className="px-6 py-4">
                    <div className="flex gap-2 text-sm mb-2">
                      <span className="text-gray-400 shrink-0 font-medium">Lý do:</span>
                      <span className="text-gray-700">{ret.reason}</span>
                    </div>

                    {ret.rejectReason && (
                      <div className="flex gap-2 text-sm">
                        <span className="text-gray-400 shrink-0 font-medium">Lý do từ chối:</span>
                        <span className="text-red-500">{ret.rejectReason}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
                    {/* REQUESTED → Approve hoặc Reject */}
                    {ret.status === 'REQUESTED' && (
                      <>
                        <button
                          onClick={() => handleApprove(ret.orderCode)}
                          disabled={processing === ret.orderCode + '_approve'}
                          className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition cursor-pointer border-0 disabled:opacity-50"
                        >
                          {processing === ret.orderCode + '_approve' ? '...' : '✓ Duyệt trả hàng'}
                        </button>
                        <button
                          onClick={() => { setRejectModal(ret.orderCode); setRejectReason('') }}
                          className="text-sm border border-red-300 text-red-400 px-4 py-2 rounded-lg hover:bg-red-50 transition cursor-pointer bg-white"
                        >
                          ✕ Từ chối
                        </button>
                      </>
                    )}

                    {/* APPROVED hoặc RETURNING → Xác nhận đã nhận hàng */}
                    {(ret.status === 'APPROVED' || ret.status === 'RETURNING') && (
                      <button
                        onClick={() => handleConfirmReceived(ret.orderCode)}
                        disabled={processing === ret.orderCode + '_received'}
                        className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition cursor-pointer border-0 disabled:opacity-50"
                      >
                        {processing === ret.orderCode + '_received'
                          ? '...'
                          : '📦 Đã nhận hàng trả'}
                      </button>
                    )}

                    {/* RETURNED / REJECTED — không có action */}
                    {(ret.status === 'RETURNED' || ret.status === 'REJECTED') && (
                      <span className="text-xs text-gray-400 italic">Đã xử lý xong</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal từ chối */}
      {rejectModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={e => { if (e.target === e.currentTarget) setRejectModal(null) }}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold text-gray-700 mb-1">Từ chối yêu cầu trả hàng</h3>
            <p className="text-xs text-gray-400 mb-3">
              Đơn: <span className="font-mono font-medium text-gray-600">{rejectModal}</span>
            </p>
            <label className="text-xs text-gray-500 mb-1 block">Lý do từ chối *</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Nhập lý do từ chối để thông báo cho khách hàng..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReject}
                disabled={processing?.includes('_reject')}
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-5 py-2 rounded-lg cursor-pointer border-0 disabled:opacity-50"
              >
                {processing?.includes('_reject') ? '...' : 'Xác nhận từ chối'}
              </button>
              <button
                onClick={() => setRejectModal(null)}
                className="border border-gray-300 text-gray-500 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 cursor-pointer bg-white"
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