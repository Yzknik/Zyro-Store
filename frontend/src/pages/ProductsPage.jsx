import { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LangContext } from '../App'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const ProductCard = ({ product, lang, index }) => {
    const [hovered, setHovered] = useState(false)

    // Pega o plano mais barato para exibir o preço inicial
    const cheapestPlan = product.plans && product.plans.length > 0
        ? product.plans.reduce((prev, curr) => prev.price < curr.price ? prev : curr)
        : null;

    return (
        <div
            className="reveal active"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ transitionDelay: `${index * 50}ms`, height: '100%' }}
        >
            <div className="card-product glass-blue hover-glow" style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                position: 'relative', overflow: 'hidden', borderRadius: '24px'
            }}>
                {/* Banner Image */}
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: '#080c14' }}>
                    <img
                        src={product.image_url || 'https://via.placeholder.com/400x225?text=Zyro+Product'}
                        alt={product.name}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transform: hovered ? 'scale(1.1) rotate(1deg)' : 'scale(1)',
                            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0f1729, transparent)' }} />
                </div>

                {/* Info */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                        {product.category_name || 'Geral'}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', marginBottom: '1rem', lineHeight: '1.2' }}>{product.name}</h3>

                    <p style={{ fontSize: '0.9rem', color: 'rgba(148, 163, 184, 0.7)', lineHeight: '1.5', marginBottom: '1.5rem', flex: 1 }}>
                        {product.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {cheapestPlan ? (
                                <>
                                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>R$ {cheapestPlan.price.toFixed(2)}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'rgba(148, 163, 184, 0.5)', fontWeight: '700', textTransform: 'uppercase' }}>{cheapestPlan.name}</span>
                                </>
                            ) : (
                                <span style={{ fontSize: '0.9rem', color: 'rgba(148, 163, 184, 0.5)' }}>Em breve</span>
                            )}
                        </div>
                        <button className="btn-primary" style={{ padding: '10px 24px', borderRadius: '10px' }}>Comprar</button>
                    </div>
                </div>

                <div style={{
                    position: 'absolute', bottom: 0, left: 0, height: '3px',
                    background: '#3b82f6', width: hovered ? '100%' : '0%', transition: 'width 0.4s ease'
                }} />
            </div>
        </div>
    )
}

const ProductsPage = () => {
    const { lang } = useContext(LangContext)
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
                axios.get('http://localhost:5000/api/products'),
                axios.get('http://localhost:5000/api/admin/categories', { withCredentials: true }).catch(() => ({ data: [] }))
            ])

            // Para cada produto, precisamos buscar os planos
            const prodsWithPlans = await Promise.all(prodRes.data.map(async (p) => {
                const planRes = await axios.get(`http://localhost:5000/api/products/${p.id}/plans`).catch(() => ({ data: [] }))
                return { ...p, plans: planRes.data }
            }))

            setProducts(prodsWithPlans)
            setCategories(catRes.data)
        } catch (err) {
            console.error('Error fetching data')
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
        <div style={{ minHeight: '100vh', background: '#080c14', color: '#e2e8f0' }}>
            <Navbar />

            {/* Header Section */}
            <div style={{ paddingTop: '140px', paddingBottom: '60px', position: 'relative', overflow: 'hidden' }}>
                <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.2 }} />
                <div className="container-lg" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    <h1 className="reveal active" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: '950', marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
                        Nossa <span className="glow-text">Loja</span>
                    </h1>
                    <p className="reveal active" style={{ fontSize: '1.2rem', color: 'rgba(148, 163, 184, 0.7)', maxWidth: '600px', margin: '0 auto' }}>
                        Produtos de alta performance sincronizados com seu servidor.
                    </p>
                </div>
            </div>

            <div className="container-lg" style={{ paddingBottom: '100px' }}>
                {/* Filters & Search */}
                <div className="reveal active" style={{
                    display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(15, 23, 41, 0.4)', backdropFilter: 'blur(10px)', padding: '1.5rem',
                    borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.15)', marginBottom: '3rem'
                }}>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                        <button onClick={() => setActiveCat('all')} className={`tag ${activeCat === 'all' ? 'active' : ''}`}>Todos</button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCat(cat.id)}
                                className={`tag ${activeCat == cat.id ? 'active' : ''}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div style={{ position: 'relative', flex: '1 1 300px' }}>
                        <input
                            type="text"
                            placeholder="Pesquisar ferramentas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%', background: 'rgba(8, 12, 20, 0.5)', border: '1px solid rgba(59, 130, 246, 0.2)',
                                borderRadius: '12px', padding: '12px 20px 12px 45px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                            }}
                        />
                        <svg style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </div>
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>Carregando...</div>
                    ) : filtered.length > 0 ? (
                        filtered.map((p, i) => (
                            <ProductCard key={p.id} product={p} lang={lang} index={i} />
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0', opacity: 0.3 }}>
                            <h3>Nenhum produto em estoque.</h3>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ProductsPage
