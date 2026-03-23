import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import ShopSidebar from '../../components/shop/ShopSidebar'
import productService from '../../services/productService'
import categoryService from '../../services/categoryService'
import api from '../../services/api'

const EMPTY_FORM = {
  name: '', description: '', price: '', stock: '',
  categoryId: '', categoryName: '', mediaList: [],
}

export default function ShopProducts() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [filterActive, setFilterActive] = useState('all')
  const [catSearch, setCatSearch] = useState('')
  const [showCatDropdown, setShowCatDropdown] = useState(false)
  const fileInputRef = useRef(null)
  const catInputRef = useRef(null)
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    fetchData()
    if (searchParams.get('action') === 'add') setShowForm(true)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (catInputRef.current && !catInputRef.current.contains(e.target)) {
        setShowCatDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
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
    setEditingId(null)
    setForm(EMPTY_FORM)
    setCatSearch('')
    setShowForm(true)
  }

  const openEdit = (product) => {
    const cat = categories.find(c => c.name === product.categoryName)
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      categoryId: cat?.id || '',
      categoryName: product.categoryName || '',
      mediaList: product.mediaList || [],
    })
    setCatSearch(product.categoryName || '')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectCategory = (cat) => {
    setForm(p => ({ ...p, categoryId: cat.id, categoryName: cat.name }))
    setCatSearch(cat.name)
    setShowCatDropdown(false)
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  )

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          // FIX: bỏ prefix /api
          const res = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          return res.data.url
        })
      )
      setForm(prev => ({
        ...prev,
        mediaList: [
          ...prev.mediaList,
          ...uploads.map((url, i) => ({
            url, type: 'IMAGE',
            sortOrder: prev.mediaList.length + i,
          })),
        ],
      }))
    } catch {
      alert('Upload ảnh thất bại')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeMedia = (idx) => {
    setForm(prev => ({
      ...prev,
      mediaList: prev.mediaList
        .filter((_, i) => i !== idx)
        .map((m, i) => ({ ...m, sortOrder: i })),
    }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.stock || !form.categoryId) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: Number(form.categoryId),
      }
      if (editingId) {
        const res = await productService.update(editingId, payload)
        setProducts(prev => prev.map(p => p.id === editingId ? res.data : p))
        setSavedMessage('Cập nhật sản phẩm thành công')
      } else {
        const res = await productService.create(payload)
        setProducts(prev => [res.data, ...prev])
        setSavedMessage('Thêm sản phẩm thành công')
      }
      setShowForm(false)
      setForm(EMPTY_FORM)
      setCatSearch('')
      setEditingId(null)
      setTimeout(() => setSavedMessage(''), 3000) // FIX: 3000ms thay vì 300ms
    } catch {
      alert('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
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
      <div className="min-h-screen bg-gray-50 flex">
        <ShopSidebar />
        <div className="flex-1 flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"></div>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ShopSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Quản Lý Sản Phẩm</h2>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg transition cursor-pointer border-0"
            >
              + Thêm sản phẩm
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Tổng sản phẩm', value: products.length,                       color: 'bg-blue-500' },
              { label: 'Đang bán',      value: products.filter(p => p.active).length,  color: 'bg-green-500' },
              { label: 'Đã ẩn',         value: products.filter(p => !p.active).length, color: 'bg-gray-400' },
            ].map((s, i) => (
              <div key={i} className={`${s.color} text-white rounded-xl p-4`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs opacity-80 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {savedMessage && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl mb-4">
              ✅ {savedMessage}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
              <h3 className="font-semibold text-gray-700 mb-4">
                {editingId ? '✏️ Chỉnh sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tên sản phẩm *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Tên sản phẩm..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Giá (₫) *</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Tồn kho *</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                  <div ref={catInputRef} className="relative">
                    <label className="text-xs text-gray-500 mb-1 block">Danh mục *</label>
                    <input
                      type="text"
                      value={catSearch}
                      onChange={e => {
                        setCatSearch(e.target.value)
                        setForm(p => ({ ...p, categoryId: '', categoryName: '' }))
                        setShowCatDropdown(true)
                      }}
                      onFocus={() => setShowCatDropdown(true)}
                      placeholder="Tìm danh mục..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                    />
                    {showCatDropdown && filteredCategories.length > 0 && (
                      <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredCategories.map(cat => (
                          <div
                            key={cat.id}
                            onClick={() => handleSelectCategory(cat)}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-orange-50 hover:text-orange-500 ${
                              form.categoryId === cat.id ? 'bg-orange-50 text-orange-500 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {cat.name}
                          </div>
                        ))}
                      </div>
                    )}
                    {showCatDropdown && filteredCategories.length === 0 && catSearch && (
                      <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <p className="px-3 py-2 text-sm text-gray-400">Không tìm thấy danh mục</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Mô tả</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Mô tả sản phẩm..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
                  />
                </div>

                {/* Image upload */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Hình ảnh {uploading && <span className="text-orange-400">— Đang upload...</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {form.mediaList.map((m, idx) => (
                      <div key={`${m.url}-${idx}`} className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden group">
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeMedia(idx)}
                          className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer border-0"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-400 transition cursor-pointer bg-white disabled:opacity-50"
                    >
                      {uploading
                        ? <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-orange-500 animate-spin"></div>
                        : <><span className="text-2xl leading-none">+</span><span className="text-[10px] mt-0.5">Thêm ảnh</span></>
                      }
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleUpload}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-5 py-2 rounded-lg transition cursor-pointer border-0 disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm sản phẩm'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditingId(null); setCatSearch('') }}
                  className="border border-gray-300 text-gray-500 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 transition cursor-pointer bg-white"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Filter tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-4 flex">
            {[['all', 'Tất cả'], ['active', 'Đang bán'], ['hidden', 'Đã ẩn']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterActive(val)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer bg-white border-l-0 border-r-0 border-t-0 ${
                  filterActive === val
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-500 hover:text-orange-400'
                }`}
              >
                {label}
                <span className="ml-1.5 text-xs text-gray-400">
                  ({val === 'all' ? products.length
                    : val === 'active' ? products.filter(p => p.active).length
                    : products.filter(p => !p.active).length})
                </span>
              </button>
            ))}
          </div>

          {/* Product list */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-400 text-sm">Chưa có sản phẩm nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(product => (
                <div
                  key={product.id}
                  className={`bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 ${!product.active ? 'opacity-60' : ''}`}
                >
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {product.mediaList?.[0]?.url
                      ? <img src={product.mediaList[0].url} alt={product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📷</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-700 truncate">{product.name}</p>
                      {!product.active && (
                        <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded shrink-0">Đã ẩn</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{product.categoryName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-bold text-orange-500">
                        {Number(product.price).toLocaleString('vi-VN')}₫
                      </span>
                      <span className="text-xs text-gray-400">Tồn: {product.stock}</span>
                      <span className="text-xs text-gray-400">Đã bán: {product.sold}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(product)}
                      className="text-xs border border-blue-300 text-blue-500 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer bg-white"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleToggle(product.id)}
                      className={`text-xs border px-3 py-1.5 rounded-lg transition cursor-pointer bg-white ${
                        product.active
                          ? 'border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-400'
                          : 'border-green-300 text-green-500 hover:bg-green-50'
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