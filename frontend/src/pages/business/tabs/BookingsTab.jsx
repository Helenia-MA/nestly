import { useState, useEffect} from 'react'
import { businessesAPI, bookingsAPI } from '../../../services/api'

export default function BookingsTab( {business}) {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState('upcoming')
    const [selectedDate, setSelectedDate] = useState('')

    useEffect(() => {
        fetchBookings()
    }, [business.id, selectedDate])

    const fetchBookings = async () => {
        setLoading(true)
        try {
            const filters = {}
            if (selectedDate) filters.date = selectedDate

            const res = await businessesAPI.getBookings(business.id, filters)
            setBookings(res.data.bookings)
        } catch (err) {
            console.error("failed to load bookings", err)
        } finally {
            setLoading(false)
        }
    }

    const handleCancelByBusiness = async (bookingId) => {
        if (!window.confirm('cancel this booking? the customer will need to be notified manually')) return
        try {
            await bookingsAPI.cancelByBusiness(bookingId)
            setBookings(bookings.map(b =>
                b.id === bookingId ? {...b, status: 'cancelled_by_business'} : b
            ))
        } catch (err) {
            alert(err.response?.data?.error || "failed to cancel booking")
        }
    }

    const now = new Date()

    const filteredBookings = bookings.filter(b => {
        if (activeFilter === 'upcoming') {
            return b.status === 'confirmed' && new Date(b.start_time) > now
        }
        if (activeFilter === 'past') {
            return b.status === 'confirmed' && new Date(b.start_time) <= now
        }
        if (activeFilter === 'cancelled') {
            return b.status === "cancelled_by_customer" || b.status === "cancelled_by_business"
        }
        return true
    })

    const filterTabs = [
        {id: 'upcoming', label: 'Upcoming'},
        { id: 'past', label: 'Past' },
        { id: 'cancelled', label: 'Cancelled' },
        { id: 'all', label: 'All' }
    ]

    return (
        <div style={{ padding: '1rem 1.25rem' }}>

            {/* date filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', alignItems: 'center' }}>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '0.5px solid var(--color-border)',
                        fontSize: '12px',
                        outline: 'none',
                        backgroundColor: 'white'
                    }}
                />
                {selectedDate && (
                    <button
                        onClick={() => setSelectedDate('')}
                        style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '0.5px solid var(--color-border)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            backgroundColor: 'white',
                            color: 'var(--color-muted)'
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* status filter tabs */}
            <div style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '1rem',
                overflowX: 'auto',
                scrollbarWidth: 'none'
            }}>
                {filterTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: '0.5px solid var(--color-border)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            backgroundColor: activeFilter === tab.id
                                ? 'var(--color-primary)'
                                : 'white',
                            color: activeFilter === tab.id
                                ? 'white'
                                : 'var(--color-muted)'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* bookings list */}
            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>
                    Loading...
                </div>
            ) : filteredBookings.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '0.5px solid var(--color-border)',
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'var(--color-muted)',
                    fontSize: '13px'
                }}>
                    No bookings found
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredBookings.map(booking => (
                        <div key={booking.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            border: '0.5px solid var(--color-border)',
                            padding: '12px',
                            opacity: booking.status !== 'confirmed' ? 0.7 : 1
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: booking.status === 'confirmed'
                                        ? 'var(--color-primary)'
                                        : '#E05050',
                                    flexShrink: 0,
                                    marginTop: '4px'
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                                        {booking.service_name}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>
                                        👤 {booking.customer_name}
                                        {booking.customer_phone
                                            ? ` · 📞 ${booking.customer_phone}`
                                            : booking.customer_email
                                                ? ` · ✉️ ${booking.customer_email}`
                                                : ''}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                        {booking.duration_minutes}min
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: 'var(--color-primary)',
                                        marginTop: '4px'
                                    }}>
                                        📅 {booking.start_time?.slice(0, 10)} · {booking.start_time?.slice(11, 16)} — {booking.end_time?.slice(11, 16)}
                                    </div>
                                    {booking.notes && (
                                        <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>
                                            📝 {booking.notes}
                                        </div>
                                    )}
                                    {booking.status !== 'confirmed' && (
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#E05050',
                                            marginTop: '4px'
                                        }}>
                                            {booking.status === 'cancelled_by_customer'
                                                ? 'Cancelled by customer'
                                                : 'Cancelled by you'}
                                        </div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                                        KSh {booking.service_price?.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* cancel action — only for upcoming confirmed bookings */}
                            {booking.status === 'confirmed' &&
                                new Date(booking.start_time) > now && (
                                    <div style={{
                                        marginTop: '10px',
                                        paddingTop: '10px',
                                        borderTop: '0.5px solid var(--color-border)'
                                    }}>
                                        <button
                                            onClick={() => handleCancelByBusiness(booking.id)}
                                            style={{
                                                padding: '6px 14px',
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
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}