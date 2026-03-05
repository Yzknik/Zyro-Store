import { useState, createContext, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProductsPage from './pages/ProductsPage'
import TosPage from './pages/TosPage'
import VerifiedPage from './pages/VerifiedPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import ResellerPage from './pages/ResellerPage'
import ErrorPage from './pages/ErrorPage'
import { translations } from './i18n'
import { AuthProvider } from './context/AuthContext'

export const LangContext = createContext({ lang: 'pt', t: translations.pt })

/* ── Custom Cursor ── */
const CustomCursor = () => {
  const cursorRef = useRef(null)
  const [active, setActive] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const moveCursor = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`
        cursorRef.current.style.top = `${e.clientY}px`
      }
    }
    const handleInteract = (e) => {
      const target = e.target.closest('button, a, .tag, input, .card, select, textarea')
      setActive(!!target)
    }
    const handleLeave = () => setHidden(true)
    const handleEnter = () => setHidden(false)

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', handleInteract)
    document.addEventListener('mouseleave', handleLeave)
    document.addEventListener('mouseenter', handleEnter)
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', handleInteract)
      document.removeEventListener('mouseleave', handleLeave)
      document.removeEventListener('mouseenter', handleEnter)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      id="custom-cursor"
      className={`${active ? 'active' : ''} ${hidden ? 'hidden' : ''}`}
    />
  )
}

/* ── Mouse Spotlight ── */
const MouseSpotlight = () => {
  const lightRef = useRef(null)
  useEffect(() => {
    const moveLight = (e) => {
      if (lightRef.current) {
        lightRef.current.style.background = `radial-gradient(800px circle at ${e.clientX}px ${e.clientY}px, rgba(51, 102, 255, 0.04), transparent 80%)`
      }
    }
    window.addEventListener('mousemove', moveLight)
    return () => window.removeEventListener('mousemove', moveLight)
  }, [])
  return <div ref={lightRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }} />
}

/* ── Scroll Reveal Observer ── */
const ScrollReveal = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
        }
      })
    }, { threshold: 0.1 })

    const elements = document.querySelectorAll('.reveal')
    elements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [pathname])
  return null
}

const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  const [lang, setLang] = useState('pt')
  const t = translations[lang]

  return (
    <AuthProvider>
      <LangContext.Provider value={{ lang, setLang, t }}>
        <BrowserRouter>
          <ScrollToTop />
          <ScrollReveal />
          <CustomCursor />
          <MouseSpotlight />
          <div style={{ background: '#080c14', minHeight: '100vh', position: 'relative' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/tos" element={<TosPage />} />
              <Route path="/verified" element={<VerifiedPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/reseller" element={<ResellerPage />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </LangContext.Provider>
    </AuthProvider>
  )
}

export default App
