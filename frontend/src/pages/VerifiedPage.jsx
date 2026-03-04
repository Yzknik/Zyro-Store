import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LangContext } from '../App'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

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
            await axios.post('http://localhost:5000/api/auth/finalize', { username, password }, { withCredentials: true })
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

            <div style={{ paddingTop: '140px', paddingBottom: '100px', display: 'flex', justifyContent: 'center' }}>
                <div className="glass reveal active" style={{ width: '100%', maxWidth: '450px', padding: '3rem', borderRadius: '30px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ width: '70px', height: '70px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '950', marginBottom: '0.5rem' }}>
                            {t.nav.tos === 'ToS' ? 'Verified!' : 'Verificado!'}
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>
                            {t.nav.tos === 'ToS' ? 'Complete your profile setup' : 'Complete a configuração do seu perfil'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                                {t.nav.tos === 'ToS' ? 'CHOOSE USERNAME' : 'ESCOLHA UM USUÁRIO'}
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Username"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: '#fff', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                                {t.nav.tos === 'ToS' ? 'CREATE PASSWORD' : 'CRIAR SENHA'}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: '#fff', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                                {t.nav.tos === 'ToS' ? 'CONFIRM PASSWORD' : 'CONFIRMAR SENHA'}
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: '#fff', outline: 'none' }}
                            />
                        </div>

                        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>{error}</p>}

                        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '15px', borderRadius: '12px', marginTop: '0.5rem', width: '100%', fontSize: '1rem' }}>
                            {loading ? (t.nav.tos === 'ToS' ? 'SAVING...' : 'SALVANDO...') : (t.nav.tos === 'ToS' ? 'ENTER DASHBOARD' : 'ENTRAR NO PAINEL')}
                        </button>
                    </form>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default VerifiedPage
