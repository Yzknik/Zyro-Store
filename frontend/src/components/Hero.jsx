import { useEffect, useState, useContext, useRef } from 'react'
import { Link } from 'react-router-dom'
import { LangContext } from '../App'

const Hero = () => {
  const [visible, setVisible] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const { t } = useContext(LangContext)
  const sectionRef = useRef(null)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)

    const handleMouseMove = (e) => {
      if (!sectionRef.current) return
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      const x = (clientX / innerWidth - 0.5) * 20 // Max 20px move
      const y = (clientY / innerHeight - 0.5) * 20
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '120px 0',
        background: '#050505',
        overflow: 'hidden'
      }}
    >
      {/* Dynamic Background Elements */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: `radial-gradient(600px circle at ${50 + mousePos.x / 10}% ${30 + mousePos.y / 10}%, rgba(51, 102, 255, 0.12) 0%, transparent 100%)`,
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div className="container-lg" style={{ position: 'relative', zIndex: 10, width: '100%' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '60px',
          justifyContent: 'space-between'
        }}>

          {/* Content Section */}
          <div style={{
            flex: '1 1 500px',
            transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)`,
            transition: 'transform 0.1s ease-out'
          }}>
            <div style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              marginBottom: '1.5rem'
            }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                color: 'var(--color-primary)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                background: 'rgba(51, 102, 255, 0.05)',
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid rgba(51, 102, 255, 0.1)'
              }}>
                OVERPOWER THE COMPETITION
              </span>
            </div>

            <h1 className="title-large" style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
              marginBottom: '2rem',
              color: '#fff',
              lineHeight: '1.1'
            }}>
              {t.hero.title1} <br />
              <span style={{
                background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.4) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>{t.hero.title2}</span>
            </h1>

            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: '1.8',
              marginBottom: '3.5rem',
              maxWidth: '550px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              fontWeight: '400'
            }}>
              {t.hero.subtitle}
            </p>

            <div style={{
              display: 'flex',
              gap: '20px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s'
            }}>
              <Link to="/products" className="btn-primary" style={{
                padding: '18px 45px',
                borderRadius: '4px',
                boxShadow: '0 10px 40px rgba(51, 102, 255, 0.2)'
              }}>
                {t.hero.cta1}
              </Link>
              <a href="https://discord.gg" target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '18px 45px', borderRadius: '4px' }}>
                {t.hero.cta2}
              </a>
            </div>
          </div>

          {/* Logo Section */}
          <div style={{
            flex: '1 1 400px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            opacity: visible ? 1 : 0,
            transform: visible
              ? `translate(${mousePos.x}px, ${mousePos.y}px) scale(1)`
              : 'scale(0.8) translateY(40px)',
            transition: 'opacity 1.2s ease, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '500px',
              animation: 'subtleFloat 6s ease-in-out infinite'
            }}>
              {/* Decorative Glow behind logo */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120%',
                height: '120%',
                background: 'radial-gradient(circle, rgba(51, 102, 255, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: -1
              }} />

              <img
                src="/zyrologo.png"
                alt="Zyro Logo"
                style={{
                  width: '100%',
                  height: 'auto',
                  filter: 'drop-shadow(0 0 50px rgba(51, 102, 255, 0.3))'
                }}
              />
            </div>
          </div>

        </div>

        {/* Badges Staggered */}
        <div style={{
          marginTop: '100px',
          display: 'flex',
          gap: '40px',
          opacity: visible ? 0.4 : 0,
          transition: 'opacity 1.5s ease 0.8s'
        }}>
          {[t.hero.badge1, t.hero.badge2, t.hero.badge3].map((b, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.75rem',
              fontWeight: '700',
              letterSpacing: '0.1em',
              color: '#fff'
            }}>
              <span style={{ width: '4px', height: '4px', background: 'var(--color-primary)', borderRadius: '50%' }} />
              {b.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
