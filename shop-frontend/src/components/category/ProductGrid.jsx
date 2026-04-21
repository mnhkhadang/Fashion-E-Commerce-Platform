import ProductCard from '../home/ProductCard'

/**
 * ProductGrid — hiển thị lưới sản phẩm
 * Dùng cho CategoryPage và các trang danh sách sản phẩm
 *
 * Props:
 *  products {Array}   — danh sách sản phẩm
 *  loading  {boolean} — đang tải
 *  cols     {number}  — số cột (default: 4)
 */
export default function ProductGrid({ products = [], loading = false, cols = 4 }) {
  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  }[cols] || 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
      </div>
    )

  if (products.length === 0)
    return (
      <div className="text-center py-20 text-gray-400">
        <span className="text-5xl block mb-4">🔍</span>
        <p className="text-sm">Không có sản phẩm nào</p>
      </div>
    )

  return (
    <div className={`grid ${colClass} gap-3`}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}