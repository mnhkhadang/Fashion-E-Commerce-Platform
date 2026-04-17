import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ShopSidebar from '../../components/shop/ShopSidebar'
import ProductFormModal from './ProductFormModal'
import productService from '../../services/productService'
import categoryService from '../../services/categoryService'

export default function ShopProducts() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null) // null = thêm mới
  const [filterActive, setFilterActive] = useState('all')
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    fetchData()
    if (searchParams.get('action') === 'add') setShowForm(true)
  }, [])

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getMyProducts(),
        categoryService.getAll(),
      ])
      setProducts(prodRes.data)
      setCategories(catRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditingProduct(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClose = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  // Callback từ ProductFormModal sau khi lưu thành công
  const handleSaved = (savedProduct, isEdit) => {
    if (isEdit) {
      setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p))
      setSavedMessage('Cập nhật sản phẩm thành công')
    } else {
      setProducts(prev => [savedProduct, ...prev])
      setSavedMessage('Thêm sản phẩm thành công')
    }
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handleToggle = async (id) => {
    try {
      await productService.toggleActive(id)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
    } catch {
      alert('Có lỗi xảy ra')
    }
  }

  const filtered = products.filter(p => {
    if (filterActive === 'active') return p.active
    if (filterActive === 'hidden') return !p.active
    return true
  })

  if (loading)
    return (
      <div className="min-h-screen bg-[#f8fafc] flex">
        <ShopSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      <ShopSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-10 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[3px] mb-1">Kho hàng & Sản phẩm</p>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Quản Lý Sản Phẩm</h2>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] border-0 cursor-pointer uppercase tracking-wider"
            >
              <span className="text-lg">+</span> Thêm sản phẩm mới
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Tổng sản phẩm', value: products.length,                        color: 'from-slate-700 to-slate-800',   icon: '📦' },
              { label: 'Đang bán',       value: products.filter(p => p.active).length,  color: 'from-emerald-500 to-teal-600',  icon: '✅' },
              { label: 'Đã ẩn',          value: products.filter(p => !p.active).length, color: 'from-amber-400 to-orange-500',  icon: '👁️‍🗨️' },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-6 shadow-xl flex items-center justify-between`}>
                <div>
                  <p className="text-3xl font-black tracking-tighter">{s.value}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mt-1">{s.label}</p>
                </div>
                <span className="text-2xl bg-white/20 w-12 h-12 flex items-center justify-center rounded-xl backdrop-blur-sm">{s.icon}</span>
              </div>
            ))}
          </div>

          {/* Toast thông báo */}
          {savedMessage && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold px-6 py-4 rounded-2xl mb-8 animate-slideDown">
              <span className="text-lg">✨</span> {savedMessage}
            </div>
          )}

          {/* Form thêm / chỉnh sửa — tách thành component riêng */}
          <ProductFormModal
            open={showForm}
            editingProduct={editingProduct}
            categories={categories}
            onClose={handleClose}
            onSaved={handleSaved}
          />

          {/* Filter tabs */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8 flex p-1.5 border border-slate-100 overflow-x-auto">
            {[
              ['all',    'Tất cả sản phẩm'],
              ['active', 'Đang hiển thị'],
              ['hidden', 'Kho lưu trữ'],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterActive(val)}
                className={`flex-1 flex-shrink-0 px-6 py-4 text-[11px] font-extrabold rounded-xl transition-all duration-300 border-0 cursor-pointer uppercase tracking-widest ${
                  filterActive === val
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {label}
                <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] ${filterActive === val ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {val === 'all'
                    ? products.length
                    : val === 'active'
                      ? products.filter(p => p.active).length
                      : products.filter(p => !p.active).length
                  }
                </span>
              </button>
            ))}
          </div>

          {/* Danh sách sản phẩm */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-[2rem] shadow-sm p-24 text-center border border-slate-100">
              <p className="text-6xl mb-6 opacity-20">📦</p>
              <p className="text-slate-400 text-lg font-bold italic tracking-tight">Danh sách trống</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map(product => (
                <div
                  key={product.id}
                  className={`bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 flex items-center gap-6 border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all duration-300 group ${!product.active ? 'bg-slate-50/50 grayscale-[0.5]' : ''}`}
                >
                  {/* Ảnh thumbnail */}
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner">
                    {product.mediaList?.[0]?.url
                      ? <img src={product.mediaList[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-slate-300 text-2xl">📷</div>
                    }
                  </div>

                  {/* Thông tin */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{product.name}</p>
                      {!product.active && (
                        <span className="text-[9px] font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-tighter">Đã ẩn</span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">{product.categoryName}</p>
                    <div className="flex items-center gap-6 mt-3">
                      <span className="text-lg font-black text-indigo-600 tracking-tighter">
                        {Number(product.price).toLocaleString('vi-VN')}₫
                      </span>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Tồn kho</span>
                          <span className="text-xs font-black text-slate-700">{product.stock}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Đã bán</span>
                          <span className="text-xs font-black text-slate-700">{product.sold}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(product)}
                      className="text-[11px] font-black border border-slate-200 text-slate-500 px-5 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all cursor-pointer bg-white uppercase tracking-widest"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleToggle(product.id)}
                      className={`text-[11px] font-black border px-5 py-2.5 rounded-xl transition-all cursor-pointer bg-white uppercase tracking-widest ${
                        product.active
                          ? 'border-slate-200 text-slate-400 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50'
                          : 'border-emerald-200 text-emerald-500 hover:bg-emerald-50'
                      }`}
                    >
                      {product.active ? 'Ẩn' : 'Hiện'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}