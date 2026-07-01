// src/pages/customer/CategoryPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import { businessesAPI, categoriesAPI } from '../../services/api'

export default function CategoryPage() {
    const { categoryId } = useParams()
    const navigate = useNavigate()

    const [businesses, setBusinesses] = useState([])
    const [category, setCategory] = useState(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({
        min_price: '',
        max_price: '',
        max_distance: ''
    })
    const [userLocation, setUserLocation] = useState(null)
    const [sortBy, setSortBy] = useState('newest')

    // get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('User location:', position.coords.latitude, position.coords.longitude)
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                },
                () => {
                    // user denied location — that's fine
                    console.log('Location access denied')
                }
            )
        }
    }, [])

    // fetch category info and businesses
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // get category name
                const catsRes = await categoriesAPI.getAll()
                const cat = catsRes.data.categories.find(
                    c => c.id === parseInt(categoryId)
                )
                setCategory(cat)

                // build filters
                const queryFilters = { category_id: categoryId }

                if (search) queryFilters.search = search
                if (filters.min_price) queryFilters.min_price = filters.min_price
                if (filters.max_price) queryFilters.max_price = filters.max_price
                if (userLocation && filters.max_distance) {
                    queryFilters.lat = userLocation.lat
                    queryFilters.lng = userLocation.lng
                    queryFilters.max_distance = filters.max_distance
                }

                const bizRes = await businessesAPI.getAll(queryFilters)
                setBusinesses(bizRes.data.businesses)
            } catch (err) {
                console.error('Failed to load category data', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [categoryId, search, filters, userLocation])

    // sort businesses
    const sortedBusinesses = [...businesses].sort((a, b) => {
        if (sortBy === 'distance' && a.distance !== null) {
            return a.distance - b.distance
        }
        if (sortBy === 'newest') {
            return new Date(b.created_at) - new Date(a.created_at)
        }
        return 0
    })

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            <Navbar />

            <div style={{ padding: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>

                {/* header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            color: 'var(--color-primary)',
                            cursor: 'pointer'
                        }}
                    >
                        ←
                    </button>
                    <h1 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-text)' }}>
                        {category?.name || 'Loading...'}
                    </h1>
                    <span style={{ fontSize: '12px', color: 'var(--color-muted)', marginLeft: 'auto' }}>
                        {businesses.length} businesses
                    </span>
                </div>

                {/* search bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'white',
                    border: '0.5px solid var(--color-border)',
                    borderRadius: '10px',
                    padding: '9px 12px',
                    marginBottom: '0.75rem'
                }}>
                    <span style={{ color: 'var(--color-muted)' }}>🔍</span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Search within ${category?.name || 'this category'}...`}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            fontSize: '13px',
                            color: 'var(--color-text)',
                            outline: 'none',
                            flex: 1
                        }}
                    />
                </div>

                {/* filters */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '0.75rem',
                    scrollbarWidth: 'none'
                }}>
                    {/* price range */}
                    <input
                        type="number"
                        placeholder="Min price"
                        value={filters.min_price}
                        onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                        style={{
                            padding: '6px 10px',
                            borderRadius: '20px',
                            border: '0.5px solid var(--color-border)',
                            fontSize: '12px',
                            backgroundColor: 'white',
                            width: '100px',
                            outline: 'none'
                        }}
                    />
                    <input
                        type="number"
                        placeholder="Max price"
                        value={filters.max_price}
                        onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                        style={{
                            padding: '6px 10px',
                            borderRadius: '20px',
                            border: '0.5px solid var(--color-border)',
                            fontSize: '12px',
                            backgroundColor: 'white',
                            width: '100px',
                            outline: 'none'
                        }}
                    />

                    {/* distance filter — only show if location granted */}
                    {userLocation && (
                        <input
                            type="number"
                            placeholder="Max km"
                            value={filters.max_distance}
                            onChange={(e) => setFilters({ ...filters, max_distance: e.target.value })}
                            style={{
                                padding: '6px 10px',
                                borderRadius: '20px',
                                border: '0.5px solid var(--color-border)',
                                fontSize: '12px',
                                backgroundColor: 'white',
                                width: '90px',
                                outline: 'none'
                            }}
                        />
                    )}

                    {/* sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '6px 10px',
                            borderRadius: '20px',
                            border: '0.5px solid var(--color-border)',
                            fontSize: '12px',
                            backgroundColor: 'white',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="newest">Newest</option>
                        {userLocation && <option value="distance">Nearest</option>}
                    </select>
                </div>

                {/* results */}
                {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>
                        Loading...
                    </div>
                ) : sortedBusinesses.length === 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '0.5px solid var(--color-border)',
                        padding: '2rem',
                        textAlign: 'center',
                        color: 'var(--color-muted)',
                        fontSize: '13px'
                    }}>
                        No businesses found — try adjusting your filters
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {sortedBusinesses.map(biz => (
                            <div
                                key={biz.id}
                                onClick={() => navigate(`/business/${biz.id}`)}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    border: '0.5px solid var(--color-border)',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    cursor: 'pointer'
                                }}
                            >
                                {/* image */}
                                <div style={{
                                    width: '90px',
                                    minHeight: '110px',
                                    backgroundColor: '#F0EBF7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    fontSize: '28px'
                                }}>
                                    {biz.cover_photo
                                        ? <img src={biz.cover_photo} alt={biz.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : '✂️'}
                                </div>

                                {/* info */}
                                <div style={{ padding: '12px', flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' }}>
                                            {biz.name}
                                        </div>
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
                                    </div>

                                    <div style={{ fontSize: '11px', color: 'var(--color-muted)', margin: '4px 0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {biz.location && <span>📍 {biz.location}</span>}
                                        {biz.distance !== null && biz.distance !== undefined && (
                                            <span>🗺️ {biz.distance}km away</span>
                                        )}
                                    </div>

                                    {/* services mini chips */}
                                    {biz.services && biz.services.length > 0 && (
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                                            {biz.services.slice(0, 3).map(service => (
                                                <div key={service.id} style={{
                                                    backgroundColor: 'var(--color-bg)',
                                                    border: '0.5px solid var(--color-border)',
                                                    borderRadius: '8px',
                                                    padding: '4px 8px',
                                                    fontSize: '11px'
                                                }}>
                                                    <div style={{ fontWeight: '500', color: 'var(--color-text)' }}>
                                                        {service.name}
                                                    </div>
                                                    <div style={{ color: 'var(--color-primary)' }}>
                                                        KSh {service.price?.toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                            {biz.services.length > 3 && (
                                                <div style={{
                                                    backgroundColor: 'white',
                                                    border: '0.5px dashed var(--color-border)',
                                                    borderRadius: '8px',
                                                    padding: '4px 8px',
                                                    fontSize: '11px',
                                                    color: 'var(--color-muted)',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    +{biz.services.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}