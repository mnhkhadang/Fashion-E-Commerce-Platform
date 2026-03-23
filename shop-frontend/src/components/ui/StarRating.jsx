import { useState } from 'react'

/**
 * StarRating — dùng chung cho ProductCard, ReviewSection, ShopOrders,...
 *
 * Props:
 *  value    {number}   — số sao hiện tại (1-5)
 *  onChange {function} — callback khi click (chỉ có khi interactive)
 *  readonly {boolean}  — true = chỉ hiển thị, false = có thể click (default: false)
 *  size     {string}   — 'sm' | 'md' | 'lg' (default: 'md')
 *
 * Ví dụ:
 *  <StarRating value={4} readonly />                        // chỉ đọc
 *  <StarRating value={form.rating} onChange={v => ...} />   // interactive
 *  <StarRating value={4.5} readonly size="sm" />            // nhỏ
 */
export default function StarRating({ value = 0, onChange, readonly = false, size = 'md' }) {
  const [hover, setHover] = useState(0)

  const sizeClass = {
    sm: 'text-sm',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size] || 'text-2xl'

  return (
    <div className="flex gap-0.5" aria-label={`${value} sao`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`
            ${sizeClass}
            ${readonly ? 'cursor-default' : 'cursor-pointer'}
            bg-transparent border-0 p-0 leading-none
          `}
          tabIndex={readonly ? -1 : 0}
        >
          <span className={(hover || value) >= star ? 'text-yellow-400' : 'text-gray-200'}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}