import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import API_URL from '../api'
import axios from 'axios'
import { MessageCircle, Newspaper, ShieldCheck, Users } from 'lucide-react'

const CommunityPage = () => {
    const [info, setInfo] = useState({ news: [], settings: {}, products: [], launcher: {} })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`${API_URL}/api/admin/info`, { withCredentials: true })
            .then(res => setInfo(res.data || { news: [], settings: {}, products: [], launcher: {} }))
            .catch(() => setInfo({ news: [], settings: {}, products: [], launcher: {} }))
            .finally(() => setLoading(false))
    }, [])

    const settings = info.settings || {}
    const launcher = info.launcher || {}

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />
            <main style={{ paddingTop: '130px', paddingBottom: '90px', maxWidth: '1180px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
                <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '28px', alignItems: 'stretch', marginBottom: '32px' }}>
                    <div className="glass" style={{ padding: '34px', borderRadius: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#93c5fd', fontSize: '0.72rem', fontWeight: '950', letterSpacing: '0.16em', marginBottom: '18px' }}>
                            <Newspaper size={16} /> COMMUNITY FEED
                        </div>
                        <h1 style={{ fontSize: '2.5rem', lineHeight: 1, marginBottom: '14px', fontWeight: '950' }}>Notícias e status da Zyro</h1>
                        <p style={{ color: 'rgba(255,255,255,0.48)', maxWidth: '620px', lineHeight: 1.7 }}>
                            Atualizações do launcher, produtos, manutenções e comunicados importantes aparecem aqui.
                        </p>
                    </div>
                    <div className="glass" style={{ padding: '30px', borderRadius: '28px', display: 'grid', gap: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', fontWeight: '900' }}>LAUNCHER</span>
                            <span style={{ color: launcher.status === 'MAINTENANCE' ? '#f59e0b' : '#22c55e', fontWeight: '950', fontSize: '0.75rem' }}>{launcher.status || 'ONLINE'}</span>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>v{launcher.version || '1.0.0'}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>{launcher.changelog || settings.broadcast_message || 'Nenhum comunicado do launcher no momento.'}</p>
                        {settings.discord_link && (
                            <a href={settings.discord_link} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center', padding: '14px', borderRadius: '14px', marginTop: '8px' }}>
                                ENTRAR NO DISCORD
                            </a>
                        )}
                    </div>
                </section>

                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    {[
                        { icon: Users, label: 'Usuários ativos', value: settings.stats_active_users || '0+' },
                        { icon: ShieldCheck, label: 'Uptime', value: `${settings.stats_uptime || '99'}%` },
                        { icon: MessageCircle, label: 'Discord', value: settings.discord_members_count ? `${settings.discord_members_count}+` : 'Online' }
                    ].map(item => (
                        <div key={item.label} className="card" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <item.icon size={20} color="#93c5fd" />
                            <div>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.38)', fontSize: '0.72rem', fontWeight: '900' }}>{item.label.toUpperCase()}</p>
                                <h3 style={{ margin: 0, marginTop: '4px', fontSize: '1.25rem' }}>{item.value}</h3>
                            </div>
                        </div>
                    ))}
                </section>

                <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
                    <div className="glass" style={{ padding: '28px', borderRadius: '28px' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: '950', marginBottom: '18px' }}>NOTÍCIAS</h2>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {loading && <p style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando...</p>}
                            {!loading && info.news?.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)' }}>Nenhuma notícia publicada ainda.</p>}
                            {info.news?.map(n => (
                                <article key={n.id} style={{ padding: '18px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px' }}>
                                    <h3 style={{ margin: 0, fontSize: '0.98rem' }}>{n.title}</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '8px 0 10px' }}>{n.description}</p>
                                    <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.72rem' }}>{new Date(n.created_at).toLocaleString()}</span>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '28px', borderRadius: '28px' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: '950', marginBottom: '18px' }}>STATUS DOS PRODUTOS</h2>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {info.products?.map(p => (
                                <div key={p.id} style={{ padding: '18px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '0.98rem' }}>{p.name}</h3>
                                        <p style={{ margin: '6px 0 0', color: '#93c5fd', fontSize: '0.72rem', fontWeight: '900' }}>v{p.current_version || '1.0.0'}</p>
                                    </div>
                                    <span style={{ height: 'fit-content', padding: '6px 10px', borderRadius: '999px', background: p.status === 'UNDETECTED' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: p.status === 'UNDETECTED' ? '#22c55e' : '#f59e0b', fontSize: '0.68rem', fontWeight: '950' }}>{p.status || 'ONLINE'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default CommunityPage
