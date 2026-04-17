import { useState, useRef, useEffect } from 'react'
import api from '../../services/api'
import productService from '../../services/productService'

const EMPTY_FORM = {
  name: '', description: '', price: '', stock: '',
  categoryId: '', categoryName: '', mediaList: [],
}

/**
 * Props:
 * - open          : boolean — hiển thị/ẩn form
 * - editingProduct: object | null — null = thêm mới, object = chỉnh sửa
 * - categories    : array
 * - onClose       : () => void
 * - onSaved       : (product, isEdit) => void — trả sản phẩm đã lưu về cho trang cha
 */
export default function ProductFormModal({
  open,
  editingProduct,
  categories,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [catSearch, setCatSearch] = useState('')
  const [showCatDropdown, setShowCatDropdown] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  const fileInputRef = useRef(null)
  const catInputRef = useRef(null)

  // Sync form khi editingProduct thay đổi
  useEffect(() => {
    if (!open) return
    if (editingProduct) {
      const cat = categories.find(c => c.name === editingProduct.categoryName)
      setForm({
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price,
        stock: editingProduct.stock,
        categoryId: cat?.id || '',
        categoryName: editingProduct.categoryName || '',
        mediaList: editingProduct.mediaList || [],
      })
      setCatSearch(editingProduct.categoryName || '')
    } else {
      setForm(EMPTY_FORM)
      setCatSearch('')
    }
    setUrlInput('')
  }, [open, editingProduct])

  // Đóng dropdown danh mục khi click bên ngoài
  useEffect(() => {
    const handleClick = (e) => {
      if (catInputRef.current && !catInputRef.current.contains(e.target)) {
        setShowCatDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  )

  const handleSelectCategory = (cat) => {
    setForm(p => ({ ...p, categoryId: cat.id, categoryName: cat.name }))
    setCatSearch(cat.name)
    setShowCatDropdown(false)
  }

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
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

  const handleAddUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    if (!url.startsWith('http')) { alert('URL không hợp lệ'); return }
    const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i.test(url) || url.includes('youtube.com') || url.includes('youtu.be')
    setForm(prev => ({
      ...prev,
      mediaList: [...prev.mediaList, { url, type: isVideo ? 'VIDEO' : 'IMAGE', sortOrder: prev.mediaList.length }],
    }))
    setUrlInput('')
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

      let savedProduct
      if (editingProduct) {
        const res = await productService.update(editingProduct.id, payload)
        savedProduct = res.data
      } else {
        const res = await productService.create(payload)
        savedProduct = res.data
      }

      onSaved(savedProduct, !!editingProduct)
      onClose()
    } catch {
      alert('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-10 mb-10 border border-slate-100 animate-fadeIn">
      {/* Tiêu đề form */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
          {editingProduct ? 'Chỉnh sửa thông tin' : 'Khởi tạo sản phẩm'}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cột trái */}
        <div className="space-y-6">
          {/* Tên sản phẩm */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tên hiển thị *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ví dụ: Áo Hoodie Nỉ Bông Unisex..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
            />
          </div>

          {/* Giá & Tồn kho */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Giá bán (₫) *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-indigo-600 outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tồn kho *</label>
              <input
                type="number"
                value={form.stock}
                onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Danh mục */}
          <div ref={catInputRef} className="relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Danh mục ngành hàng *</label>
            <input
              type="text"
              value={catSearch}
              onChange={e => {
                setCatSearch(e.target.value)
                setForm(p => ({ ...p, categoryId: '', categoryName: '' }))
                setShowCatDropdown(true)
              }}
              onFocus={() => setShowCatDropdown(true)}
              placeholder="Gõ để tìm kiếm danh mục..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
            />
            {showCatDropdown && (
              <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-56 overflow-y-auto p-2 animate-fadeIn">
                {filteredCategories.length > 0
                  ? filteredCategories.map(cat => (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat)}
                      className={`px-4 py-3 text-xs font-bold rounded-xl cursor-pointer transition-colors mb-1 last:mb-0 ${
                        form.categoryId === cat.id
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat.name}
                    </div>
                  ))
                  : <p className="px-4 py-3 text-xs text-slate-400 italic">Không tìm thấy kết quả</p>
                }
              </div>
            )}
          </div>
        </div>

        {/* Cột phải */}
        <div className="space-y-6">
          {/* Media */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Hình ảnh & Media</label>
            <div className="flex flex-wrap gap-3 mb-4">
              {form.mediaList.map((m, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-2xl border border-slate-100 overflow-hidden group shadow-sm">
                  {m.type === 'VIDEO'
                    ? <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">VIDEO</div>
                    : <img src={m.url} alt="" className="w-full h-full object-cover" />
                  }
                  <button
                    onClick={() => removeMedia(idx)}
                    className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold border-0 cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-all bg-slate-50/50 cursor-pointer disabled:opacity-50"
              >
                {uploading
                  ? <div className="w-5 h-5 border-2 border-slate-200 border-t-indigo-600 animate-spin rounded-full"></div>
                  : <><span className="text-xl">+</span><span className="text-[9px] font-black uppercase">Upload</span></>
                }
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="Hoặc dán link ảnh/video vào đây..."
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-indigo-400 transition-all"
              />
              <button
                onClick={handleAddUrl}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold px-4 rounded-xl transition-all border-0 cursor-pointer"
              >
                THÊM URL
              </button>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Mô tả sản phẩm</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={4}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm resize-none min-h-[250px]"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-10 pt-8 border-t border-slate-50">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-10 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-100 border-0 cursor-pointer uppercase tracking-widest disabled:opacity-50"
        >
          {submitting ? 'Đang xử lý...' : editingProduct ? 'Lưu thay đổi' : 'Xác nhận thêm mới'}
        </button>
        <button
          onClick={onClose}
          className="bg-white border border-slate-200 text-slate-400 text-xs font-bold px-10 py-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer uppercase tracking-widest"
        >
          Hủy bỏ
        </button>
      </div>
    </div>
  )
}