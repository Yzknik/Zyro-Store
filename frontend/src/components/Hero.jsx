import { useEffect, useState, useContext, useRef } from 'react'
import { Link } from 'react-router-dom'
import { LangContext } from '../App'

const HUDFragment = ({ style, label, value }) => (
  <div style={{
    position: 'absolute',
    padding: '8px 12px',
    background: 'rgba(8, 12, 20, 0.4)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '4px',
    fontFamily: '"JetBrains Mono", monospace, "Fira Code", monospace',
    fontSize: '0.65rem',
    color: 'rgba(148, 163, 184, 0.6)',
    letterSpacing: '0.1em',
    zIndex: 5,
    pointerEvents: 'none',
    backdropFilter: 'blur(4px)',
    ...style
  }}>
    <div style={{ opacity: 0.5, marginBottom: '2px' }}>{label}</div>
    <div style={{ color: '#3b82f6', fontWeight: '700' }}>{value}</div>
  </div>
)

const Magnetic = ({ children }) => {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const handleMouse = (e) => {
    const { clientX, clientY } = e
    const { height, width, left, top } = ref.current.getBoundingClientRect()
    const x = clientX - (left + width / 2)
    const y = clientY - (top + height / 2)
    setPos({ x: x * 0.2, y: y * 0.2 })
  }
  const reset = () => setPos({ x: 0, y: 0 })
  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)' }}
      className="magnetic"
    >
      {children}
    </div>
  )
}

const Tilt = ({ children, style, className }) => {
  const ref = useRef(null)
  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10
    ref.current.style.setProperty('--rotate-x', `${rotateX}deg`)
    ref.current.style.setProperty('--rotate-y', `${rotateY}deg`)
  }
  const reset = () => {
    ref.current.style.setProperty('--rotate-x', `0deg`)
    ref.current.style.setProperty('--rotate-y', `0deg`)
  }
  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      className={`tilt-card ${className || ''}`}
      style={style}
    >
      {children}
    </div>
  )
}

const Particles = () => {
  const pts = useRef(Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    dur: `${15 + Math.random() * 10}s`,
    delay: `-${Math.random() * 20}s`,
    size: 1 + Math.random() * 2,
    color: ['#3b82f6', '#06b6d4', '#8b5cf6'][Math.floor(Math.random() * 3)],
    opacity: 0.15 + Math.random() * 0.3,
  }))).current
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 2 }}>
      {pts.map(p => (
        <div key={p.id} style={{
          position: 'absolute', bottom: '-10px', left: p.left,
          width: `${p.size}px`, height: `${p.size}px`,
          borderRadius: '50%', background: p.color, opacity: p.opacity,
          animation: `particle ${p.dur} ${p.delay} linear infinite`,
          boxShadow: `0 0 ${p.size * 5}px ${p.color}`,
        }} />
      ))}
    </div>
  )
}

const CursorBlink = () => <span style={{ display: 'inline-block', width: '3px', height: '1.1em', background: '#3b82f6', marginLeft: '6px', verticalAlign: 'middle', animation: 'blink 1.2s step-end infinite' }} />

function useTypewriter(text, speed = 60, startDelay = 800) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    let i = 0
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1))
        i++
        if (i >= text.length) { clearInterval(interval); setDone(true) }
      }, speed)
      return () => clearInterval(interval)
    }, startDelay)
    return () => clearTimeout(timeout)
  }, [text])
  return { displayed, done }
}

const Hero = () => {
  const [visible, setVisible] = useState(false)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const { t, lang } = useContext(LangContext)
  const { displayed, done } = useTypewriter("Zyro Cheats")

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    const onMouse = (e) => setMouse({
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    })
    window.addEventListener('mousemove', onMouse)
    return () => window.removeEventListener('mousemove', onMouse)
  }, [])

  return (
    <>
      <style>{`
        @keyframes border-glow { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes text-glow-pulse { 0%,100%{text-shadow: 0 0 20px rgba(59,130,246,0.3)} 50%{text-shadow: 0 0 40px rgba(59,130,246,0.8)} }
      `}</style>

      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        padding: '80px 0'
      }}>
        <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

        {/* Decorative Orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', filter: 'blur(120px)', zIndex: 1 }} />

        <div className="container-lg" style={{ position: 'relative', zIndex: 10, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '40px' }}>

            {/* ── LEFT CONTENT ── */}
            <div style={{
              flex: '1 1 500px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateX(-50px)',
              transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '99px', padding: '6px 16px', marginBottom: '2rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e', animation: 'pulse-border 2s infinite' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  System Online — v2.4
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
                fontWeight: '950',
                lineHeight: '0.9',
                marginBottom: '1.5rem',
                letterSpacing: '-0.05em',
                color: '#fff',
                animation: 'text-glow-pulse 4s ease-in-out infinite'
              }}>
                {displayed}
                {!done && <CursorBlink />}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem' }}>
                <div style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, #3b82f6, transparent)' }} />
                <span className="shimmer-text" style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', fontWeight: '800' }}>
                  {t.hero.title1} {t.hero.title2}
                </span>
              </div>

              <p style={{ fontSize: '1.2rem', color: 'rgba(148, 163, 184, 0.8)', lineHeight: '1.8', marginBottom: '3.5rem', maxWidth: '580px' }}>
                {t.hero.subtitle}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '4rem' }}>
                <Magnetic>
                  <Link to="/products" className="btn-primary" style={{ padding: '18px 45px', fontSize: '1.1rem', borderRadius: '12px', fontWeight: '800', boxShadow: '0 0 30px rgba(59,130,246,0.3)' }}>
                    {t.hero.cta1}
                  </Link>
                </Magnetic>
                <Magnetic>
                  <a href="https://discord.gg" target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '18px 45px', fontSize: '1.1rem', borderRadius: '12px', fontWeight: '800' }}>
                    {t.hero.cta2}
                  </a>
                </Magnetic>
              </div>

              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {[t.hero.badge1, t.hero.badge2, t.hero.badge3].map((b, i) => (
                  <div key={i} className="glass" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT LOGO AREA ── */}
            <div style={{
              flex: '1 1 400px',
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'scale(0.8) rotate(10deg)',
              transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <Tilt style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                <div style={{ position: 'relative', padding: '40px' }}>
                  {/* Rotating Rings */}
                  <div style={{ position: 'absolute', inset: 0, border: '1px dashed rgba(59,130,246,0.15)', borderRadius: '50%', animation: 'spin-slow 20s linear infinite' }} />
                  <div style={{ position: 'absolute', inset: '20px', border: '1px solid rgba(6,182,212,0.1)', borderRadius: '50%', animation: 'spin-slow 30s linear infinite reverse' }} />

                  <img
                    src="/zyrologo.png"
                    alt="Zyro Logo"
                    style={{
                      width: '100%',
                      height: 'auto',
                      filter: 'drop-shadow(0 0 60px rgba(59,130,246,0.5))',
                      animation: 'float-slower 8s ease-in-out infinite'
                    }}
                  />
                </div>
              </Tilt>

              {/* HUD Fragments Floating */}
              <HUDFragment style={{ top: '10%', right: '5%' }} label="FIREWALL" value="BYPASSED" />
              <HUDFragment style={{ bottom: '15%', left: '0%' }} label="UPTIME" value="99.99%" />
              <HUDFragment style={{ top: '60%', right: '0%' }} label="USERS" value="10.4k+" />
            </div>

          </div>
        </div>

        <Particles />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: 'linear-gradient(to top, #080c14, transparent)', zIndex: 11 }} />
      </section>
    </>
  )
}

export default Hero
