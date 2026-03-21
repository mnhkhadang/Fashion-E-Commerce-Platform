export default function CheckoutProductSection({ selectedItems, note, setNote }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
            <h3 className="font-semibold text-gray-700 mb-3">🛍 Sản Phẩm Đặt Hàng</h3>
            <div className="space-y-3">
                {selectedItems?.map(item => (
                    <div key={item.productSlug} className="flex items-center gap-3">
                        <img
                            src={item.productImage || 'https://picsum.photos/60/60'}
                            alt={item.productName}
                            className="w-14 h-14 object-cover rounded border border-gray-100"
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
    )
}