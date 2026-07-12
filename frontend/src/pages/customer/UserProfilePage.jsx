// src/pages/customer/UserProfilePage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import { bookingsAPI, authAPI } from '../../services/api'

function PersonalInfoForm({ user, setUser }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(null)
    const [editing, setEditing] = useState(false)

    const handleSave = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await authAPI.updateProfile(formData)
            setUser(res.data.user)
            setSuccess(true)
            setEditing(false)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile')
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
        <div style={{
            backgroundColor: 'white',
            borderBottom: '0.5px solid var(--color-border)',
            padding: '1rem 1.25rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' }}>
                    Personal information
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        style={{
                            fontSize: '12px',
                            color: 'var(--color-primary)',
                            background: 'none',
                            border: '0.5px solid #C8E8D8',
                            borderRadius: '20px',
                            padding: '4px 12px',
                            cursor: 'pointer'
                        }}
                    >
                        Edit
                    </button>
                )}
            </div>

            {success && (
                <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#F2F9F5',
                    color: '#4A9E75',
                    borderRadius: '8px',
                    fontSize: '12px',
                    marginBottom: '0.75rem'
                }}>
                    ✓ Profile updated successfully
                </div>
            )}

            {!editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                        { label: 'Name', value: user?.name },
                        { label: 'Email', value: user?.email || '—' },
                        { label: 'Phone', value: user?.phone || '—' },
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: 'var(--color-muted)' }}>{item.label}</span>
                            <span style={{ color: 'var(--color-text)' }}>{item.value}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <form onSubmit={handleSave}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {error && (
                            <div style={{
                                padding: '8px 12px',
                                backgroundColor: '#FEF0F4',
                                color: '#9E4060',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}>
                                {error}
                            </div>
                        )}
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                Name
                            </label>
                            <input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
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
                                    cursor: 'pointer'
                                }}
                            >
                                {loading ? 'Saving...' : 'Save changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(false)
                                    setError(null)
                                }}
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
            )}
        </div>
    )
}

function ChangePasswordForm() {
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(null)
    const [open, setOpen] = useState(false)
    const [show, setShow] = useState({ current: false, new: false, confirm: false })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.new_password !== formData.confirm_password) {
            setError('New passwords do not match')
            return
        }
        setLoading(true)
        setError(null)
        try {
            await authAPI.changePassword({
                current_password: formData.current_password,
                new_password: formData.new_password
            })
            setSuccess(true)
            setOpen(false)
            setFormData({ current_password: '', new_password: '', confirm_password: '' })
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to change password')
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

    const passwordField = (key, label, field) => (
        <div>
            <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    type={show[key] ? 'text' : 'password'}
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    required
                    style={{ ...inputStyle, paddingRight: '52px' }}
                />
                <button
                    type="button"
                    onClick={() => setShow({ ...show, [key]: !show[key] })}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: '11px',
                        color: 'var(--color-primary)',
                        cursor: 'pointer'
                    }}
                >
                    {show[key] ? 'Hide' : 'Show'}
                </button>
            </div>
        </div>
    )

    return (
        <div style={{
            backgroundColor: 'white',
            borderBottom: '0.5px solid var(--color-border)',
            padding: '1rem 1.25rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' }}>
                    Change password
                </div>
                <button
                    onClick={() => setOpen(!open)}
                    style={{
                        fontSize: '12px',
                        color: 'var(--color-primary)',
                        background: 'none',
                        border: '0.5px solid #C8E8D8',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        cursor: 'pointer'
                    }}
                >
                    {open ? 'Cancel' : 'Change'}
                </button>
            </div>

            {success && (
                <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#F2F9F5',
                    color: '#4A9E75',
                    borderRadius: '8px',
                    fontSize: '12px',
                    marginTop: '0.75rem'
                }}>
                    ✓ Password changed successfully
                </div>
            )}

            {open && (
                <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {error && (
                            <div style={{
                                padding: '8px 12px',
                                backgroundColor: '#FEF0F4',
                                color: '#9E4060',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}>
                                {error}
                            </div>
                        )}
                        {passwordField('current', 'Current password', 'current_password')}
                        {passwordField('new', 'New password', 'new_password')}
                        {passwordField('confirm', 'Confirm new password', 'confirm_password')}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '9px',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                cursor: 'pointer'
                            }}
                        >
                            {loading ? 'Updating...' : 'Update password'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default function UserProfilePage() {
    const { user, setUser, logout } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('bookings')
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await bookingsAPI.getMyBookings()
                setBookings(res.data.bookings)
            } catch (err) {
                console.error('Failed to load bookings', err)
            } finally {
                setLoading(false)
            }
        }
        fetchBookings()
    }, [])

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return
        try {
            await bookingsAPI.cancelByCustomer(bookingId)
            setBookings(bookings.map(b =>
                b.id === bookingId
                    ? { ...b, status: 'cancelled_by_customer' }
                    : b
            ))
        } catch (err) {
            alert(err.response?.data?.error || 'Could not cancel booking')
        }
    }

    const upcomingBookings = bookings.filter(b =>
        b.status === 'confirmed' && new Date(b.start_time) > new Date()
    )

    const pastBookings = bookings.filter(b =>
        b.status !== 'confirmed' || new Date(b.start_time) <= new Date()
    )

    const tabs = ['bookings', 'favourites', 'account']

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            <Navbar />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* profile header */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    borderBottom: '0.5px solid var(--color-border)'
                }}>
                    <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#9E4060',
                        flexShrink: 0
                    }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text)' }}>
                            {user?.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                            {user?.email || user?.phone}
                        </div>
                    </div>
                </div>

                {/* tabs */}
                <div style={{
                    display: 'flex',
                    backgroundColor: 'white',
                    borderBottom: '0.5px solid var(--color-border)'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                fontSize: '13px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                borderBottom: activeTab === tab
                                    ? '2px solid var(--color-primary)'
                                    : '2px solid transparent',
                                color: activeTab === tab
                                    ? 'var(--color-primary)'
                                    : 'var(--color-muted)',
                                fontWeight: activeTab === tab ? '500' : 'normal',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* bookings tab */}
                {activeTab === 'bookings' && (
                    <div style={{ padding: '1rem 1.25rem' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>
                                Loading...
                            </div>
                        ) : (
                            <>
                                {/* upcoming */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        color: 'var(--color-muted)',
                                        marginBottom: '0.75rem'
                                    }}>
                                        UPCOMING
                                    </div>

                                    {upcomingBookings.length === 0 ? (
                                        <div style={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            border: '0.5px solid var(--color-border)',
                                            padding: '1.5rem',
                                            textAlign: 'center',
                                            color: 'var(--color-muted)',
                                            fontSize: '13px'
                                        }}>
                                            No upcoming bookings
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {upcomingBookings.map(booking => (
                                                <div key={booking.id} style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '12px',
                                                    border: '0.5px solid var(--color-border)',
                                                    padding: '12px'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                        <div style={{
                                                            width: '38px',
                                                            height: '38px',
                                                            borderRadius: '8px',
                                                            backgroundColor: '#F0EBF7',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '16px',
                                                            flexShrink: 0
                                                        }}>
                                                            ✂️
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                                                                {booking.business_name}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                                                {booking.service_name}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '11px',
                                                                color: 'var(--color-primary)',
                                                                marginTop: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}>
                                                                📅 {booking.start_time?.slice(0, 10)} · {booking.start_time?.slice(11, 16)}
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                                                            KSh {booking.service_price?.toLocaleString()}
                                                        </div>
                                                    </div>

                                                    {/* actions */}
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '8px',
                                                        marginTop: '10px',
                                                        paddingTop: '10px',
                                                        borderTop: '0.5px solid var(--color-border)'
                                                    }}>
                                                        <button
                                                            onClick={() => handleCancel(booking.id)}
                                                            style={{
                                                                flex: 1,
                                                                padding: '7px',
                                                                borderRadius: '8px',
                                                                border: '0.5px solid #F2C8D4',
                                                                backgroundColor: '#FEF0F4',
                                                                color: '#9E4060',
                                                                fontSize: '12px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Cancel booking
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/business/${booking.business_id}`)}
                                                            style={{
                                                                flex: 1,
                                                                padding: '7px',
                                                                borderRadius: '8px',
                                                                border: '0.5px solid #C8E8D8',
                                                                backgroundColor: '#F2F9F5',
                                                                color: '#4A9E75',
                                                                fontSize: '12px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            View business
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* past */}
                                <div>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        color: 'var(--color-muted)',
                                        marginBottom: '0.75rem'
                                    }}>
                                        PAST
                                    </div>

                                    {pastBookings.length === 0 ? (
                                        <div style={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            border: '0.5px solid var(--color-border)',
                                            padding: '1.5rem',
                                            textAlign: 'center',
                                            color: 'var(--color-muted)',
                                            fontSize: '13px'
                                        }}>
                                            No past bookings
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {pastBookings.map(booking => (
                                                <div key={booking.id} style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '12px',
                                                    border: '0.5px solid var(--color-border)',
                                                    padding: '12px',
                                                    opacity: 0.75
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                        <div style={{
                                                            width: '38px',
                                                            height: '38px',
                                                            borderRadius: '8px',
                                                            backgroundColor: '#F0EBF7',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '16px',
                                                            flexShrink: 0
                                                        }}>
                                                            ✂️
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                                                                {booking.business_name}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                                                {booking.service_name}
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>
                                                                📅 {booking.start_time?.slice(0, 10)} · {booking.start_time?.slice(11, 16)}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '11px',
                                                                marginTop: '4px',
                                                                color: booking.status === 'cancelled_by_customer' || booking.status === 'cancelled_by_business'
                                                                    ? '#9E4060'
                                                                    : 'var(--color-muted)'
                                                            }}>
                                                                {booking.status === 'cancelled_by_customer' ? 'Cancelled by you'
                                                                    : booking.status === 'cancelled_by_business' ? 'Cancelled by business'
                                                                        : 'Completed'}
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-muted)' }}>
                                                            KSh {booking.service_price?.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* favourites tab */}
                {activeTab === 'favourites' && (
                    <div style={{ padding: '2rem 1.25rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '0.75rem' }}>🤍</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '4px' }}>
                            No favourites yet
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                            Tap the heart on any business to save it here
                        </div>
                    </div>
                )}

                {/* account tab */}
                {activeTab === 'account' && (
                    <div>
                        <PersonalInfoForm user={user} setUser={setUser} />
                        <ChangePasswordForm />

                        {/* register business banner */}
                        {!user?.is_business_owner && (
                            <div style={{
                                margin: '1rem 1.25rem',
                                backgroundColor: '#F2F9F5',
                                border: '0.5px solid #C8E8D8',
                                borderRadius: '10px',
                                padding: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{ fontSize: '22px' }}>🏪</span>
                                <div style={{ flex: 1, fontSize: '12px', color: '#4A9E75', lineHeight: '1.5' }}>
                                    Own a business? Register it on Nestly and start accepting bookings.
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        color: 'white',
                                        backgroundColor: 'var(--color-primary)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '7px 12px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Register
                                </button>
                            </div>
                        )}

                        {/* logout */}
                        <div style={{ padding: '0.5rem 1.25rem 1.5rem' }}>
                            <button
                                onClick={logout}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '0.5px solid #F2C8C8',
                                    backgroundColor: 'white',
                                    color: '#E05050',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                🚪 Log out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}