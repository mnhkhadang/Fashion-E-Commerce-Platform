import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

/**
 * PaymentResult — trang nhận redirect từ VNPay
 *
 * BE redirect về:
 *  /payment/result?status=success&code=PAY-xxx
 *  /payment/result?status=failed&code=PAY-xxx
 *  /payment/result?status=invalid
 */

// Đọc + xóa sessionStorage bên ngoài component — chạy 1 lần khi module load
// Tránh gọi setState trong effect body (ESLint: react-hooks/set-state-in-effect)
function getInitialCountdown(status) {
  const expiredAt = sessionStorage.getItem('reservationExpiredAt')
  sessionStorage.removeItem('reservationExpiredAt')
  if (!expiredAt || status !== 'failed') return null
  const diff = Math.max(0, Math.floor((new Date(expiredAt) - Date.now()) / 1000))
  return diff > 0 ? diff : null
}

export default function PaymentResult() {
  const [searchParams] = useSearchParams()

  const status      = searchParams.get('status')   // success | failed | invalid
  const paymentCode = searchParams.get('code')      // PAY-xxx

  // FIX: lazy initializer — tính 1 lần ngay khi render, không cần effect
  const [countdown, setCountdown] = useState(() => getInitialCountdown(status))

  // Đếm ngược — chỉ chạy khi có countdown > 0
  useEffect(() => {
    if (!countdown || countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const pad = n => String(n).padStart(2, '0')
  const formatCountdown = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`

  // ─── SUCCESS ───────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h2>
          <p className="text-sm text-gray-500 mb-1">Đơn hàng của bạn đã được xác nhận.</p>
          {paymentCode && (
            <p className="text-xs text-gray-400 mb-6">
              Mã thanh toán: <span className="font-mono font-semibold text-gray-600">{paymentCode}</span>
            </p>
          )}

          <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 text-sm text-green-700">
            Shop sẽ bắt đầu chuẩn bị hàng và liên hệ với bạn sớm nhất có thể.
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/orders"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition no-underline block"
            >
              Xem đơn hàng
            </Link>
            <Link
              to="/"
              className="w-full border border-gray-300 text-gray-500 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition no-underline block"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── FAILED ────────────────────────────────────────────────────────────────
  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h2>
          <p className="text-sm text-gray-500 mb-1">Giao dịch không thành công.</p>
          {paymentCode && (
            <p className="text-xs text-gray-400 mb-4">
              Mã thanh toán: <span className="font-mono font-semibold text-gray-600">{paymentCode}</span>
            </p>
          )}

          {/* Countdown TTL còn lại */}
          {countdown !== null && countdown > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-sm text-yellow-700">
              <p className="font-semibold mb-1">⏱ Stock vẫn đang được giữ</p>
              <p>
                Bạn còn{' '}
                <span className="font-mono font-bold text-yellow-800">
                  {formatCountdown(countdown)}
                </span>{' '}
                để thử thanh toán lại.
              </p>
            </div>
          )}

          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 text-sm text-red-600">
            Đơn hàng của bạn vẫn được lưu. Bạn có thể thử thanh toán lại hoặc hủy đơn.
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/orders"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition no-underline block"
            >
              Xem đơn hàng
            </Link>
            <Link
              to="/"
              className="w-full border border-gray-300 text-gray-500 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition no-underline block"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── INVALID / fallback ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Liên kết không hợp lệ</h2>
        <p className="text-sm text-gray-500 mb-6">
          Không thể xác minh kết quả thanh toán. Vui lòng kiểm tra lịch sử đơn hàng.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/orders"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition no-underline block"
          >
            Xem đơn hàng
          </Link>
          <Link
            to="/"
            className="w-full border border-gray-300 text-gray-500 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition no-underline block"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}