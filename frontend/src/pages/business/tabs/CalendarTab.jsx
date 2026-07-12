// src/pages/business/tabs/CalendarTab.jsx
import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { businessesAPI } from '../../../services/api'


const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: { 'en-US': enUS }
})

// color per service name
const SERVICE_COLORS = [
    '#7DBF9E', '#F2A8B8', '#B5D4F4', '#FAC775',
    '#C8A8D8', '#A8D8B5', '#F4B5B5', '#B5C8F4'
]

function getServiceColor(serviceName, serviceColorMap) {
    if (!serviceColorMap[serviceName]) {
        const idx = Object.keys(serviceColorMap).length % SERVICE_COLORS.length
        serviceColorMap[serviceName] = SERVICE_COLORS[idx]
    }
    return serviceColorMap[serviceName]
}

export default function CalendarTab({ business }) {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [currentView, setCurrentView] = useState('week')
    const [selectedBooking, setSelectedBooking] = useState(null)
    const serviceColorMap = {}

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await businessesAPI.getBookings(business.id)
                setBookings(res.data.bookings)
            } catch (err) {
                console.error('Failed to load bookings', err)
            } finally {
                setLoading(false)
            }
        }
        fetchBookings()
    }, [business.id])

    // convert bookings to react-big-calendar event format
    const events = bookings
        .filter(b => b.status === 'confirmed')
        .map(b => ({
            id: b.id,
            title: b.service_name,
            start: new Date(b.start_time),
            end: new Date(b.end_time),
            resource: b
        }))

    const eventStyleGetter = (event) => {
        const color = getServiceColor(event.title, serviceColorMap)
        return {
            style: {
                backgroundColor: color,
                borderRadius: '4px',
                border: 'none',
                color: '#2C2C2C',
                fontSize: '11px',
                padding: '2px 4px'
            }
        }
    }

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                Loading...
            </div>
        )
    }

    return (
        <div style={{ padding: '1rem 1.25rem' }}>

            {/* color legend */}
            {events.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {[...new Set(bookings.filter(b => b.status === 'confirmed').map(b => b.service_name))].map(name => (
                        <span key={name} style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '20px',
                            backgroundColor: getServiceColor(name, serviceColorMap),
                            color: '#2C2C2C'
                        }}>
                            {name}
                        </span>
                    ))}
                </div>
            )}

            {/* calendar */}
            <div style={{ height: '500px', backgroundColor: 'white', borderRadius: '12px', padding: '1rem' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    date={currentDate}
                    view={currentView}
                    onNavigate={(date) => setCurrentDate(date)}
                    onView={(view) => setCurrentView(view)}
                    views={['week', 'day', 'agenda']}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={(event) => setSelectedBooking(event.resource)}
                    style={{ height: '100%' }}
                />
            </div>

            {/* booking detail modal */}
            {selectedBooking && (
                <div
                    onClick={() => setSelectedBooking(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 200
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            width: '300px',
                            maxWidth: '90%'
                        }}
                    >
                        <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '1rem' }}>
                            Booking details
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { label: 'Service', value: selectedBooking.service_name },
                                { label: 'Customer', value: selectedBooking.customer_name },
                                { label: 'Contact', value: selectedBooking.customer_phone || selectedBooking.customer_email || 'N/A' },
                                { label: 'Date', value: selectedBooking.start_time?.slice(0, 10) },
                                { label: 'Time', value: `${selectedBooking.start_time?.slice(11, 16)} - ${selectedBooking.end_time?.slice(11, 16)}` },
                                { label: 'Duration', value: `${selectedBooking.duration_minutes} mins` },
                                { label: 'Price', value: `KSh ${selectedBooking.service_price?.toLocaleString()}` },
                                { label: 'Notes', value: selectedBooking.notes || 'None' },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: 'var(--color-muted)' }}>{item.label}</span>
                                    <span style={{ color: 'var(--color-text)', fontWeight: '500' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setSelectedBooking(null)}
                            style={{
                                width: '100%',
                                marginTop: '1rem',
                                padding: '8px',
                                backgroundColor: 'var(--color-bg)',
                                border: '0.5px solid var(--color-border)',
                                borderRadius: '8px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                color: 'var(--color-text)'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}