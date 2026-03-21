import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddressForm from '../address/AddressForm'
import shippingAddressService from '../../services/shippingAddressService'
import locationService from '../../services/locationService'

const EMPTY_FORM = {
    fullName: '', phone: '', streetAddress: '',
    provinceCode: '', districtCode: '', isDefault: false,
}

export default function CheckoutAddressSection({ addresses, setAddresses, selectedAddress, setSelectedAddress }) {
    const navigate = useNavigate()
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [provinces, setProvinces] = useState([])
    const [districts, setDistricts] = useState([])
    const [submitting, setSubmitting] = useState(false)

    const openAddForm = async () => {
        setEditingId(null)
        setForm(EMPTY_FORM)
        setDistricts([])
        if (provinces.length === 0) {
            const res = await locationService.getProvince()
            setProvinces(res.data)
        }
        setShowForm(true)
    }

    const openEditForm = async (address) => {
        if (provinces.length === 0) {
            const res = await locationService.getProvince()
            setProvinces(res.data)
        }
        const province = provinces.find(p => p.name === address.provinceName)
        const provinceCode = province?.code || ''
        let districtCode = ''
        if (provinceCode) {
            const res = await locationService.getDistricts(provinceCode)
            setDistricts(res.data)
            const district = res.data.find(d => d.name === address.districtName)
            districtCode = district?.code || ''
        }
        setForm({
            fullName: address.fullName, phone: address.phone,
            streetAddress: address.streetAddress,
            provinceCode, districtCode, isDefault: address.isDefault,
        })
        setEditingId(address.id)
        setShowForm(true)
    }

    const handleChange = async (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value,
            ...(field === 'provinceCode' ? { districtCode: '' } : {})
        }))
        if (field === 'provinceCode' && value) {
            const res = await locationService.getDistricts(value)
            setDistricts(res.data)
        }
    }

    const handleSubmit = async () => {
        if (!form.fullName || !form.phone || !form.streetAddress || !form.provinceCode || !form.districtCode) {
            alert('Vui lòng điền đầy đủ thông tin')
            return
        }
        setSubmitting(true)
        try {
            if (editingId) {
                const res = await shippingAddressService.update(editingId, form)
                setAddresses(prev => prev.map(a => a.id === editingId ? res.data : a))
                if (selectedAddress?.id === editingId) setSelectedAddress(res.data)
            } else {
                const res = await shippingAddressService.add(form)
                setAddresses(prev => [...prev, res.data])
                setSelectedAddress(res.data)
            }
            setShowForm(false)
        } catch {
            alert('Có lỗi xảy ra, vui lòng thử lại!')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-orange-500">📍</span>Địa chỉ giao hàng
                </h3>
                <button
                    onClick={openAddForm}
                    className="text-xs text-orange-500 border border-orange-500 px-3 py-1.5 rounded hover:bg-orange-50 cursor-pointer bg-white"
                >
                    + Thêm địa chỉ mới
                </button>
            </div>

            {showForm && (
                <div className="mb-4">
                    <AddressForm
                        form={form}
                        provinces={provinces}
                        districts={districts}
                        editingId={editingId}
                        submitting={submitting}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {addresses.length === 0 ? (
                <div className="text-center py-4">
                    <p className="text-gray-400 text-sm mb-3">Chưa có địa chỉ giao hàng</p>
                    <button
                        onClick={() => navigate('/profile/address')}
                        className="text-orange-500 text-sm border border-orange-500 px-4 py-1.5 rounded hover:bg-orange-50 cursor-pointer bg-white"
                    >
                        + Thêm địa chỉ
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {addresses.map(address => (
                        <div
                            key={address.id}
                            onClick={() => setSelectedAddress(address)}
                            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                                selectedAddress?.id === address.id
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-100 hover:border-orange-200'
                            }`}
                        >
                            <div className="w-4 h-4 rounded-full border-2 border-orange-500 mt-0.5 flex items-center justify-center shrink-0">
                                {selectedAddress?.id === address.id && (
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-700">
                                    {address.fullName} | {address.phone}
                                    {address.isDefault && (
                                        <span className="ml-2 text-[10px] border border-orange-500 text-orange-500 px-1.5 py-0.5 rounded">Mặc định</span>
                                    )}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {address.streetAddress}, {address.districtName}, {address.provinceName}
                                </p>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); openEditForm(address) }}
                                className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer bg-transparent border-0 shrink-0"
                            >
                                Sửa
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}