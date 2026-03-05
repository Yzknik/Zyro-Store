import { useState, useContext, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LangContext } from '../App'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogOut, Globe, Shield, User, LayoutDashboard, Store, Zap } from 'lucide-react'

const Navbar = () => {
  const { lang, setLang, t } = useContext(LangContext)
  const { user, isAdmin, role, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: t.nav.features, href: '/#features', icon: <Zap size={14} /> },
    { label: t.nav.products, href: '/products', icon: <Store size={14} /> },
    { label: t.nav.community || 'COMMUNITY', href: 'https://discord.gg/zyrogg', external: true },
    ...(isAdmin ? [{ label: t.nav.admin || 'ADMIN', href: '/admin', icon: <Shield size={14} /> }] : []),
    ...(user && (role?.toUpperCase() === 'RESELLER' || isAdmin || user.discord_id === '1249488594414997676') ? [{ label: t.nav.reseller || 'RESELLER', href: '/reseller', icon: <Zap size={14} /> }] : [])
  ]

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: isScrolled ? '70px' : '90px',
        display: 'flex', alignItems: 'center',
        background: isScrolled ? 'rgba(5, 5, 5, 0.7)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent',
        transition: 'all 0.4s var(--curve)',
        padding: '0 40px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.opacity = '0.8'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
            <img src="/zyrologo.png" alt="Zyro" style={{ height: '28px' }} />
          </Link>

          {/* Desktop Nav */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {navLinks.map((link, i) => (
              <div key={i}>
                {link.external ? (
                  <a href={link.href} target="_blank" rel="noreferrer" style={{
                    color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '800', transition: '0.3s', letterSpacing: '2px'
                  }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                    {link.label.toUpperCase()}
                  </a>
                ) : (
                  <Link to={link.href} style={{
                    color: location.pathname === link.href ? '#fff' : 'rgba(255,255,255,0.4)',
                    textDecoration: 'none', fontSize: '0.75rem', fontWeight: '800', transition: '0.3s', letterSpacing: '2px',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => { if (location.pathname !== link.href) e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}>
                    {link.icon}
                    {link.label.toUpperCase()}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => setLang(lang === 'en' ? 'pt' : 'en')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.65rem', fontWeight: '900', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={12} />
              {lang.toUpperCase()}
            </button>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link to="/dashboard" style={{
                  display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none',
                  padding: '6px 16px', borderRadius: '12px', background: 'rgba(51, 102, 255, 0.08)',
                  border: '1px solid rgba(51, 102, 255, 0.2)', transition: '0.3s'
                }}>
                  <div style={{ position: 'relative' }}>
                    <img src={user.avatar} alt={user.username} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid rgba(51, 102, 255, 0.3)' }} />
                    <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', border: '2px solid #050505' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: '900' }}>{user.username.toUpperCase()}</span>
                    <span style={{ fontSize: '0.55rem', fontWeight: '950', color: role?.toUpperCase() === 'OWNER' ? '#ff4b2b' : (role?.toUpperCase() === 'RESELLER' ? '#22c55e' : '#3366ff'), letterSpacing: '0.5px' }}>{role?.toUpperCase()}</span>
                  </div>
                </Link>
                <button onClick={logout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.color = '#ef4444'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-premium btn-primary-gradient" style={{ padding: '10px 24px', fontSize: '0.65rem', textDecoration: 'none' }}>
                SIGN IN
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="hide-desktop" onClick={() => setIsMenuOpen(true)} style={{ background: 'none', border: 'none', color: '#fff' }}>
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, right: 0, width: '100%', height: '100vh',
              background: '#050505', zIndex: 2000, padding: '100px 40px',
              display: 'flex', flexDirection: 'column', gap: '40px'
            }}
          >
            <button onClick={() => setIsMenuOpen(false)} style={{ position: 'absolute', top: '30px', right: '40px', background: 'none', border: 'none', color: '#fff' }}>
              <X size={32} />
            </button>

            {navLinks.map((link, i) => (
              <Link key={i} to={link.href} onClick={() => setIsMenuOpen(false)} style={{
                color: '#fff', fontSize: '2.5rem', fontWeight: '900', textDecoration: 'none', letterSpacing: '-2px',
                display: 'flex', alignItems: 'center', gap: '20px'
              }}>
                {link.icon && <span style={{ opacity: 0.3 }}>{link.icon}</span>}
                {link.label}
              </Link>
            ))}

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {user ? (
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="glass" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none' }}>
                  <img src={user.avatar} style={{ width: '50px', height: '50px', borderRadius: '50%' }} alt="" />
                  <div>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>{user.username}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#3366ff', fontWeight: '800' }}>GO TO DASHBOARD</p>
                  </div>
                </Link>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn-premium btn-primary-gradient" style={{ padding: '24px', textAlign: 'center', textDecoration: 'none', fontSize: '1rem' }}>SIGN IN NOW</Link>
              )}
              <button onClick={() => { setLang(lang === 'en' ? 'pt' : 'en'); setIsMenuOpen(false); }} className="glass" style={{ padding: '20px', color: '#fff', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '900', fontSize: '0.8rem' }}>
                SET LANGUAGE: {lang.toUpperCase()}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
