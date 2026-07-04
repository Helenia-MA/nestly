// src/pages/business/tabs/WorkingHoursForm.jsx
import { useState, useEffect } from 'react'
import { businessesAPI } from '../../../services/api'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function WorkingHoursForm({ business }) {
    const [hours, setHours] = useState(
        DAYS.map((_, i) => ({
            day_of_week: i,
            open_time: '09:00',
            close_time: '18:00',
            is_closed: false
        }))
    )
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        const fetchHours = async () => {
            try {
                const res = await businessesAPI.getHours(business.id)
                if (res.data.hours && res.data.hours.length === 7) {
                    setHours(res.data.hours.map(h => ({
                        day_of_week: h.day_of_week,
                        open_time: h.open_time,
                        close_time: h.close_time,
                        is_closed: h.is_closed
                    })))
                }
            } catch (err) {
                console.error('Failed to load hours', err)
            } finally {
                setFetching(false)
            }
        }
        fetchHours()
    }, [business.id])

    const handleChange = (dayIndex, field, value) => {
        setHours(hours.map((h, i) =>
            i === dayIndex ? { ...h, [field]: value } : h
        ))
    }

    const handleSave = async () => {
        setLoading(true)
        setSuccess(false)
        try {
            await businessesAPI.setHours(business.id, { hours })
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save hours')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return (
        <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            Loading...
        </div>
    )

    return (
        <div>
            {success && (
                <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#F2F9F5',
                    color: '#4A9E75',
                    borderRadius: '8px',
                    fontSize: '12px',
                    marginBottom: '0.75rem'
                }}>
                    ✓ Working hours saved
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {hours.map((day, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        opacity: day.is_closed ? 0.5 : 1
                    }}>
                        <div style={{
                            width: '90px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--color-text)',
                            flexShrink: 0
                        }}>
                            {DAYS[idx]}
                        </div>

                        <input
                            type="checkbox"
                            checked={day.is_closed}
                            onChange={(e) => handleChange(idx, 'is_closed', e.target.checked)}
                            id={`closed-${idx}`}
                        />
                        <label htmlFor={`closed-${idx}`} style={{
                            fontSize: '11px',
                            color: 'var(--color-muted)',
                            cursor: 'pointer',
                            flexShrink: 0
                        }}>
                            Closed
                        </label>

                        {!day.is_closed && (
                            <>
                                <input
                                    type="time"
                                    value={day.open_time}
                                    onChange={(e) => handleChange(idx, 'open_time', e.target.value)}
                                    style={{
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        border: '0.5px solid var(--color-border)',
                                        fontSize: '12px',
                                        outline: 'none',
                                        flex: 1
                                    }}
                                />
                                <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>to</span>
                                <input
                                    type="time"
                                    value={day.close_time}
                                    onChange={(e) => handleChange(idx, 'close_time', e.target.value)}
                                    style={{
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        border: '0.5px solid var(--color-border)',
                                        fontSize: '12px',
                                        outline: 'none',
                                        flex: 1
                                    }}
                                />
                            </>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={handleSave}
                disabled={loading}
                style={{
                    marginTop: '1rem',
                    padding: '9px 20px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                }}
            >
                {loading ? 'Saving...' : 'Save hours'}
            </button>
        </div>
    )
}