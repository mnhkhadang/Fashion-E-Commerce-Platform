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
    if (!window.confirm(`Mở khóa tài khoản ${email}?`)) return
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
    if (!window.confirm('Từ chối yêu cầu này?')) return
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
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Yêu Cầu Mở Khóa Tài Khoản</h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">🔓</p>
            <p className="text-gray-400">Không có yêu cầu mở khóa nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm">🔒</span>
                      <span className="font-semibold text-gray-700">{req.email}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 mb-1">Lý do:</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{req.reason}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Gửi lúc: {new Date(req.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(req.id, req.email)}
                      disabled={processing?.startsWith(req.id)}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg cursor-pointer border-0 disabled:opacity-50"
                    >
                      {processing === req.id + '_approve' ? '...' : '✓ Mở khóa'}
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={processing?.startsWith(req.id)}
                      className="border border-red-300 text-red-400 text-sm px-4 py-2 rounded-lg hover:bg-red-50 cursor-pointer bg-white disabled:opacity-50"
                    >
                      {processing === req.id + '_reject' ? '...' : '✕ Từ chối'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}