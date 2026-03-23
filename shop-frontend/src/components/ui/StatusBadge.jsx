/**
 * StatusBadge — badge trạng thái dùng chung cho Orders, ShopOrders, Returns
 *
 * Props:
 *  status {string} — giá trị status từ BE
 *  type   {string} — 'order' | 'return' | 'payment' | 'shop' (default: 'order')
 *
 * Ví dụ:
 *  <StatusBadge status="PENDING" />
 *  <StatusBadge status="APPROVED" type="return" />
 *  <StatusBadge status="COMPLETED" type="payment" />
 */

const ORDER_CONFIG = {
  PENDING:          { label: 'Chờ xác nhận',   color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  CONFIRMED:        { label: 'Đã xác nhận',     color: 'text-blue-600 bg-blue-50 border-blue-200' },
  SHIPPING:         { label: 'Đang giao',        color: 'text-orange-600 bg-orange-50 border-orange-200' },
  DELIVERED:        { label: 'Đã giao',          color: 'text-green-600 bg-green-50 border-green-200' },
  CANCELLED:        { label: 'Đã hủy',           color: 'text-red-500 bg-red-50 border-red-200' },
  RETURN_REQUESTED: { label: 'Yêu cầu trả',     color: 'text-purple-600 bg-purple-50 border-purple-200' },
  RETURNING:        { label: 'Đang trả hàng',   color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  RETURNED:         { label: 'Đã trả hàng',     color: 'text-gray-600 bg-gray-50 border-gray-200' },
}

const RETURN_CONFIG = {
  REQUESTED: { label: 'Chờ duyệt',     color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  APPROVED:  { label: 'Đã duyệt',      color: 'text-blue-600 bg-blue-50 border-blue-200' },
  RETURNING: { label: 'Đang trả hàng', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  RETURNED:  { label: 'Hoàn thành',    color: 'text-green-600 bg-green-50 border-green-200' },
  REJECTED:  { label: 'Bị từ chối',    color: 'text-red-500 bg-red-50 border-red-200' },
}

const PAYMENT_CONFIG = {
  PENDING:   { label: 'Chờ thanh toán', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  COMPLETED: { label: 'Đã thanh toán',  color: 'text-green-600 bg-green-50 border-green-200' },
  FAILED:    { label: 'Thất bại',        color: 'text-red-500 bg-red-50 border-red-200' },
  CANCELLED: { label: 'Đã hủy',         color: 'text-gray-500 bg-gray-50 border-gray-200' },
}

const SHOP_CONFIG = {
  PENDING:  { label: 'Chờ duyệt',  color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  APPROVED: { label: 'Đã duyệt',   color: 'text-green-600 bg-green-50 border-green-200' },
  REJECTED: { label: 'Bị từ chối', color: 'text-red-500 bg-red-50 border-red-200' },
}

const CONFIG_MAP = {
  order:   ORDER_CONFIG,
  return:  RETURN_CONFIG,
  payment: PAYMENT_CONFIG,
  shop:    SHOP_CONFIG,
}

export default function StatusBadge({ status, type = 'order' }) {
  const config = CONFIG_MAP[type]?.[status] || {
    label: status,
    color: 'text-gray-500 bg-gray-50 border-gray-200',
  }

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${config.color}`}>
      {config.label}
    </span>
  )
}