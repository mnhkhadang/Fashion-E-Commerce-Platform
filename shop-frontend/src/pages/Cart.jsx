    import {useState, useEffect} from 'react'
    import {useNavigate, Link } from 'react-router-dom'
    import api from '../services/api'
    import Header  from '../components/Header'
    import Footer  from '../components/Footer'

    export default function Cart(){
        const [cart , setCart] = useState()
        const [loading, setLoading] = useState(true)
        const [searchQuery, setSearchQuery] = useState('')
        const [selectedItems, setSelectedItems] = useState([])
        const navigate = useNavigate()

        useEffect( ()=> {
            fetchCart()
        },[])

        const fetchCart = async () => {
            setLoading(true)
            try {
                const res = await api.get('/api/cart')
                setCart(res.data)
            } catch {
                console.error('Lỗi khi tải giỏ hàng')
            } finally {
                setLoading(false)
            }
        }

        const updateQuantity = async( slug , quantity) => {
            if(quantity < 1) 
                return
            try {
                await api.put('/api/cart/items/update', {slug, quantity})
                setCart(prev => ({
                    ...prev,
                    items: prev.items.map(item =>
                        item.productSlug === slug ? { ...item, quantity} : item
                    )
                }))
            } catch {
                console.error('lỗi khi nhập số lượng')
            } 
        }

        const removeItem = async(slug) => {
            try {
                await api.delete(`/api/cart/items?slug=${slug}`)
                setSelectedItems(prev => prev.filter(s => s !== slug))
                setCart(prev => ({
                    ...prev,
                    items: prev.items.filter(item => item.productSlug !== slug)
                }))
            } catch {
                console.error('Lỗi khi xóa sản phẩm')
            }
        }

        const toggleSelect = (slug) => {
            setSelectedItems( prev => 
                prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
            )
        }

        const toggleSelectAll = () => {
            if( !cart?.items) 
                return
            if( selectedItems.length === cart.items.length){
                setSelectedItems([])
            }else {
                setSelectedItems(cart.items.map(item => item.productSlug))
            }
        }

        const totalPrice = cart?.items
            ?.filter(item => selectedItems.includes(item.productSlug))
            ?.reduce((sum, item) => sum + item.price*item.quantity,0) || 0
        const handleCheckout = () => {
            if( selectedItems.length === 0)
                return
            navigate('/checkout', {state: {slugs: selectedItems}})
        }

        if (loading) return (

            <div className='main-h-screen bg-gray-100'>
                <Header searchQuery={searchQuery} onSearchChange={setSearchQuery}/>
                <div className='flex justity-center py-20'>
                    <div className='w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin'></div>
                </div>
            </div>
        )

        return  (
            <div className='min-h-screen bg-gray-100'>
                <Header searchQuery={searchQuery} onSearchChange={setSearchQuery}/>

                <div className='max-w-6xl mx-auto px-4 py-5'>
                    <h2 className='text-lg font-bold text-gray-700 mb-4'>Giỏ hàng ({cart?.items?.length || 0} sản phẩm)</h2>
                    
                    {!cart?.items?.length ?(
                        <div className='bg-white rounded-lg shadow-sm p-20 text-center text-gray-400'>
                            <span className='text-6xl block mb-4'>🛒</span>
                            <p className='text-lg mb-4'>Giỏ hàng trống</p>
                            <Link to="/" className='bg-orange-500 text-white px-6 py-2 rounded-sm hover:bg-orange-600 no-underline'>
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    ):(
                        <div className='flex gap-4'>
                            {/* cart items */}
                            <div className='flex-1'>
                                {/* header row */}
                                <div className='bg-white rounded-lg shadow-sm px-4 py-3 mb-2 flex items-center gap-4 text-sm text-gray-500' >
                                    <input 
                                        type="checkbox"
                                        checked={selectedItems.length === cart.items.length}
                                        onChange={toggleSelectAll}
                                        className='w-4 h-4 accent-orange-500'                             
                                    />
                                    <span className='flex-1'>Sản Phẩm</span>
                                    <span className='w-24 text-center'>Đơn Giá</span>
                                    <span className='w-28 text-center'>Số Lượng</span>
                                    <span className='w-24 text-center'>Số Tiền</span>
                                    <span className='w-16 text-center'>Thao Tác</span>
                                </div>
                                {/* item */}
                                {cart.items.map( item => (
                                    <div key={item.productSlug} className='bg-white rounded-lg shadow-sm px-4 py-4 mb-2 flex items-center gap-4'>
                                        <input 
                                            type="checkbox"
                                            checked={selectedItems.includes(item.productSlug)}
                                            onChange={()=> toggleSelect(item.productSlug)}
                                            className='w-4 h-4 accent-orange-500'
                                        />
                                        {/* product info */}
                                        <div className='flex items-center gap-3 flex-1'>
                                            <img 
                                                src={item.productImage || 'https://picsum.photos/80/80'} 
                                                alt={item.productName}
                                                className='w-16 h-16 object-cover rounded border border-gray-100'
                                            />
                                            <div>
                                                <Link to={`/products/${item.productSlug}`} className='text-sm text-gray-700 hover:text-orange-500 no-underline line-clamp-2'>
                                                    {item.productName}
                                                </Link>
                                                <p className='text-xs text-gray-400 mt-1'>{item.shopName}</p>
                                            </div>
                                        </div>
                                        {/* price */}
                                        <div className='w-24 text-center text-orange-500 text-sm font-medium'>
                                            {item.price.toLocaleString('vi-VN')}₫
                                        </div>
                                        {/* quantity */}
                                        <div className='w-28 flex items-center justify-center'>
                                            <div className='flex items-center border border-gray-200 rounded'>
                                                <button
                                                    onClick={()=> updateQuantity(item.productSlug, item.quantity -1)}
                                                    className='w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer bg-transparent border-0'
                                                >-</button>
                                                <span className='w-8 text-center text-sm'>{item.quantity}</span>
                                                <button 
                                                    onClick={()=> updateQuantity(item.productSlug, item.quantity + 1)}
                                                    className='w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer bg-transparent border-0'
                                                >+</button>                                       
                                            </div>
                                        </div>
                                        {/* subtotal */}
                                        <div className='w-24 text-center text-orange-500 font-semibold text-sm'>
                                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫                                    
                                        </div>
                                        {/* remove */}
                                        <div className='w-16 text-center'>
                                            <button
                                                onClick={()=> removeItem(item.productSlug)}
                                                className='text-gray-400 hover:text-red-500 text-sm cursor-pointer bg-transparent border-0'
                                            >Xóa</button>                                   
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* sumary */}
                            <div className='w-80 shrink-0'>
                                <div className='bg-white rounded-lg shadow-sm p-4 sticky top-24'>
                                    <h3 className='font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100'>Tóm tắt đơn hàng</h3>
                                    <div className='flex justify-between text-sm text-gray-500 mb-2'>
                                        <span>Sản phẩm đã chọn</span>
                                        <span>{selectedItems.length}</span>
                                    </div>
                                    <div className='flex just-between text-sm text-gray-500 mb-4'>
                                        <span>Tổng tiền hàng</span>
                                        <span className='text-orange-500 font-semibold'>{totalPrice.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                    <div className='flex justify-between font-bold text-gray-800 mb-5 pt-2 border-t border-gray-100'>
                                        <span>Tổng thanh toán</span>
                                        <span className='text-orange-500 text-lg'>{totalPrice.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={selectedItems.length === 0}
                                        className='w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-sm font-semibold transition cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        Mua Hàng ({selectedItems.length})
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <Footer/>
            </div>
        )
    }