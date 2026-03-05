import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LangContext } from '../App'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import API_URL from '../api'

const VerifiedPage = () => {
    const { t } = useContext(LangContext)
    const { user, checkAuth } = useAuth()
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (user) {
            setUsername(user.username || '')
        }
    }, [user])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError(t.nav.tos === 'ToS' ? 'Passwords do not match' : 'As senhas não coincidem')
            return
        }
        if (password.length < 6) {
            setError(t.nav.tos === 'ToS' ? 'Password must be at least 6 characters' : 'A senha deve ter pelo menos 6 caracteres')
            return
        }

        setLoading(true)
        try {
            await axios.post(`${API_URL}/api/auth/finalize`, { username, password }, { withCredentials: true })
            await checkAuth()
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Error finalizing account')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#080c14', color: '#fff' }}>
            <Navbar />

            <div style={{ paddingTop: '140px', paddingBottom: '100px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
                {/* Background Glows */}
                <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

                <div className="glass reveal active" style={{
                    width: '100%',
                    maxWidth: '480px',
                    padding: '3.5rem',
                    borderRadius: '40px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                    backdropFilter: 'blur(30px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            boxShadow: '0 10px 20px rgba(34, 197, 94, 0.1)',
                            transform: 'rotate(-5deg)'
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '950', marginBottom: '0.5rem', letterSpacing: '-1.5px', background: 'linear-gradient(to bottom, #fff, rgba(255,255,255,0.5))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {t.nav.tos === 'ToS' ? 'Verified!' : 'Verificado!'}
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', fontWeight: '500' }}>
                            {t.nav.tos === 'ToS' ? 'Secure your new Zyro account' : 'Proteja sua nova conta Zyro'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: '900', letterSpacing: '2px' }}>
                                {t.nav.tos === 'ToS' ? 'IDENTITY / USERNAME' : 'IDENTIDADE / USUÁRIO'}
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="ex: ZyroUser"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', padding: '16px 20px', color: '#fff', outline: 'none', fontSize: '1rem', transition: '0.3s' }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: '900', letterSpacing: '2px' }}>
                                {t.nav.tos === 'ToS' ? 'CREATE ACCESS KEY' : 'CRIAR CHAVE DE ACESSO'}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', padding: '16px 20px', color: '#fff', outline: 'none', fontSize: '1rem', transition: '0.3s' }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: '900', letterSpacing: '2px' }}>
                                {t.nav.tos === 'ToS' ? 'REPEAT ACCESS KEY' : 'REPETIR CHAVE DE ACESSO'}
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', padding: '16px 20px', color: '#fff', outline: 'none', fontSize: '1rem', transition: '0.3s' }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                            />
                        </div>

                        {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: '800', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', padding: '10px', borderRadius: '10px' }}>{error}</p>}

                        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '20px', borderRadius: '20px', marginTop: '1rem', width: '100%', fontSize: '1.1rem', fontWeight: '950', boxShadow: '0 10px 30px rgba(51, 102, 255, 0.3)' }}>
                            {loading ? (t.nav.tos === 'ToS' ? 'SECURE_SAVING...' : 'PROTEGENDO_CONTA...') : (t.nav.tos === 'ToS' ? 'INITIALIZE SYSTEM' : 'INICIALIZAR SISTEMA')}
                        </button>
                    </form>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default VerifiedPage
