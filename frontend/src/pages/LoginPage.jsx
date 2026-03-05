import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LangContext } from '../App'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const LoginPage = () => {
    const { loginWithDiscord, user, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        // Se já estiver logado, vai pro dashboard
        if (!loading && user) {
            navigate('/dashboard')
        }
    }, [user, loading, navigate])

    return (
        <div style={{ minHeight: '100vh', background: '#080c14', color: '#fff' }}>
            <Navbar />

            <div style={{ paddingTop: '160px', paddingBottom: '120px', display: 'flex', justifyContent: 'center', paddingLeft: '20px', paddingRight: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(88, 101, 242, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

                <div className="glass reveal active" style={{
                    width: '100%',
                    maxWidth: '480px',
                    padding: '4rem 3.5rem',
                    borderRadius: '45px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                    backdropFilter: 'blur(30px)',
                    boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.8)'
                }}>
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{
                            width: '90px',
                            height: '90px',
                            background: 'rgba(88, 101, 242, 0.1)',
                            borderRadius: '26px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.8rem',
                            border: '1px solid rgba(88, 101, 242, 0.2)',
                            boxShadow: '0 15px 30px rgba(88, 101, 242, 0.15)',
                            transform: 'rotate(8deg)'
                        }}>
                            <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="#5865F2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                        </div>
                        <h1 style={{ fontSize: '2.8rem', fontWeight: '1000', marginBottom: '1rem', letterSpacing: '-2px', background: 'linear-gradient(to bottom, #fff, rgba(255,255,255,0.5))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Área de Membros
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.05rem', lineHeight: '1.6', fontWeight: '500' }}>
                            Utilizamos o protocolo OAuth2 do Discord para garantir acesso criptografado à sua conta.
                        </p>
                    </div>

                    <button
                        onClick={loginWithDiscord}
                        className="btn-primary hover-glow"
                        style={{
                            width: '100%',
                            background: '#5865F2',
                            color: '#fff',
                            border: 'none',
                            padding: '22px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px',
                            fontWeight: '950',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            fontSize: '1.2rem',
                            boxShadow: '0 12px 25px rgba(88, 101, 242, 0.4)',
                            transform: 'translateY(0)'
                        }}
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" /></svg>
                        AUTENTICAR VIA DISCORD
                    </button>

                    <p style={{ marginTop: '2.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.2)', fontWeight: '700', letterSpacing: '1px' }}>
                        PROTECTED BY ZYRO AUTH SYSTEM
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default LoginPage
