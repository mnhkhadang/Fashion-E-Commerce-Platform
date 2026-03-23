import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import AddressForm from '../components/address/AddressForm'
import AddressSelector from '../components/address/AddressSelector'
import shippingAddressService from '../services/shippingAddressService'
import locationService from '../services/locationService'

const EMPTY_FORM = {
  fullName: '', phone: '', streetAddress: '',
  provinceCode: '', districtCode: '', isDefault: false,
}

export default function AddressManager() {
  const [addresses, setAddresses] = useState([])
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (form.provinceCode) {
      locationService.getDistricts(form.provinceCode)
        .then(res => setDistricts(res.data))
        .catch(() => setDistricts([]))
    } else {
      setDistricts([])
    }
  }, [form.provinceCode])

  const fetchData = async () => {
    try {
      const [addrRes, provRes] = await Promise.all([
        shippingAddressService.getAll(),
        // FIX: getProvinces() — có chữ s
        locationService.getProvinces(),
      ])
      setAddresses(addrRes.data)
      setProvinces(provRes.data)
    } catch {
      console.error('Lỗi khi tải dữ liệu address')
    } finally {
      setLoading(false)
    }
  }

  const openAddForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDistricts([])
    setShowForm(true)
  }

  const openEditForm = async (addr) => {
    const province = provinces.find(p => p.name === addr.provinceName)
    const provinceCode = province?.code || ''
    let districtCode = ''
    if (provinceCode) {
      const res = await locationService.getDistricts(provinceCode)
      setDistricts(res.data)
      const district = res.data.find(d => d.name === addr.districtName)
      districtCode = district?.code || ''
    }
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      streetAddress: addr.streetAddress,
      provinceCode,
      districtCode,
      isDefault: addr.isDefault,
    })
    setEditingId(addr.id)
    setShowForm(true)
  }

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'provinceCode' ? { districtCode: '' } : {}),
    }))
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
      } else {
        const res = await shippingAddressService.add(form)
        setAddresses(prev => [...prev, res.data])
      }
      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
    } catch {
      alert('Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    // FIX: window.confirm
    if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này không?')) return
    try {
      await shippingAddressService.delete(id)
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch {
      alert('Không thể xóa địa chỉ này')
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await shippingAddressService.setDefault(id)
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
    } catch {
      alert('Có lỗi xảy ra')
    }
  }

  if (loading)
    return (
      <LoadingSpinner fullPage searchQuery={searchQuery} onSearchChange={setSearchQuery} />
    )

  return (
    <div className="min-h-screen bg-gray-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-700">Địa chỉ của tôi</h2>
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded transition cursor-pointer border-0"
          >
            + Thêm địa chỉ mới
          </button>
        </div>

        {showForm && (
          <AddressForm
            form={form}
            provinces={provinces}
            districts={districts}
            editingId={editingId}
            submitting={submitting}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingId(null) }}
          />
        )}

        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">📍</p>
            <p className="text-gray-400 text-sm">Chưa có địa chỉ nào</p>
          </div>
        ) : (
          <AddressSelector
            addresses={addresses}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
        )}
      </div>
      <Footer />
    </div>
  )
}