import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { LangContext } from '../App'

const FeatureCard = ({ icon, title, desc, index }) => (
  <div style={{
    opacity: 0,
    animation: 'fadeUp 0.8s ease forwards',
    animationDelay: `${index * 0.1}s`,
    height: '100%'
  }}>
    <div className="card" style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        color: 'var(--color-primary)',
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>{title}</h3>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>{desc}</p>
      </div>
    </div>
  </div>
)

const Features = () => {
  const { t } = useContext(LangContext)

  const icons = [
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ]

  return (
    <section id="features" style={{ padding: '140px 0', background: '#050505' }}>
      <div className="container-lg">

        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: '800',
            color: 'var(--color-primary)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '16px'
          }}>
            ELITE FEATURES
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fff' }}>
            Engineered for Precision
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {t.features.items.map((f, i) => (
            <FeatureCard
              key={i}
              index={i}
              icon={icons[i]}
              title={f.title}
              desc={f.description}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div style={{ marginTop: '100px', textAlign: 'center' }}>
          <div className="card" style={{
            padding: '60px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>Ready to elevate your game?</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>Join over 10,000 players already using Zyro.</p>
            <Link to="/products" className="btn-primary" style={{ padding: '16px 40px' }}>Explore Catalog</Link>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Features
