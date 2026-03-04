import { useState, useEffect, useRef, useContext } from 'react'
import { LangContext } from '../App'

// Tab icons
const tabIcons = [
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
  </svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    <path d="M1 12h2M21 12h2M12 1v2M12 21v2" />
  </svg>,
]

const Showcase = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const ref = useRef()
  const { t } = useContext(LangContext)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true)
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => { if (ref.current) observer.unobserve(ref.current) }
  }, [])

  const mockBars = [[75, 60, 90, 45, 80], [40, 85, 55, 70, 95], [90, 30, 65, 80, 50]]
  const currentBars = mockBars[activeTab]

  return (
    <section id="showcase" ref={ref} style={{ padding: '6rem 1.5rem', background: 'linear-gradient(to bottom, rgba(7,11,20,0), rgba(7,11,20,1))' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        <div style={{
          textAlign: 'center', marginBottom: '4rem',
          opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease',
        }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '1rem' }}>
            <span className="glow-text">{t.showcase.title}</span>
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
            {t.showcase.subtitle}
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem', alignItems: 'center',
        }}>

          {/* Tabs */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '1rem',
            opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateX(0)' : 'translateX(-30px)',
            transition: 'all 0.8s ease',
          }}>
            {t.showcase.tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '1.25rem 1.5rem',
                  borderRadius: '14px',
                  background: activeTab === index ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.03)',
                  border: activeTab === index ? '1px solid rgba(37,99,235,0.5)' : '1px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === index ? '0 8px 30px rgba(37,99,235,0.2)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  color: activeTab === index ? 'white' : 'rgba(255,255,255,0.5)',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  background: activeTab === index ? 'linear-gradient(135deg, #2563EB, #00D4FF)' : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  color: activeTab === index ? 'white' : 'rgba(255,255,255,0.4)',
                }}>
                  {tabIcons[index]}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '2px' }}>{tab.title}</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{tab.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Mock UI preview */}
          <div style={{
            opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateX(0)' : 'translateX(30px)',
            transition: 'all 0.8s ease 0.2s',
            position: 'relative',
          }}>
            {/* Glow rings */}
            <div style={{
              position: 'absolute', inset: '-20px', borderRadius: '24px',
              background: 'rgba(37,99,235,0.1)', filter: 'blur(30px)', zIndex: 0,
            }} />
            <div style={{
              position: 'relative', zIndex: 1,
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(37,99,235,0.2)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            }}>
              {/* Window chrome */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)' }}>
                {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                  <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
                ))}
                <div style={{ flex: 1, height: '18px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginLeft: '8px' }} />
              </div>

              {/* Content area */}
              <div style={{ padding: '1.5rem' }}>
                {/* Bar chart */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '120px', marginBottom: '1rem' }}>
                  {currentBars.map((h, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '100%', height: `${h}%`,
                        background: i % 2 === 0 ? 'linear-gradient(to top, #2563EB, #00D4FF)' : 'linear-gradient(to top, #1d4ed8, #60a5fa)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.6s ease',
                        minHeight: '8px',
                      }} />
                    </div>
                  ))}
                </div>
                {/* Progress bars */}
                {[
                  { w: '78%', label: 'Performance' },
                  { w: '62%', label: 'Conversions' },
                  { w: '91%', label: 'Uptime' },
                ].map((bar, i) => (
                  <div key={i} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      <span>{bar.label}</span><span>{bar.w}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: bar.w, background: 'linear-gradient(to right, #2563EB, #00D4FF)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div style={{
              position: 'absolute', top: '-14px', right: '20px',
              background: 'linear-gradient(135deg, #2563EB, #00D4FF)',
              borderRadius: '20px', padding: '6px 14px',
              fontSize: '0.75rem', fontWeight: '700', color: 'white',
              animation: 'float 3s ease-in-out infinite',
              zIndex: 2,
            }}>
              Live Preview
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Showcase
