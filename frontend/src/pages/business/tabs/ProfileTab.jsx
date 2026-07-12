// src/pages/business/tabs/ProfileTab.jsx
import { useState } from 'react'
import { businessesAPI } from '../../../services/api'
import WorkingHoursForm from './WorkingHoursForm'

export default function ProfileTab({ business, setBusiness }) {
    const [formData, setFormData] = useState({
        name: business.name || '',
        description: business.description || '',
        location: business.location || '',
        phone: business.phone || '',
        instagram: business.instagram || '',
        tiktok: business.tiktok || '',
        website: business.website || '',
        capacity: business.capacity || 1,
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(null)
    const [mapsUrl, setMapsUrl] = useState('')
    const [mapsLoading, setMapsLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)
        try {
            const res = await businessesAPI.update(business.id, formData)
            setBusiness(res.data.business)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save changes')
        } finally {
            setLoading(false)
        }
    }

    const handleMapsUrl = async () => {
        if (!mapsUrl) return
        setMapsLoading(true)
        try {
            const res = await businessesAPI.update(business.id, { maps_url: mapsUrl })
            setBusiness(res.data.business)
            setMapsUrl('')
            alert('Location updated successfully!')
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update location')
        } finally {
            setMapsLoading(false)
        }
    }

    const handleStatusChange = async (newStatus) => {
        if (newStatus === 'published') {
            if (!window.confirm('Are you ready to go live? Your business will be visible to customers.')) return
        }
        if (newStatus === 'paused') {
            if (!window.confirm('Pause your listing? Customers won\'t be able to book until you republish.')) return
        }
        try {
            const res = await businessesAPI.updateStatus(business.id, newStatus)
            setBusiness(res.data.business)
        } catch (err) {
            alert('Failed to update status')
        }
    }

    const handleCoverPhoto = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const formData = new FormData()
        formData.append('photo', file)
        try {
            // upload to cloudinary
            const res = await businessesAPI.uploadPhoto(business.id, formData)
            const photoUrl = res.data.photo.photo_url
            const photoId = res.data.photo.id

            // set as cover photo on business
            await businessesAPI.update(business.id, { cover_photo: photoUrl })

            // remove from gallery since it's a cover photo not a gallery photo
            await businessesAPI.deletePhoto(business.id, photoId)

            setBusiness({ ...business, cover_photo: photoUrl })
            alert('Cover photo updated!')
        } catch (err) {
            alert('Failed to upload cover photo')
        }
    }

    const handleGalleryUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const formData = new FormData()
        formData.append('photo', file)
        try {
            const res = await businessesAPI.uploadPhoto(business.id, formData)
            setBusiness({
                ...business,
                photos: [...(business.photos || []), res.data.photo]
            })
        } catch (err) {
            alert('Failed to upload photo')
        }
    }

    const handleDeletePhoto = async (photoId) => {
        if (!window.confirm('Delete this photo?')) return
        try {
            await businessesAPI.deletePhoto(business.id, photoId)
            setBusiness({
                ...business,
                photos: business.photos.filter(p => p.id !== photoId)
            })
        } catch (err) {
            alert('Failed to delete photo')
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

    const labelStyle = {
        fontSize: '12px',
        color: 'var(--color-muted)',
        display: 'block',
        marginBottom: '4px'
    }

    return (
        <div style={{ padding: '1rem 1.25rem' }}>

            {/* cover photo */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '0.5px solid var(--color-border)',
                padding: '1rem',
                marginBottom: '1rem'
            }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                    Cover photo
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '120px',
                        height: '80px',
                        borderRadius: '8px',
                        backgroundColor: '#E8D8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        {business.cover_photo
                            ? <img src={business.cover_photo} alt="Cover"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : '🏪'}
                    </div>
                    <div>
                        <label style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '0.5px solid #C8E8D8',
                            backgroundColor: '#F2F9F5',
                            color: '#4A9E75',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'inline-block'
                        }}>
                            Upload cover photo
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverPhoto}
                                style={{ display: 'none' }}
                            />
                        </label>
                        <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '6px' }}>
                            This appears as the main banner on your profile
                        </div>
                    </div>
                </div>
            </div>

            {/* gallery photos */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '0.5px solid var(--color-border)',
                padding: '1rem',
                marginBottom: '1rem'
            }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                    Gallery — Our work
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {business.photos?.map(photo => (
                        <div key={photo.id} style={{ position: 'relative' }}>
                            <img
                                src={photo.photo_url}
                                alt="Business"
                                style={{
                                    width: '80px',
                                    height: '70px',
                                    borderRadius: '8px',
                                    objectFit: 'cover'
                                }}
                            />
                            <button
                                onClick={() => handleDeletePhoto(photo.id)}
                                style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: '#E05050',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    {/* add photo button */}
                    <label style={{
                        width: '80px',
                        height: '70px',
                        borderRadius: '8px',
                        border: '0.5px dashed var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        cursor: 'pointer',
                        backgroundColor: 'var(--color-bg)',
                        color: 'var(--color-muted)'
                    }}>
                        +
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleGalleryUpload}
                        />
                    </label>
                </div>
            </div>

            {/* business details form */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '0.5px solid var(--color-border)',
                padding: '1rem',
                marginBottom: '1rem'
            }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '1rem' }}>
                    Business details
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
                        ✓ Changes saved successfully
                    </div>
                )}

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

                <form onSubmit={handleSave}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                        <div>
                            <label style={labelStyle}>Business name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Tell customers about your business..."
                                style={{
                                    ...inputStyle,
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Location</label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Westlands, Nairobi"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Phone number</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g. 0712 345 678"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={labelStyle}>Instagram</label>
                                <input
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    placeholder="@handle"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>TikTok</label>
                                <input
                                    name="tiktok"
                                    value={formData.tiktok}
                                    onChange={handleChange}
                                    placeholder="@handle"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Website</label>
                            <input
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://..."
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Capacity (number of staff serving simultaneously)
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
                                cursor: 'pointer'
                            }}
                        >
                            {loading ? 'Saving...' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* location from google maps */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '0.5px solid var(--color-border)',
                padding: '1rem',
                marginBottom: '1rem'
            }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '4px' }}>
                    Set location from Google Maps
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
                    Copy the URL from your browser address bar on Google Maps
                </div>

                {business.latitude && (
                    <div style={{ fontSize: '12px', color: '#4A9E75', marginBottom: '0.75rem' }}>
                        ✓ Location set: {business.latitude?.toFixed(4)}, {business.longitude?.toFixed(4)}
                        {' · '}
                        <a href={business.maps_link} target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--color-primary)' }}>
                            View on Maps
                        </a>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        value={mapsUrl}
                        onChange={(e) => setMapsUrl(e.target.value)}
                        placeholder="https://www.google.com/maps/place/..."
                        style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                        onClick={handleMapsUrl}
                        disabled={mapsLoading || !mapsUrl}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            opacity: mapsLoading || !mapsUrl ? 0.6 : 1
                        }}
                    >
                        {mapsLoading ? 'Updating...' : 'Update location'}
                    </button>
                </div>

                {/* manual coordinates fallback */}
                <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
                        Or enter coordinates manually (Google Maps → right click → "What's here?")
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="number"
                            placeholder="Latitude e.g. -1.2921"
                            step="any"
                            id="manual-lat"
                            style={{ ...inputStyle, flex: 1 }}
                        />
                        <input
                            type="number"
                            placeholder="Longitude e.g. 36.8219"
                            step="any"
                            id="manual-lng"
                            style={{ ...inputStyle, flex: 1 }}
                        />
                        <button
                            onClick={async () => {
                                const lat = document.getElementById('manual-lat').value
                                const lng = document.getElementById('manual-lng').value
                                if (!lat || !lng) return alert('Enter both coordinates')
                                try {
                                    const res = await businessesAPI.update(business.id, {
                                        latitude: parseFloat(lat),
                                        longitude: parseFloat(lng)
                                    })
                                    setBusiness(res.data.business)
                                    alert('Location updated!')
                                } catch (err) {
                                    alert('Failed to update location')
                                }
                            }}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>

            {/* working hours */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '0.5px solid var(--color-border)',
                padding: '1rem',
                marginBottom: '1rem'
            }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '4px' }}>
                    Working hours
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                    Set your weekly schedule. Customers will only see available slots within these hours.
                </div>
                <WorkingHoursForm business={business} />
            </div>

            {/* listing status */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '0.5px solid var(--color-border)',
                padding: '1rem'
            }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                    Listing status
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
                    {business.status === 'published'
                        ? '● Your business is live and visible to customers'
                        : business.status === 'paused'
                            ? '● Your listing is paused — customers cannot book'
                            : '● Your listing is in draft — not visible to customers'}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['draft', 'published', 'paused'].map(status => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: '8px',
                                border: '0.5px solid var(--color-border)',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: business.status === status ? '500' : 'normal',
                                backgroundColor: business.status === status
                                    ? status === 'published' ? '#EAF3DE'
                                        : status === 'paused' ? '#FAEEDA'
                                            : '#F0EDE8'
                                    : 'white',
                                color: business.status === status
                                    ? status === 'published' ? '#3B6D11'
                                        : status === 'paused' ? '#854F0B'
                                            : '#8A8A8A'
                                    : 'var(--color-muted)',
                                textTransform: 'capitalize'
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}