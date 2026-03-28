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
    // FIX: bỏ prefix /api
    api.get('/shop-registrations')
      .then(res => setRegs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleApprove = async (id) => {
    // FIX: window.confirm
    if (!window.confirm('Duyệt đơn đăng ký này?')) return
    setProcessing(id + '_approve')
    try {
      // FIX: bỏ prefix /api, BE dùng PUT không phải POST
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
      // FIX: bỏ prefix /api, BE dùng PUT, param đúng là reason
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
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 px-6 py-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-700">Đơn Đăng Ký Shop</h2>
          <span className="text-sm text-gray-400">
            {regs.filter(r => r.status === 'PENDING').length} đơn chờ duyệt
          </span>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4 flex">
          {[
            ['PENDING',  'Chờ duyệt'],
            ['APPROVED', 'Đã duyệt'],
            ['REJECTED', 'Từ chối'],
            ['ALL',      'Tất cả'],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer bg-white border-l-0 border-r-0 border-t-0 ${
                filterStatus === val
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500 hover:text-orange-400'
              }`}
            >
              {label}
              <span className="ml-1.5 text-xs text-gray-400">
                ({val === 'ALL' ? regs.length : regs.filter(r => r.status === val).length})
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-400 text-sm">
            Không có đơn nào
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(reg => (
              <div key={reg.id} className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-700">{reg.shopName}</p>
                      {/* FIX: dùng StatusBadge type="shop" */}
                      <StatusBadge status={reg.status} type="shop" />
                    </div>
                    <p className="text-xs text-gray-500">👤 {reg.ownerUsername} — {reg.ownerEmail}</p>
                    {reg.phone && <p className="text-xs text-gray-400 mt-0.5">📞 {reg.phone}</p>}
                    {reg.address && <p className="text-xs text-gray-400">📍 {reg.address}</p>}
                    {reg.description && (
                      <p className="text-xs text-gray-400 mt-1">{reg.description}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-1.5">
                      Gửi:{' '}
                      {new Date(reg.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    {reg.rejectReason && (
                      <p className="text-xs text-red-400 mt-1">❌ Lý do: {reg.rejectReason}</p>
                    )}
                  </div>

                  {reg.status === 'PENDING' && (
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button
                        onClick={() => handleApprove(reg.id)}
                        disabled={processing === reg.id + '_approve'}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded transition cursor-pointer border-0 disabled:opacity-50"
                      >
                        {processing === reg.id + '_approve' ? '...' : '✓ Duyệt'}
                      </button>
                      <button
                        onClick={() => { setRejectModal({ id: reg.id, shopName: reg.shopName }); setRejectReason('') }}
                        className="text-xs border border-red-300 text-red-400 px-3 py-1.5 rounded hover:bg-red-50 transition cursor-pointer bg-white"
                      >
                        ✕ Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal từ chối */}
      {rejectModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={e => { if (e.target === e.currentTarget) setRejectModal(null) }}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold text-gray-700 mb-1">Từ chối đơn đăng ký</h3>
            <p className="text-xs text-gray-400 mb-3">
              Shop: <span className="font-medium text-gray-600">{rejectModal.shopName}</span>
            </p>
            <label className="text-xs text-gray-500 mb-1 block">Lý do từ chối *</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Nhập lý do từ chối..."
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReject}
                disabled={processing?.includes('_reject')}
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-5 py-2 rounded cursor-pointer border-0 disabled:opacity-50"
              >
                {processing?.includes('_reject') ? '...' : 'Xác nhận từ chối'}
              </button>
              <button
                onClick={() => setRejectModal(null)}
                className="border border-gray-300 text-gray-500 text-sm px-5 py-2 rounded hover:bg-gray-50 cursor-pointer bg-white"
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