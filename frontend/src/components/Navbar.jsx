import { useState, useEffect, useContext, useRef } from 'react'
import { Link } from 'react-router-dom'
import { LangContext } from '../App'
import { useAuth } from '../context/AuthContext'

const Navbar = ({ isMenuOpen, setIsMenuOpen }) => {
  const [scrolled, setScrolled] = useState(false)
  const [hoveredLink, setHoveredLink] = useState(null)
  const { lang, setLang, t } = useContext(LangContext)
  const { user, isAdmin, loginWithDiscord, logout } = useAuth()
  const menuRef = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const navLinks = [
    { label: t.nav.features, href: '/#features' },
    { label: t.nav.products, href: '/products', type: 'link' },
    { label: t.nav.tos, href: '/tos', type: 'link' },
    ...(isAdmin ? [{ label: 'ADMIN', href: '/admin', type: 'link' }] : [])
  ]

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '70px', display: 'flex', alignItems: 'center',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        background: scrolled ? 'rgba(8, 12, 20, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(59, 130, 246, 0.15)' : '1px solid transparent',
        padding: '0 1.5rem'
      }}>
        <div className="container-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/zyrologo.png"
              alt="Zyro"
              style={{
                height: scrolled ? '32px' : '38px',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </Link>

          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            {navLinks.map((link, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {link.type === 'link' ? (
                  <Link
                    to={link.href}
                    onMouseEnter={() => setHoveredLink(i)}
                    onMouseLeave={() => setHoveredLink(null)}
                    style={{ color: hoveredLink === i ? '#fff' : 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', transition: '0.3s' }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    onMouseEnter={() => setHoveredLink(i)}
                    onMouseLeave={() => setHoveredLink(null)}
                    style={{ color: hoveredLink === i ? '#fff' : 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', transition: '0.3s' }}
                  >
                    {link.label}
                  </a>
                )}
                <div style={{
                  position: 'absolute', bottom: '-4px', left: 0,
                  height: '2px', background: '#3b82f6',
                  width: hoveredLink === i ? '100%' : '0%',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            ))}
          </div>

          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button key="lang" onClick={() => setLang(lang === 'en' ? 'pt' : 'en')} className="btn-ghost" style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}>
              {lang.toUpperCase()}
            </button>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={user.avatar} alt={user.username} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(59,130,246,0.5)' }} />
                    {isAdmin && (
                      <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '10px', height: '10px', background: user.discord_id === '1249488594414997676' ? '#f87171' : '#22c55e', borderRadius: '50%', border: '2px solid #080c14' }} title={user.discord_id === '1249488594414997676' ? 'CEO' : 'ADMIN'} />
                    )}
                  </div>
                  <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '800' }}>{user.username}</span>
                </Link>
                <button onClick={logout} className="btn-ghost" style={{ padding: '6px', opacity: 0.6 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary"
                style={{
                  padding: '8px 25px',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" /></svg>
                LOGIN
              </Link>
            )}
          </div>

          <button className="hide-desktop" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <div
        ref={menuRef}
        style={{
          position: 'fixed', top: 0, right: isMenuOpen ? 0 : '-100%',
          width: '100%', height: '100vh',
          background: 'rgba(8, 12, 20, 0.98)', backdropFilter: 'blur(30px)',
          transition: 'right 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', padding: '100px 2rem 2rem', gap: '2rem',
          zIndex: 1000
        }}
      >
        <button onClick={() => setIsMenuOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>

        {navLinks.map((link, i) => (
          <div key={i}>
            <Link to={link.href} onClick={() => setIsMenuOpen(false)} style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '900', textDecoration: 'none' }}>{link.label}</Link>
          </div>
        ))}

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#fff' }}>
              <img src={user.avatar} style={{ width: '40px', borderRadius: '50%' }} />
              <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{user.username}</span>
            </div>
          ) : (
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn-primary" style={{ padding: '20px', fontSize: '1.2rem', textDecoration: 'none', textAlign: 'center' }}>LOGIN</Link>
          )}
          <button onClick={() => setLang(lang === 'en' ? 'pt' : 'en')} className="btn-ghost" style={{ padding: '20px', fontSize: '1.2rem' }}>LANGUAGE: {lang.toUpperCase()}</button>
        </div>
      </div>
    </>
  )
}

export default Navbar
