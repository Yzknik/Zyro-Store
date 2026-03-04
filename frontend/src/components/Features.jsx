import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { LangContext } from '../App'

const FeatureCard = ({ icon, title, desc, color, index }) => (
  <div
    className="reveal"
    style={{
      transitionDelay: `${index * 100}ms`,
      height: '100%'
    }}
  >
    <div className="card-product glass-blue hover-glow" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${color}30`,
        color: color,
        boxShadow: `0 0 20px ${color}10`
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '0.75rem' }}>{title}</h3>
        <p style={{ fontSize: '0.95rem', color: 'rgba(148, 163, 184, 0.7)', lineHeight: '1.6' }}>{desc}</p>
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

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

  return (
    <section id="features" style={{ padding: '100px 0', background: '#080c14', position: 'relative' }}>
      <div className="container-lg">

        <div style={{ textAlign: 'center', marginBottom: '5rem' }} className="reveal">
          <span className="badge badge-blue" style={{ marginBottom: '1rem' }}>Recursos de Elite</span>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '900', color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Por que escolher a <span className="glow-text">Zyro</span> ?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(148, 163, 184, 0.6)', maxWidth: '600px', margin: '0 auto' }}>
            Trabalhamos duro para oferecer a melhor experiência, com foco total em segurança e estabilidade para nossos usuários.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {t.features.items.map((f, i) => (
            <FeatureCard
              key={i}
              index={i}
              icon={icons[i]}
              title={f.title}
              desc={f.description}
              color={colors[i]}
            />
          ))}
        </div>

        {/* ── Unique CTA Bottom ── */}
        <div className="reveal" style={{ marginTop: '6rem' }}>
          <div className="glass" style={{ borderRadius: '24px', padding: '3rem', border: '1px solid rgba(59,130,246,0.15)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(59,130,246,0.1)', filter: 'blur(80px)', borderRadius: '50%' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
              <div style={{ flex: '1 1 400px' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', marginBottom: '1rem' }}>Pronto para elevar seu jogo?</h3>
                <p style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '1.1rem' }}>Junte-se a milhares de jogadores que já utilizam a Zyro.</p>
              </div>
              <Link to="/products" className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>Ver Catálogo Completo</Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Features
