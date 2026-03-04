import { useRef, useEffect, useState } from 'react'
import axios from 'axios'
import API_URL from '../api'

const Stats = () => {
  const [data, setData] = useState({
    stats_active_users: '...',
    stats_uptime: '...',
    stats_detection: '...',
    stats_delivery: '...'
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/info`)
        if (res.data.settings) {
          setData(res.data.settings)
        }
      } catch (e) { }
    }
    fetchStats()
  }, [])

  const statsList = [
    { label: 'Active Users', value: data.stats_active_users, icon: 'Users' },
    { label: 'System Uptime', value: data.stats_uptime, icon: 'Shield' },
    { label: 'Detection Rate', value: data.stats_detection, icon: 'Zap' },
    { label: 'Instant Delivery', value: data.stats_delivery, icon: 'Clock' }
  ]

  return (
    <section style={{ padding: '60px 0', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <div className="container-lg">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
          {statsList.map((s, i) => (
            <div key={i} className="reveal" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: s.label === 'Detection Rate' ? (data.stats_detection === '0%' ? '#22c55e' : '#ff4b2b') : '#fff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats
