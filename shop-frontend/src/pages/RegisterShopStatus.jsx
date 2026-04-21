import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import api from '../services/api'

export default function RegisterShopStatus() {
  const navigate = useNavigate()
  const [reg, setReg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // FIX: bỏ prefix /api
    api.get('/shop-registrations/my')
      .then(res => setReg(res.data))
      .catch(() => setReg(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <LoadingSpinner fullPage searchQuery={searchQuery} onSearchChange={setSearchQuery} />
    )

  return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="max-w-lg mx-auto px-4 py-5">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Trạng Thái Đăng Ký Shop</h2>

        {!reg ? (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            <p className="text-4xl mb-3">🏪</p>
            <p className="text-gray-500 text-sm mb-4">Bạn chưa có đơn đăng ký nào</p>
            <button
              onClick={() => navigate('/register-shop')}
              className="bg-orange-500 text-white text-sm px-5 py-2 rounded hover:bg-orange-600 cursor-pointer border-0"
            >
              Đăng ký ngay
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
              <div>
                <p className="text-base font-bold text-gray-700">{reg.shopName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Gửi lúc:{' '}
                  {new Date(reg.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              {/* FIX: dùng StatusBadge type="shop" */}
              <StatusBadge status={reg.status} type="shop" />
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              {reg.phone && <p>📞 {reg.phone}</p>}
              {reg.address && <p>📍 {reg.address}</p>}
              {reg.description && <p className="text-xs text-gray-400">{reg.description}</p>}
            </div>

            {reg.status === 'REJECTED' && reg.rejectReason && (
              <div className="mt-4 p-3 bg-red-50 rounded border border-red-100">
                <p className="text-xs font-semibold text-red-500 mb-1">Lý do từ chối:</p>
                <p className="text-xs text-red-400">{reg.rejectReason}</p>
              </div>
            )}

            {reg.status === 'APPROVED' && (
              <div className="mt-4 p-3 bg-green-50 rounded border border-green-100">
                <p className="text-xs text-green-600">
                  🎉 Đơn đã được duyệt! Vui lòng đăng xuất và đăng nhập lại để sử dụng tính năng bán hàng.
                </p>
              </div>
            )}

            {reg.status === 'REJECTED' && (
              <button
                onClick={() => navigate('/register-shop')}
                className="mt-4 w-full border border-orange-500 text-orange-500 py-2 rounded text-sm hover:bg-orange-50 cursor-pointer bg-white"
              >
                Gửi lại đơn đăng ký
              </button>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}