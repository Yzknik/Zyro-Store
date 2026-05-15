import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LangContext } from '../App'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import API_URL from '../api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Copy, QrCode, Loader2, ChevronRight, Zap, Shield, Target } from 'lucide-react'

const InfoModal = ({ product, isOpen, onClose }) => {
    if (!product || !isOpen) return null;
    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', padding: '20px' }} onClick={onClose}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '500px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '950', color: '#fff' }}>{product.name}</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={24} /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: 'rgba(255,255,255,0.6)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                            <span>Version</span>
                            <span style={{ color: '#3366ff', fontWeight: '900' }}>v{product.current_version || '1.0.0'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                            <span>Status</span>
                            <span style={{ color: '#22c55e', fontWeight: '900' }}>UNDETECTED</span>
                        </div>
                        <p style={{ marginTop: '15px', fontSize: '0.9rem', lineHeight: '1.6' }}>{product.description}</p>
                    </div>
                    <button onClick={onClose} className="btn-primary" style={{ width: '100%', marginTop: '30px', padding: '20px', borderRadius: '15px', fontWeight: '900', background: '#3366ff', border: 'none', color: '#fff', cursor: 'pointer' }}>GOT IT</button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const PaymentModal = ({ product, isOpen, onClose }) => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [loading, setLoading] = useState(false)
    const [paymentData, setPaymentData] = useState(null)
    const [status, setStatus] = useState('pending') // pending, paid
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (isOpen && product.plans.length > 0) {
            setSelectedPlan(product.plans[0])
        }
        if (!isOpen) {
            setPaymentData(null)
            setStatus('pending')
        }
    }, [isOpen, product])

    // Poll for status if payment is active
    useEffect(() => {
        let interval;
        if (paymentData && status === 'pending') {
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(`${API_URL}/api/payment/status/${paymentData.transaction_id}`, { withCredentials: true })
                    if (res.data.status === 'paid') {
                        setStatus('paid')
                        clearInterval(interval)
                        setTimeout(() => {
                            navigate('/dashboard')
                        }, 3000)
                    }
                } catch (e) { console.error(e) }
            }, 3000)
        }
        return () => clearInterval(interval)
    }, [paymentData, status, navigate])

    if (!isOpen) return null;

    const handlePurchase = async () => {
        if (!user) return navigate('/login');
        setLoading(true)
        try {
            const res = await axios.post(`${API_URL}/api/payment/create`, {
                plan_id: selectedPlan.id
            }, { withCredentials: true })
            setPaymentData(res.data)
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Payment failed';
            alert(errorMsg);
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(paymentData.pix_copia_e_cola)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="glass"
                    style={{
                        width: '100%', maxWidth: '500px', padding: '40px', borderRadius: '32px',
                        position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <button onClick={onClose} style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>

                    {!paymentData ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(51, 102, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3366ff' }}>
                                    <Zap size={22} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>Unlock {product.name}</h2>
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>SELECT YOUR PREFERRED PLAN</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                                {product.plans.map(plan => (
                                    <div
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan)}
                                        style={{
                                            padding: '20px', borderRadius: '16px', cursor: 'pointer',
                                            background: selectedPlan?.id === plan.id ? 'rgba(51, 102, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${selectedPlan?.id === plan.id ? 'rgba(51, 102, 255, 0.4)' : 'rgba(255,255,255,0.05)'}`,
                                            transition: '0.3s',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <p style={{ margin: 0, color: '#fff', fontWeight: '800', fontSize: '1rem' }}>{plan.name.toUpperCase()}</p>
                                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: '700' }}>{plan.duration_days === 0 ? 'LIFETIME ACCESS' : `${plan.duration_days} DAYS SUBSCRIPTION`}</p>
                                        </div>
                                        <span style={{ color: selectedPlan?.id === plan.id ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: '900', fontSize: '1.1rem' }}>R$ {plan.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handlePurchase}
                                disabled={loading}
                                className="btn-premium btn-primary-gradient"
                                style={{ width: '100%', padding: '20px', fontSize: '0.9rem' }}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'GENERATE PIX PAYMENT'}
                            </button>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            {status === 'pending' ? (
                                <>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', marginBottom: '10px' }}>Complete PIX Payment</h2>
                                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '30px' }}>Scan the QR Code or copy the code below to pay.</p>

                                    <div style={{ padding: '20px', background: '#fff', borderRadius: '24px', display: 'inline-block', marginBottom: '30px' }}>
                                        <img src={paymentData.qrcode_base64} alt="PIX QR Code" style={{ width: '220px', height: '220px' }} />
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                                        <input
                                            readOnly
                                            value={paymentData.pix_copia_e_cola}
                                            style={{ background: 'none', border: 'none', color: '#fff', flex: 1, fontSize: '0.7rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                                        />
                                        <button onClick={copyToClipboard} style={{ background: '#3366ff', border: 'none', borderRadius: '8px', padding: '8px', color: '#fff', cursor: 'pointer' }}>
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#22c55e', fontSize: '0.8rem', fontWeight: '800' }}>
                                        <Loader2 size={16} className="animate-spin" />
                                        WAITING FOR PAYMENT...
                                    </div>
                                </>
                            ) : (
                                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                                        <Check size={40} />
                                    </div>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', marginBottom: '10px' }}>Payment Confirmed!</h2>
                                    <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', marginBottom: '30px' }}>Your license has been issued. Redirecting to your dashboard...</p>
                                </motion.div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

const ProductCard = ({ product, index, onPurchase }) => {
    const cheapestPlan = product.plans && product.plans.length > 0
        ? product.plans.reduce((prev, curr) => prev.price < curr.price ? prev : curr)
        : null;

    return (
        <div style={{
            opacity: 0,
            animation: 'fadeUp 0.8s var(--curve) forwards',
            animationDelay: `${index * 0.05}s`
        }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
                    <img
                        src={product.image_url || 'https://via.placeholder.com/400x250?text=Zyro'}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0c0c0c, transparent)' }} />
                    <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                        <span style={{
                            background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
                            color: '#22c55e', fontSize: '0.6rem', padding: '4px 10px', borderRadius: '30px', fontWeight: '900'
                        }}>
                            • UNDETECTED
                        </span>
                    </div>
                </div>

                <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.65rem', color: '#3366ff', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={12} />
                        {product.category_name || 'ELITE SOFTWARE'}
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', marginBottom: '12px', letterSpacing: '-0.5px' }}>{product.name}</h3>
                    <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.7', marginBottom: '32px', flex: 1 }}>
                        {product.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                            {cheapestPlan ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>R$ {cheapestPlan.price.toFixed(2)}</span>
                                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontWeight: '800' }}>STARTING PRICE</span>
                                </div>
                            ) : (
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', fontWeight: '800' }}>COMING SOON</span>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <button
                                onClick={() => onPurchase(product, 'info')}
                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', padding: '12px', color: '#fff', cursor: 'pointer' }}
                            >
                                <Shield size={18} />
                            </button>
                            <button
                                onClick={() => onPurchase(product, 'buy')}
                                className="btn-premium"
                                style={{ flex: 1, padding: '12px 28px', fontSize: '0.7rem', background: '#3366ff', border: 'none' }}
                            >
                                PURCHASE
                                <ChevronRight size={14} />
                            </button>
                        </div>
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

    // Checkout State
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

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

    const handleOpenPurchase = (product, mode = 'buy') => {
        setSelectedProduct(product)
        if (mode === 'buy') setIsPaymentModalOpen(true)
        else setIsInfoModalOpen(true)
    }

    const filtered = products.filter(p => {
        const matchCat = activeCat === 'all' || p.category_id == activeCat
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />

            {selectedProduct && (
                <>
                    <PaymentModal
                        product={selectedProduct}
                        isOpen={isPaymentModalOpen}
                        onClose={() => setIsPaymentModalOpen(false)}
                    />
                    <InfoModal
                        product={selectedProduct}
                        isOpen={isInfoModalOpen}
                        onClose={() => setIsInfoModalOpen(false)}
                    />
                </>
            )}

            <div style={{ paddingTop: '160px', paddingBottom: '80px' }}>
                <div className="container-lg">
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#3366ff', letterSpacing: '0.4em', marginBottom: '20px', display: 'block' }}>CATALOGUE</span>
                        <h1 className="title-ultra" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>Cheats Zyro</h1>
                    </div>

                    {/* Filter Bar */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '24px',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '60px',
                        padding: '32px',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '24px'
                    }}>
                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '5px' }}>
                            <button
                                onClick={() => setActiveCat('all')}
                                style={{
                                    background: activeCat === 'all' ? '#3366ff' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${activeCat === 'all' ? '#3366ff' : 'rgba(255,255,255,0.05)'}`,
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '0.75rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    transition: '0.3s'
                                }}
                            >
                                ALL PRODUCTS
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCat(cat.id)}
                                    style={{
                                        background: activeCat == cat.id ? '#3366ff' : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${activeCat == cat.id ? '#3366ff' : 'rgba(255,255,255,0.05)'}`,
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        transition: '0.3s'
                                    }}
                                >
                                    {cat.name.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
                            <input
                                type="text"
                                placeholder="SEARCH FOR SOFTWARE..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '16px',
                                    padding: '16px 24px',
                                    color: '#fff',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    outline: 'none',
                                    transition: '0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3366ff'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                            />
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                            <Loader2 className="animate-spin" size={40} color="#3366ff" />
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '800', letterSpacing: '2px' }}>SYNCHRONIZING CATALOGUE...</span>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '40px' }}>
                            {filtered.length > 0 ? (
                                filtered.map((p, i) => (
                                    <ProductCard key={p.id} product={p} index={i} onPurchase={handleOpenPurchase} />
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
