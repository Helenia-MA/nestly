import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { businessesAPI } from '../../services/api'
import Navbar from '../../components/common/Navbar'
import RegisterBusinessForm from './RegisterBusinessForm'

// tab imports
import OverviewTab from './tabs/OverviewTab'
import CalendarTab from './tabs/CalendarTab'
import ServicesTab from './tabs/ServicesTab'
import ProfileTab from './tabs/ProfileTab'
import BookingsTab from './tabs/BookingsTab'

const TABS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'services', label: 'Services', icon: '✂️' },
    { id: 'bookings', label: 'Bookings', icon: '📋' },
    { id: 'profile', label: 'Profile', icon: '🏪' },
]

export default function DashboardPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [businesses, setBusinesses] = useState([])
    const [business, setBusiness] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                // getting all businesses and finding the one owned by the user
                const res = await businessesAPI.getMyBusinesses()
                const bizList = res.data.businesses
                setBusinesses(bizList)

                if (bizList.length === 1) {
                    setBusiness(bizList[0])
                }
            } catch (err) {
                console.error('Failed to load business:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchBusinesses()
    }, [user])

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

    // business selector if multiple
    if (businesses.length > 1 && !business) {
        return (
            <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
                <Navbar />
                <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1.25rem' }}>
                    <h2 style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: 'var(--color-text)',
                        marginBottom: '1rem'
                    }}>
                        Select a business to manage
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {businesses.map(biz => (
                            <div
                                key={biz.id}
                                onClick={() => setBusiness(biz)}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    border: '0.5px solid var(--color-border)',
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '10px',
                                    backgroundColor: '#F0EBF7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    flexShrink: 0
                                }}>
                                    🏪
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' }}>
                                        {biz.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                        {biz.location || 'No location set'}
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: '11px',
                                    padding: '3px 10px',
                                    borderRadius: '20px',
                                    backgroundColor: biz.status === 'published' ? '#EAF3DE' : '#FEF0F4',
                                    color: biz.status === 'published' ? '#3B6D11' : '#9E4060',
                                    border: `0.5px solid ${biz.status === 'published' ? '#C0DD97' : '#F2C8D4'}`
                                }}>
                                    {biz.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }


    // if user is not a business owner, or no business yet, we'll show the setup prompt
    if (!business) {
        return (
            <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
                <Navbar />
                <RegisterBusinessForm />
            </div>
        )
    }

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            <Navbar />

            {/* business name header */}
            <div style={{
                backgroundColor: 'white',
                borderBottom: '0.5px solid var(--color-border)',
                padding: '0.75rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text)' }}>
                        {business.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                        Business dashboard
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {businesses.length > 1 && (
                        <button
                            onClick={() => setBusiness(null)}
                            style={{
                                fontSize: '11px',
                                color: 'var(--color-primary)',
                                background: 'none',
                                border: '0.5px solid #C8E8D8',
                                borderRadius: '20px',
                                padding: '3px 10px',
                                cursor: 'pointer'
                            }}
                        >
                            Switch
                        </button>
                    )}
                    <span style={{
                        fontSize: '11px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        backgroundColor: business.status === 'published' ? '#EAF3DE' : '#FEF0F4',
                        color: business.status === 'published' ? '#3B6D11' : '#9E4060',
                        border: `0.5px solid ${business.status === 'published' ? '#C0DD97' : '#F2C8D4'}`
                    }}>
                        {business.status === 'published' ? '● Live' : business.status === 'draft' ? '● Draft' : '● Paused'}
                    </span>
                </div>
            </div>

            {/* tab navigation */}
            <div style={{
                display: 'flex',
                backgroundColor: 'white',
                borderBottom: '0.5px solid var(--color-border)',
                overflowX: 'auto',
                scrollbarWidth: 'none'
            }}>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
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
                            gap: '3px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* tab content */}
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {activeTab === 'overview' && <OverviewTab business={business} />}
                {activeTab === 'calendar' && <CalendarTab business={business} />}
                {activeTab === 'services' && <ServicesTab business={business} setBusiness={setBusiness} />}
                {activeTab === 'bookings' && <BookingsTab business={business} />}
                {activeTab === 'profile' && <ProfileTab business={business} setBusiness={setBusiness} />}
            </div>
        </div>
    )
}