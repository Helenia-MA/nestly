// src/pages/business/tabs/OverviewTab.jsx
import { useState, useEffect } from 'react'
import { businessesAPI } from '../../../services/api'

export default function OverviewTab({ business }) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await businessesAPI.getStats(business.id)
                setStats(res.data.stats)
            } catch (err) {
                console.error('Failed to load stats', err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [business.id])

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                Loading...
            </div>
        )
    }

    return (
        <div style={{ padding: '1rem 1.25rem' }}>

            {/* stats grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                marginBottom: '1.5rem'
            }}>
                {[
                    { label: 'Today', value: stats?.bookings_today ?? 0, color: 'var(--color-primary)' },
                    { label: 'This week', value: stats?.bookings_this_week ?? 0, color: 'var(--color-primary)' },
                    { label: 'New since login', value: stats?.new_since_login ?? 0, color: 'var(--color-accent)' },
                    { label: 'Cancelled today', value: stats?.cancelled_today ?? 0, color: '#E05050' },
                    { label: 'Cancelled this week', value: stats?.cancelled_this_week ?? 0, color: '#E05050' },
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

            {/* today's upcoming appointments */}
            <div>
                <div style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--color-text)',
                    marginBottom: '0.75rem'
                }}>
                    Today's upcoming appointments
                </div>

                {stats?.todays_upcoming?.length === 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '0.5px solid var(--color-border)',
                        padding: '1.5rem',
                        textAlign: 'center',
                        color: 'var(--color-muted)',
                        fontSize: '13px'
                    }}>
                        No appointments today
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {stats?.todays_upcoming?.map(booking => (
                            <div key={booking.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '10px',
                                border: '0.5px solid var(--color-border)',
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--color-primary)',
                                    flexShrink: 0
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                                        {booking.service_name}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                        {booking.duration_minutes}min
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-primary)' }}>
                                    {booking.start_time?.slice(11, 16)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* publish/pause toggle */}
            <div style={{
                marginTop: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '0.5px solid var(--color-border)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                        Listing status
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                        {business.status === 'published'
                            ? 'Your business is visible to customers'
                            : 'Your business is not visible to customers'}
                    </div>
                </div>
                <button
                    onClick={async () => {
                        const newStatus = business.status === 'published' ? 'paused' : 'published'
                        try {
                            await businessesAPI.updateStatus(business.id, newStatus)
                            window.location.reload()
                        } catch (err) {
                            alert('Failed to update status')
                        }
                    }}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        backgroundColor: business.status === 'published' ? '#FEF0F4' : 'var(--color-primary)',
                        color: business.status === 'published' ? '#9E4060' : 'white'
                    }}
                >
                    {business.status === 'published' ? 'Pause listing' : 'Publish listing'}
                </button>
            </div>
        </div>
    )
}