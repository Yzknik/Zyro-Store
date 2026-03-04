import { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LangContext } from '../App'
import axios from 'axios'
import API_URL from '../api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const ProductCard = ({ product, index }) => {
    const cheapestPlan = product.plans && product.plans.length > 0
        ? product.plans.reduce((prev, curr) => prev.price < curr.price ? prev : curr)
        : null;

    return (
        <div style={{
            opacity: 0,
            animation: 'fadeUp 0.8s var(--curve) forwards',
            animationDelay: `${index * 0.05}s`
        }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
                    <img
                        src={product.image_url || 'https://via.placeholder.com/400x250?text=Zyro'}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0c0c0c, transparent)' }} />
                </div>

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>
                        {product.category_name || 'SOFTWARE'}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>{product.name}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6', marginBottom: '24px', flex: 1 }}>
                        {product.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                        <div>
                            {cheapestPlan ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>R$ {cheapestPlan.price.toFixed(2)}</span>
                                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontWeight: '700' }}>STARTING PRICE</span>
                                </div>
                            ) : (
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', fontWeight: '700' }}>COMING SOON</span>
                            )}
                        </div>
                        <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.75rem' }}>PURCHASE</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ProductsPage = () => {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [activeCat, setActiveCat] = useState('all')
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        window.scrollTo(0, 0)
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                axios.get(`${API_URL}/api/products`),
                axios.get(`${API_URL}/api/admin/categories`, { withCredentials: true }).catch(() => ({ data: [] }))
            ])

            const prodsWithPlans = await Promise.all(prodRes.data.map(async (p) => {
                const planRes = await axios.get(`${API_URL}/api/products/${p.id}/plans`).catch(() => ({ data: [] }))
                return { ...p, plans: planRes.data }
            }))

            setProducts(prodsWithPlans)
            setCategories(catRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const filtered = products.filter(p => {
        const matchCat = activeCat === 'all' || p.category_id == activeCat
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />

            <div style={{ paddingTop: '160px', paddingBottom: '80px' }}>
                <div className="container-lg">
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '0.3em', marginBottom: '16px', display: 'block' }}>CATALOGUE</span>
                        <h1 className="title-large">Elite Softwares</h1>
                    </div>

                    {/* Filter Bar */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '20px',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '60px',
                        padding: '20px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.03)',
                        borderRadius: '4px'
                    }}>
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                            <button
                                onClick={() => setActiveCat('all')}
                                style={{
                                    background: activeCat === 'all' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '3px',
                                    color: '#fff',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    cursor: 'none'
                                }}
                            >
                                ALL
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCat(cat.id)}
                                    style={{
                                        background: activeCat == cat.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '3px',
                                        color: '#fff',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        cursor: 'none'
                                    }}
                                >
                                    {cat.name.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
                            <input
                                type="text"
                                placeholder="SEARCH PRODUCTS..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '3px',
                                    padding: '12px 20px',
                                    color: '#fff',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    outline: 'none',
                                    cursor: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px', color: 'rgba(255,255,255,0.2)' }}>SYNCHRONIZING CATALOGUE...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                            {filtered.length > 0 ? (
                                filtered.map((p, i) => (
                                    <ProductCard key={p.id} product={p} index={i} />
                                ))
                            ) : (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', opacity: 0.3 }}>
                                    NO PRODUCTS IN STOCK.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default ProductsPage
