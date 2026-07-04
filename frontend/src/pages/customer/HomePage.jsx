// src/pages/customer/HomePage.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import { categoriesAPI, businessesAPI } from '../../services/api'

export default function HomePage() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [businesses, setBusinesses] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const searchInputRef = useRef(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
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

    const groupedCategories = categories.reduce((acc, cat) => {
        if (!acc[cat.group]) acc[cat.group] = []
        acc[cat.group].push(cat)
        return acc
    }, {})

    const filteredBusinesses = search
        ? businesses.filter(b => {
            const searchLower = search.toLowerCase()
            const nameMatch = b.name.toLowerCase().includes(searchLower)
            const serviceMatch = b.services?.some(s =>
                s.name.toLowerCase().includes(searchLower)
            )
            const categoryMatch = b.services?.some(s => {
                const cat = categories.find(c => c.id === s.category_id)
                return cat?.name.toLowerCase().includes(searchLower)
            })
            return nameMatch || serviceMatch || categoryMatch
        })
        : businesses

    const matchingCategories = search
        ? categories.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase())
        )
        : []

    const handleSearch = (e) => {
        e.preventDefault()
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
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search businesses, services or categories..."
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '14px',
                                    color: 'var(--color-text)',
                                    outline: 'none',
                                    flex: 1
                                }}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        color: 'var(--color-muted)'
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* search results */}
                {search ? (
                    <div style={{ marginBottom: '1.5rem' }}>

                        {/* matching categories */}
                        {matchingCategories.length > 0 && (
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h3 style={{
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: 'var(--color-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                    marginBottom: '0.75rem'
                                }}>
                                    Categories
                                </h3>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {matchingCategories.map(cat => (
                                        <div
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            style={{
                                                backgroundColor: 'var(--color-primary)',
                                                borderRadius: '12px',
                                                padding: '10px 16px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            {cat.icon && (
                                                <img src={cat.icon} alt={cat.name}
                                                    style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                            )}
                                            <div style={{ fontSize: '12px', fontWeight: '500', color: 'white' }}>
                                                {cat.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* matching businesses */}
                        <h3 style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: 'var(--color-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            marginBottom: '0.75rem'
                        }}>
                            Businesses — {filteredBusinesses.length} found
                        </h3>

                        {filteredBusinesses.length === 0 ? (
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                border: '0.5px solid var(--color-border)',
                                padding: '2rem',
                                textAlign: 'center',
                                color: 'var(--color-muted)',
                                fontSize: '13px'
                            }}>
                                No businesses found for "{search}"
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {filteredBusinesses.map(biz => (
                                    <div
                                        key={biz.id}
                                        onClick={() => navigate(`/business/${biz.id}`)}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            border: '0.5px solid var(--color-border)',
                                            padding: '12px',
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
                                            flexShrink: 0,
                                            overflow: 'hidden'
                                        }}>
                                            {biz.cover_photo
                                                ? <img src={biz.cover_photo} alt={biz.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : '🏪'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' }}>
                                                {biz.name}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                                {biz.location}
                                            </div>
                                            {biz.services?.filter(s =>
                                                s.name.toLowerCase().includes(search.toLowerCase())
                                            ).slice(0, 2).map(s => (
                                                <span key={s.id} style={{
                                                    fontSize: '10px',
                                                    backgroundColor: '#FEF0F4',
                                                    color: '#9E4060',
                                                    borderRadius: '20px',
                                                    padding: '2px 7px',
                                                    border: '0.5px solid #F2C8D4',
                                                    display: 'inline-block',
                                                    marginTop: '4px',
                                                    marginRight: '4px'
                                                }}>
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                        {biz.is_verified && (
                                            <span style={{
                                                fontSize: '10px',
                                                backgroundColor: '#F2F9F5',
                                                color: '#4A9E75',
                                                borderRadius: '20px',
                                                padding: '2px 7px',
                                                border: '0.5px solid #C8E8D8',
                                                flexShrink: 0
                                            }}>
                                                ✓ Verified
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
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
                                            <div style={{
                                                height: '70px',
                                                backgroundColor: '#F0EBF7',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '28px',
                                                overflow: 'hidden'
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
                    </>
                )}
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