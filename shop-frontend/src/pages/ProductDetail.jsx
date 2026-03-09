import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/useAuth'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [addingCart, setAddingToCart] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/api/products/${slug}`)
        setProduct(res.data)
      } catch (e) {
        console.error('Lỗi khi tải sản phẩm', e.response?.status)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!user.roles.includes('ROLE_USER')) {
      setMessage({ type: 'error', text: 'Chỉ người dùng mới có thể thêm vào giỏ hàng' })
      return
    }
    setAddingToCart(true)
    try {
      await api.post('/api/cart/items', { slug: product.slug, quantity })
      setMessage({ type: 'success', text: 'Đã thêm vào giỏ hàng!' })
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setMessage({ type: 'error', text: 'Lỗi khi thêm vào giỏ hàng' })
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    try {
        await api.post('/api/cart/items', { slug: product.slug, quantity })
        navigate('/cart')
    } catch {
        console.error('Lỗi khi mua ngay')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
      </div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="text-center py-20 text-gray-400">Không tìm thấy sản phẩm</div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-100 font-sans'>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className='max-w-6xl mx-auto px-4 py-5'>
        {/* Breadcrumb */}
        <nav className='text-xs text-gray-400 mb-4 flex items-center gap-1'>
          <button onClick={() => navigate('/')} className='hover:text-orange-500 cursor-pointer bg-transparent border-0 p-0'>Trang chủ</button>
          <span>›</span>
          <button 
            onClick={() => navigate(`/category/${encodeURIComponent(product.categoryName)}`)} 
            className='hover:text-orange-500 cursor-pointer bg-transparent border-0 p-0'
          >
            {product.categoryName}
          </button>
          <span>›</span>
          <span className='text-gray-600 truncate'>{product.name}</span>
        </nav>

        {/* Product Info Section */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-4'>
          <div className='flex flex-col md:flex-row gap-8'>
            
            {/* Image Block */}
            <div className='w-full md:w-96 shrink-0'>
              <div className='aspect-square rounded-lg overflow-hidden mb-3 border border-gray-100'>
                <img 
                  src={product.mediaList?.[selectedImage]?.url || 'https://picsum.photos/400/400'} 
                  alt={product.name}
                  className='w-full h-full object-cover transition-transform duration-500 hover:scale-110'
                />
              </div>
              {product.mediaList?.length > 1 && (
                <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
                  {product.mediaList.map((media, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-16 rounded border-2 overflow-hidden shrink-0 cursor-pointer transition-all ${
                        selectedImage === idx ? 'border-orange-500' : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <img src={media.url} alt="" className='w-full h-full object-cover'/>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detail Block */}
            <div className='flex-1'>
              <h1 className='text-2xl font-semibold text-gray-800 mb-2'>{product.name}</h1>

              <div className='flex items-center gap-4 text-sm text-gray-400 mb-6'>
                <span className='text-orange-400 font-bold'>⭐ 4.0</span>
                <span className='w-[1px] h-3 bg-gray-200'></span>
                <span>Đã bán {product.sold}</span>
                <span className='w-[1px] h-3 bg-gray-200'></span>
                <span>Còn {product.stock} sản phẩm</span>
              </div>

              <div className='bg-gray-50 rounded-lg px-6 py-4 mb-6'>
                <p className='text-3xl font-bold text-orange-500'>
                  {product.price?.toLocaleString('vi-VN')}₫
                </p>
              </div>

              {/* Shop Info Block - ĐÃ SỬA LỖI LẶP LẠI */}
              <div className='flex items-center gap-4 mb-8 py-5 border-y border-gray-100'>
                <div className='w-14 h-14 rounded-full bg-gradient-to-tr from-orange-100 to-orange-50 flex items-center justify-center text-orange-500 font-bold text-2xl shadow-inner shrink-0 border border-orange-200'>
                  {product.shopName?.charAt(0).toUpperCase() || 'S'}
                </div>
                
                <div className='flex flex-col justify-center'>
                  <h3 className='text-base font-bold text-gray-800 m-0 leading-tight'>
                    {product.shopName || 'Shop Name'}
                  </h3>
                  <div className='flex items-center gap-3 mt-1.5'>
                    <button
                      onClick={() => navigate(`/shop/${encodeURIComponent(product.shopName)}`)}
                      className='flex items-center gap-1 text-xs text-orange-500 hover:text-white hover:bg-orange-500 border border-orange-500 px-3 py-1 rounded-sm transition-all cursor-pointer font-medium bg-transparent'
                    >
                      🏪 Xem Shop
                    </button>
                    <span className='text-[11px] text-gray-400'>|</span>
                    <span className='text-[11px] text-gray-500'>Đánh giá cực tốt</span>
                  </div>
                </div>
              </div>

              {/* Quantity Picker */}
              <div className='flex items-center gap-6 mb-8'>
                <span className='text-sm text-gray-500 font-medium'>Số lượng</span>
                <div className='flex items-center border border-gray-300 rounded-sm overflow-hidden'>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className='w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer bg-white border-0 border-r border-gray-300 text-xl'
                  >-</button>
                  <span className='w-12 text-center text-sm font-semibold'>{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className='w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer bg-white border-0 border-l border-gray-300 text-xl'
                  >+</button>
                </div>
                <span className='text-xs text-gray-400'>{product.stock} sản phẩm sẵn có</span>
              </div>

              {message && (
                <div className={`text-sm px-4 py-3 rounded-sm mb-6 ${
                  message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              <div className='flex gap-4'>
                <button
                  onClick={handleAddToCart}
                  disabled={addingCart || product.stock === 0}
                  className='flex-1 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 py-3.5 rounded-sm font-bold transition-all cursor-pointer bg-white disabled:opacity-50 uppercase text-sm'
                >
                  {addingCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                </button>
                <button 
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className='flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-sm font-bold transition-all cursor-pointer border-0 shadow-lg shadow-orange-500/20 disabled:opacity-50 uppercase text-sm'
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className='bg-white rounded-lg shadow-sm p-8'>
          <h2 className='text-lg font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100 uppercase tracking-wide'>
            Chi tiết sản phẩm
          </h2>
          <div className='text-sm text-gray-600 leading-relaxed whitespace-pre-line'>
            {product.description || 'Thông tin mô tả đang được cập nhật...'}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}