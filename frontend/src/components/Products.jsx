import { useState, useEffect, useRef, useContext } from 'react'
import { LangContext } from '../App'

const products = [
    // FiveM
    {
        id: 1, category: 'FiveM', tag: 'FiveM',
        name: 'FiveM External — Basic',
        desc: 'Solução externa básica para FiveM. Ideal para iniciantes, sem modificações no jogo.',
        badge: 'undetectable',
        price: 'R$ 29,90',
        period: '/mês',
        features: ['ESP de Jogadores', 'AimBot Básico', 'Radar Hack', 'Suporte 24/7'],
        color: '#3b82f6',
        popular: false,
    },
    {
        id: 2, category: 'FiveM', tag: 'FiveM',
        name: 'FiveM External — Advanced',
        desc: 'Modo avançado com recursos extras: aimbot aprimorado, ESP completo e mais funções.',
        badge: 'undetectable',
        price: 'R$ 59,90',
        period: '/mês',
        features: ['ESP Completo', 'AimBot Avançado', 'Triggerbot', 'Wallhack', 'Suporte 24/7'],
        color: '#06b6d4',
        popular: true,
    },
    {
        id: 3, category: 'FiveM', tag: 'FiveM',
        name: 'FiveM External — Private',
        desc: 'Versão privada exclusiva, com updates frequentes e acesso a funções beta.',
        badge: 'undetectable',
        price: 'R$ 99,90',
        period: '/mês',
        features: ['Tudo do Advanced', 'Funções Beta', 'Updates Prioritários', 'Suporte VIP'],
        color: '#8b5cf6',
        popular: false,
    },
    // Bypass
    {
        id: 4, category: 'Bypass', tag: 'Bypass',
        name: 'FiveM Bypass — Private',
        desc: 'Bypass privado de alta eficiência para servidores com anti-cheat reforçado.',
        badge: 'undetectable',
        price: 'R$ 79,90',
        period: '/mês',
        features: ['Anti-Detecção', 'Compatível VOID AC', 'Atualização Automática'],
        color: '#10b981',
        popular: false,
    },
    {
        id: 5, category: 'Bypass', tag: 'Bypass',
        name: 'FiveM Bypass — UEFI',
        desc: 'Bypass em nível de firmware — o mais seguro disponível no mercado.',
        badge: 'undetectable',
        price: 'R$ 149,90',
        period: '/mês',
        features: ['Nível UEFI', 'Máxima Segurança', 'Totalmente Invisível', 'Suporte VIP'],
        color: '#f59e0b',
        popular: false,
    },
    // CS2
    {
        id: 6, category: 'CS2', tag: 'CS2',
        name: 'CS2 External',
        desc: 'Cheat externo para CS2. Aimbot, ESP e mais recursos para dominar as partidas.',
        badge: null,
        price: 'R$ 49,90',
        period: '/mês',
        features: ['Aimbot', 'ESP Completo', 'Triggerbot', 'Radar Hack'],
        color: '#ef4444',
        popular: false,
    },
    // Spoofer
    {
        id: 7, category: 'Spoofer', tag: 'Spoofer',
        name: 'FiveM Spoofer — Hour',
        desc: 'Spoofer temporário para uso por 1 hora. Ideal para testes rápidos.',
        badge: null,
        price: 'R$ 9,90',
        period: '/hora',
        features: ['1 Hora de Uso', 'HWID Spoof', 'Entrega Automática'],
        color: '#ec4899',
        popular: false,
    },
    {
        id: 8, category: 'Spoofer', tag: 'Spoofer',
        name: 'FiveM Spoofer — Global',
        desc: 'Spoofer permanente com proteção global e updates vitalícios inclusos.',
        badge: 'undetectable',
        price: 'R$ 199,90',
        period: '/lifetime',
        features: ['Uso Vitalício', 'Proteção Global', 'HWID + MAC Spoof', 'Suporte VIP'],
        color: '#8b5cf6',
        popular: false,
    },
    // Accounts
    {
        id: 9, category: 'Accounts', tag: 'Accounts',
        name: 'Rockstar Accounts',
        desc: 'Contas Rockstar/GTA verificadas, prontas para uso imediato.',
        badge: 'undetectable',
        price: 'R$ 19,90',
        period: '/conta',
        features: ['Conta Verificada', 'Email Incluso', 'Entrega Imediata'],
        color: '#f97316',
        popular: false,
    },
]

const categoryIcons = {
    FiveM: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    CS2: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>,
    Bypass: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>,
    Spoofer: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
    Accounts: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
}

const Products = () => {
    const [visible, setVisible] = useState(false)
    const [activeCategory, setCategory] = useState(0)
    const ref = useRef()
    const { t } = useContext(LangContext)

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.05 })
        if (ref.current) obs.observe(ref.current)
        return () => { if (ref.current) obs.unobserve(ref.current) }
    }, [])

    const catKeys = ['All', 'FiveM', 'CS2', 'Bypass', 'Spoofer', 'Accounts']
    const catLabels = t.products.categories
    const filtered = activeCategory === 0 ? products : products.filter(p => p.category === catKeys[activeCategory])

    return (
        <section id="products" ref={ref} style={{ padding: '6rem 0' }}>
            <div className="container-lg">

                {/* Header */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end',
                    justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem',
                    opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
                    transition: 'all 0.7s ease',
                }}>
                    <div>
                        <div style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="badge badge-blue">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /></svg>
                                {t.products.badge1}
                            </span>
                            <span className="badge badge-green">{t.products.badge2}</span>
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.01em' }}>
                            {t.products.title}
                        </h2>
                        <p style={{ fontSize: '0.95rem', color: 'rgba(148,163,184,0.7)', marginTop: '6px' }}>{t.products.subtitle}</p>
                    </div>
                </div>

                {/* Category filters */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '2rem',
                    opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease 0.1s',
                }}>
                    {catLabels.map((label, i) => (
                        <button
                            key={i}
                            className={`tag ${activeCategory === i ? 'active' : ''}`}
                            onClick={() => setCategory(i)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            {i > 0 && (
                                <span style={{ width: '14px', height: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
                                    {categoryIcons[catKeys[i]]}
                                </span>
                            )}
                            {label}
                        </button>
                    ))}
                </div>

                {/* Product grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem',
                }}>
                    {filtered.map((p, i) => (
                        <div
                            key={p.id}
                            className="card-product"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? 'none' : 'translateY(20px)',
                                transition: `all 0.5s ease ${i * 60}ms`,
                            }}
                        >
                            {/* Popular ribbon */}
                            {p.popular && (
                                <div style={{
                                    position: 'absolute', top: '12px', right: '12px',
                                    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                                    borderRadius: '6px', padding: '2px 10px',
                                    fontSize: '0.7rem', fontWeight: '700', color: 'white',
                                    letterSpacing: '0.05em', textTransform: 'uppercase',
                                }}>
                                    POPULAR
                                </div>
                            )}

                            {/* Top accent line */}
                            <div style={{ height: '2px', background: `linear-gradient(90deg, ${p.color}, transparent)` }} />

                            <div style={{ padding: '1.25rem' }}>
                                {/* Category + undetectable */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                                    <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                                        <span style={{ width: '12px', height: '12px', display: 'inline-flex', opacity: 0.8 }}>
                                            {categoryIcons[p.category] || null}
                                        </span>
                                        {p.tag}
                                    </span>
                                    {p.badge === 'undetectable' && (
                                        <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                            {t.products.undetectable}
                                        </span>
                                    )}
                                </div>

                                {/* Name */}
                                <h3 style={{ fontSize: '1.02rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '6px', lineHeight: '1.3' }}>
                                    {p.name}
                                </h3>
                                <p style={{ fontSize: '0.82rem', color: 'rgba(148,163,184,0.6)', marginBottom: '1rem', lineHeight: '1.5' }}>
                                    {p.desc}
                                </p>

                                {/* Feature list */}
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '1.25rem' }}>
                                    {p.features.map((f, fi) => (
                                        <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.82rem', color: 'rgba(148,163,184,0.75)' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {/* Divider */}
                                <div className="divider" style={{ marginBottom: '1rem' }} />

                                {/* Price + Buy */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                    <div>
                                        <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f1f5f9' }}>{p.price}</span>
                                        <span style={{ fontSize: '0.78rem', color: 'rgba(148,163,184,0.5)', marginLeft: '3px' }}>{p.period}</span>
                                    </div>
                                    <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                        {t.products.buyNow}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Products
