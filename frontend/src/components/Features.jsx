import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { LangContext } from '../App'
import { motion } from 'framer-motion'
import { Shield, Zap, Target, MessageSquare, Monitor, Users, ChevronRight } from 'lucide-react'

const FeatureCard = ({ icon, title, desc, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
    style={{ height: '100%' }}
  >
    <div className="card" style={{ padding: '48px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{
        width: '50px',
        height: '50px',
        color: '#3366ff',
        background: 'rgba(51, 102, 255, 0.08)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(51, 102, 255, 0.2)'
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginBottom: '12px', letterSpacing: '-0.5px' }}>{title}</h3>
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.7', fontWeight: '400' }}>{desc}</p>
      </div>
    </div>
  </motion.div>
)

const Features = () => {
  const { t } = useContext(LangContext)

  const icons = [
    <Shield size={24} />,
    <Zap size={24} />,
    <Target size={24} />,
    <MessageSquare size={24} />,
    <Monitor size={24} />,
    <Users size={24} />
  ]

  return (
    <section id="features" style={{ padding: '160px 0', background: '#050505', position: 'relative' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '100px' }}
        >
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '900',
            color: '#3366ff',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '20px'
          }}>
            {t.features.badge || 'PREMIUM TECHNOLOGY'}
          </span>
          <h2 className="title-ultra" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            {t.features.title}
          </h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '32px'
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

        {/* Professional CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginTop: '140px', textAlign: 'center' }}
        >
          <div className="glass" style={{
            padding: '80px 40px',
            borderRadius: '40px',
            maxWidth: '1000px',
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div className="mesh-bg" style={{ top: '-50%', left: '-20%', opacity: 0.2 }} />

            <h3 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', color: '#fff', marginBottom: '20px', letterSpacing: '-1px' }}>{t.features.ctaTitle || 'Ready to Evolve?'}</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem', marginBottom: '48px', maxWidth: '600px', marginInline: 'auto' }}>
              {t.features.ctaSubtitle || 'Join the largest community of elite players and experience the future of software execution.'}
            </p>

            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
              <Link to="/products" className="btn-premium btn-primary-gradient" style={{ textDecoration: 'none' }}>
                {t.features.ctaButton || 'BROWSE STORE'}
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}

export default Features