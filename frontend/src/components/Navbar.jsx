import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { LangContext } from '../App'
import { useAuth } from '../context/AuthContext'

const Navbar = ({ isMenuOpen, setIsMenuOpen }) => {
  const { lang, setLang, t } = useContext(LangContext)
  const { user, isAdmin, logout } = useAuth()
  const [hoveredLink, setHoveredLink] = useState(null)

  const navLinks = [
    { label: t.nav.features, href: '/#features' },
    { label: t.nav.products, href: '/products', type: 'link' },
    { label: 'COMMUNITY', href: 'https://discord.gg/zyrogg' },
    { label: t.nav.tos, href: '/tos', type: 'link' },
    ...(isAdmin ? [{ label: 'ADMIN', href: '/admin', type: 'link' }] : []),
    ...(user && (user.role === 'reseller' || user.role === 'admin' || user.discord_id === '1249488594414997676') ? [{ label: 'RESELLER', href: '/reseller', type: 'link' }] : [])
  ]

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '70px', display: 'flex', alignItems: 'center',
        background: 'rgba(5, 5, 5, 0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
        padding: '0 2rem'
      }}>
        <div className="container-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 0 }}>

          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/zyrologo.png" alt="Zyro" style={{ height: '26px' }} />
          </Link>

          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            {navLinks.map((link, i) => (
              <div key={i}>
                {link.type === 'link' ? (
                  <Link
                    to={link.href}
                    onMouseEnter={() => setHoveredLink(i)}
                    onMouseLeave={() => setHoveredLink(null)}
                    style={{
                      color: hoveredLink === i ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      transition: '0.2s',
                      letterSpacing: '0.1em'
                    }}
                  >
                    {link.label.toUpperCase()}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    onMouseEnter={() => setHoveredLink(i)}
                    onMouseLeave={() => setHoveredLink(null)}
                    style={{
                      color: hoveredLink === i ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      transition: '0.2s',
                      letterSpacing: '0.1em'
                    }}
                  >
                    {link.label.toUpperCase()}
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => setLang(lang === 'en' ? 'pt' : 'en')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', fontWeight: '800', cursor: 'none', padding: '10px' }}>
              {lang.toUpperCase()}
            </button>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                  <img src={user.avatar} alt={user.username} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)' }} />
                  <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '700' }}>{user.username.toUpperCase()}</span>
                </Link>
                <button onClick={logout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.7rem' }}>
                LOGIN
              </Link>
            )}
          </div>

          <button className="hide-desktop" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', color: '#fff' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <div
        style={{
          position: 'fixed', top: 0, right: isMenuOpen ? 0 : '-100%',
          width: '100%', height: '100vh',
          background: '#050505',
          transition: 'all 0.6s var(--curve)',
          display: 'flex', flexDirection: 'column', padding: '100px 2rem 2rem', gap: '1.5rem',
          zIndex: 1000
        }}
      >
        <button onClick={() => setIsMenuOpen(false)} style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', color: '#fff' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>

        {navLinks.map((link, i) => (
          <Link key={i} to={link.href} onClick={() => setIsMenuOpen(false)} style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', textDecoration: 'none', letterSpacing: '-0.02em' }}>{link.label}</Link>
        ))}

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', padding: '20px 0' }}>
              <img src={user.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{user.username.toUpperCase()}</span>
            </div>
          ) : (
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn-primary" style={{ padding: '20px', textAlign: 'center' }}>LOGIN</Link>
          )}
          <button onClick={() => setLang(lang === 'en' ? 'pt' : 'en')} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: '#fff', padding: '20px', borderRadius: '4px', fontWeight: '700' }}>LANGUAGE: {lang.toUpperCase()}</button>
        </div>
      </div>
    </>
  )
}

export default Navbar
