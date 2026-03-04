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

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        fetchInfo()
        return () => clearInterval(timer)
    }, [])

    const fetchInfo = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/info`, { withCredentials: true })
            setNews(res.data.news || [])
            setSettings(res.data.settings || {})
        } catch (e) { console.error('Error fetching dashboard info', e) }
    }

    const handleResetHWID = async (productId) => {
        if (!confirm('Deseja realmente resetar seu Hardware ID?')) return
        try {
            setResetting(productId)
            await axios.post(`${API_URL}/api/auth/hwid/reset`, { product_id: productId }, { withCredentials: true })
            await checkAuth()
        } catch (err) { } finally { setResetting(null) }
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
                            { id: 'security', label: 'HWID Config' }
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

                                {/* Detailed Ecosystem Stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
                                    {[
                                        { label: 'DISCORD MEMBROS', value: settings.discord_members_count || 0, color: '#5865F2' }
                                    ].map((s, i) => (
                                        <div key={i} className="card" style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                                            <p style={{ fontSize: '0.6rem', fontWeight: '900', color: 'rgba(255,255,255,0.2)', marginBottom: '4px', letterSpacing: '0.1em' }}>{s.label}</p>
                                            <h4 style={{ fontSize: '1.2rem', fontWeight: '950', color: s.color || '#fff' }}>{s.value}</h4>
                                        </div>
                                    ))}
                                </div>

                                {/* News & Platform Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                                    <div className="card" style={{ padding: '30px' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px' }}>Platform Updates</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            {news.length > 0 ? news.map((n, i) => (
                                                <div key={i} style={{ paddingBottom: i !== news.length - 1 ? '20px' : 0, borderBottom: i !== news.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{n.title}</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' }}>{n.description}</p>
                                                </div>
                                            )) : (
                                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.2)' }}>No updates posted yet.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card" style={{ padding: '30px' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px' }}>Live Status</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            {[
                                                { label: 'Users Active', value: settings.stats_active_users || '...' },
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
                                        <a
                                            href={settings.discord_link || 'https://discord.gg/zyrostore'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(51, 102, 255, 0.05)', borderRadius: '6px', border: '1px solid rgba(51, 102, 255, 0.1)', transition: '0.2s', textAlign: 'center' }} className="hover-glow">
                                                <p style={{ fontSize: '0.75rem', color: '#fff', fontWeight: '700' }}>
                                                    JOIN OUR DISCORD COMMUNITY
                                                </p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'licenses' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {userProducts?.map((p, idx) => (
                                    <div key={idx} className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>{p.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    {showKeys[idx] ? 'Hide' : 'Show'}
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
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

                        {activeTab === 'security' && (
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
                                            <code style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>
                                                {p.hwid || 'No hardware linked yet. Launch the injector to link.'}
                                            </code>
                                        </div>
                                    </div>
                                ))}
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
