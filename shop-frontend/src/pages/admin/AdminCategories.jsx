import React, { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import CategoryFormModal from './CategoryFormModal'
import categoryService from '../../services/categoryService'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await categoryService.getAll()
      setCategories(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditingCat(null)
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setEditingCat(cat)
    setShowForm(true)
  }

  const handleSaved = (isEdit) => {
    setSuccessMsg(isEdit ? 'Cập nhật danh mục thành công' : 'Tạo danh mục thành công')
    setTimeout(() => setSuccessMsg(''), 3000)
    fetchCategories()
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Lưu ý: Xóa danh mục "${name}" có thể ảnh hưởng đến các sản phẩm thuộc danh mục này. Tiếp tục?`)) return
    try {
      await categoryService.delete(id)
      setSuccessMsg('Đã gỡ bỏ danh mục khỏi hệ thống')
      setTimeout(() => setSuccessMsg(''), 3000)
      fetchCategories()
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa danh mục này')
    }
  }

  const parents = categories.filter(c => !c.parentId)
  const children = categories.filter(c => c.parentId)

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-10 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[3px] mb-1">Cấu trúc dữ liệu</p>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Quản Lý Danh Mục</h2>
            </div>
            <button
              onClick={openAdd}
              className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black px-8 py-4 rounded-2xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] border-0 cursor-pointer uppercase tracking-widest"
            >
              + Thêm danh mục mới
            </button>
          </div>

          {/* Stats Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Tổng số ngành hàng', value: categories.length, color: 'from-slate-700 to-slate-800', icon: '📂' },
              { label: 'Danh mục gốc (Gốc)',  value: parents.length,    color: 'from-indigo-500 to-blue-600', icon: '🌿' },
              { label: 'Phân loại phụ',       value: children.length,   color: 'from-emerald-500 to-teal-600', icon: '🍂' },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-6 shadow-xl flex items-center justify-between`}>
                <div>
                  <p className="text-3xl font-black tracking-tighter">{s.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1">{s.label}</p>
                </div>
                <span className="text-2xl bg-white/20 w-12 h-12 flex items-center justify-center rounded-xl backdrop-blur-sm">{s.icon}</span>
              </div>
            ))}
          </div>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold px-6 py-4 rounded-2xl mb-8 animate-slideDown flex items-center gap-3">
              <span className="text-lg">✨</span> {successMsg}
            </div>
          )}

          {/* Table Container */}
          {loading ? (
            <div className="flex justify-center items-center py-40">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-50">
                    <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phân cấp & Tên danh mục</th>
                    <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả định nghĩa</th>
                    <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Phân loại</th>
                    <th className="text-right px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {parents.map(parent => (
                    <React.Fragment key={parent.id}>
                      {/* Parent row */}
                      <tr className="group hover:bg-slate-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                            <span className="font-black text-slate-800 text-sm uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                                {parent.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-medium text-slate-400 max-w-xs truncate italic">
                          {parent.description || '—'}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="text-[9px] font-black bg-indigo-50 text-indigo-500 border border-indigo-100 px-3 py-1 rounded-lg uppercase tracking-widest">
                            ROOT LEVEL
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => openEdit(parent)} className="text-[10px] font-black border border-slate-200 text-slate-500 px-4 py-2 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all cursor-pointer uppercase tracking-widest bg-white">
                              Sửa
                            </button>
                            <button onClick={() => handleDelete(parent.id, parent.name)} className="text-[10px] font-black border border-slate-200 text-slate-400 px-4 py-2 rounded-xl hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer uppercase tracking-widest bg-white">
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Children rows */}
                      {children.filter(c => c.parentId === parent.id).map(child => (
                        <tr key={child.id} className="bg-slate-50/20 group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="ml-8 flex items-center gap-3">
                              <span className="text-slate-200 font-light text-xl -mt-2">└</span>
                              <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-500 transition-colors uppercase">
                                {child.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-xs font-medium text-slate-400 max-w-xs truncate italic">
                            {child.description || '—'}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-lg uppercase tracking-widest">
                               SUB LEVEL
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(child)} className="text-[10px] font-black border border-slate-200 text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all cursor-pointer bg-white uppercase">
                                Sửa
                              </button>
                              <button onClick={() => handleDelete(child.id, child.name)} className="text-[10px] font-black border border-slate-200 text-slate-400 px-3 py-1.5 rounded-lg hover:text-rose-500 transition-all cursor-pointer bg-white uppercase">
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              {!loading && categories.length === 0 && (
                <div className="text-center py-24 text-slate-300 font-bold italic border-t border-slate-50">
                  <span className="text-4xl block mb-4 grayscale opacity-20">📂</span>
                  Hệ thống chưa thiết lập cấu trúc danh mục
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      <CategoryFormModal
        open={showForm}
        editingCat={editingCat}
        parentOptions={parents}
        onClose={() => setShowForm(false)}
        onSaved={handleSaved}
      />
    </div>
  )
}