// src/pages/admin/AdminPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import { adminAPI, categoriesAPI } from '../../services/api'

const TABS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'businesses', label: 'Businesses', icon: '🏪' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
]

const GROUPS = ['Personal Services', 'Home & Property']

function CategoriesTab({ categories, setCategories }) {
    const [showForm, setShowForm] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [formData, setFormData] = useState({ name: '', group: '', icon: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const resetForm = () => {
        setFormData({ name: '', group: '', icon: '' })
        setShowForm(false)
        setEditingCategory(null)
        setError(null)
    }

    // resolve the actual group name — use the custom value when "other" is selected
    const buildPayload = () => {
        const { customGroup, ...rest } = formData
        return {
            ...rest,
            group: formData.group === 'other' ? (customGroup || '').trim() : formData.group
        }
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await adminAPI.createCategory(buildPayload())
            setCategories([...categories, res.data.category])
            resetForm()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create category')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await adminAPI.updateCategory(editingCategory.id, buildPayload())
            setCategories(categories.map(c =>
                c.id === editingCategory.id ? res.data.category : c
            ))
            resetForm()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update category')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Delete this category? This cannot be undone.')) return
        try {
            await adminAPI.deleteCategory(categoryId)
            setCategories(categories.filter(c => c.id !== categoryId))
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete category')
        }
    }

    const startEdit = (category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            group: category.group,
            icon: category.icon || ''
        })
        setShowForm(true)
    }

    // group categories by group
    const grouped = categories.reduce((acc, cat) => {
        if (!acc[cat.group]) acc[cat.group] = []
        acc[cat.group].push(cat)
        return acc
    }, {})

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
        <div>
            {/* add button */}
            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
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
                    + Add new category
                </button>
            )}

            {/* add/edit form */}
            {showForm && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '0.5px solid var(--color-border)',
                    padding: '1rem',
                    marginBottom: '1rem'
                }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '1rem' }}>
                        {editingCategory ? 'Edit category' : 'Add new category'}
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

                    <form onSubmit={editingCategory ? handleEdit : handleAdd}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                    Category name
                                </label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Photography"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                    Group
                                </label>
                                <select
                                    value={formData.group}
                                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">Select a group</option>
                                    {GROUPS.map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                    <option value="other">Other (new group)</option>
                                </select>
                            </div>

                            {formData.group === 'other' && (
                                <div>
                                    <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                        New group name
                                    </label>
                                    <input
                                        value={formData.customGroup || ''}
                                        onChange={(e) => setFormData({ ...formData, customGroup: e.target.value })}
                                        placeholder="e.g. Creative Services"
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                            )}

                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>
                                    Icon URL (optional)
                                </label>
                                <input
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="https://..."
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
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {loading ? 'Saving...' : editingCategory ? 'Save changes' : 'Add category'}
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

            {/* categories grouped */}
            {Object.entries(grouped).map(([group, cats]) => (
                <div key={group} style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: 'var(--color-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '0.75rem'
                    }}>
                        {group} ({cats.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {cats.map(cat => (
                            <div key={cat.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '10px',
                                border: '0.5px solid var(--color-border)',
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                {/* icon */}
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    backgroundColor: '#F0EBF7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}>
                                    {cat.icon
                                        ? <img src={cat.icon} alt={cat.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        : '📋'}
                                </div>

                                <div style={{ flex: 1, fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                                    {cat.name}
                                </div>

                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                        onClick={() => startEdit(cat)}
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
                                    <button
                                        onClick={() => handleDelete(cat.id)}
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
                </div>
            ))}
        </div>
    )
}

export default function AdminPage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [stats, setStats] = useState(null)
    const [businesses, setBusinesses] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [categories, setCategories] = useState([])

    useEffect(() => {
        fetchData()
    }, [activeTab])

    const fetchData = async () => {
        setLoading(true)
        try {
            if (activeTab === 'overview') {
                const res = await adminAPI.getStats()
                setStats(res.data.stats)
            } else if (activeTab === 'businesses') {
                const res = await adminAPI.getBusinesses()
                setBusinesses(res.data.businesses)
            } else if (activeTab === 'users') {
                const res = await adminAPI.getUsers()
                setUsers(res.data.users)
            } else if (activeTab === 'categories') {
                const res = await categoriesAPI.getAll()
                setCategories(res.data.categories)
            }
        } catch (err) {
            console.error('Failed to load admin data', err)
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (businessId) => {
        try {
            const res = await adminAPI.verifyBusiness(businessId)
            setBusinesses(businesses.map(b =>
                b.id === businessId ? res.data.business : b
            ))
        } catch (err) {
            alert('Failed to update verification')
        }
    }

    const handleBusinessStatus = async (businessId, status) => {
        try {
            const res = await adminAPI.updateBusinessStatus(businessId, status)
            setBusinesses(businesses.map(b =>
                b.id === businessId ? res.data.business : b
            ))
        } catch (err) {
            alert('Failed to update status')
        }
    }

    const handleSuspend = async (userId) => {
        if (!window.confirm('Suspend this user?')) return
        try {
            const res = await adminAPI.suspendUser(userId)
            setUsers(users.map(u =>
                u.id === userId ? res.data.user : u
            ))
        } catch (err) {
            alert('Failed to suspend user')
        }
    }

    const handleUnsuspend = async (userId) => {
        try {
            const res = await adminAPI.unsuspendUser(userId)
            setUsers(users.map(u =>
                u.id === userId ? res.data.user : u
            ))
        } catch (err) {
            alert('Failed to unsuspend user')
        }
    }

    const filteredBusinesses = businesses.filter(b => {
        const matchesSearch = !search || b.name.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = !statusFilter || b.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const filteredUsers = users.filter(u =>
        !search || u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            <Navbar />

            {/* admin header */}
            <div style={{
                backgroundColor: '#2C2C2C',
                padding: '0.75rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>
                    Admin Panel
                </div>
                <span style={{
                    fontSize: '11px',
                    backgroundColor: 'var(--color-accent)',
                    color: '#9E4060',
                    borderRadius: '20px',
                    padding: '2px 8px'
                }}>
                    Admin
                </span>
            </div>

            {/* tab navigation */}
            <div style={{
                display: 'flex',
                backgroundColor: 'white',
                borderBottom: '0.5px solid var(--color-border)'
            }}>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id)
                            setSearch('')
                            setStatusFilter('')
                        }}
                        style={{
                            flex: 1,
                            padding: '10px 8px',
                            fontSize: '12px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            borderBottom: activeTab === tab.id
                                ? '2px solid var(--color-primary)'
                                : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-muted)',
                            fontWeight: activeTab === tab.id ? '500' : 'normal',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '3px'
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem 1.25rem' }}>

                {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>
                        Loading...
                    </div>
                ) : (
                    <>
                        {/* overview tab */}
                        {activeTab === 'overview' && stats && (
                            <div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: '10px',
                                    marginBottom: '1.5rem'
                                }}>
                                    {[
                                        { label: 'Total users', value: stats.total_users, color: 'var(--color-primary)' },
                                        { label: 'Total businesses', value: stats.total_businesses, color: 'var(--color-primary)' },
                                        { label: 'Total bookings', value: stats.total_bookings, color: 'var(--color-primary)' },
                                        { label: 'New users this week', value: stats.new_users_this_week, color: 'var(--color-accent)' },
                                        { label: 'Bookings today', value: stats.bookings_today, color: 'var(--color-primary)' },
                                        { label: 'Bookings this week', value: stats.bookings_this_week, color: 'var(--color-primary)' },
                                        { label: 'Cancelled bookings', value: stats.cancelled_bookings, color: '#E05050' },
                                    ].map(stat => (
                                        <div key={stat.label} style={{
                                            backgroundColor: 'white',
                                            borderRadius: '10px',
                                            border: '0.5px solid var(--color-border)',
                                            padding: '12px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '24px', fontWeight: '500', color: stat.color }}>
                                                {stat.value}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* businesses by status */}
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    border: '0.5px solid var(--color-border)',
                                    padding: '1rem'
                                }}>
                                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                                        Businesses by status
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {Object.entries(stats.businesses_by_status).map(([status, count]) => (
                                            <div key={status} style={{
                                                flex: 1,
                                                textAlign: 'center',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                backgroundColor: status === 'published' ? '#EAF3DE'
                                                    : status === 'paused' ? '#FAEEDA' : '#F0EDE8'
                                            }}>
                                                <div style={{ fontSize: '20px', fontWeight: '500' }}>{count}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--color-muted)', textTransform: 'capitalize' }}>
                                                    {status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* businesses tab */}
                        {activeTab === 'businesses' && (
                            <div>
                                {/* search and filters */}
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Search businesses..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '0.5px solid var(--color-border)',
                                            fontSize: '13px',
                                            outline: 'none',
                                            backgroundColor: 'white'
                                        }}
                                    />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '0.5px solid var(--color-border)',
                                            fontSize: '13px',
                                            outline: 'none',
                                            backgroundColor: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="">All statuses</option>
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                        <option value="paused">Paused</option>
                                    </select>
                                </div>

                                <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
                                    {filteredBusinesses.length} businesses
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {filteredBusinesses.map(biz => (
                                        <div key={biz.id} style={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            border: '0.5px solid var(--color-border)',
                                            padding: '12px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' }}>
                                                            {biz.name}
                                                        </span>
                                                        {biz.is_verified && (
                                                            <span style={{
                                                                fontSize: '10px',
                                                                backgroundColor: '#F2F9F5',
                                                                color: '#4A9E75',
                                                                borderRadius: '20px',
                                                                padding: '2px 7px',
                                                                border: '0.5px solid #C8E8D8'
                                                            }}>
                                                                ✓ Verified
                                                            </span>
                                                        )}
                                                        <span style={{
                                                            fontSize: '10px',
                                                            padding: '2px 8px',
                                                            borderRadius: '20px',
                                                            backgroundColor: biz.status === 'published' ? '#EAF3DE'
                                                                : biz.status === 'paused' ? '#FAEEDA' : '#F0EDE8',
                                                            color: biz.status === 'published' ? '#3B6D11'
                                                                : biz.status === 'paused' ? '#854F0B' : '#8A8A8A'
                                                        }}>
                                                            {biz.status}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                                        {biz.location || 'No location'} · joined {biz.created_at?.slice(0, 10)}
                                                    </div>

                                                    {biz.owner && (
                                                        <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>
                                                            👤 Owner: {biz.owner.name} · {biz.owner.email || biz.owner.phone}
                                                        </div>
                                                    )}
                                                    <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>
                                                        📅 {biz.booking_count} booking{biz.booking_count !== 1 ? 's' : ''} total
                                                    </div>

                                                </div>

                                                {/* actions */}
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => handleVerify(biz.id)}
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
                                                        {biz.is_verified ? 'Unverify' : 'Verify'}
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/business/${biz.id}`)}
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
                                                        View
                                                    </button>
                                                    {biz.status !== 'paused' && (
                                                        <button
                                                            onClick={() => handleBusinessStatus(biz.id, 'paused')}
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
                                                            Pause
                                                        </button>
                                                    )}
                                                    {biz.status === 'paused' && (
                                                        <button
                                                            onClick={() => handleBusinessStatus(biz.id, 'published')}
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
                                                            Unpause
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* users tab */}
                        {activeTab === 'users' && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '0.5px solid var(--color-border)',
                                        fontSize: '13px',
                                        outline: 'none',
                                        backgroundColor: 'white',
                                        boxSizing: 'border-box',
                                        marginBottom: '1rem'
                                    }}
                                />

                                <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
                                    {filteredUsers.length} users
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {filteredUsers.map(user => (
                                        <div key={user.id} style={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            border: '0.5px solid var(--color-border)',
                                            padding: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--color-accent)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#9E4060',
                                                flexShrink: 0
                                            }}>
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                                                        {user.name}
                                                    </span>
                                                    {user.is_admin && (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            backgroundColor: '#FEF0F4',
                                                            color: '#9E4060',
                                                            borderRadius: '20px',
                                                            padding: '2px 7px'
                                                        }}>Admin</span>
                                                    )}
                                                    {user.is_business_owner && (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            backgroundColor: '#F2F9F5',
                                                            color: '#4A9E75',
                                                            borderRadius: '20px',
                                                            padding: '2px 7px'
                                                        }}>Owner</span>
                                                    )}
                                                    {user.is_suspended && (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            backgroundColor: '#F0EDE8',
                                                            color: '#8A8A8A',
                                                            borderRadius: '20px',
                                                            padding: '2px 7px'
                                                        }}>Suspended</span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                                    {user.email || user.phone} · joined {user.created_at?.slice(0, 10)}
                                                </div>
                                            </div>

                                            {/* actions */}
                                            {!user.is_admin && (
                                                <button
                                                    onClick={() => user.is_suspended
                                                        ? handleUnsuspend(user.id)
                                                        : handleSuspend(user.id)
                                                    }
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        border: user.is_suspended
                                                            ? '0.5px solid #C8E8D8'
                                                            : '0.5px solid #F2C8D4',
                                                        fontSize: '11px',
                                                        cursor: 'pointer',
                                                        backgroundColor: user.is_suspended ? '#F2F9F5' : '#FEF0F4',
                                                        color: user.is_suspended ? '#4A9E75' : '#9E4060'
                                                    }}
                                                >
                                                    {user.is_suspended ? 'Unsuspend' : 'Suspend'}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* categories tab */}
                        {activeTab === 'categories' && (
                            <CategoriesTab
                                categories ={categories}
                                setCategories={setCategories}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}