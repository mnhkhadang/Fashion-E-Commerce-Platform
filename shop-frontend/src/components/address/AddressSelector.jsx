export default function AddressSelector({ addresses, onEdit, onDelete, onSetDefault }) {
    return (
        <div className='space-y-3'>
            {addresses.map(address => (
                <div key={address.id} className='bg-white rounded-lg shadow-sm p-5'>
                    <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1 flex-wrap'>
                                <p className='text-sm font-semibold text-gray-700'>{address.fullName}</p>
                                <span className='text-gray-300'>|</span>
                                <p className='text-sm text-gray-500'>{address.phone}</p>
                                {address.isDefault && (
                                    <span className='text-[10px] border border-orange-500 text-orange-500 px-1.5 py-0.5 rounded'>Mặc định</span>
                                )}
                            </div>
                            <p className='text-xs text-gray-500'>
                                {address.streetAddress}, {address.districtName}, {address.provinceName}
                            </p>
                        </div>
                        <div className='flex gap-2 ml-4 shrink-0'>
                            <button
                                onClick={() => onEdit(address)}
                                className='text-xs text-blue-500 hover:text-blue-600 cursor-pointer bg-transparent border-0 p-0'
                            >
                                Sửa
                            </button>
                            <span className='text-gray-300'>|</span>
                            <button
                                onClick={() => onDelete(address.id)}
                                className='text-xs text-red-400 hover:text-red-500 cursor-pointer bg-transparent border-0 p-0'
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                    {!address.isDefault && (
                        <button
                            onClick={() => onSetDefault(address.id)}
                            className='mt-3 text-xs border border-gray-300 text-gray-500 px-3 py-1.5 rounded hover:border-orange-400 hover:text-orange-500 transition cursor-pointer bg-white'
                        >
                            Đặt làm mặc định
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
}