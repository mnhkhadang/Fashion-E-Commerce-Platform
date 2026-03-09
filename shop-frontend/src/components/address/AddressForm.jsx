export default function AddressForm({ form, provinces, districts, editingId, submitting, onChange, onSubmit, onCancel }) {
    return (
        <div className='bg-white rounded-lg shadow-sm p-5 mb-4'>
            <h3 className='font-semibold text-gray-700 mb-4'>
                {editingId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </h3>
            <div className='grid grid-cols-1 gap-3'>
                <div className='grid grid-cols-2 gap-3'>
                    <div>
                        <label className='text-xs text-gray-500 mb-1 block'>Họ và tên</label>
                        <input type="text" value={form.fullName} onChange={e => onChange('fullName', e.target.value)}
                            placeholder='Nguyen Van A'
                            className='w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400'
                        />
                    </div>
                    <div>
                        <label className='text-xs text-gray-500 mb-1 block'>Số điện thoại</label>
                        <input type="text" value={form.phone} onChange={e => onChange('phone', e.target.value)}
                            placeholder='090123456'
                            className='w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400'
                        />
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                    <div>
                        <label className='text-xs text-gray-500 mb-1 block'>Tỉnh/ Thành phố</label>
                        <select value={form.provinceCode} onChange={e => onChange('provinceCode', e.target.value)}
                            className='w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white'>
                            <option value="">Chọn Tỉnh/ Thành phố</option>
                            {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className='text-xs text-gray-500 mb-1 block'>Quận/ Huyện</label>
                        <select value={form.districtCode} onChange={e => onChange('districtCode', e.target.value)}
                            disabled={!form.provinceCode}
                            className='w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white disabled:bg-gray-50 disabled:text-gray-400'
                        >
                            <option value="">Chọn quận/ huyện</option>
                            {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className='text-xs text-gray-500 mb-1 block'>Địa chỉ cụ thể</label>
                    <input type="text" value={form.streetAddress} onChange={e => onChange('streetAddress', e.target.value)}
                        placeholder='Số nhà, tên đường,...'
                        className='w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-orange-400'
                    />
                </div>
                <label className='flex items-center gap-2 cursor-pointer select-none'>
                    <input type="checkbox" checked={form.isDefault} onChange={e => onChange('isDefault', e.target.checked)}
                        className='accent-orange-500'
                    />
                    <span className='text-sm text-gray-600'>Đặt làm địa chỉ mặc định</span>
                </label>
            </div>
            <div className='flex gap-2 mt-4'>
                <button
                    onClick={onSubmit} disabled={submitting}
                    className='bg-orange-500 hover:bg-orange-600 text-white text-sm px-5 py-2 rounded transition cursor-pointer border-0 disabled:opacity-50'
                >
                    {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm địa chỉ'}
                </button>
                <button
                    onClick={onCancel}
                    className='border border-gray-300 text-gray-500 text-sm px-5 py-2 rounded hover:bg-gray-50 transition cursor-pointer bg-white'
                >
                    Hủy
                </button>
            </div>
        </div>
    )
}