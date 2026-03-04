import { useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Stats from '../components/Stats'
import Features from '../components/Features'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

const HomePage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#e2e8f0', overflowX: 'hidden' }}>
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <main>
                <Hero />
                <Stats />
                <div style={{ position: 'relative', zIndex: 10, background: '#050505' }}>
                    <Features />
                    <FAQ />
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default HomePage
