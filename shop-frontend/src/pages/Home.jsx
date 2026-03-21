import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Banner from '../components/home/Banner'
import CategorySection from '../components/home/CategorySection'
import ProductSuggestion from '../components/home/ProductSuggestion'

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/api/products'),
          api.get('/api/categories/tree'),  // ← dùng /api/categories bình thường
        ])
        setProducts(productsRes.data)
        setCategories(categoriesRes.data)
      } catch {
        console.error('Lỗi khi tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const fetchByCategory = async (categoryName) => {
    setLoading(true)
    try {
      const res = await api.get(`/api/products/category?categoryName=${encodeURIComponent(categoryName)}`)  // ← fix URL
      setProducts(res.data)
      setSelectedCategory(categoryName)
    } catch {
      console.error('Lỗi khi lọc sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/products')
      setProducts(res.data)
      setSelectedCategory(null)
    } catch {
      console.error('Lỗi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Banner />
      <main className="max-w-6xl mx-auto px-4 py-5">
        <CategorySection
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={fetchByCategory}
          onSelectAll={fetchAll}
        />
        <ProductSuggestion
          products={products}
          loading={loading}
          searchQuery={searchQuery}
        />
      </main>
      <Footer />
    </div>
  )
}