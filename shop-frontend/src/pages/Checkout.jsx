import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from '../services/api'
import Header from "../components/Header";
import Footer from "../components/Footer";


export default function Checkout(){
    const { state } = useLocation()
    const navigate = useNavigate()
    const slugs = state?.slugs || []
    
    const [cart, setCart] = useState()
    const [addresses, setAddresses] = useState([])
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('COD')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() =>{
        if(slugs.length === 0){
            navigate('/cart')
            return
        }

        const fetchData = async () =>    {
            try {
                const [cartRes, addressRes] = await Promise.all ([
                    api.get('/api/cart'),
                    api.get('/api/shipping-addresses')
                ])
                setCart(cartRes.data)
                setAddresses(addressRes.data)
                const defaultAddress = addressRes.data.find(a => a.defautl) || addressRes.data[0]
                if( defaultAddress) 
                    setSelectedAddress(defaultAddress)
            } catch {
                console.error('Lỗi khi tải dữ liệu')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    },[])


    const selectedItems = cart?.items?.filter(item => slugs.includes(item.productSlug))

    const totalPrice = selectedItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0

    const handleSubmit = async ()=> {
        if(!selectedAddress){
            alert('Vui lòng chọn địa chỉ giao hàng!')
            return
        }

        setSubmitting(true)
        try {
            const res = await api.post('/api/payments/checkout', {
                shippingAddressId: selectedAddress.id,
                note,
                slugs,
                paymentMethod
            })
            navigate('/orders', {state: {paymentCode: res.data.paymentCode}})
        } catch {
            console.error('Lỗi khi đặt hàng')
            alert('Đặt hàng thất bại, vui lòng thử lại')
        } finally{
            setSubmitting(false)
        }
    }

    if(loading) return (
        <div className="min-h-screen bg-gray-100">
            <Header searchQuery={searchQuery} onSearchChange={setSearchQuery}/>
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"></div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-100">
            <Header searchQuery={searchQuery } onSearchChange={setSearchQuery} />

            <div className="max-w-4xl mx-auto px-4 py-5">
                <h2 className="text-lg font-bold text-gray-700 mb-4">Thanh Toán</h2>

                {/* Địa chỉ giao hàng */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-orange-500">📍</span>Địa chỉ giao hàng
                    </h3>

                    {addresses.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-gray-400 text-sm mb-3">Chưa có địa chỉ giao hàng</p>
                            <button
                                onClick={()=> navigate('/profile/address')}
                                className="text-orange-500 text-sm border border-orange-500 px-4 py-1.5 rounded hover:bg-orange-50 cursor-pointer bg-white"
                            >
                                + Thêm địa chỉ
                            </button>
                        </div>
                    ):(
                        <div className="space-y-2">
                            {addresses.map(address => (
                                <div 
                                    key={address.id}
                                    onClick={()=> setSelectedAddress(address)}
                                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                                        selectedAddress?.id === address.id
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-100 hover:border-orange-200'
                                    }`}
                                >
                                    <div className="w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 border-0 border-orange-500">
                                        {selectedAddress?.id === address.id && (
                                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-700">
                                            {address.fullName} | {address.phone}
                                            {address.defautl && (
                                                <span className="ml-2 text-[10px] border border-orange-500 text-orange-500 px-1.5 py-0.5 rounded">Mặc định</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {address.streetAddress}, {address.districtAddress}, {address.proviceName}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Sản phẩm */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
                    <h3 className="font-semibold text-gray-700 mb-3">🛍 Sản Phẩm Đặt Hàng</h3>
                    <div className="space-y-3">
                        {selectedItems.map(item =>(
                            <div key={item.productSlug} className="flex items-center gap-3">
                                <img 
                                    src={item.productImage || 'https://picsum.photos/60/60'} 
                                    alt={item.productName}
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-700">{item.productName}</p>
                                    <p className="text-xs text-gray-400">{item.shopName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-orange-500 font-medium">
                                        {item.price.toLocaleString('vi-VN')}₫
                                    </p>
                                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* note */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <label className="text-sm text-gray-500 mb-1 block">Lời nhắn cho shop:</label>
                        <input 
                            type="text"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Lưu ý cho người bán..."
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400"
                        />
                    </div>
                </div>
                {/* Phương thức thanh toán */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
                    <h3 className="font-semibold text-gray-700 mb-3">💳 Phương Thức Thanh Toán</h3>
                    <div className="flex gap-3">
                        {[
                            { value: 'COD', label: '💵 Thanh toán khi nhận hàng' },
                            { value: 'VNPAY', label: '🏦 VNPay' }
                        ].map(method => (
                            <div
                                key={method.value}
                                onClick={()=> setPaymentMethod(method.value)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition ${
                                    paymentMethod === method.value
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-orange-200'
                                }`}
                            >
                                <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center shrink-0">
                                    {paymentMethod === method.value && (
                                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    )}
                                </div>
                                <span className="text-sm">{method.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tổng tiền */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>Tổng tiền hàng</span>
                        <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                        <span>Phí vận chuyển</span>
                        <span className="text-green-500">Miễn phí</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-800 mb-5 pt-3 border-t border-gray-100">
                        <span>Tổng thanh toán</span>
                        <span className="text-orange-500 text-xl">{totalPrice.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !selectedAddress}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-sm font-semibold transition cursor-pointer border-0 disabled:opacity-50"
                    >
                        {submitting ? 'Đang đặt hàng...' : 'Đặt hàng'} 
                    </button>
                </div>
            </div>

            <Footer/>
        </div>
    )
}