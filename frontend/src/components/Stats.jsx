import { useState, useEffect, useRef, useContext } from 'react'
import { LangContext } from '../App'

const Stats = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [counters, setCounters] = useState({ users: 0, projects: 0, uptime: 0, countries: 0 })
  const ref = useRef()
  const { t } = useContext(LangContext)

  const targetStats = { users: 50000, projects: 100000, uptime: 99.9, countries: 120 }

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true)
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => { if (ref.current) observer.unobserve(ref.current) }
  }, [])

  useEffect(() => {
    if (!isVisible) return
    const duration = 2000, steps = 60
    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const ease = 1 - Math.pow(1 - progress, 4)
      setCounters({
        users: Math.floor(targetStats.users * ease),
        projects: Math.floor(targetStats.projects * ease),
        uptime: parseFloat((targetStats.uptime * ease).toFixed(1)),
        countries: Math.floor(targetStats.countries * ease),
      })
      if (currentStep >= steps) clearInterval(interval)
    }, duration / steps)
  }, [isVisible])

  const statIcons = [
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px' }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px' }}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px' }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>,
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px' }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>,
  ]

  const statValues = [
    counters.users.toLocaleString() + '+',
    counters.projects.toLocaleString() + '+',
    counters.uptime + '%',
    counters.countries + '+',
  ]

  return (
    <section ref={ref} style={{ padding: '6rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Centered glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '300px', background: 'rgba(0,212,255,0.04)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          textAlign: 'center', marginBottom: '4rem',
          opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease',
        }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '1rem' }}>
            <span className="glow-text">{t.stats.title}</span>
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto' }}>
            {t.stats.subtitle}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {t.stats.items.map((stat, index) => (
            <div
              key={index}
              style={{
                textAlign: 'center', padding: '2rem 1.5rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(37,99,235,0.2)',
                borderRadius: '20px',
                backdropFilter: 'blur(12px)',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                transition: `all 0.6s ease ${index * 100}ms`,
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(37,99,235,0.2)'
                e.currentTarget.style.border = '1px solid rgba(37,99,235,0.5)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.border = '1px solid rgba(37,99,235,0.2)'
              }}
            >
              {/* Icon */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 1rem',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(0,212,255,0.3))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#00D4FF',
              }}>
                {statIcons[index]}
              </div>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '6px' }} className="glow-text">
                {statValues[index]}
              </div>
              <div style={{ fontWeight: '600', color: 'white', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Join badge */}
        <div style={{
          marginTop: '3.5rem', textAlign: 'center',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease 0.4s',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '1rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(37,99,235,0.25)',
            borderRadius: '60px', padding: '12px 24px',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: `linear-gradient(${i * 40}deg, #2563EB, #00D4FF)`,
                  border: '2px solid #070B14',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '700', fontSize: '0.75rem',
                  marginLeft: i > 1 ? '-10px' : 0,
                }}>
                  {i}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', color: 'white', fontSize: '0.95rem' }}>{t.stats.joinText}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{t.stats.joinSub}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Stats
