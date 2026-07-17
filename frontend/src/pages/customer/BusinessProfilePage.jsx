// src/pages/customer/BusinessProfilePage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import { businessesAPI, bookingsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

// review form component
function LeaveReviewForm({ businessId, onReviewSubmitted }) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!rating) return setError('Please select a rating')
        setLoading(true)
        setError(null)
        try {
            const res = await businessesAPI.createReview(businessId, { rating, comment })
            setSubmitted(true)
            onReviewSubmitted(res.data.review)
        } catch (err) {
            console.log('Review error:', err.response?.data)
            setError(err.response?.data?.error || 'Failed to submit review')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div style={{
                padding: '10px 12px',
                backgroundColor: '#F2F9F5',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#4A9E75',
                marginBottom: '1rem'
            }}>
                ✓ Thank you for your review!
            </div>
        )
    }

    return (
        <div style={{
            backgroundColor: 'var(--color-bg)',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '1rem'
        }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '8px' }}>
                Leave a review
            </div>

            {error && (
                <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#FEF0F4',
                    color: '#9E4060',
                    borderRadius: '8px',
                    fontSize: '12px',
                    marginBottom: '8px'
                }}>
                    {error}
                </div>
            )}

            {/* star rating */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        style={{
                            fontSize: '28px',
                            cursor: 'pointer',
                            color: star <= (hoveredRating || rating) ? '#F5A623' : '#E0E0E0',
                            transition: 'color 0.1s'
                        }}
                    >
                        ★
                    </span>
                ))}
            </div>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (optional)"
                rows={2}
                style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '0.5px solid var(--color-border)',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    marginBottom: '8px'
                }}
            />

            <button
                onClick={handleSubmit}
                disabled={loading || !rating}
                style={{
                    padding: '8px 20px',
                    backgroundColor: rating ? 'var(--color-primary)' : 'var(--color-border)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: rating ? 'pointer' : 'not-allowed',
                    fontWeight: '500'
                }}
            >
                {loading ? 'Submitting...' : 'Submit review'}
            </button>
        </div>
    )
}

export default function BusinessProfilePage() {
    const { businessId } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const [business, setBusiness] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedService, setSelectedService] = useState(null)
    const [selectedDate, setSelectedDate] = useState('')
    const [availableWindows, setAvailableWindows] = useState([])
    const [loadingWindows, setLoadingWindows] = useState(false)
    const [bookingNotes, setBookingNotes] = useState('')
    const [bookingLoading, setBookingLoading] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(null)
    const [bookingError, setBookingError] = useState(null)
    const [activePhoto, setActivePhoto] = useState(null)

    const [isFavourite, setIsFavourite] = useState(false)

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const res = await businessesAPI.getOne(businessId)
                setBusiness(res.data.business)
                const favRes = await businessesAPI.getFavourites()
                const isFav = favRes.data.favourites.some(f => f.business_id === parseInt(businessId))
                setIsFavourite(isFav)
            } catch (err) {
                console.error('Failed to load business', err)
            } finally {
                setLoading(false)
            }
        }
        fetchBusiness()
    }, [businessId])

    useEffect(() => {
        if (!selectedService || !selectedDate) return

        const fetchWindows = async () => {
            setLoadingWindows(true)
            setAvailableWindows([])
            try {
                const res = await bookingsAPI.getAvailability({
                    business_id: businessId,
                    service_id: selectedService.id,
                    date: selectedDate
                })
                setAvailableWindows(res.data.available_windows)
            } catch (err) {
                console.error('Failed to load availability', err)
            } finally {
                setLoadingWindows(false)
            }
        }
        fetchWindows()
    }, [selectedService, selectedDate])

    const handleServiceSelect = (service) => {
        setSelectedService(service)
        setSelectedDate('')
        setAvailableWindows([])
        setBookingSuccess(null)
        setBookingError(null)
    }

    const handleBooking = async (startTime) => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        setBookingLoading(true)
        setBookingError(null)

        try {
            const res = await bookingsAPI.create({
                business_id: parseInt(businessId),
                service_id: selectedService.id,
                start_time: `${selectedDate}T${startTime}:00`,
                notes: bookingNotes
            })
            setBookingSuccess(res.data.booking)
            setSelectedService(null)
            setSelectedDate('')
            setAvailableWindows([])
            setBookingNotes('')
        } catch (err) {
            setBookingError(err.response?.data?.error || 'Booking failed')
        } finally {
            setBookingLoading(false)
        }
    }

    const getDateOptions = () => {
        const dates = []
        const today = new Date()
        for (let i = 0; i < 14; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            const dateStr = date.toISOString().split('T')[0]
            const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-KE', {
                weekday: 'short', month: 'short', day: 'numeric'
            })
            dates.push({ value: dateStr, label })
        }
        return dates
    }

    if (loading) {
        return (
            <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
                <Navbar />
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                    Loading...
                </div>
            </div>
        )
    }

    if (!business) {
        return (
            <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
                <Navbar />
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                    Business not found
                </div>
            </div>
        )
    }

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            <Navbar />

            {/* booking success banner */}
            {bookingSuccess && (
                <div style={{
                    backgroundColor: '#F2F9F5',
                    border: '0.5px solid #C8E8D8',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '20px' }}>🎉</span>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#3B6D11' }}>
                            Booking confirmed!
                        </div>
                        <div style={{ fontSize: '12px', color: '#4A9E75' }}>
                            {bookingSuccess.service_name} at {bookingSuccess.start_time?.slice(11, 16)} on {bookingSuccess.start_time?.slice(0, 10)}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        style={{
                            marginLeft: 'auto',
                            fontSize: '12px',
                            color: '#4A9E75',
                            background: 'none',
                            border: '0.5px solid #C8E8D8',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            cursor: 'pointer'
                        }}
                    >
                        View booking
                    </button>
                </div>
            )}

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* banner */}
                <div style={{
                    height: '140px',
                    backgroundColor: '#E8D8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px'
                }}>
                    {business.cover_photo
                        ? <img src={business.cover_photo} alt={business.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '✂️'}
                </div>

                {/* header */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '1rem 1.25rem',
                    borderBottom: '0.5px solid var(--color-border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--color-text)', flex: 1 }}>
                            {business.name}
                        </h1>

                        {/* heart button */}
                        {isAuthenticated && (
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await businessesAPI.toggleFavourite(business.id)
                                        setIsFavourite(res.data.is_favourite)
                                    } catch (err) {
                                        console.error('Failed to toggle favourite', err)
                                    }
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '22px',
                                    cursor: 'pointer',
                                    color: isFavourite ? '#E05050' : '#E0E0E0',
                                    flexShrink: 0,
                                    padding: '0'
                                }}
                            >
                                {isFavourite ? '♥' : '♡'}
                            </button>
                        )}

                        {business.is_verified && (
                            <span style={{
                                fontSize: '11px',
                                backgroundColor: '#F2F9F5',
                                color: '#4A9E75',
                                borderRadius: '20px',
                                padding: '3px 9px',
                                border: '0.5px solid #C8E8D8',
                                flexShrink: 0
                            }}>
                                ✓ Verified
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
                        {business.location && (
                            <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                                📍 {business.location}
                            </span>
                        )}
                        {business.phone && (
                            <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                                📞 {business.phone}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        {business.instagram && (
                            <a href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                                target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none' }}>
                                Instagram
                            </a>
                        )}
                        {business.tiktok && (
                            <a href={`https://tiktok.com/${business.tiktok}`}
                                target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none' }}>
                                TikTok
                            </a>
                        )}
                        {business.website && (
                            <a href={business.website}
                                target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none' }}>
                                Website
                            </a>
                        )}
                        {business.maps_link && (
                            <a href={business.maps_link}
                                target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none' }}>
                                📍 Get directions
                            </a>
                        )}
                    </div>
                </div>

                {/* about */}
                {business.description && (
                    <div style={{
                        padding: '1rem 1.25rem',
                        backgroundColor: 'white',
                        borderBottom: '0.5px solid var(--color-border)'
                    }}>
                        <h2 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '6px' }}>
                            About
                        </h2>
                        <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: '1.6' }}>
                            {business.description}
                        </p>
                    </div>
                )}

                {/* photos gallery */}
                {business.photos && business.photos.length > 0 && (
                    <div style={{
                        padding: '1rem 1.25rem',
                        backgroundColor: 'white',
                        borderBottom: '0.5px solid var(--color-border)'
                    }}>
                        <h2 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                            Our work
                        </h2>
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                            {business.photos.map(photo => (
                                <img
                                    key={photo.id}
                                    src={photo.photo_url}
                                    alt="Business photo"
                                    onClick={() => setActivePhoto(photo.photo_url)}
                                    style={{
                                        width: '80px',
                                        height: '70px',
                                        borderRadius: '8px',
                                        objectFit: 'cover',
                                        flexShrink: 0,
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* photo lightbox */}
                {activePhoto && (
                    <div
                        onClick={() => setActivePhoto(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 200
                        }}
                    >
                        <img src={activePhoto} alt="Full size"
                            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px' }} />
                    </div>
                )}

                {/* services */}
                <div style={{
                    padding: '1rem 1.25rem',
                    backgroundColor: 'white',
                    borderBottom: '0.5px solid var(--color-border)'
                }}>
                    <h2 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                        Services — tap to book
                    </h2>

                    {business.services && business.services.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {business.services.map(service => (
                                <div
                                    key={service.id}
                                    onClick={() => handleServiceSelect(service)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderRadius: '10px',
                                        border: selectedService?.id === service.id
                                            ? '1.5px solid var(--color-primary)'
                                            : '0.5px solid var(--color-border)',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        backgroundColor: selectedService?.id === service.id ? '#F2F9F5' : 'white'
                                    }}
                                >
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        backgroundColor: '#F0EBF7',
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px'
                                    }}>
                                        {service.photos && service.photos.length > 0
                                            ? <img src={service.photos[0].photo_url} alt={service.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : '✂️'}
                                    </div>

                                    <div style={{ flex: 1, padding: '10px 12px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                                            {service.name}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                            {service.duration_minutes >= 60
                                                ? `${Math.floor(service.duration_minutes / 60)}hr${service.duration_minutes % 60 ? ` ${service.duration_minutes % 60}min` : ''}`
                                                : `${service.duration_minutes}min`}
                                            {service.price_is_negotiable && ' · Price varies'}
                                        </div>
                                    </div>

                                    <div style={{ padding: '0 12px', fontSize: '13px', fontWeight: '500', color: 'var(--color-primary)' }}>
                                        {service.price_is_negotiable ? 'Varies' : `KSh ${service.price?.toLocaleString()}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                            No services listed yet
                        </p>
                    )}
                </div>

                {/* booking section */}
                {selectedService && (
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1rem 1.25rem',
                        borderBottom: '0.5px solid var(--color-border)'
                    }}>
                        <h2 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                            Book an appointment
                        </h2>

                        {/* selected service summary */}
                        <div style={{
                            backgroundColor: '#F2F9F5',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '12px',
                            color: '#4A9E75',
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.75rem'
                        }}>
                            <span>✓ {selectedService.name} · {selectedService.duration_minutes}min</span>
                            <span style={{ fontWeight: '500' }}>KSh {selectedService.price?.toLocaleString()}</span>
                        </div>

                        {/* date picker */}
                        <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
                                Pick a date
                            </div>
                            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
                                {getDateOptions().map(date => (
                                    <div
                                        key={date.value}
                                        onClick={() => setSelectedDate(date.value)}
                                        style={{
                                            flexShrink: 0,
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: selectedDate === date.value
                                                ? '1.5px solid var(--color-primary)'
                                                : '0.5px solid var(--color-border)',
                                            backgroundColor: selectedDate === date.value ? 'var(--color-primary)' : 'white',
                                            color: selectedDate === date.value ? 'white' : 'var(--color-text)',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            minWidth: '60px'
                                        }}
                                    >
                                        {date.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* available windows */}
                        {selectedDate && (
                            <div style={{ marginBottom: '0.75rem' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
                                    Available times on {selectedDate}
                                </div>

                                {loadingWindows ? (
                                    <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                                        Loading availability...
                                    </div>
                                ) : availableWindows.length === 0 ? (
                                    <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                                        No availability on this date
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {availableWindows.map((window, idx) => (
                                            <div key={idx} style={{
                                                backgroundColor: '#F2F9F5',
                                                borderRadius: '8px',
                                                padding: '10px 12px',
                                                border: '0.5px solid #C8E8D8'
                                            }}>
                                                <div style={{ fontSize: '12px', color: '#4A9E75', marginBottom: '6px' }}>
                                                    Available: {window.from} – {window.to}
                                                    <span style={{ color: 'var(--color-muted)', marginLeft: '8px' }}>
                                                        (latest start: {window.latest_start})
                                                    </span>
                                                </div>

                                                <input
                                                    type="time"
                                                    min={window.from}
                                                    max={window.latest_start}
                                                    defaultValue={window.from}
                                                    id={`time-${idx}`}
                                                    style={{
                                                        padding: '6px 10px',
                                                        borderRadius: '8px',
                                                        border: '0.5px solid var(--color-border)',
                                                        fontSize: '13px',
                                                        outline: 'none',
                                                        width: '100%',
                                                        boxSizing: 'border-box',
                                                        marginBottom: '8px'
                                                    }}
                                                />

                                                <textarea
                                                    value={bookingNotes}
                                                    onChange={(e) => setBookingNotes(e.target.value)}
                                                    placeholder="Any special requests? (optional)"
                                                    rows={2}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        border: '0.5px solid var(--color-border)',
                                                        fontSize: '12px',
                                                        outline: 'none',
                                                        resize: 'none',
                                                        fontFamily: 'inherit',
                                                        boxSizing: 'border-box',
                                                        marginBottom: '8px',
                                                        backgroundColor: 'white'
                                                    }}
                                                />

                                                <button
                                                    onClick={() => {
                                                        const timeInput = document.getElementById(`time-${idx}`)
                                                        handleBooking(timeInput.value)
                                                    }}
                                                    disabled={bookingLoading}
                                                    style={{
                                                        width: '100%',
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
                                                    {bookingLoading ? 'Confirming...' : `Confirm booking — KSh ${selectedService?.price?.toLocaleString()}`}
                                                </button>
                                            </div>
                                        ))}

                                        {/* booking error */}
                                        {bookingError && (
                                            <div style={{
                                                padding: '8px 12px',
                                                backgroundColor: '#FEF0F4',
                                                color: '#9E4060',
                                                borderRadius: '8px',
                                                fontSize: '12px'
                                            }}>
                                                {bookingError}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* reviews section */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '1rem 1.25rem',
                    borderBottom: '0.5px solid var(--color-border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' }}>
                            Reviews
                        </h2>
                        {business.avg_rating && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '18px', color: '#F5A623' }}>★</span>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' }}>
                                    {business.avg_rating}
                                </span>
                                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                                    ({business.review_count} review{business.review_count !== 1 ? 's' : ''})
                                </span>
                            </div>
                        )}
                    </div>

                    {/* leave a review */}
                    {isAuthenticated && <LeaveReviewForm businessId={business.id} onReviewSubmitted={(review) => {
                        setBusiness({
                            ...business,
                            reviews: [review, ...(business.reviews || [])],
                            review_count: (business.review_count || 0) + 1,
                            avg_rating: business.reviews?.length
                                ? ((business.avg_rating * business.review_count + review.rating) / (business.review_count + 1)).toFixed(1)
                                : review.rating
                        })
                    }} />}

                    {/* reviews list */}
                    {business.reviews?.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            color: 'var(--color-muted)',
                            fontSize: '13px',
                            padding: '1rem 0'
                        }}>
                            No reviews yet — be the first to review!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '1rem' }}>
                            {business.reviews?.map(review => (
                                <div key={review.id} style={{
                                    borderBottom: '0.5px solid var(--color-border)',
                                    paddingBottom: '12px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                                            {review.customer_name}
                                        </div>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span key={star} style={{
                                                    fontSize: '14px',
                                                    color: star <= review.rating ? '#F5A623' : '#E0E0E0'
                                                }}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                        {review.created_at?.slice(0, 10)}
                                    </div>
                                    {review.comment && (
                                        <div style={{ fontSize: '13px', color: 'var(--color-text)', marginTop: '6px', lineHeight: '1.5' }}>
                                            {review.comment}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* back button */}
                <div style={{ padding: '1rem 1.25rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '13px',
                            color: 'var(--color-primary)',
                            cursor: 'pointer'
                        }}
                    >
                        ← Back
                    </button>
                </div>

            </div>
        </div>
    )
}
