import { useContext, useState, useEffect } from 'react'
import { LangContext } from '../App'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { Navigate, Link } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../api'

const DashboardPage = () => {
    const { t } = useContext(LangContext)
    const { user, userProducts, isAdmin, loading, checkAuth } = useAuth()
    const [resetting, setResetting] = useState(null)
    const [showKeys, setShowKeys] = useState({})
    const [currentTime, setCurrentTime] = useState(new Date())
    const [activeTab, setActiveTab] = useState('overview')

    const [news, setNews] = useState([])
    const [settings, setSettings] = useState({})
    const [history, setHistory] = useState([])
    const [tickets, setTickets] = useState([])
    const [configs, setConfigs] = useState([])
    const [selectedConfigProduct, setSelectedConfigProduct] = useState(null)

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        fetchInfo()
        fetchHistory()
        fetchTickets()
        return () => clearInterval(timer)
    }, [])

    const fetchInfo = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/info`, { withCredentials: true })
            setNews(res.data.news || [])
            setSettings(res.data.settings || {})
        } catch (e) { console.error('Error fetching dashboard info', e) }
    }

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/auth/history`, { withCredentials: true })
            setHistory(res.data || [])
        } catch (e) { }
    }

    const fetchTickets = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/tickets/my`, { withCredentials: true })
            setTickets(res.data || [])
        } catch (e) { }
    }

    const fetchConfigs = async (productId) => {
        try {
            const res = await axios.get(`${API_URL}/api/auth/configs/${productId}`, { withCredentials: true })
            setConfigs(res.data || [])
            setSelectedConfigProduct(productId)
        } catch (e) { }
    }

    const handleResetHWID = async (productId) => {
        if (!confirm('Deseja realmente resetar seu Hardware ID?')) return
        try {
            setResetting(productId)
            const res = await axios.post(`${API_URL}/api/auth/hwid/reset`, { product_id: productId }, { withCredentials: true })
            alert(res.data.message || 'HWID resetado com sucesso.')
            await checkAuth()
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao resetar HWID.')
        } finally { setResetting(null) }
    }

    const handleToggleStatus = async (licenseId) => {
        try {
            await axios.post(`${API_URL}/api/auth/license/toggle`, { license_id: licenseId }, { withCredentials: true })
            await checkAuth()
        } catch (err) { }
    }

    if (loading) return null
    if (!user) return <Navigate to="/" />

    const isCEO = user.discord_id === '1249488594414997676'
    const userRole = user.role || (isCEO ? 'ZYRO OWNER' : isAdmin ? 'STAFF' : 'MEMBER')

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />

            <div style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '1100px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>

                {/* Header Profile Section */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    marginBottom: '60px',
                    animation: 'fadeUp 0.6s ease both'
                }}>
                    <img
                        src={user.avatar}
                        style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)' }}
                        alt=""
                    />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>{user.username}</h2>
                            <span style={{
                                fontSize: '0.65rem',
                                fontWeight: '800',
                                color: isCEO ? '#ff4b2b' : '#3366ff',
                                background: 'rgba(255,255,255,0.03)',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                letterSpacing: '0.1em'
                            }}>
                                {userRole}
                            </span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Welcome back to your workspace</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 250px) 1fr', gap: '60px' }}>

                    {/* Navigation Tab */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'licenses', label: 'My Products' },
                            { id: 'configs', label: 'Cloud Configs' },
                            { id: 'security', label: 'HWID & History' },
                            { id: 'tickets', label: 'Support Tickets' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    textAlign: 'left',
                                    padding: '12px 16px',
                                    borderRadius: '6px',
                                    background: activeTab === tab.id ? 'rgba(255,255,255,0.03)' : 'transparent',
                                    color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.4)',
                                    border: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: '0.2s'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}

                        {(user.role === 'reseller' || isAdmin || isCEO) && (
                            <Link to="/reseller" style={{
                                marginTop: '10px',
                                textAlign: 'left',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: 'rgba(34, 197, 94, 0.05)',
                                color: '#22c55e',
                                textDecoration: 'none',
                                fontSize: '0.8rem',
                                fontWeight: '900',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                transition: '0.3s',
                                letterSpacing: '1px'
                            }}>
                                RESELLER HUB
                            </Link>
                        )}
                        {isAdmin && (
                            <Link to="/admin" style={{ textDecoration: 'none', marginTop: '20px' }}>
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    Admin Panel
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div style={{ animation: 'fadeUp 0.6s ease both 0.1s' }}>
                        {activeTab === 'overview' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                {/* Stats Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                    <div className="card" style={{ padding: '24px' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '0.05em' }}>ACTIVE PRODUCTS</p>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{userProducts?.length || 0}</h3>
                                    </div>
                                    <div className="card" style={{ padding: '24px' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '0.05em' }}>LOCAL TIME</p>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                                    </div>
                                    <div className="card" style={{ padding: '24px' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '0.05em' }}>PLATFORM STATUS</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#22c55e' }}>ONLINE</h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Platform Support Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', width: '100%' }}>

                                    {/* Discord Connection Card */}
                                    <div className="card" style={{ padding: '30px', width: '100%' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px' }}>Discord Connection</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <img src={user.avatar} style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid rgba(88, 101, 242, 0.5)' }} alt="Discord Avatar" />
                                            <div>
                                                <h5 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '700' }}>{user.username}</h5>
                                                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0, marginTop: '4px', fontFamily: '"JetBrains Mono", monospace' }}>{user.discord_id}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Access Level</span>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#5865F2', background: 'rgba(88,101,242,0.1)', padding: '4px 10px', borderRadius: '6px' }}>{userRole}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Sync Status</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e' }} />
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#22c55e' }}>LINKED</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Status Card */}
                                    <div className="card" style={{ padding: '30px', width: '100%' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px' }}>Live Status</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            {[
                                                { label: 'Discord Members', value: settings.discord_members_count || '...' },
                                                { label: 'System Uptime', value: settings.stats_uptime || '...' },
                                                { label: 'Detection Rate', value: settings.stats_detection || '...' },
                                                { label: 'Instant Delivery', value: settings.stats_delivery || '...' }
                                            ].map((s, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        color: '#3366ff',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {s.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'licenses' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {userProducts?.map((p, idx) => (
                                    <div key={idx} className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{p.name}</h3>
                                                <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#3366ff', background: 'rgba(51,102,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>v{p.current_version || '1.0.0'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                                <code style={{
                                                    background: 'rgba(255,255,255,0.03)',
                                                    padding: '4px 10px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem',
                                                    filter: showKeys[idx] ? 'none' : 'blur(4px)',
                                                    transition: '0.2s'
                                                }}>
                                                    {p.license_key}
                                                </code>
                                                <button
                                                    onClick={() => setShowKeys(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                                    style={{ background: 'none', border: 'none', color: '#3366ff', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    {showKeys[idx] ? 'Hide' : 'Show'}
                                                </button>
                                            </div>
                                            {p.changelog && (
                                                <button
                                                    onClick={() => alert(`NOTAS DA VERSÃO v${p.current_version}:\n\n${p.changelog}`)}
                                                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                                                >
                                                    O QUE HÁ DE NOVO?
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: p.status === 'active' ? '#22c55e' : '#ef4444', background: p.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: '4px', marginBottom: '10px', display: 'inline-block' }}>{p.status.toUpperCase()}</span>
                                            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>EXPIRATION</p>
                                            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: p.expires_at ? '#fff' : '#22c55e' }}>
                                                {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : 'LIFETIME'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {(!userProducts || userProducts.length === 0) && (
                                    <div className="card" style={{ padding: '60px', textAlign: 'center', opacity: 0.4 }}>
                                        <p>No products found in your account.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'configs' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                                    {userProducts?.map((p, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => fetchConfigs(p.product_id)}
                                            style={{
                                                padding: '15px',
                                                background: selectedConfigProduct === p.product_id ? 'rgba(51,102,255,0.1)' : 'rgba(255,255,255,0.02)',
                                                border: selectedConfigProduct === p.product_id ? '1px solid #3366ff' : '1px solid rgba(255,255,255,0.05)',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                                {selectedConfigProduct && (
                                    <div className="card" style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                            <h4 style={{ margin: 0 }}>Stored Configs</h4>
                                            <button className="btn-outline" style={{ padding: '5px 15px', fontSize: '0.75rem' }}>NEW CONFIG</button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {configs.map((c, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                                                    <span>{c.config_name}</span>
                                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{new Date(c.updated_at).toLocaleString()}</span>
                                                </div>
                                            ))}
                                            {configs.length === 0 && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>No cloud configs for this product.</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px' }}>Hardware Lock</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {userProducts?.map((p, idx) => (
                                            <div key={idx} className="card" style={{ padding: '24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{p.name}</h3>
                                                    {p.hwid && !isCEO && (
                                                        <button
                                                            onClick={() => handleResetHWID(p.product_id)}
                                                            disabled={resetting === p.product_id}
                                                            className="btn-outline"
                                                            style={{ padding: '8px 20px', fontSize: '0.8rem' }}
                                                        >
                                                            {resetting === p.product_id ? 'WAIT...' : 'RESET HWID'}
                                                        </button>
                                                    )}
                                                </div>
                                                <div style={{
                                                    background: '#0a0a0a',
                                                    padding: '16px',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(255,255,255,0.03)'
                                                }}>
                                                    <code style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', wordBreak: 'break-all' }}>
                                                        {p.hwid || 'No hardware linked yet. Launch the injector to link.'}
                                                    </code>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px' }}>Login History (Sessions)</h3>
                                    <div className="card" style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {history.map((h, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>{h.ip_address}</p>
                                                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{h.hwid || 'N/A'}</p>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{new Date(h.created_at).toLocaleString()}</span>
                                                </div>
                                            ))}
                                            {history.length === 0 && <p style={{ textAlign: 'center', opacity: 0.3 }}>No session records yet.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tickets' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Support Center</h3>
                                    <button className="btn" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>OPEN NEW TICKET</button>
                                </div>
                                <div className="card" style={{ overflow: 'hidden' }}>
                                    {tickets.map((t, i) => (
                                        <div key={i} style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h5 style={{ margin: 0, fontSize: '1rem' }}>{t.subject}</h5>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>Ticket #{t.id} - {new Date(t.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span style={{
                                                fontSize: '0.6rem',
                                                fontWeight: '900',
                                                background: t.status === 'open' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                                                color: t.status === 'open' ? '#22c55e' : 'rgba(255,255,255,0.4)',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                textTransform: 'uppercase'
                                            }}>{t.status}</span>
                                        </div>
                                    ))}
                                    {tickets.length === 0 && <div style={{ padding: '60px', textAlign: 'center', opacity: 0.3 }}>You don't have any support tickets.</div>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default DashboardPage
