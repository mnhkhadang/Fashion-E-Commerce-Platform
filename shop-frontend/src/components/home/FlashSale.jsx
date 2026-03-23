import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import productService from '../../services/productService'

/**
 * FlashSale — hiển thị top sản phẩm bán chạy trên trang Home
 * Lấy tất cả sản phẩm rồi sort theo sold desc, lấy top 10
 */
export default function FlashSale() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 59, s: 59 })

  useEffect(() => {
    productService.getAll()
      .then(res => {
        const sorted = [...res.data]
          .sort((a, b) => (b.sold || 0) - (a.sold || 0))
          .slice(0, 10)
        setProducts(sorted)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Đồng hồ đếm ngược đơn giản
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 }
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 }
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = n => String(n).padStart(2, '0')

  if (loading) return null

  return (
    <section className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-black text-gray-800 m-0 flex items-center gap-1.5">
            ⚡ Flash Sale
          </h2>
          {/* Countdown */}
          <div className="flex items-center gap-1 bg-gray-800 text-white text-xs font-black px-2 py-1 rounded">
            <span>{pad(timeLeft.h)}</span>
            <span className="opacity-60">:</span>
            <span>{pad(timeLeft.m)}</span>
            <span className="opacity-60">:</span>
            <span>{pad(timeLeft.s)}</span>
          </div>
        </div>
        <Link
          to="/category/Tất cả"
          className="text-xs text-orange-500 hover:underline no-underline font-medium"
        >
          Xem tất cả →
        </Link>
      </div>

      {/* Products */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 list-none m-0 p-0">
        {products.map(product => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}