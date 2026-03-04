import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { LangContext } from '../App'

const Footer = () => {
  const { t } = useContext(LangContext)

  return (
    <footer style={{
      background: '#050505',
      paddingTop: '80px',
      paddingBottom: '40px',
      borderTop: '1px solid rgba(255,255,255,0.03)'
    }}>
      <div className="container-lg">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '60px'
        }}>
          {/* Brand */}
          <div style={{ maxWidth: '300px' }}>
            <img src="/zyrologo.png" alt="Zyro" style={{ height: '26px', marginBottom: '20px', opacity: 0.6 }} />
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
              {t.footer.tagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Product
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/products" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem', transition: '0.2s' }}>All Softwares</Link></li>
              <li><a href="https://discord.gg/zyrostore" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem' }}>Discord Community</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Support
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/tos" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem' }}>Terms of Service</Link></li>
              <li><Link to="/contact" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem' }}>Contact Support</Link></li>
            </ul>
          </div>

          {/* Status */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: '600' }}>SYSTEMS ONLINE</span>
            </div>
          </div>
        </div>

        <div style={{
          paddingTop: '30px',
          borderTop: '1px solid rgba(255,255,255,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} ZYRO STORE. ALL RIGHTS RESERVED.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Simple social icons or links can go here */}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
