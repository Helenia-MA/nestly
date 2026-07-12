// src/pages/business/tabs/ServicesTab.jsx
import { useState, useEffect } from 'react'
import { businessesAPI, categoriesAPI } from '../../../services/api'

export default function ServicesTab({ business, setBusiness }) {
    const [services, setServices] = useState(business.services || [])
    const [categories, setCategories] = useState([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingService, setEditingService] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration_minutes: '',
        price_is_negotiable: false,
        category_id: ''
    })

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoriesAPI.getAll()
                setCategories(res.data.categories)
            } catch (err) {
                console.error('Failed to load categories', err)
            }
        }
        fetchCategories()
    }, [])

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            duration_minutes: '',
            price_is_negotiable: false,
            category_id: ''
        })
        setShowAddForm(false)
        setEditingService(null)
        setError(null)
    }

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setFormData({ ...formData, [e.target.name]: value })
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await businessesAPI.createService(business.id, {
                ...formData,
                price: parseFloat(formData.price),
                duration_minutes: parseInt(formData.duration_minutes),
                category_id: parseInt(formData.category_id)
            })
            setServices([...services, res.data.service])
            resetForm()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add service')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await businessesAPI.updateService(
                business.id,
                editingService.id,
                {
                    ...formData,
                    price: parseFloat(formData.price),
                    duration_minutes: parseInt(formData.duration_minutes)
                }
            )
            setServices(services.map(s =>
                s.id === editingService.id ? res.data.service : s
            ))
            resetForm()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update service')
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async (service) => {
        try {
            const res = await businessesAPI.toggleService(business.id, service.id)
            setServices(services.map(s =>
                s.id === service.id ? res.data.service : s
            ))
        } catch (err) {
            alert('Failed to toggle service')
        }
    }

    const handleDelete = async (serviceId) => {
        if (!window.confirm('Delete this service? This cannot be undone.')) return
        try {
            await businessesAPI.deleteService(business.id, serviceId)
            setServices(services.filter(s => s.id !== serviceId))
        } catch (err) {
            alert('Failed to delete service')
        }
    }

    const startEdit = (service) => {
        setEditingService(service)
        setFormData({
            name: service.name,
            description: service.description || '',
            price: service.price,
            duration_minutes: service.duration_minutes,
            price_is_negotiable: service.price_is_negotiable,
            category_id: service.category_id
        })
        setShowAddForm(true)
    }

    const inputStyle = {
        width: '100%',
        padding: '8px 12px',
        borderRadius: '8px',
        border: '0.5px solid var(--color-border)',
        fontSize: '13px',
        outline: 'none',
        backgroundColor: 'var(--color-bg)',
        boxSizing: 'border-box'
    }

    return (
        <div style={{ padding: '1rem 1.25rem' }}>

            {/* add service button */}
            {!showAddForm && (
                <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                        width: '100%',
                        padding: '11px',
                        backgroundColor: '#F2F9F5',
                        color: '#4A9E75',
                        border: '0.5px dashed var(--color-primary)',
                        borderRadius: '10px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    + Add new service
                </button>
            )}

            {/* add/edit form */}
            {showAddForm && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '0.5px solid var(--color-border)',
                    padding: '1rem',
                    marginBottom: '1rem'
                }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '1rem' }}>
                        {editingService ? 'Edit service' : 'Add new service'}
                    </div>

                    {error && (
                        <div style={{
                            padding: '8px 12px',
                            backgroundColor: '#FEF0F4',
                            color: '#9E4060',
                            borderRadius: '8px',
                            fontSize: '12px',
                            marginBottom: '0.75rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={editingService ? handleEdit : handleAdd}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                    Service name
                                </label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Boho Braids"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                    Category
                                </label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.group} — {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                    Description (optional)
                                </label>
                                <input
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief description"
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                        Price (KSh)
                                    </label>
                                    <input
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="e.g. 1500"
                                        required={!formData.price_is_negotiable}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                        Duration (minutes)
                                    </label>
                                    <input
                                        name="duration_minutes"
                                        type="number"
                                        value={formData.duration_minutes}
                                        onChange={handleChange}
                                        placeholder="e.g. 180"
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    name="price_is_negotiable"
                                    id="negotiable"
                                    checked={formData.price_is_negotiable}
                                    onChange={handleChange}
                                />
                                <label htmlFor="negotiable" style={{ fontSize: '12px', color: 'var(--color-muted)', cursor: 'pointer' }}>
                                    Price is negotiable
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '9px',
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {loading ? 'Saving...' : editingService ? 'Save changes' : 'Add service'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{
                                        padding: '9px 16px',
                                        backgroundColor: 'var(--color-bg)',
                                        color: 'var(--color-muted)',
                                        border: '0.5px solid var(--color-border)',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* services list */}
            {services.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '0.5px solid var(--color-border)',
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'var(--color-muted)',
                    fontSize: '13px'
                }}>
                    No services yet — add your first one above
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {services.map(service => (
                        <div key={service.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            border: '0.5px solid var(--color-border)',
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            opacity: service.is_active ? 1 : 0.6
                        }}>
                            {/* service photo */}
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                backgroundColor: '#F0EBF7',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                overflow: 'hidden'
                            }}>
                                {service.photos && service.photos.length > 0
                                    ? <img src={service.photos[0].photo_url} alt={service.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : '✂️'}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                                    {service.name}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                    KSh {parseFloat(service.price).toLocaleString()} ·{' '}
                                    {service.duration_minutes >= 60
                                        ? `${Math.floor(service.duration_minutes / 60)}hr${service.duration_minutes % 60 ? ` ${service.duration_minutes % 60}min` : ''}`
                                        : `${service.duration_minutes}min`}
                                    {!service.is_active && ' · Inactive'}
                                </div>
                            </div>

                            {/* actions */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => handleToggle(service)}
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: '0.5px solid var(--color-border)',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        backgroundColor: service.is_active ? '#FEF0F4' : '#F2F9F5',
                                        color: service.is_active ? '#9E4060' : '#4A9E75'
                                    }}
                                >
                                    {service.is_active ? 'Pause' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => startEdit(service)}
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: '0.5px solid var(--color-border)',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        backgroundColor: 'white',
                                        color: 'var(--color-text)'
                                    }}
                                >
                                    Edit
                                </button>
                                <label
                                    htmlFor={`photo-upload-${service.id}`}
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: '0.5px solid #C8E8D8',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        backgroundColor: '#F2F9F5',
                                        color: '#4A9E75'
                                    }}
                                >
                                    📷 Photo
                                </label>
                                <input
                                    type="file"
                                    id={`photo-upload-${service.id}`}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={async (e) => {
                                        const file = e.target.files[0]
                                        if (!file) return
                                        const formData = new FormData()
                                        formData.append('photo', file)
                                        try {
                                            const res = await businessesAPI.uploadServicePhoto(
                                                business.id, service.id, formData
                                            )
                                            console.log('service photo upload response:', res.data)
                                            const updatedServices = services.map(s =>
                                                s.id === service.id
                                                    ? { ...s, photos: [res.data.photo] }
                                                    : s
                                            )
                                            setServices(updatedServices)
                                            alert('Photo uploaded successfully')
                                        } catch (err) {
                                            console.log('upload error:', err.response?.data || err.message)
                                            alert('Failed to upload photo')
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: '0.5px solid #F2C8D4',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        backgroundColor: '#FEF0F4',
                                        color: '#9E4060'
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
