import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/useAuth'
import reviewService from '../services/reviewService'
import StarRating from '../components/ui/StarRating'
import reportService from '../services/reportService'
import api from '../services/api'

// ─── MediaPreview
const MediaPreview = ({ mediaList, onRemove }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {mediaList.map((m, i) => (
      <div key={i} className="relative group">
        {m.type === 'IMAGE' ? (
          <img src={m.url} alt="" className="w-20 h-20 object-cover rounded border border-gray-200" />
        ) : (
          <video src={m.url} className="w-20 h-20 object-cover rounded border border-gray-200" />
        )}
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs border-0 cursor-pointer hidden group-hover:flex items-center justify-center"
          >
            ×
          </button>
        )}
      </div>
    ))}
  </div>
)

export default function ReviewSection({ productSlug }) {
  const { user } = useAuth()
  const fileRef = useRef()

  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myReview, setMyReview] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ rating: 5, comment: '', mediaList: [] })
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reportModal, setReportModal] = useState(null) // reviewId đang report
  const [reportReason, setReportReason] = useState('')
  const [reporting, setReporting] = useState(false)
  const [error, setError] = useState('')

  const fetchReviews = async () => {
    try {
      const res = await reviewService.getProductReviews(productSlug)
      setSummary(res.data)
      if (user) {
        const mine = res.data.reviews?.find(r => r.username === user.username)
        setMyReview(mine || null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReviews() }, [productSlug])

  const handleFilesUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const uploaded = await Promise.all(
        files.map(async (file, idx) => {
          const formData = new FormData()
          formData.append('file', file)
          const res = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          const isVideo = file.type.startsWith('video/')
          return {
            url: res.data.url,
            type: isVideo ? 'VIDEO' : 'IMAGE',
            sortOrder: form.mediaList.length + idx,
          }
        })
      )
      setForm(p => ({ ...p, mediaList: [...p.mediaList, ...uploaded] }))
    } catch {
      setError('Upload file thất bại')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeMedia = (index) => {
    setForm(p => ({
      ...p,
      mediaList: p.mediaList
        .filter((_, i) => i !== index)
        .map((m, i) => ({ ...m, sortOrder: i })),
    }))
  }

  const handleReport = async () => {
    if (!reportReason.trim()) { alert('Vui lòng nhập lý do báo cáo'); return }
    setReporting(true)
    try {
      await reportService.reportReview(reportModal, reportReason.trim())
      setReportModal(null)
      setReportReason('')
      alert('Đã gửi báo cáo thành công')
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setReporting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (editingId) {
        await reviewService.updateReview(editingId, form)
      } else {
        await reviewService.createReview(productSlug, form)
      }
      setShowForm(false)
      setEditingId(null)
      setForm({ rating: 5, comment: '', mediaList: [] })
      await fetchReviews()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa đánh giá này?')) return
    try {
      await reviewService.deleteReview(id)
      await fetchReviews()
    } catch (err) {
      alert(err.response?.data || 'Có lỗi xảy ra')
    }
  }

  const handleEdit = (review) => {
    setEditingId(review.id)
    setForm({
      rating: review.rating,
      comment: review.comment || '',
      mediaList: review.mediaList || [],
    })
    setShowForm(true)
    setError('')
  }

  const ratingBars = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: summary?.reviews?.filter(r => r.rating === star).length || 0,
    pct: summary?.totalReviews
      ? Math.round(
          (summary.reviews.filter(r => r.rating === star).length / summary.totalReviews) * 100
        )
      : 0,
  }))

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"></div>
      </div>
    )

  return (
    <>
    <div className="mt-8">
      <h3 className="text-base font-bold text-gray-700 mb-4">Đánh Giá Sản Phẩm</h3>

      {/* Summary */}
      {summary && summary.totalReviews > 0 && (
        <div className="bg-orange-50 rounded-lg p-4 mb-5 flex gap-6 items-center">
          <div className="text-center shrink-0">
            <p className="text-4xl font-black text-orange-500">
              {summary.averageRating.toFixed(1)}
            </p>
            <StarRating value={Math.round(summary.averageRating)} readonly size="sm" />
            <p className="text-xs text-gray-400 mt-1">{summary.totalReviews} đánh giá</p>
          </div>
          <div className="flex-1 space-y-1">
            {ratingBars.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-4 text-right">{star}</span>
                <span className="text-yellow-400">★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-yellow-400 h-1.5 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nút viết đánh giá */}
      {user && !myReview && !showForm && (
        <button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            setForm({ rating: 5, comment: '', mediaList: [] })
            setError('')
          }}
          className="mb-4 border border-orange-500 text-orange-500 text-sm px-4 py-2 rounded hover:bg-orange-50 cursor-pointer bg-white"
        >
          ✏️ Viết đánh giá
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            {editingId ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}
          </h4>
          {error && (
            <div className="bg-red-100 text-red-600 p-2 rounded text-xs mb-3">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Số sao *</label>
              <StarRating
                value={form.rating}
                onChange={v => setForm(p => ({ ...p, rating: v }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Nội dung
                <span className="text-gray-400 ml-1">(không bắt buộc)</span>
              </label>
              {/* FIX: bỏ required — chỉ cần số sao là đủ */}
              <textarea
                value={form.comment}
                onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                rows={3}
                placeholder="Chia sẻ trải nghiệm của bạn... (có thể bỏ qua)"
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Ảnh / Video
                <span className="text-gray-400 ml-1">(không bắt buộc)</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFilesUpload}
                className="text-xs text-gray-500"
              />
              {uploading && (
                <p className="text-xs text-orange-400 mt-1">⏳ Đang upload...</p>
              )}
              {form.mediaList.length > 0 && (
                <MediaPreview mediaList={form.mediaList} onRemove={removeMedia} />
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || uploading}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded cursor-pointer border-0 disabled:opacity-50"
              >
                {submitting ? '...' : editingId ? 'Cập nhật' : 'Gửi đánh giá'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); setError('') }}
                className="border border-gray-300 text-gray-500 text-sm px-4 py-2 rounded hover:bg-gray-50 cursor-pointer bg-white"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách reviews */}
      {!summary || summary.totalReviews === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
        </div>
      ) : (
        <div className="space-y-5">
          {summary.reviews.map(review => (
            <div key={review.id} className="border-b border-gray-100 pb-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-500 shrink-0">
                    {review.username?.[0]?.toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{review.username}</p>
                    <StarRating value={review.rating} readonly size="sm" />
                  </div>
                </div>

                {user && review.username === user.username && (
                  <div className="flex items-center gap-2 shrink-0">
                    {review.canEdit ? (
                      <button
                        onClick={() => handleEdit(review)}
                        className="text-xs text-blue-500 hover:underline cursor-pointer bg-transparent border-0"
                      >
                        Sửa
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">
                        (Sửa được sau{' '}
                        {Math.max(1, Math.ceil(30 - (Date.now() - new Date(review.updatedAt)) / 60000))}{' '}
                        phút)
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-xs text-red-400 hover:underline cursor-pointer bg-transparent border-0"
                    >
                      Xóa
                    </button>
                  </div>
                )}
                {/* Nút report — chỉ hiện cho review của người khác */}
                {user && review.username !== user.username && (
                  <button
                    onClick={() => { setReportModal(review.id); setReportReason('') }}
                    className="text-xs text-gray-300 hover:text-red-400 cursor-pointer bg-transparent border-0 transition"
                    title="Báo cáo đánh giá này"
                  >
                    🚩
                  </button>
                )}
              </div>

              {/* Comment — chỉ hiện nếu có */}
              {review.comment && (
                <p className="text-sm text-gray-600 mt-1 ml-9">{review.comment}</p>
              )}

              {/* Nếu không có comment — hiện placeholder nhỏ */}
              {!review.comment && (
                <p className="text-xs text-gray-300 mt-1 ml-9 italic">Không có nhận xét</p>
              )}

              {review.mediaList?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 ml-9">
                  {review.mediaList.map(m =>
                    m.type === 'IMAGE' ? (
                      <img
                        key={m.id}
                        src={m.url}
                        alt=""
                        className="w-20 h-20 object-cover rounded border border-gray-100 cursor-pointer hover:opacity-90"
                        onClick={() => window.open(m.url, '_blank')}
                      />
                    ) : (
                      <video
                        key={m.id}
                        src={m.url}
                        controls
                        className="w-32 h-20 rounded border border-gray-100"
                      />
                    )
                  )}
                </div>
              )}

              <p className="text-xs text-gray-300 mt-1.5 ml-9">
                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Modal báo cáo review */}
      {reportModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={e => { if (e.target === e.currentTarget) setReportModal(null) }}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold text-gray-700 mb-1">Báo cáo đánh giá</h3>
            <p className="text-xs text-gray-400 mb-3">Vui lòng cho chúng tôi biết lý do báo cáo</p>
            <label className="text-xs text-gray-500 mb-1 block">Lý do *</label>
            <textarea
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              rows={3}
              placeholder="Ví dụ: Đánh giá không liên quan, spam, nội dung không phù hợp..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReport}
                disabled={reporting}
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-5 py-2 rounded-lg cursor-pointer border-0 disabled:opacity-50"
              >
                {reporting ? '...' : 'Gửi báo cáo'}
              </button>
              <button
                onClick={() => setReportModal(null)}
                className="border border-gray-300 text-gray-500 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 cursor-pointer bg-white"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}