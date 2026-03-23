import Header from '../Header'
import Footer from '../Footer'

/**
 * LoadingSpinner — dùng chung cho tất cả page
 *
 * Props:
 *  fullPage     {boolean} — true = bọc Header + Footer (default: false)
 *  searchQuery  {string}  — truyền vào Header khi fullPage = true
 *  onSearchChange {fn}    — truyền vào Header khi fullPage = true
 *
 * Ví dụ:
 *  // Inline spinner (trong card, modal,...)
 *  <LoadingSpinner />
 *
 *  // Toàn trang — thay thế pattern lặp đi lặp lại ở mọi page
 *  <LoadingSpinner fullPage searchQuery={q} onSearchChange={setQ} />
 */
export default function LoadingSpinner({ fullPage = false, searchQuery = '', onSearchChange }) {
  const spinner = (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
    </div>
  )

  if (!fullPage) return spinner

  return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={onSearchChange ?? (() => {})} />
      {spinner}
      <Footer />
    </div>
  )
}