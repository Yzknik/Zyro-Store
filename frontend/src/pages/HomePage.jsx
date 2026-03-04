import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

/* ── Live Activity Ticker ── */
const LiveActivity = () => {
    const [activity, setActivity] = useState({ user: 'Lu***', product: 'FiveM External', time: '2m' })
    const products = ['FiveM External', 'CS2 External', 'Zyro Spoofer', 'Bypass Private']
    const names = ['Ma***', 'Ga***', 'Fe***', 'Ri***', 'Jo***', 'An***']

    useEffect(() => {
        const interval = setInterval(() => {
            setActivity({
                user: names[Math.floor(Math.random() * names.length)],
                product: products[Math.floor(Math.random() * products.length)],
                time: Math.floor(Math.random() * 5) + 'm'
            })
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{
            position: 'fixed', bottom: '30px', left: '30px', zIndex: 50,
            background: 'rgba(15, 23, 41, 0.8)', border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px', padding: '12px 20px', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', gap: '15px',
            animation: 'fadeUp 0.5s ease both',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }} className="hide-mobile">
            <div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }} />
            <div style={{ fontSize: '0.85rem' }}>
                <span style={{ fontWeight: '800', color: '#fff' }}>{activity.user}</span> acaba de adquirir <span style={{ fontWeight: '800', color: '#3b82f6' }}>{activity.product}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>{activity.time} atrás</div>
        </div>
    )
}

const HomePage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <div style={{ minHeight: '100vh', background: '#080c14', color: '#e2e8f0', overflowX: 'hidden' }}>
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <main>
                <Hero />
                <div style={{ position: 'relative', zIndex: 10, background: '#080c14' }}>
                    <Features />
                    <FAQ />
                </div>
            </main>
            <Footer />
            <LiveActivity />
        </div>
    )
}

export default HomePage
