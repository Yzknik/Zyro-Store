import { useEffect, useState, useContext, useRef } from 'react'
import { Link } from 'react-router-dom'
import { LangContext } from '../App'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Shield, Zap, Target, MousePointer2 } from 'lucide-react'

const Hero = () => {
  const { t } = useContext(LangContext)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e
    const moveX = (clientX - window.innerWidth / 2) / 25
    const moveY = (clientY - window.innerHeight / 2) / 25
    setMousePosition({ x: moveX, y: moveY })
  }

  return (
    <section
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '160px 0 120px',
        background: '#050505',
        overflow: 'hidden'
      }}
    >
      {/* Animated Mesh Gradients */}
      <div className="mesh-bg" style={{ top: '-10%', right: '-10%', transform: 'scale(1.5)', opacity: 0.4 }} />
      <div className="mesh-bg" style={{ bottom: '-10%', left: '-10%', transform: 'scale(1.2)', background: 'radial-gradient(circle, rgba(0, 242, 254, 0.1) 0%, transparent 70%)', opacity: 0.3 }} />

      {/* Floating Particles/Shapes */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', top: '20%', right: '15%', opacity: 0.1, zIndex: 1 }}
      >
        <Zap size={120} color="#3366ff" strokeWidth={1} />
      </motion.div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', width: '100%', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '80px', alignItems: 'center' }}>

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(51, 102, 255, 0.08)',
                padding: '8px 16px',
                borderRadius: '100px',
                border: '1px solid rgba(51, 102, 255, 0.2)',
                marginBottom: '24px'
              }}
            >
              <Zap size={14} color="#3366ff" fill="#3366ff" />
              <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#fff', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Next-Gen Execution v2.1
              </span>
            </motion.div>

            <h1 className="title-ultra" style={{ fontSize: 'clamp(3.5rem, 7vw, 6rem)', marginBottom: '24px' }}>
              {t.hero.title1} <br />
              <span style={{ WebkitTextFillColor: 'initial', color: '#fff', opacity: 0.9 }}>{t.hero.title2}</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.8', marginBottom: '48px', maxWidth: '600px', fontWeight: '500' }}>
              {t.hero.subtitle}
            </p>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <Link to="/products" className="btn-premium" style={{ textDecoration: 'none', background: '#3366ff', border: 'none' }}>
                {t.hero.cta1}
                <ArrowRight size={18} />
              </Link>

              <a href="https://discord.gg/zyrogg" target="_blank" rel="noreferrer" style={{
                textDecoration: 'none',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: '900',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                opacity: 0.6,
                transition: '0.3s'
              }}
                onMouseOver={e => e.currentTarget.style.opacity = '1'}
                onMouseOut={e => e.currentTarget.style.opacity = '0.6'}
              >
                {t.hero.cta2.toUpperCase()}
                <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
              </a>
            </div>

            {/* Staggered Badges */}
            <div style={{ marginTop: '80px', display: 'flex', gap: '48px' }}>
              {[
                { icon: <Shield size={18} color="#3366ff" />, label: t.hero.badge1 },
                { icon: <Target size={18} color="#00f2fe" />, label: t.hero.badge2 },
                { icon: <Zap size={18} color="#3366ff" />, label: t.hero.badge3 }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (i * 0.1) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  {item.icon}
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
                    {item.label.toUpperCase()}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            style={{
              position: 'relative',
              x: mousePosition.x,
              y: mousePosition.y,
              transition: { type: 'spring', stiffness: 50, damping: 20 }
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              style={{ position: 'relative', zIndex: 10 }}
            >
              {/* Decorative Glow behind logo */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120%',
                height: '120%',
                background: 'radial-gradient(circle, rgba(51, 102, 255, 0.1) 0%, transparent 70%)',
                filter: 'blur(80px)',
                zIndex: -1
              }} />
              <img
                src="/zyrologo.png"
                alt="Zyro Evolution"
                style={{
                  width: '100%',
                  height: 'auto',
                  filter: `drop-shadow(0 0 80px rgba(51, 102, 255, ${isHovered ? 0.4 : 0.2}))`,
                  transition: '0.5s filter ease'
                }}
              />

              {/* Floating UI Element */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="glass"
                style={{
                  position: 'absolute',
                  bottom: '10%',
                  right: '-10%',
                  padding: '20px 24px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{t.hero.statusLabel || 'SYSTEM STATUS'}</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '950', color: '#fff' }}>{t.hero.statusValue || 'ALL SYSTEMS ONLINE'}</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default Hero