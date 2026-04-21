import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Banner from '../components/home/Banner'
import CategorySection from '../components/home/CategorySection'
import ProductSuggestion from '../components/home/ProductSuggestion'
import productService from '../services/productService'
import categoryService from '../services/categoryService'

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
          productService.getAll(),
          // FIX: dùng getAll() — hiện phẳng tất cả category (cả parent lẫn child)
          categoryService.getAll(),
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
      const res = await productService.getByCategory(categoryName)
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
      const res = await productService.getAll()
      setProducts(res.data)
      setSelectedCategory(null)
    } catch {
      console.error('Lỗi khi tải sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Banner />
      <main className="max-w-6xl mx-auto px-4 py-5">
        {/* CategorySection nhận getAll() — hiện phẳng tất cả */}
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