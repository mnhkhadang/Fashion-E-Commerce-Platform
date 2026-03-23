import ProductCard from './ProductCard'

export default function ProductSuggestion({ products, loading, searchQuery }) {
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  )

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase m-0">
          Gợi ý hôm nay
        </p>
        {searchQuery && (
          <p className="text-sm text-gray-400 m-0">
            <span className="font-semibold text-gray-700">{filtered.length}</span> kết quả cho{' '}
            <mark className="bg-orange-50 text-red-600 rounded px-1 font-semibold">
              {searchQuery}
            </mark>
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div
            className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin mb-4"
            role="status"
            // FIX: aria-label thay vì arial-label
            aria-label="Đang tải"
          />
          {/* FIX: "Dang-" → "Đang" */}
          <p className="text-sm">Đang tải sản phẩm...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-gray-400"
          role="status"
        >
          <span className="text-5xl mb-4 select-none">🔍</span>
          <p className="text-sm">Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 list-none m-0 p-0">
          {filtered.map(product => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}