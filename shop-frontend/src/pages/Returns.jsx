import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import returnService from '../services/returnService'

const STATUS_DESC = {
  REQUESTED: 'Yêu cầu của bạn đã được gửi, đang chờ shop xem xét.',
  APPROVED:  'Shop đã duyệt. Vui lòng gửi hàng về địa chỉ shop.',
  RETURNING: 'Shop đang chờ nhận hàng trả từ bạn.',
  RETURNED:  'Shop đã nhận hàng. Quá trình hoàn trả hoàn tất.',
  REJECTED:  'Shop đã từ chối yêu cầu trả hàng của bạn.',
}

export default function Returns() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('Tất cả')

  const TABS = ['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Hoàn thành', 'Từ chối']
  const TAB_STATUS = {
    'Tất cả':    null,
    'Chờ duyệt': ['REQUESTED', 'RETURNING'],
    'Đã duyệt':  ['APPROVED'],
    'Hoàn thành':['RETURNED'],
    'Từ chối':   ['REJECTED'],
  }

  useEffect(() => {
    returnService.getMyReturns()
      .then(res => setReturns(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = returns.filter(r => {
    const statusFilter = TAB_STATUS[activeTab]
    return !statusFilter || statusFilter.includes(r.status)
  })

  if (loading)
    return <LoadingSpinner fullPage searchQuery={searchQuery} onSearchChange={setSearchQuery} />

  return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="max-w-3xl mx-auto px-4 py-5">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Yêu Cầu Trả Hàng</h2>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4 flex overflow-x-auto">
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

        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-400 text-sm">Chưa có yêu cầu trả hàng nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(ret => (
              <div key={ret.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Mã đơn hàng</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {ret.orderCode}
                    </p>
                  </div>
                  <StatusBadge status={ret.status} type="return" />
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                  {/* Mô tả trạng thái */}
                  <p className="text-xs text-gray-500 mb-3">
                    {STATUS_DESC[ret.status]}
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-400 shrink-0">Lý do:</span>
                      <span className="text-gray-700">{ret.reason}</span>
                    </div>

                    {ret.rejectReason && (
                      <div className="flex gap-2 text-sm">
                        <span className="text-gray-400 shrink-0">Shop từ chối vì:</span>
                        <span className="text-red-500">{ret.rejectReason}</span>
                      </div>
                    )}

                    <div className="flex gap-2 text-xs text-gray-400">
                      <span>Tạo lúc:</span>
                      <span>
                        {new Date(ret.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {ret.updatedAt && (
                      <div className="flex gap-2 text-xs text-gray-400">
                        <span>Cập nhật:</span>
                        <span>
                          {new Date(ret.updatedAt).toLocaleDateString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}