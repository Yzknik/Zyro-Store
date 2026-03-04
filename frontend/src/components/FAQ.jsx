import { useState, useEffect, useRef, useContext } from 'react'
import { LangContext } from '../App'

const FAQ = () => {
  const [visible, setVisible] = useState(false)
  const [openIdx, setOpenIdx] = useState(null)
  const ref = useRef()
  const { t } = useContext(LangContext)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => { if (ref.current) obs.unobserve(ref.current) }
  }, [])

  return (
    <section id="faq" ref={ref} style={{ padding: '6rem 0' }}>
      <div className="container-lg" style={{ maxWidth: '800px' }}>

        {/* Header */}
        <div style={{
          marginBottom: '3rem',
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
          transition: 'all 0.7s ease',
        }}>
          <div style={{ marginBottom: '10px' }}>
            <span className="badge badge-blue">FAQ</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.01em', marginBottom: '0.6rem' }}>
            {t.faq.title}
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(148,163,184,0.7)', lineHeight: '1.7' }}>
            {t.faq.subtitle}
          </p>
        </div>

        {/* Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {t.faq.items.map((item, i) => (
            <div
              key={i}
              style={{
                background: openIdx === i ? 'rgba(59,130,246,0.07)' : '#0f1729',
                border: `1px solid ${openIdx === i ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.1)'}`,
                borderRadius: '12px', overflow: 'hidden',
                transition: 'all 0.25s ease',
                opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)',
                transitionDelay: `${i * 60}ms`,
              }}
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                style={{
                  width: '100%', padding: '1.1rem 1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  color: '#f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '26px', height: '26px', flexShrink: 0, borderRadius: '7px',
                    background: openIdx === i ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: openIdx === i ? '#60a5fa' : 'rgba(148,163,184,0.5)',
                    fontSize: '0.75rem', fontWeight: '700', transition: 'all 0.2s',
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.4' }}>{item.question}</span>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, transform: openIdx === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div style={{ maxHeight: openIdx === i ? '240px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                <div style={{ padding: '0 1.25rem 1.1rem 3.4rem', fontSize: '0.875rem', color: 'rgba(148,163,184,0.7)', lineHeight: '1.7' }}>
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div style={{
          marginTop: '2.5rem',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.05))',
          border: '1px solid rgba(59,130,246,0.18)',
          borderRadius: '14px', padding: '1.5rem 2rem',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease 0.4s',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              {/* Discord icon */}
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(88,101,242,0.2)', border: '1px solid rgba(88,101,242,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#818cf8"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z" /></svg>
              </div>
              <span style={{ fontWeight: '700', color: '#f1f5f9', fontSize: '1rem' }}>{t.faq.stillQuestion}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(148,163,184,0.6)' }}>{t.faq.supportSub}</div>
          </div>
          <a href="https://discord.gg" target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z" /></svg>
            {t.faq.joinDiscord}
          </a>
        </div>
      </div>
    </section>
  )
}

export default FAQ
