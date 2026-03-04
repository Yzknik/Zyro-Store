import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { LangContext } from '../App'

const Footer = () => {
  const { t } = useContext(LangContext)

  return (
    <footer style={{ borderTop: '1px solid rgba(59,130,246,0.1)', background: '#080c14' }}>
      <div className="container-lg" style={{ padding: '3rem 1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>

          {/* Brand */}
          <div>
            <img src="/zyrologo.png" alt="Zyro" style={{ height: '30px', width: 'auto', objectFit: 'contain', marginBottom: '0.85rem' }} />
            <p style={{ fontSize: '0.85rem', color: 'rgba(148,163,184,0.55)', lineHeight: '1.7', maxWidth: '230px' }}>
              {t.footer.tagline}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
              {/* Discord */}
              <a href="https://discord.gg" target="_blank" rel="noreferrer" style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(88,101,242,0.15)', border: '1px solid rgba(88,101,242,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#818cf8', textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(88,101,242,0.3)'; e.currentTarget.style.borderColor = 'rgba(88,101,242,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(88,101,242,0.15)'; e.currentTarget.style.borderColor = 'rgba(88,101,242,0.25)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z" /></svg>
              </a>
              {/* Twitter/X */}
              <a href="#" style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(148,163,184,0.6)', textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
              {t.footer.quickLinks}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {[
                { href: '#features', label: t.footer.links.features },
                { href: '#products', label: t.footer.links.products },
                { href: '#faq', label: t.footer.links.tos },
                { href: 'https://discord.gg', label: t.footer.links.discord },
              ].map(link => (
                <li key={link.href}>
                  <a href={link.href} style={{
                    fontSize: '0.875rem', color: 'rgba(148,163,184,0.55)',
                    textDecoration: 'none', transition: 'color 0.2s',
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.55)'}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><polyline points="9 18 15 12 9 6" /></svg>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
              {t.footer.support}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {[
                { href: '#faq', label: t.footer.links.faq },
                { href: '#', label: t.footer.links.contact },
                { href: '#', label: t.footer.links.tos },
              ].map(link => (
                <li key={link.label}>
                  <a href={link.href} style={{
                    fontSize: '0.875rem', color: 'rgba(148,163,184,0.55)',
                    textDecoration: 'none', transition: 'color 0.2s',
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.55)'}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><polyline points="9 18 15 12 9 6" /></svg>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Status badge */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
              Status
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', marginBottom: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'block', boxShadow: '0 0 6px #10b981' }} />
              <span style={{ fontSize: '0.83rem', color: '#34d399', fontWeight: '600' }}>All systems operational</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(148,163,184,0.4)' }}>Uptime: 99.9%</div>
          </div>
        </div>

        {/* Bottom */}
        <div className="divider" style={{ marginBottom: '1.5rem' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'rgba(148,163,184,0.35)' }}>{t.footer.rights}</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[t.footer.links.tos, t.footer.links.contact].map(label => (
              <a key={label} href="#" style={{ fontSize: '0.8rem', color: 'rgba(148,163,184,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#60a5fa'}
                onMouseLeave={e => e.target.style.color = 'rgba(148,163,184,0.35)'}
              >{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
