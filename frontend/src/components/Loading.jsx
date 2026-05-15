import { motion } from 'framer-motion'

const LoadingScreen = () => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#050505',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(51, 102, 255, 0.2)',
            borderTopColor: '#3366ff',
            borderRadius: '50%',
            margin: '0 auto 20px'
          }}
        />
        <p style={{ color: '#888', fontSize: '0.85rem', fontWeight: '500' }}>Loading...</p>
      </motion.div>
    </div>
  )
}

const SkeletonCard = () => (
  <div style={{
    background: '#111',
    borderRadius: '16px',
    padding: '24px',
    animation: 'pulse 2s ease-in-out infinite'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      background: '#222',
      borderRadius: '10px',
      marginBottom: '16px'
    }} />
    <div style={{
      width: '60%',
      height: '20px',
      background: '#222',
      borderRadius: '4px',
      marginBottom: '8px'
    }} />
    <div style={{
      width: '80%',
      height: '14px',
      background: '#222',
      borderRadius: '4px'
    }} />
  </div>
)

export { LoadingScreen, SkeletonCard }