import { useState, useEffect, useContext } from 'react'
import { LangContext } from '../App'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../api'
import { Zap } from 'lucide-react'

const WithdrawModal = ({ balance, isOpen, onClose, onRefresh }) => {
    const [amount, setAmount] = useState('');
    const [pixKey, setPixKey] = useState('');
    const [loading, setLoading] = useState(false);
    const { notify } = useNotification();
    const { t } = useContext(LangContext);

    const handleWithdraw = async () => {
        if (!amount || !pixKey) return notify('Preencha os campos obrigatorios.', 'error');
        if (parseFloat(amount) > balance) return notify('Saldo insuficiente.', 'error');

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/payment/withdraw`, {
                amount: parseFloat(amount),
                pixKey
            }, { withCredentials: true });

            notify('Solicitação de saque enviada com sucesso!', 'success');
            onRefresh();
            onClose();
        } catch (err) {
            notify(err.response?.data?.error || 'Erro ao processar saque.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', padding: '20px' }} onClick={onClose}>
            <div style={{ background: '#080c14', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '950', marginBottom: '10px' }}>{t.nav.requestWithdraw}</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '30px' }}>{t.nav.minAmount}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#fff', opacity: 0.3, letterSpacing: '1px', marginBottom: '10px', display: 'block' }}>{t.nav.withdrawAmount}</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            style={{ width: '100%', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', color: '#fff', borderRadius: '15px', fontWeight: '700' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#fff', opacity: 0.3, letterSpacing: '1px', marginBottom: '10px', display: 'block' }}>{t.nav.pixKey}</label>
                        <input
                            placeholder="..."
                            value={pixKey}
                            onChange={e => setPixKey(e.target.value)}
                            style={{ width: '100%', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', color: '#fff', borderRadius: '15px', fontWeight: '700' }}
                        />
                    </div>

                    <button
                        className="btn-primary"
                        onClick={handleWithdraw}
                        disabled={loading}
                        style={{ height: '55px', borderRadius: '15px', marginTop: '10px', fontWeight: '900' }}
                    >
                        {loading ? '...' : t.nav.confirmWithdraw}
                    </button>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>CANCEL</button>
                </div>
            </div>
        </div>
    );
};

const ResellerPage = () => {
    const { t } = useContext(LangContext);
    const { user, role, loading: authLoading } = useAuth()
    const { notify } = useNotification()
    const [stats, setStats] = useState({ balance: 0, total_keys: 0, total_spent: 0 })
    const [recentSales, setRecentSales] = useState([])
    const [products, setProducts] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [buying, setBuying] = useState(false)
    const [newKey, setNewKey] = useState(null)
    const [withdrawOpen, setWithdrawOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchStats()
            fetchProducts()
        }
    }, [user])

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/reseller/stats`, { withCredentials: true })
            setStats(res.data.stats)
            setRecentSales(res.data.recentSales)
        } catch (e) { }
    }

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/products`, { withCredentials: true })
            setProducts(res.data)
        } catch (e) { }
    }

    const handleBuyKey = async () => {
        if (!selectedProduct || !selectedPlan) return
        setBuying(true)
        try {
            const res = await axios.post(`${API_URL}/api/reseller/buy`, {
                product_id: selectedProduct.id,
                plan_id: selectedPlan.id
            }, { withCredentials: true })
            setNewKey(res.data.license_key)
            fetchStats()
        } catch (err) {
            notify(err.response?.data?.error || 'Erro ao comprar key', 'error')
        } finally {
            setBuying(false)
        }
    }

    if (authLoading) return null
    if (!user || (role !== 'RESELLER' && role !== 'ADMIN' && role !== 'OWNER' && user.discord_id !== '1249488594414997676')) {
        return <Navigate to="/dashboard" />
    }

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />
            <WithdrawModal balance={stats.balance} isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} onRefresh={fetchStats} />

            <div style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '1100px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-1px' }}>Reseller Hub</h1>
                        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>Manage your inventory and balance</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div className="card" style={{ padding: '20px 30px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#22c55e', marginBottom: '5px', letterSpacing: '1px' }}>CURRENT BALANCE</p>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '950', color: '#fff' }}>R$ {stats.balance?.toFixed(2) || '0.00'}</h2>
                        </div>
                        <button
                            onClick={() => setWithdrawOpen(true)}
                            className="glass"
                            style={{
                                padding: '20px',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: '900',
                                fontSize: '0.7rem',
                                letterSpacing: '1px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <Zap size={16} color="#22c55e" />
                            {t.nav.withdraw?.toUpperCase()}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {/* Key Shop */}
                        <div className="card" style={{ padding: '40px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '25px' }}>Generate New License</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '10px' }}>SELECT PRODUCT</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                                        {products.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedProduct(p);
                                                    setSelectedPlan(p.plans && p.plans.length > 0 ? p.plans[0] : null);
                                                    setNewKey(null);
                                                }}
                                                style={{
                                                    padding: '12px',
                                                    background: selectedProduct?.id === p.id ? 'rgba(51, 102, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                                                    border: selectedProduct?.id === p.id ? '1px solid #3366ff' : '1px solid rgba(255,255,255,0.05)',
                                                    borderRadius: '12px',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '700',
                                                    transition: '0.3s ease',
                                                    transform: selectedProduct?.id === p.id ? 'scale(1.05)' : 'scale(1)'
                                                }}
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedProduct && selectedProduct.plans && selectedProduct.plans.length > 0 && (
                                    <div style={{ animation: 'fadeUp 0.4s ease' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '10px' }}>SELECT DURATION / PLAN</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                                            {selectedProduct.plans.map(pl => (
                                                <button
                                                    key={pl.id}
                                                    onClick={() => { setSelectedPlan(pl); setNewKey(null); }}
                                                    style={{
                                                        padding: '12px',
                                                        background: selectedPlan?.id === pl.id ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.02)',
                                                        border: selectedPlan?.id === pl.id ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.05)',
                                                        borderRadius: '12px',
                                                        color: '#fff',
                                                        cursor: 'pointer',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        transition: '0.2s',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '0.8rem', fontWeight: '900' }}>{pl.name}</span>
                                                    <span style={{ color: '#22c55e', fontSize: '0.7rem', opacity: 0.8 }}>R$ {pl.price.toFixed(2)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedPlan && !newKey && (
                                    <button
                                        className="btn-primary"
                                        onClick={handleBuyKey}
                                        disabled={buying}
                                        style={{ height: '55px', borderRadius: '15px', marginTop: '10px', fontWeight: '900' }}
                                    >
                                        {buying ? 'GENERATING...' : `GENERATE KEY (R$ ${selectedPlan.price.toFixed(2)})`}
                                    </button>
                                )}

                                {newKey && (
                                    <div style={{
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        border: '1px solid rgba(34, 197, 94, 0.3)',
                                        padding: '25px',
                                        borderRadius: '15px',
                                        textAlign: 'center',
                                        animation: 'pop 0.4s var(--curve-bounce)'
                                    }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#22c55e', marginBottom: '10px' }}>KEY GENERATED SUCCESSFULLY!</p>
                                        <code style={{ fontSize: '1.2rem', fontWeight: '950', letterSpacing: '2px', color: '#fff' }}>{newKey}</code>
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(newKey); notify('Chave copiada com sucesso!'); }}
                                            style={{ display: 'block', margin: '15px auto 0', background: 'none', border: 'none', color: '#22c55e', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            COPY KEY
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Sales */}
                        <div className="card" style={{ padding: '30px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px' }}>Recent Sales History</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {recentSales.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div>
                                            <p style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>{s.product_name} - {s.plan_name}</p>
                                            <code style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{s.license_key}</code>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: '800', color: '#22c55e', margin: 0 }}>R$ {s.price_charged?.toFixed(2)}</p>
                                            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', margin: 0 }}>{new Date(s.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {recentSales.length === 0 && <p style={{ textAlign: 'center', opacity: 0.3, padding: '20px' }}>No sales yet.</p>}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {/* Side Stats */}
                        <div className="card" style={{ padding: '30px' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '20px' }}>Performance Overview</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Total License Keys Sold</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{stats.total_keys || 0}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Total Volume Spent</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#3366ff' }}>R$ {stats.total_spent?.toFixed(2) || '0.00'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="card" style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(51, 102, 255, 0.05) 0%, transparent 100%)' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '15px' }}>Top-up Balance</h4>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5', marginBottom: '20px' }}>To add more funds to your reseller account, please contact an administrator.</p>
                            <a href="https://discord.gg/zyrogg" target="_blank" className="btn-outline" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '12px' }}>CONTACT ADMIN</a>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    )
}

export default ResellerPage
