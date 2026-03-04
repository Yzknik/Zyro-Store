import { useState, useContext } from 'react'
import { LangContext } from '../App'

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(null)
  const { t } = useContext(LangContext)

  return (
    <section id="faq" style={{ padding: '100px 0', background: '#050505' }}>
      <div className="container-lg" style={{ maxWidth: '800px' }}>

        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: '800',
            color: 'var(--color-primary)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '16px'
          }}>
            FAQ
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            {t.faq.title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t.faq.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {t.faq.items.map((item, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px',
                transition: '0.2s',
              }}
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                style={{
                  width: '100%',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#fff',
                }}
              >
                <span style={{ fontSize: '1rem', fontWeight: '600' }}>{item.question}</span>
                <svg
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: openIdx === i ? 'rotate(180deg)' : 'none', transition: '0.25s', opacity: 0.4 }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div style={{
                maxHeight: openIdx === i ? '500px' : '0',
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out'
              }}>
                <div style={{ padding: '0 24px 24px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '60px',
          textAlign: 'center',
          padding: '30px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '16px' }}>{t.faq.stillQuestion}</p>
          <a href="https://discord.gg" target="_blank" rel="noreferrer" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}>
            Join Discord Support
          </a>
        </div>
      </div>
    </section>
  )
}

export default FAQ
