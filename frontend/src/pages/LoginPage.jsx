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

            <div style={{ paddingTop: '140px', paddingBottom: '100px', display: 'flex', justifyContent: 'center', paddingLeft: '20px', paddingRight: '20px' }}>
                <div className="glass reveal active" style={{ width: '100%', maxWidth: '450px', padding: '3.5rem 3rem', borderRadius: '35px', border: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '950', marginBottom: '0.8rem', letterSpacing: '-0.02em' }}>Área de Membros</h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: '1.5' }}>
                            Utilizamos o Discord para garantir o acesso seguro à sua conta Zyro.
                        </p>
                    </div>

                    <button
                        onClick={loginWithDiscord}
                        className="btn-primary hover-glow"
                        style={{
                            width: '100%', background: '#5865F2', color: '#fff', border: 'none', padding: '18px', borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontWeight: '900', cursor: 'pointer',
                            transition: 'all 0.3s ease', fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(88, 101, 242, 0.2)'
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" /></svg>
                        ACESSAR COM DISCORD
                    </button>

                    <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>
                        Ao continuar você concorda com nossos Termos de Serviço.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default LoginPage
