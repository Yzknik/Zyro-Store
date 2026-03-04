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

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const handleResetHWID = async (productId) => {
        if (!confirm('DESEJA REALMENTE RESETAR SEU HARDWARE ID?')) return
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
    const userRole = user.role || (isCEO ? 'ZYRO OWNER' : isAdmin ? 'CENTRAL STAFF' : 'MEMBRO')

    return (
        <div style={{ minHeight: '100vh', background: '#080c14', color: '#fff' }}>
            <Navbar />

            <style>{`
<<<<<<< HEAD
                @keyframes floatIn { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes shine { 0% { left: -100%; opacity: 0; } 50% { opacity: 0.5; } 100% { left: 100%; opacity: 0; } }
                .dash-reveal { animation: floatIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
                
                .flat-icon-tag {
                    width: 42px; height: 42px; border-radius: 14px;
                    display: flex; items: center; justifyContent: center;
                    position: relative; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer; background: #0f172a;
                    border: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                }
                .flat-icon-tag:hover { transform: scale(1.15) rotate(5deg); }
                
                .icon-ceo { background: linear-gradient(135deg, #ef4444, #7f1d1d); border-color: rgba(239, 68, 68, 0.3); }
                .icon-staff { background: linear-gradient(135deg, #3b82f6, #1e40af); border-color: rgba(59, 130, 246, 0.3); }
                .icon-member { background: linear-gradient(135deg, #334155, #0f172a); }
=======
        /* 1. Animações Refinadas (Spring Physics Style) */
@keyframes floatIn {
    from { transform: translateY(20px) scale(0.98); opacity: 0; filter: blur(4px); }
    to { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
}
>>>>>>> 87a0be7ff716ca8cfc901948834be9ce470c1d0c

@keyframes pulseGlow {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

/* 2. O Ícone (Agora com Glassmorphism) */
.flat-icon-tag {
    width: 54px; height: 54px; 
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    position: relative; 
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); /* Efeito elástico */
    cursor: pointer;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(8px); /* Efeito de vidro */
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.flat-icon-tag:hover {
    transform: scale(1.1) translateY(-5px) rotate(-3deg);
    border-color: rgba(255, 255, 255, 0.3);
}

/* 3. Cores de Status (Gradientes Vibrantes) */
.icon-ceo { background: linear-gradient(135deg, #ff416c, #ff4b2b); }
.icon-staff { background: linear-gradient(135deg, #00c6ff, #0072ff); }
.icon-member { background: linear-gradient(135deg, #434343, #000000); }

/* 4. Navegação (Menu com Visual Clean) */
.nav-item {
    padding: 12px 20px;
    border-radius: 12px;
    cursor: pointer;
    transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 600;
    font-size: 0.9rem;
    color: #94a3b8;
    display: flex; align-items: center; gap: 10px;
}

.nav-item.active {
    background: rgba(59, 130, 246, 0.1);
    color: #60a5fa;
    box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.nav-item:hover:not(.active) {
    background: rgba(255, 255, 255, 0.05);
    color: #f8fafc;
    transform: translateX(5px);
}

/* 5. Tooltip Elegante */
.tooltip {
    position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%) scale(0.8);
    background: #ffffff; color: #0f172a; 
    padding: 8px 16px; border-radius: 8px;
    font-size: 0.75rem; font-weight: 700;
    opacity: 0; pointer-events: none; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
}

.flat-icon-tag:hover .tooltip {
    opacity: 1; transform: translateX(-50%) scale(1);
}

/* 6. Card de Produto (Premium Dark) */
.product-card {
    background: linear-gradient(165deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.5));
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 2rem;
    transition: 0.5s;
    overflow: hidden;
    position: relative;
}

.product-card::before { /* Efeito de luz no topo do card */
    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
}

.product-card:hover {
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}
            `}</style>

            <div style={{ paddingTop: '120px', paddingBottom: '100px', width: '90%', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '3.5rem' }}>

                    {/* --- LEFT SIDEBAR --- */}
                    <div className="dash-reveal" style={{ animationDelay: '0.1s' }}>
                        <div className="glass" style={{ padding: '4rem 2rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.03)', textAlign: 'center', marginBottom: '2.5rem', position: 'relative', background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }}>
                            <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 2rem' }}>
                                <img src={user.avatar} style={{ width: '100%', height: '100%', borderRadius: '50px', border: '2px solid rgba(255,255,255,0.05)', padding: '10px', position: 'relative', zIndex: 1, objectFit: 'cover' }} alt="" />
                                <div style={{ position: 'absolute', bottom: '0px', right: '0px', zIndex: 2 }}>
                                    <div className={`flat-icon-tag ${isCEO ? 'icon-ceo' : isAdmin ? 'icon-staff' : 'icon-member'}`}>
                                        {isCEO ? (
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                                        ) : isAdmin ? (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                        ) : (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        )}
                                        <div className="tooltip">{userRole.toUpperCase()}</div>
                                    </div>
                                </div>
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: '950', marginBottom: '0.6rem', letterSpacing: '-1px' }}>{user.username}</h2>
                            <p style={{ fontSize: '0.7rem', fontWeight: '950', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '3px', opacity: 0.6 }}>ACESSO VERIFICADO</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div onClick={() => setActiveTab('overview')} className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}>CENTRAL DE COMANDO</div>
                            <div onClick={() => setActiveTab('licenses')} className={`nav-item ${activeTab === 'licenses' ? 'active' : ''}`}>MEUS SOFTWARES</div>
                            <div onClick={() => setActiveTab('security')} className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}>SEGURANÇA HWID</div>
                            {isAdmin && <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}><div className="nav-item" style={{ color: '#ef4444', marginTop: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', textAlign: 'center' }}>PAINEL ADMINISTRATIVO</div></Link>}
                        </div>
                    </div>

                    {/* --- MAIN CONTENT --- */}
                    <div className="dash-reveal" style={{ animationDelay: '0.3s' }}>
                        {activeTab === 'overview' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                <div className="glass" style={{ padding: '4rem', borderRadius: '50px', background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, transparent 100%)', border: '1px solid rgba(59,130,246,0.15)', position: 'relative', overflow: 'hidden' }}>
                                    <h1 style={{ fontSize: '3.2rem', fontWeight: '950', marginBottom: '1.2rem', letterSpacing: '-2px', lineHeight: 1.1 }}>
                                        {currentTime.getHours() < 12 ? 'Bom dia' : currentTime.getHours() < 18 ? 'Boa tarde' : 'Boa noite'},<br />{user.username.split(/[#_]/)[0]}!
                                    </h1>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem', maxWidth: '600px', lineHeight: '1.6', fontWeight: '600' }}>
                                        Seu ecossistema Zyro está operacional. Gerencie suas licenças e hardware com total autonomia.
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                    {[
                                        { label: 'KEYS ATIVAS', val: userProducts?.length || 0, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3-3.5 3.5z" /></svg>, color: '#3b82f6' },
                                        { label: 'NÍVEL DE ACESSO', val: userRole, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, color: '#22c55e' },
                                        { label: 'HORÁRIO LOCAL', val: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>, color: '#ef4444' }
                                    ].map((card, i) => (
                                        <div key={i} className="glass" style={{ padding: '2.5rem', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.02)' }}>
                                            <div style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: `1px solid ${card.color}22` }}>
                                                {card.icon}
                                            </div>
                                            <p style={{ fontSize: '0.65rem', fontWeight: '950', color: 'rgba(255,255,255,0.3)', marginBottom: '0.6rem', letterSpacing: '2px' }}>{card.label}</p>
                                            <h3 style={{ fontSize: '1.4rem', fontWeight: '950', color: '#fff' }}>{card.val}</h3>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'licenses' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {userProducts?.map((p, idx) => (
                                    <div key={idx} className="product-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: `scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.1}s both` }}>
                                        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                                            <div style={{ width: '70px', height: '70px', borderRadius: '24px', background: 'rgba(59, 130, 246, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.1)' }}>
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: '950', marginBottom: '10px', letterSpacing: '-0.5px' }}>{p.name.toUpperCase()}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <code style={{ fontSize: '0.9rem', color: '#3b82f6', opacity: showKeys[idx] ? 1 : 0.1, filter: showKeys[idx] ? 'none' : 'blur(6px)', transition: '0.4s', fontFamily: '"JetBrains Mono", monospace', fontWeight: '800' }}>{p.license_key}</code>
                                                    </div>
                                                    <button onClick={() => setShowKeys(prev => ({ ...prev, [idx]: !prev[idx] }))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: '950', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}>{showKeys[idx] ? 'Ocultar' : 'Revelar'}</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                            {!isCEO && (
                                                <button onClick={() => handleToggleStatus(p.id)} style={{ padding: '15px 35px', borderRadius: '20px', background: p.status === 'active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', border: `1px solid ${p.status === 'active' ? '#ef444455' : '#22c55e55'}`, color: p.status === 'active' ? '#ef4444' : '#22c55e', fontSize: '0.8rem', fontWeight: '950', cursor: 'pointer', transition: '0.3s' }}>
                                                    {p.status === 'active' ? 'PAUSAR ACESSO' : 'ATIVAR ACESSO'}
                                                </button>
                                            )}
                                            <div style={{ textAlign: 'right', minWidth: '140px' }}>
                                                <p style={{ fontSize: '0.6rem', fontWeight: '950', color: 'rgba(255,255,255,0.2)', marginBottom: '5px', letterSpacing: '2px' }}>VENCIMENTO</p>
                                                <p style={{ fontSize: '1.1rem', fontWeight: '950', color: p.expires_at ? '#fff' : '#22c55e' }}>{p.expires_at ? new Date(p.expires_at).toLocaleDateString() : 'VITALÍCIO'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!userProducts || userProducts.length === 0) && (
                                    <div className="glass" style={{ padding: '5rem', borderRadius: '50px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                        <h3 style={{ opacity: 0.2, fontWeight: '950', fontSize: '1.5rem' }}>Nenhum software vinculado.</h3>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {userProducts?.map((p, idx) => (
                                    <div key={idx} className="glass" style={{ padding: '3rem', borderRadius: '45px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: p.hwid ? '#22c55e' : 'rgba(255,255,255,0.05)', boxShadow: p.hwid ? '0 0 10px #22c55e' : 'none' }} />
                                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '950', letterSpacing: '-0.5px' }}>{p.name.toUpperCase()}</h3>
                                                </div>
                                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)', maxWidth: '90%' }}>
                                                    <code style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontFamily: '"JetBrains Mono", monospace' }}>{p.hwid || 'Aguardando primeiro login no launcher...'}</code>
                                                </div>
                                            </div>
                                            {p.hwid && !isCEO && (
                                                <button onClick={() => handleResetHWID(p.product_id)} disabled={resetting === p.product_id} style={{ background: '#fff', color: '#000', border: 'none', padding: '20px 40px', borderRadius: '22px', fontWeight: '950', fontSize: '0.9rem', cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 30px rgba(255,255,255,0.1)' }}>
                                                    {resetting === p.product_id ? 'PROCESSANDO...' : 'RESETAR HWID'}
                                                </button>
                                            )}
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
