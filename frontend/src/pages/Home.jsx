import { useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Showcase from '../components/Showcase'
import Stats from '../components/Stats'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dark text-white overflow-x-hidden">
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <Hero />
      <Features />
      <Showcase />
      <Stats />
      <FAQ />
      <Footer />
    </div>
  )
}

export default Home
