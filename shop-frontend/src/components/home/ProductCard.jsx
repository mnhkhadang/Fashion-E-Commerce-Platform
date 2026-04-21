import { Link } from 'react-router-dom'
import StarRating from '../ui/StarRating'

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block bg-white rounded-lg overflow-hidden shadow-md hover:-translate-y-0.5 transition-all duration-200 no-underline"
    >
      <figure className="relative overflow-hidden aspect-square m-0">
        <img
          src={product.mediaList?.[0]?.url || 'https://picsum.photos/400/400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full select-none">
          SALE
        </span>
        <button
          aria-label="Thêm vào yêu thích"
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 cursor-pointer border-0"
        >
          ♡
        </button>
      </figure>

      <div className="p-3">
        <p className="text-[13px] text-gray-700 font-medium leading-snug line-clamp-2 min-h-[38px] mb-2">
          {product.name}
        </p>
        <p className="text-red-600 font-bold text-[15px] mb-1.5">
          {product.price?.toLocaleString('vi-VN')}₫
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400">Đã bán {product.sold}</span>
          <div className="flex items-center gap-1">
            {/* FIX: dùng averageRating từ BE, fallback 0 nếu chưa có review */}
            <StarRating value={product.averageRating ?? 0} readonly size="sm" />
            {product.reviewCount > 0 && (
              <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}