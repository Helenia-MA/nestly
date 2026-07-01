// src/pages/customer/HomePage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import { categoriesAPI, businessesAPI } from '../../services/api'

export default function HomePage() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [businesses, setBusinesses] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, bizRes] = await Promise.all([
                    categoriesAPI.getAll(),
                    businessesAPI.getAll()
                ])
                setCategories(catsRes.data.categories)
                setBusinesses(bizRes.data.businesses)
            } catch (err) {
                console.error('Failed to load home page data', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // group categories by their group field
    const groupedCategories = categories.reduce((acc, cat) => {
        if (!acc[cat.group]) acc[cat.group] = []
        acc[cat.group].push(cat)
        return acc
    }, {})

    const handleSearch = (e) => {
        e.preventDefault()
        if (search.trim()) {
            navigate(`/?search=${encodeURIComponent(search)}`)
        }
    }

    const handleCategoryClick = (categoryId) => {
        navigate(`/category/${categoryId}`)
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

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            <Navbar />

            <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>

                {/* hero */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--color-text)', marginBottom: '4px' }}>
                        What are you looking for?
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                        Browse services near you
                    </p>

                    {/* search bar */}
                    <form onSubmit={handleSearch}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: 'white',
                            border: '0.5px solid var(--color-border)',
                            borderRadius: '10px',
                            padding: '10px 14px'
                        }}>
                            <span style={{ color: 'var(--color-muted)', fontSize: '16px' }}>🔍</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search services or businesses..."
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '14px',
                                    color: 'var(--color-text)',
                                    outline: 'none',
                                    flex: 1
                                }}
                            />
                        </div>
                    </form>
                </div>

                {/* categories grouped */}
                {Object.entries(groupedCategories).map(([group, cats]) => (
                    <div key={group} style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: 'var(--color-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            marginBottom: '0.75rem'
                        }}>
                            {group}
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '10px'
                        }}>
                            {cats.map(cat => (
                                <div
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        border: '0.5px solid var(--color-border)',
                                        padding: '14px 10px',
                                        textAlign: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {cat.icon ? (
                                        <img src={cat.icon} alt={cat.name}
                                            style={{ width: '32px', height: '32px', objectFit: 'contain', margin: '0 auto 6px' }} />
                                    ) : (
                                        <div style={{ fontSize: '24px', marginBottom: '6px' }}>📋</div>
                                    )}
                                    <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--color-text)' }}>
                                        {cat.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* recently added businesses */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: 'var(--color-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '0.75rem'
                    }}>
                        Recently added
                    </h3>

                    {businesses.length === 0 ? (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            border: '0.5px solid var(--color-border)',
                            padding: '2rem',
                            textAlign: 'center',
                            color: 'var(--color-muted)',
                            fontSize: '13px'
                        }}>
                            No businesses yet — check back soon!
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '10px'
                        }}>
                            {businesses.slice(0, 4).map(biz => (
                                <div
                                    key={biz.id}
                                    onClick={() => navigate(`/business/${biz.id}`)}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        border: '0.5px solid var(--color-border)',
                                        overflow: 'hidden',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {/* cover photo or placeholder */}
                                    <div style={{
                                        height: '70px',
                                        backgroundColor: '#F0EBF7',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '28px'
                                    }}>
                                        {biz.cover_photo
                                            ? <img src={biz.cover_photo} alt={biz.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : '✂️'}
                                    </div>
                                    <div style={{ padding: '10px 12px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                                            {biz.name}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                            {biz.location}
                                        </div>
                                        {biz.is_verified && (
                                            <span style={{
                                                fontSize: '10px',
                                                backgroundColor: '#F2F9F5',
                                                color: '#4A9E75',
                                                borderRadius: '20px',
                                                padding: '2px 7px',
                                                border: '0.5px solid #C8E8D8',
                                                display: 'inline-block',
                                                marginTop: '4px'
                                            }}>
                                                ✓ Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* FAQ button */}
            <button
                style={{
                    position: 'fixed',
                    bottom: '1.5rem',
                    right: '1.5rem',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                ?
            </button>
        </div>
    )
}