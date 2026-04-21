import React, { useState, useEffect } from 'react'
import categoryService from '../../services/categoryService'

export default function CategoryFormModal({ open, editingCat, parentOptions, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', description: '', parentId: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (editingCat) {
      setForm({
        name: editingCat.name,
        description: editingCat.description || '',
        parentId: editingCat.parentId ? String(editingCat.parentId) : '',
      })
    } else {
      setForm({ name: '', description: '', parentId: '' })
    }
    setError('')
  }, [open, editingCat])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        parentId: form.parentId ? Number(form.parentId) : null,
      }
      if (editingCat) {
        await categoryService.update(editingCat.id, payload)
      } else {
        await categoryService.create(payload)
      }
      onSaved(!!editingCat)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-[2rem] shadow-2xl p-10 w-full max-w-2xl mx-4 border border-slate-100 overflow-hidden relative">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            {editingCat ? 'Chỉnh sửa danh mục' : 'Khởi tạo danh mục mới'}
          </h3>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold p-4 rounded-2xl mb-6 flex items-center gap-2">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-left">Tên danh mục *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ví dụ: Đồ gia dụng, Thời trang Nam..."
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-left">Cấp bậc (Danh mục cha)</label>
              <select
                value={form.parentId}
                onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm appearance-none cursor-pointer"
              >
                <option value="">— Đặt làm danh mục gốc —</option>
                {parentOptions
                  .filter(p => p.id !== editingCat?.id)
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))
                }
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-left">Mô tả ngắn</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Mô tả đặc điểm hoặc phạm vi của danh mục này..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black px-6 py-4 rounded-xl transition-all shadow-lg shadow-indigo-100 border-0 cursor-pointer uppercase tracking-widest disabled:opacity-50 active:scale-95"
            >
              {submitting ? 'Đang xử lý...' : editingCat ? 'Lưu thay đổi' : 'Xác nhận tạo mới'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-slate-200 text-slate-400 text-[11px] font-black px-6 py-4 rounded-xl hover:bg-slate-50 transition-all cursor-pointer uppercase tracking-widest"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
        {/* Watermark icon */}
        <span className="absolute -right-6 -bottom-8 text-9xl opacity-[0.02] select-none pointer-events-none">📂</span>
      </div>
    </div>
  )
}