// src/pages/business/RegisterBusinessForm.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { businessesAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function RegisterBusinessForm() {
    const navigate = useNavigate()
    const { setUser, user } = useAuth()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        phone: '',
        capacity: 1
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await businessesAPI.create(formData)
            // update user to reflect is_business_owner = true
            setUser({ ...user, is_business_owner: true })
            // reload page to show dashboard
            window.location.reload()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create business')
        } finally {
            setLoading(false)
        }
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
        <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '0 1.25rem' }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '0.5px solid var(--color-border)',
                padding: '1.5rem'
            }}>
                <div style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                    Register your business
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                    You can add services, photos and working hours after registering.
                </div>

                {error && (
                    <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#FEF0F4',
                        color: '#9E4060',
                        borderRadius: '8px',
                        fontSize: '12px',
                        marginBottom: '1rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                Business name *
                            </label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Jules Salon"
                                required
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Tell customers about your business..."
                                rows={3}
                                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                Location
                            </label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Westlands, Nairobi"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                Phone number
                            </label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g. 0712 345 678"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                Number of staff (capacity)
                            </label>
                            <input
                                name="capacity"
                                type="number"
                                min="1"
                                value={formData.capacity}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                marginTop: '4px'
                            }}
                        >
                            {loading ? 'Creating...' : 'Create business'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}