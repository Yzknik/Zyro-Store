import { useContext, useState, useEffect } from 'react'
import { LangContext } from '../App'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../api'

const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000)
        return () => clearTimeout(timer)
    }, [onClose])
    return (
        <div style={{
            position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
            borderLeft: `4px solid ${type === 'error' ? '#ef4444' : '#3b82f6'}`,
            padding: '16px 24px', borderRadius: '12px', color: '#fff',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex', alignItems: 'center', gap: '12px',
            animation: 'slideIn 0.6s var(--curve-bounce)'
        }}>
            <style>{`@keyframes slideIn { from { transform: translateX(100%) scale(0.9); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }`}</style>
            <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {type === 'error' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                )}
            </div>
            <div>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700' }}>{type === 'error' ? 'ERRO' : 'SUCESSO'}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{message}</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
        </div>
    )
}

const ActivityChart = ({ data, color = "#3b82f6", label = "vendas" }) => {
    const [hovered, setHovered] = useState(null);
    if (!data || data.length === 0) return (
        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)', fontSize: '0.8rem' }}>
            Nenhum dado disponível
        </div>
    );

    const maxVal = Math.max(...data, 1);
    const H = 100; // SVG coordinate height
    const chartTop = 10;   // top padding in SVG units
    const chartBot = 88;   // bottom of chart area in SVG units

    // Map value → SVG Y coordinate
    const toY = (v) => chartBot - (v / maxVal) * (chartBot - chartTop);

    // SVG polyline points string (x in %, y in SVG units)
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${toY(v)}`).join(' ');

    // Day labels
    const days = data.map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (data.length - 1 - i));
        return d;
    });

    // Dot overlay: positions in % of the container so no SVG distortion
    const dotTopPct = (v) => ((toY(v)) / H) * 100 + '%';   // maps SVG Y → CSS top%
    const dotLeftPct = (i) => `${(i / (data.length - 1)) * 100}%`;

    return (
        <div style={{ width: '100%', position: 'relative', marginTop: '30px' }}>
            {/* SVG — only draws the path & gradient, preserveAspectRatio:none is safe here for shapes */}
            <div style={{ width: '100%', height: '160px', position: 'relative' }}>
                <svg
                    viewBox={`0 0 100 ${H}`}
                    preserveAspectRatio="none"
                    style={{ width: '100%', height: '100%', display: 'block' }}
                >
                    <defs>
                        <linearGradient id={`cg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {/* filled area */}
                    <path
                        d={`M0,${H} L0,${toY(data[0])} L${pts} L100,${H} Z`}
                        fill={`url(#cg-${color.replace('#', '')})`}
                    />
                    {/* line — vectorEffect prevents stroke-width from being squashed */}
                    <polyline
                        points={pts}
                        fill="none"
                        stroke={color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
                    />
                </svg>

                {/* HTML dots — rendered on top, use CSS % positioning so they're never distorted */}
                {data.map((v, i) => (
                    <div
                        key={i}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            position: 'absolute',
                            left: dotLeftPct(i),
                            top: dotTopPct(v),
                            transform: 'translate(-50%, -50%)',
                            width: hovered === i ? '12px' : '8px',
                            height: hovered === i ? '12px' : '8px',
                            borderRadius: '50%',
                            background: hovered === i ? color : '#fff',
                            border: `2px solid ${color}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            zIndex: 10,
                            boxShadow: hovered === i ? `0 0 10px ${color}99` : 'none',
                        }}
                    />
                ))}

                {/* Tooltip */}
                {hovered !== null && (() => {
                    const isRight = hovered > data.length * 0.6;
                    return (
                        <div style={{
                            position: 'absolute',
                            left: dotLeftPct(hovered),
                            top: dotTopPct(data[hovered]),
                            transform: `translate(${isRight ? 'calc(-100% - 12px)' : '12px'}, -50%)`,
                            background: 'rgba(5, 8, 18, 0.97)',
                            border: `1px solid ${color}30`,
                            borderRadius: '14px',
                            padding: '10px 15px',
                            pointerEvents: 'none',
                            zIndex: 20,
                            backdropFilter: 'blur(20px)',
                            boxShadow: `0 10px 30px -8px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03)`,
                            minWidth: '130px',
                            animation: 'fadeIn 0.12s ease',
                            whiteSpace: 'nowrap',
                        }}>
                            <p style={{ margin: 0, fontSize: '0.58rem', fontWeight: '900', color: 'rgba(255,255,255,0.25)', letterSpacing: '1.5px', marginBottom: '5px' }}>
                                {days[hovered]?.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}
                            </p>
                            <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '950', color: data[hovered] > 0 ? color : 'rgba(255,255,255,0.15)', lineHeight: 1, letterSpacing: '-1px' }}>
                                {data[hovered]}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{label}</p>
                        </div>
                    );
                })()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.58rem', color: 'rgba(255,255,255,0.18)', fontWeight: '900', letterSpacing: '1.5px' }}>
                <span>ÚLTIMOS {data.length} DIAS</span>
                <span>HOJE</span>
            </div>
        </div>
    );
};


const ConfirmModal = ({ isOpen, title, message, confirmText = "CONFIRMAR", onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
            animation: 'fadeIn 0.3s ease'
        }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes pop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
            <div style={{
                background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px', padding: '40px', width: '90%', maxWidth: '420px',
                textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                animation: 'pop 0.4s var(--curve-bounce)'
            }}>
                <div style={{
                    width: '60px', height: '60px', background: 'rgba(51, 102, 255, 0.1)',
                    borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 25px'
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3366ff" strokeWidth="2.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '12px', fontWeight: '800', letterSpacing: '-0.5px' }}>{title}</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '35px' }}>{message}</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent', color: '#fff', fontWeight: '700', cursor: 'pointer',
                        transition: 'all 0.3s'
                    }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>CANCELAR</button>
                    <button onClick={onConfirm} style={{
                        flex: 1, padding: '16px', borderRadius: '14px', border: 'none',
                        background: '#3366ff', color: '#fff', fontWeight: '700', cursor: 'pointer',
                        boxShadow: '0 10px 20px -5px rgba(51, 102, 255, 0.3)',
                        transition: 'all 0.3s'
                    }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>{confirmText}</button>
                </div>
            </div>
        </div>
    )
}

const InputModal = ({ isOpen, title, subtitle, placeholder, icon, accentColor = '#22c55e', confirmText = 'CONFIRMAR', onConfirm, onCancel }) => {
    const [value, setValue] = useState('');
    if (!isOpen) return null;
    const handleConfirm = () => {
        if (!value || isNaN(value) || parseFloat(value) <= 0) return;
        onConfirm(parseFloat(value));
        setValue('');
    };
    const handleCancel = () => { onCancel(); setValue(''); };
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.87)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001,
            animation: 'fadeIn 0.25s ease'
        }} onClick={e => { if (e.target === e.currentTarget) handleCancel(); }}>
            <div style={{
                background: 'linear-gradient(135deg, #0d1525 0%, #0a0f1e 100%)',
                border: `1px solid ${accentColor}22`,
                borderRadius: '28px', padding: '42px', width: '90%', maxWidth: '440px',
                boxShadow: `0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)`,
                animation: 'pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                {/* Icon */}
                <div style={{
                    width: '65px', height: '65px',
                    background: `${accentColor}15`,
                    border: `1px solid ${accentColor}30`,
                    borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 28px',
                    boxShadow: `0 8px 25px -5px ${accentColor}30`
                }}>
                    {icon || <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>}
                </div>

                {/* Title */}
                <h2 style={{ fontSize: '1.5rem', fontWeight: '950', letterSpacing: '-0.5px', marginBottom: '8px', textAlign: 'center' }}>{title}</h2>
                {subtitle && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', textAlign: 'center', marginBottom: '30px', lineHeight: '1.5' }}>{subtitle}</p>}

                {/* Input */}
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                    <span style={{
                        position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
                        fontSize: '1rem', fontWeight: '900', color: accentColor, opacity: 0.8
                    }}>R$</span>
                    <input
                        type="number"
                        autoFocus
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') handleCancel(); }}
                        placeholder={placeholder || '0.00'}
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${value && !isNaN(value) && parseFloat(value) > 0 ? accentColor + '55' : 'rgba(255,255,255,0.08)'}`,
                            padding: '18px 20px 18px 50px',
                            borderRadius: '16px',
                            color: '#fff',
                            fontSize: '1.4rem',
                            fontWeight: '900',
                            outline: 'none',
                            transition: '0.2s',
                            boxSizing: 'border-box',
                            boxShadow: value && !isNaN(value) && parseFloat(value) > 0 ? `0 0 0 3px ${accentColor}15` : 'none'
                        }}
                    />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleCancel}
                        style={{
                            flex: 1, padding: '16px', borderRadius: '14px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.5)',
                            fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '1px',
                            transition: '0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                        onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!value || isNaN(value) || parseFloat(value) <= 0}
                        style={{
                            flex: 2, padding: '16px', borderRadius: '14px', border: 'none',
                            background: value && !isNaN(value) && parseFloat(value) > 0
                                ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
                                : 'rgba(255,255,255,0.05)',
                            color: value && !isNaN(value) && parseFloat(value) > 0 ? '#fff' : 'rgba(255,255,255,0.2)',
                            fontWeight: '950', cursor: value && !isNaN(value) && parseFloat(value) > 0 ? 'pointer' : 'not-allowed',
                            fontSize: '0.85rem', letterSpacing: '1px',
                            boxShadow: value && !isNaN(value) && parseFloat(value) > 0 ? `0 8px 20px -5px ${accentColor}55` : 'none',
                            transition: '0.3s'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ROLES = [
    { value: 'user', label: 'USER', color: 'rgba(255,255,255,0.6)', bg: 'rgba(255,255,255,0.04)', icon: '👤', desc: 'Acesso padrão ao painel' },
    { value: 'reseller', label: 'RESELLER', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)', icon: '💹', desc: 'Pode gerar chaves com saldo' },
    { value: 'admin', label: 'ADMIN', color: '#3366ff', bg: 'rgba(51, 102, 255, 0.08)', icon: '⚡', desc: 'Acesso total ao painel admin' },
];

const RoleModal = ({ isOpen, username, avatar, currentRole, onConfirm, onCancel }) => {
    const [selected, setSelected] = useState(currentRole);
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002,
            animation: 'fadeIn 0.2s ease'
        }} onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
            <div style={{
                background: 'linear-gradient(135deg, #0d1525 0%, #0a0f1e 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '30px', padding: '40px', width: '90%', maxWidth: '460px',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)',
                animation: 'pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                {/* User header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '28px' }}>
                    <img src={avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} style={{ width: '52px', height: '52px', borderRadius: '16px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <div>
                        <p style={{ margin: 0, fontWeight: '950', fontSize: '1.1rem' }}>{username}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>Alterar cargo de acesso</p>
                    </div>
                </div>

                {/* Role options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                    {ROLES.map(r => (
                        <button
                            key={r.value}
                            onClick={() => setSelected(r.value)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '16px',
                                padding: '16px 20px', borderRadius: '16px',
                                background: selected === r.value ? r.bg : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${selected === r.value ? r.color + '44' : 'rgba(255,255,255,0.05)'}`,
                                cursor: 'pointer', textAlign: 'left', transition: '0.2s',
                                boxShadow: selected === r.value ? `0 0 0 3px ${r.color}15` : 'none',
                            }}
                        >
                            <span style={{ fontSize: '1.4rem' }}>{r.icon}</span>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: '950', fontSize: '0.85rem', color: selected === r.value ? r.color : '#fff' }}>{r.label}</p>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{r.desc}</p>
                            </div>
                            {currentRole === r.value && (
                                <span style={{ fontSize: '0.55rem', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '20px', color: 'rgba(255,255,255,0.3)', fontWeight: '900', letterSpacing: '1px' }}>ATUAL</span>
                            )}
                            {selected === r.value && (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={r.color} strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                            )}
                        </button>
                    ))}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onCancel} style={{ flex: 1, padding: '15px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '1px', transition: '0.2s' }}>
                        CANCELAR
                    </button>
                    <button
                        onClick={() => { if (selected !== currentRole) onConfirm(selected); else onCancel(); }}
                        style={{
                            flex: 2, padding: '15px', borderRadius: '14px', border: 'none',
                            background: selected !== currentRole
                                ? `linear-gradient(135deg, ${ROLES.find(r => r.value === selected)?.color}, ${ROLES.find(r => r.value === selected)?.color}bb)`
                                : 'rgba(255,255,255,0.05)',
                            color: selected !== currentRole ? '#fff' : 'rgba(255,255,255,0.2)',
                            fontWeight: '950', cursor: 'pointer', fontSize: '0.85rem', letterSpacing: '1px',
                            boxShadow: selected !== currentRole ? `0 8px 20px -5px ${ROLES.find(r => r.value === selected)?.color}55` : 'none',
                            transition: '0.3s'
                        }}
                    >
                        CONFIRMAR CARGO
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminPage = () => {
    const { user, isAdmin, loading: authLoading } = useAuth()
    const CEO_ID = '1249488594414997676'
    const isOwner = user?.discord_id === CEO_ID
    const [activeTab, setActiveTab] = useState('dashboard')
    const [notification, setNotification] = useState(null)
    const notify = (msg, type = 'success') => setNotification({ msg, type })

    const [stats, setStats] = useState({ users: 0, discordMembers: 0, products: 0, totalSales: 0, activeLicenses: 0, monthlySales: 0, chartData: [] })
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [licenses, setLicenses] = useState([])
    const [moderators, setModerators] = useState([])
    const [logs, setLogs] = useState([])
    const [users, setUsers] = useState([])
    const [userSearch, setUserSearch] = useState('')

    const [newCatName, setNewCatName] = useState('')
    const [newProduct, setNewProduct] = useState({ name: '', description: '', category_id: '', image_url: '', status: 'UNDETECTED', integrity_hash: '', current_version: '1.0.0', download_url: '', changelog: '' })
    const [newPlan, setNewPlan] = useState({ product_id: '', name: '', duration_days: 0, price: 0 })
    const [newLicense, setNewLicense] = useState({ discord_id: '', product_id: '', plan_id: '', duration_days: 0 })
    const [newModId, setNewModId] = useState('')
    const [newsList, setNewsList] = useState([])
    const [allSettings, setAllSettings] = useState({})
    const [newNews, setNewNews] = useState({ title: '', description: '' })
    const [localSettings, setLocalSettings] = useState({})

    const [versionList, setVersionList] = useState([])
    const [newVersion, setNewVersion] = useState({ product_id: '', version: '', download_url: '', changelog: '', is_stable: true })

    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => { } })
    const askConfirm = (title, message, confirmText, action) => {
        setConfirmConfig({ isOpen: true, title, message, confirmText, onConfirm: () => { action(); setConfirmConfig(prev => ({ ...prev, isOpen: false })) } })
    }

    const [inputConfig, setInputConfig] = useState({ isOpen: false, title: '', subtitle: '', accentColor: '#22c55e', confirmText: 'CONFIRMAR', onConfirm: () => { } })
    const askInput = (title, subtitle, accentColor, confirmText, onConfirm) => {
        setInputConfig({ isOpen: true, title, subtitle, accentColor, confirmText, onConfirm: (val) => { onConfirm(val); setInputConfig(prev => ({ ...prev, isOpen: false })) } })
    }

    const [roleModal, setRoleModal] = useState({ isOpen: false, user: null })
    const openRoleModal = (user) => setRoleModal({ isOpen: true, user })
    const closeRoleModal = () => setRoleModal({ isOpen: false, user: null })

    useEffect(() => { if (isAdmin) refreshData() }, [isAdmin, activeTab])

    useEffect(() => {
        setLocalSettings(allSettings);
    }, [allSettings])

    const fetchStats = async () => {
        try { const res = await axios.get(`${API_URL}/api/admin/stats`, { withCredentials: true }); setStats(res.data) } catch (e) { }
    }
    const fetchProducts = async () => {
        try { const res = await axios.get(`${API_URL}/api/products`, { withCredentials: true }); setProducts(res.data) } catch (e) { }
    }
    const fetchCategories = async () => {
        try { const res = await axios.get(`${API_URL}/api/admin/categories`, { withCredentials: true }); setCategories(res.data) } catch (e) { }
    }
    const fetchLicenses = async () => {
        try { const res = await axios.get(`${API_URL}/api/admin/licenses`, { withCredentials: true }); setLicenses(res.data) } catch (e) { }
    }
    const fetchModerators = async () => {
        try { const res = await axios.get(`${API_URL}/api/admin/moderators`, { withCredentials: true }); setModerators(res.data) } catch (e) { }
    }
    const fetchNews = async () => {
        try { const res = await axios.get(`${API_URL}/api/admin/news`, { withCredentials: true }); setNewsList(res.data) } catch (e) { }
    }
    const fetchSettings = async () => {
        try { const res = await axios.get(`${API_URL}/api/admin/settings`, { withCredentials: true }); setAllSettings(res.data) } catch (e) { }
    }
    const fetchLogs = async () => {
        try { const res = await axios.get(`${API_URL}/api/admin/logs`, { withCredentials: true }); setLogs(res.data) } catch (e) { }
    }
    const fetchVersions = async () => {
        try { const res = await axios.get(`${API_URL}/api/admin/versions`, { withCredentials: true }); setVersionList(res.data) } catch (e) { }
    }
    const fetchUsers = async () => {
        try { const res = await axios.get(`${API_URL}/api/admin/users`, { withCredentials: true }); setUsers(res.data) } catch (e) { }
    }


    const refreshData = async () => {
        if (activeTab === 'dashboard') await fetchStats();
        await fetchProducts();
        await fetchCategories();
        await fetchLicenses();
        await fetchModerators();
        await fetchNews();
        await fetchSettings();
        if (activeTab === 'updates') await fetchVersions();
        if (activeTab === 'users' || activeTab === 'resellers') await fetchUsers();
        await fetchLogs();
    }

    const handleCreateNews = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_URL}/api/admin/news`, newNews, { withCredentials: true })
            setNewNews({ title: '', description: '' }); fetchNews(); notify('NOTÍCIA PUBLICADA!')
        } catch (err) { notify('ERRO AO PUBLICAR', 'error') }
    }

    const handleDeleteNews = async (id) => {
        try { await axios.delete(`${API_URL}/api/admin/news/${id}`, { withCredentials: true }); fetchNews(); notify('NOTÍCIA REMOVIDA.') } catch (e) { }
    }

    const handleUpdateSetting = async (key, value) => {
        try {
            await axios.post(`${API_URL}/api/admin/settings`, { key, value }, { withCredentials: true })
            fetchSettings(); notify('AJUSTE SALVO!')
        } catch (err) { notify('ERRO AO SALVAR', 'error') }
    }

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/admin/categories`, { name: newCatName }, { withCredentials: true });
            setNewCatName(''); fetchCategories(); notify('CATEGORIA CRIADA!');
        } catch (err) { notify(err.response?.data?.error || 'ERRO AO CRIAR CATEGORIA', 'error') }
    }

    const handleDeleteCategory = (id) => {
        askConfirm('DELETAR CATEGORIA?', 'Isso pode afetar os produtos vinculados. Deseja prosseguir?', 'SIM, DELETAR', async () => {
            try { await axios.delete(`${API_URL}/api/admin/categories/${id}`, { withCredentials: true }); fetchCategories(); notify('CATEGORIA REMOVIDA.') } catch (e) { }
        })
    }

    const handleCreateProduct = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_URL}/api/admin/products`, newProduct, { withCredentials: true })
            setNewProduct({ name: '', description: '', category_id: '', image_url: '', status: 'UNDETECTED', integrity_hash: '' })
            fetchProducts(); notify('PRODUTO LANÇADO COM SUCESSO!')
        } catch (err) { notify(err.response?.data?.error || err.message, 'error') }
    }

    const handleDeleteProduct = (id) => {
        askConfirm('DELETAR PRODUTO?', 'Todos os planos e licenças deste produto serão removidos permanentemente.', 'REMOVER TUDO', async () => {
            try { await axios.delete(`${API_URL}/api/admin/products/${id}`, { withCredentials: true }); fetchProducts(); notify('PRODUTO REMOVIDO.') } catch (e) { }
        })
    }

    const handleCreatePlan = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_URL}/api/admin/plans`, newPlan, { withCredentials: true })
            setNewPlan({ product_id: '', name: '', duration_days: 0, price: 0 })
            fetchProducts(); notify('PLANO ADICIONADO!')
        } catch (err) { notify('ERRO AO CRIAR PLANO', 'error') }
    }

    const handleDeletePlan = async (id) => {
        try { await axios.delete(`${API_URL}/api/admin/plans/${id}`, { withCredentials: true }); fetchProducts(); notify('PLANO DELETADO.') } catch (e) { }
    }

    const handleCreateLicense = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_URL}/api/admin/assign`, newLicense, { withCredentials: true })
            setNewLicense({ discord_id: '', product_id: '', plan_id: '', duration_days: 0 })
            fetchLicenses(); notify('KEY GERADA COM SUCESSO!')
        } catch (err) { notify(err.response?.data?.error || err.message, 'error') }
    }

    const handleUpdateLicenseStatus = async (id, status) => {
        try { await axios.patch(`${API_URL}/api/admin/licenses/${id}/status`, { status }, { withCredentials: true }); fetchLicenses(); notify('STATUS ATUALIZADO.') } catch (e) { }
    }

    const handleDeleteLicense = (id) => {
        askConfirm('REVOGAR LICENÇA?', 'O acesso do usuário será interrompido imediatamente.', 'REVOGAR AGORA', async () => {
            try { await axios.delete(`${API_URL}/api/admin/licenses/${id}`, { withCredentials: true }); fetchLicenses(); notify('KEY REVOGADA.') } catch (e) { }
        })
    }

    const handleAddModerator = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_URL}/api/admin/moderators`, { discord_id: newModId }, { withCredentials: true })
            setNewModId(''); fetchModerators(); notify('MODERADOR ADICIONADO!')
        } catch (err) { notify('ERRO AO ADICIONAR MOD.', 'error') }
    }

    const handleRemoveModerator = (id) => {
        askConfirm('REMOVER MODERADOR?', 'Este usuário perderá acesso imediato ao painel administrativo.', 'REMOVER ACESSO', async () => {
            try { await axios.delete(`${API_URL}/api/admin/moderators/${id}`, { withCredentials: true }); fetchModerators(); notify('MODERADOR REMOVIDO.') } catch (e) { }
        })
    }

    const handlePullMembers = () => {
        askConfirm('SINCRONIZAR MEMBROS?', 'Isso forçará a entrada de todos os usuários no servidor do Discord. Pode levar alguns segundos.', 'INICIAR PUXADA', async () => {
            try {
                notify('Sincronizando usuários... Feche e aguarde.', 'success');
                const res = await axios.post(`${API_URL}/api/admin/pull-members`, {}, { withCredentials: true })
                notify(`CONCLUÍDO! ${res.data.count} membros processados.`)
            } catch (err) { notify('ERRO AO PUXAR MEMBROS.', 'error') }
        })
    }

    const handleCreateVersion = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_URL}/api/admin/versions`, newVersion, { withCredentials: true })
            setNewVersion({ product_id: '', version: '', download_url: '', changelog: '', is_stable: true })
            fetchVersions(); notify('VERSÃO PUBLICADA!')
        } catch (err) { notify('ERRO AO PUBLICAR VERSÃO', 'error') }
    }

    const handleDeleteVersion = (id) => {
        askConfirm('DELETAR VERSÃO?', 'Esta atualização será removida permanentemente.', 'DELETAR', async () => {
            try { await axios.delete(`${API_URL}/api/admin/versions/${id}`, { withCredentials: true }); fetchVersions(); notify('VERSÃO REMOVIDA.') } catch (e) { }
        })
    }


    if (authLoading) return null
    if (!isAdmin) return <Navigate to="/" />

    return (
        <div style={{ minHeight: '100vh', background: '#080c14', color: '#fff' }}>
            <Navbar />
            {notification && <Notification message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
            <ConfirmModal {...confirmConfig} onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))} />
            <InputModal {...inputConfig} onCancel={() => setInputConfig(prev => ({ ...prev, isOpen: false }))} />
            <RoleModal
                isOpen={roleModal.isOpen}
                username={roleModal.user?.username}
                avatar={roleModal.user?.avatar}
                currentRole={roleModal.user?.role || 'user'}
                onCancel={closeRoleModal}
                onConfirm={async (newRole) => {
                    try {
                        await axios.patch(`${API_URL}/api/admin/users/${roleModal.user?.id}/role`, { role: newRole }, { withCredentials: true });
                        notify(`CARGO ALTERADO PARA ${newRole.toUpperCase()}!`);
                        closeRoleModal();
                        fetchUsers();
                    } catch (err) { notify(err.response?.data?.error || 'Erro ao alterar cargo', 'error'); }
                }}
            />

            <div style={{ paddingTop: '120px', paddingBottom: '100px', width: '90%', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', overflowX: 'auto' }}>
                    {[
                        ['dashboard', 'CENTRAL'],
                        ['products', 'STOCKS'],
                        ['categories', 'TAGS'],
                        ['licenses', 'KEYS'],
                        ['updates', 'VERSIONS'],
                        ['news', 'NOTICES'],
                        ['settings', 'COMMUNITY'],
                        ...(isOwner ? [['resellers', 'REVENDA 👑']] : []),
                        ['users', 'USUÁRIOS'],
                        ['moderators', 'ACCESS'],
                        ['logs', 'LOGS TÁTICOS']
                    ].map(([tab, label]) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', color: activeTab === tab ? '#3b82f6' : 'rgba(255,255,255,0.2)', fontSize: '0.85rem', fontWeight: '950', cursor: 'pointer', transition: '0.3s', letterSpacing: '2px', whiteSpace: 'nowrap' }}>
                            {label}
                        </button>
                    ))}
                </div>

                {activeTab === 'resellers' && isOwner && (() => {
                    const resellers = users.filter(u => u.role === 'reseller');
                    return (
                        <div>
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                        <div style={{ width: '4px', height: '28px', background: 'linear-gradient(180deg, #22c55e, #16a34a)', borderRadius: '2px' }} />
                                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '950', letterSpacing: '-0.5px' }}>Rede de Revendedores</h2>
                                    </div>
                                    <p style={{ margin: 0, marginLeft: '16px', color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem' }}>
                                        {resellers.length} revendedor{resellers.length !== 1 ? 'es' : ''} ativos · Total em caixa: <span style={{ color: '#22c55e', fontWeight: '800' }}>R$ {resellers.reduce((a, u) => a + (u.reseller_balance || 0), 0).toFixed(2)}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={fetchUsers}
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" /></svg>
                                    ATUALIZAR
                                </button>
                            </div>

                            {resellers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '28px', border: '1px dashed rgba(255,255,255,0.06)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }}>💹</div>
                                    <p style={{ margin: 0, fontWeight: '800', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>Nenhum revendedor ainda</p>
                                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', marginTop: '6px' }}>Acesse a aba USUÁRIOS e promova alguém para <strong>RESELLER</strong></p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                                    {resellers.map(u => (
                                        <div key={u.id} style={{
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '24px',
                                            padding: '24px',
                                            transition: '0.2s',
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                            onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)'}
                                            onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                                        >
                                            {/* subtle green glow top */}
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent)' }} />

                                            {/* User info */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <img
                                                        src={u.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                                        style={{ width: '48px', height: '48px', borderRadius: '16px', objectFit: 'cover', border: '2px solid rgba(34,197,94,0.3)' }}
                                                        alt=""
                                                    />
                                                    <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '14px', height: '14px', background: '#22c55e', borderRadius: '50%', border: '2px solid #080c14' }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: 0, fontWeight: '950', fontSize: '0.95rem' }}>{u.username}</p>
                                                    <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', marginTop: '3px' }}>{u.discord_id}</p>
                                                </div>
                                                <span style={{ fontSize: '0.58rem', background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', padding: '4px 10px', borderRadius: '20px', fontWeight: '900', letterSpacing: '0.5px' }}>RESELLER</span>
                                            </div>

                                            {/* Balance display */}
                                            <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: '16px', padding: '16px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', fontWeight: '900', letterSpacing: '1.5px', marginBottom: '4px' }}>SALDO DISPONÍVEL</p>
                                                    <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '950', color: u.reseller_balance > 0 ? '#22c55e' : 'rgba(255,255,255,0.2)', letterSpacing: '-1px', lineHeight: 1 }}>
                                                        R$ {(u.reseller_balance || 0).toFixed(2)}
                                                    </p>
                                                </div>
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.3"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => askInput(
                                                        'ADICIONAR SALDO',
                                                        `${u.username} · Saldo atual: R$ ${(u.reseller_balance || 0).toFixed(2)}`,
                                                        '#22c55e', 'ADICIONAR',
                                                        async (amount) => {
                                                            try {
                                                                await axios.post(`${API_URL}/api/admin/users/${u.id}/reseller-balance`, { amount }, { withCredentials: true });
                                                                notify('SALDO ADICIONADO!'); fetchUsers();
                                                            } catch (err) { notify('Erro', 'error'); }
                                                        }
                                                    )}
                                                    style={{ flex: 1, padding: '11px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', color: '#22c55e', fontWeight: '900', cursor: 'pointer', fontSize: '0.72rem', letterSpacing: '0.5px', transition: '0.2s' }}
                                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(34,197,94,0.15)'}
                                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(34,197,94,0.08)'}
                                                >
                                                    + ADICIONAR
                                                </button>
                                                <button
                                                    onClick={() => askInput(
                                                        'DEFINIR SALDO',
                                                        `${u.username} · Definir valor exato`,
                                                        '#3366ff', 'DEFINIR',
                                                        async (amount) => {
                                                            try {
                                                                await axios.post(`${API_URL}/api/admin/users/${u.id}/set-reseller-balance`, { amount }, { withCredentials: true });
                                                                notify('SALDO DEFINIDO!'); fetchUsers();
                                                            } catch (err) { notify('Erro', 'error'); }
                                                        }
                                                    )}
                                                    style={{ flex: 1, padding: '11px', background: 'rgba(51,102,255,0.08)', border: '1px solid rgba(51,102,255,0.2)', borderRadius: '12px', color: '#3366ff', fontWeight: '900', cursor: 'pointer', fontSize: '0.72rem', letterSpacing: '0.5px', transition: '0.2s' }}
                                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(51,102,255,0.15)'}
                                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(51,102,255,0.08)'}
                                                >
                                                    ≡ DEFINIR
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })()}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                        <div style={{ borderLeft: '4px solid #22c55e', paddingLeft: '20px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '950', letterSpacing: '1px' }}>GERENCIAMENTO DE REVENDEDORES</h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Visualize e controle o saldo de crédito dos seus revendedores oficiais.</p>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '0', borderRadius: '35px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.7rem', fontWeight: '950', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px' }}>
                                <tr>
                                    <th style={{ padding: '25px' }}>REVENDEDOR</th>
                                    <th>DISCORD ID</th>
                                    <th>SALDO ATUAL</th>
                                    <th style={{ padding: '25px', textAlign: 'right' }}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                                {users.filter(u => u.role === 'reseller').map(u => (
                                    <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '20px 25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <img src={u.avatar} style={{ width: '40px', height: '40px', borderRadius: '12px' }} />
                                            {u.username}
                                        </td>
                                        <td style={{ opacity: 0.4 }}>{u.discord_id}</td>
                                        <td style={{ color: '#22c55e', fontWeight: '900' }}>R$ {u.reseller_balance?.toFixed(2)}</td>
                                        <td style={{ padding: '20px 25px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => {
                                                    askInput(
                                                        'DEFINIR SALDO',
                                                        `Revendedor: ${u.username} | Saldo atual: R$ ${u.reseller_balance?.toFixed(2)}`,
                                                        '#22c55e',
                                                        'DEFINIR SALDO',
                                                        async (amount) => {
                                                            try {
                                                                await axios.post(`${API_URL}/api/admin/users/${u.id}/set-reseller-balance`, { amount }, { withCredentials: true });
                                                                notify('SALDO DEFINIDO!'); fetchUsers();
                                                            } catch (err) { notify('Erro ao definir saldo', 'error'); }
                                                        }
                                                    );
                                                }}
                                                className="btn-primary"
                                                style={{ padding: '8px 20px', fontSize: '0.7rem', background: '#22c55e' }}
                                            >
                                                SET SALDO
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.filter(u => u.role === 'reseller').length === 0 && (
                                    <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', opacity: 0.3 }}>Nenhum revendedor cadastrado. Promova alguém na aba USUÁRIOS.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}

                {activeTab === 'users' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                            <div style={{ borderLeft: '4px solid #3366ff', paddingLeft: '20px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '950', letterSpacing: '1px' }}>GERENCIAMENTO DE USUÁRIOS & REVENDA</h2>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Gerencie permissões, cargos de revendedores e adicione saldo para geração de stock.</p>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Procurar Usuário / ID..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '0.8rem',
                                        width: '250px',
                                        outline: 'none'
                                    }}
                                />
                                <svg style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '0', borderRadius: '35px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.7rem', fontWeight: '950', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px' }}>
                                    <tr>
                                        <th style={{ padding: '25px' }}>USUÁRIO</th>
                                        <th>DISCORD ID</th>
                                        <th>CARGO</th>
                                        <th>SALDO REVENDA</th>
                                        <th style={{ padding: '25px', textAlign: 'right' }}>AÇÕES</th>
                                    </tr>
                                </thead>
                                <tbody style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                                    {users.filter(u =>
                                        (u.username?.toLowerCase().includes(userSearch.toLowerCase()) || u.discord_id?.includes(userSearch))
                                    ).map(u => (
                                        <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.03)', transition: '0.2s' }} className="hover-row">
                                            <td style={{ padding: '20px 25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <img src={u.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} style={{ width: '40px', height: '40px', borderRadius: '14px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.05)' }} alt="" />
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: '800' }}>{u.username}</p>
                                                    <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>#{u.id}</p>
                                                </div>
                                            </td>
                                            <td style={{ opacity: 0.5, fontSize: '0.8rem', fontFamily: 'monospace' }}>{u.discord_id}</td>
                                            <td>
                                                <button
                                                    onClick={() => openRoleModal(u)}
                                                    style={{
                                                        background: u.role === 'admin' ? 'rgba(51, 102, 255, 0.12)' : u.role === 'reseller' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255,255,255,0.05)',
                                                        border: `1px solid ${u.role === 'admin' ? 'rgba(51,102,255,0.3)' : u.role === 'reseller' ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                                        padding: '7px 14px',
                                                        borderRadius: '10px',
                                                        color: u.role === 'admin' ? '#3366ff' : u.role === 'reseller' ? '#22c55e' : 'rgba(255,255,255,0.6)',
                                                        fontSize: '0.72rem',
                                                        fontWeight: '900',
                                                        cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        transition: '0.2s',
                                                        letterSpacing: '0.5px'
                                                    }}
                                                    onMouseOver={e => e.currentTarget.style.opacity = '0.75'}
                                                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                                                >
                                                    {u.role === 'admin' ? '⚡' : u.role === 'reseller' ? '💹' : '👤'}
                                                    {(u.role || 'user').toUpperCase()}
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
                                                </button>
                                            </td>
                                            <td style={{ fontWeight: '900' }}>
                                                <span style={{ color: u.reseller_balance > 0 ? '#22c55e' : 'rgba(255,255,255,0.2)' }}>R$ {u.reseller_balance?.toFixed(2) || '0.00'}</span>
                                            </td>
                                            <td style={{ padding: '20px 25px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => {
                                                        askInput(
                                                            'ADICIONAR SALDO',
                                                            `${u.username} | Saldo atual: R$ ${u.reseller_balance?.toFixed(2) || '0.00'}`,
                                                            '#22c55e',
                                                            'ADICIONAR',
                                                            async (amount) => {
                                                                try {
                                                                    await axios.post(`${API_URL}/api/admin/users/${u.id}/reseller-balance`, { amount }, { withCredentials: true });
                                                                    notify('SALDO ADICIONADO!'); fetchUsers();
                                                                } catch (err) { notify(err.response?.data?.error || 'Erro', 'error'); }
                                                            }
                                                        );
                                                    }}
                                                    style={{
                                                        background: 'linear-gradient(to right, #22c55e, #16a34a)',
                                                        border: 'none',
                                                        color: '#fff',
                                                        padding: '10px 18px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '950',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
                                                    }}
                                                >
                                                    + SALDO
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'updates' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem' }}>
                        <div>
                            <div style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '20px', marginBottom: '30px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '1px' }}>LANÇAR ATUALIZAÇÃO</h2>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Envie novas versões e changelogs para os produtos.</p>
                            </div>
                            <form className="card" onSubmit={handleCreateVersion} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <select required className="input" value={newVersion.product_id} onChange={e => setNewVersion({ ...newVersion, product_id: e.target.value })}>
                                    <option value="">SELECIONE O PRODUTO</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <input required type="text" placeholder="Versão (ex: v1.0.4)" className="input" value={newVersion.version} onChange={e => setNewVersion({ ...newVersion, version: e.target.value })} />
                                <input required type="url" placeholder="Link de Download" className="input" value={newVersion.download_url} onChange={e => setNewVersion({ ...newVersion, download_url: e.target.value })} />
                                <textarea placeholder="O que mudou? (Changelog)" className="input" style={{ minHeight: '100px' }} value={newVersion.changelog} onChange={e => setNewVersion({ ...newVersion, changelog: e.target.value })} />
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={newVersion.is_stable} onChange={e => setNewVersion({ ...newVersion, is_stable: e.target.checked })} />
                                    MARCAR COMO ESTÁVEL
                                </label>
                                <button type="submit" className="button" style={{ background: '#3b82f6', color: '#fff', marginTop: '10px' }}>PUBLICAR LANÇAMENTO</button>
                            </form>
                        </div>
                        <div>
                            <div style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '20px', marginBottom: '30px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '1px' }}>HISTÓRICO DE VERSÕES</h2>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Versões ativas e estáveis por software.</p>
                            </div>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {versionList.map(v => (
                                    <div key={v.id} className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <strong style={{ fontSize: '1.1rem', color: '#3b82f6' }}>{v.version}</strong>
                                                <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: v.is_stable ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: v.is_stable ? '#22c55e' : '#ef4444', borderRadius: '4px', textTransform: 'uppercase' }}>
                                                    {v.is_stable ? 'ESTÁVEL' : 'BETA'}
                                                </span>
                                            </div>
                                            <p style={{ margin: '5px 0 0', fontSize: '0.8rem', fontWeight: '700' }}>{v.product_name}</p>
                                            <p style={{ margin: '5px 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{v.changelog || 'Nenhum detalhe informado.'}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <a href={v.download_url} target="_blank" rel="noreferrer" className="button" style={{ padding: '8px 12px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: '#fff' }}>DOWNLOAD</a>
                                            <button onClick={() => handleDeleteVersion(v.id)} className="button" style={{ padding: '8px 12px', fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none' }}>DELETAR</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '20px', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '1px', filter: 'drop-shadow(0 0 10px rgba(59,130,246,0.3))' }}>SISTEMA DE AUDITORIA & TRACKING</h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', maxWidth: '600px', lineHeight: '1.6' }}>Histórico completo operacional do painel Zyro. Todas as integrações com os bots de atendimento Discord deixam rastros.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {logs && logs.map(l => (
                                <div key={l.id} className="card" style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <img src={l.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                        <div>
                                            <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: '700' }}><strong style={{ color: '#3b82f6' }}>{l.username}</strong> executou: <span style={{ color: '#fff' }}>{l.action}</span></p>
                                            <p style={{ fontSize: '0.75rem', margin: 0, color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                                <span>ID: {l.discord_id}</span> • <span>{l.details || 'N/A'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                                        {new Date(l.created_at).toLocaleString('pt-BR')}
                                    </span>
                                </div>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <div className="card" style={{ padding: '30px', textAlign: 'center', opacity: 0.5 }}>
                                    Sem dados do Discord para exibir hoje.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem' }}>
                            {[
                                { label: 'TOTAL USERS', val: stats.users, color: '#3b82f6' },
                                { label: 'DISCORD', val: stats.discordMembers, color: '#5865F2' },
                                { label: 'INVENTORY', val: stats.products, color: '#3b82f6' },
                                { label: 'SALES FLOW', val: stats.totalSales, color: '#3b82f6' },
                                { label: 'ACTIVE SUBS', val: stats.activeLicenses, color: '#22c55e' }
                            ].map((s, i) => (
                                <div key={i} className="glass" style={{ padding: '2.5rem', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.02)', background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }}>
                                    <p style={{ fontSize: '0.6rem', fontWeight: '950', color: 'rgba(255,255,255,0.3)', marginBottom: '0.8rem', letterSpacing: '2px' }}>{s.label}</p>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '950', color: s.color }}>{s.val}</h3>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                            <div className="glass" style={{ padding: '3rem', borderRadius: '45px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontWeight: '950', fontSize: '1.4rem', letterSpacing: '-0.5px' }}>ANÁLISE DE VENDAS (DB)</h3>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: '950', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '6px 14px', borderRadius: '12px' }}>{stats.monthlySales} VENDAS NO MÊS</span>
                                    </div>
                                </div>
                                <ActivityChart data={stats.chartData} label="licenças geradas" />
                            </div>

                            <div className="glass" style={{ padding: '2.5rem', borderRadius: '45px' }}>
                                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '950' }}>FEED EM TEMPO REAL</h3>
                                    <div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    {licenses.slice(0, 5).map((l, i) => (
                                        <div key={l.id} style={{ display: 'flex', gap: '18px', alignItems: 'center', opacity: 1 - (i * 0.15) }}>
                                            <div style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '1rem', color: '#3b82f6' }}>{l.username[0].toUpperCase()}</div>
                                            <div>
                                                <p style={{ fontSize: '0.9rem', fontWeight: '950', margin: 0 }}>{l.username}</p>
                                                <p style={{ fontSize: '0.75rem', opacity: 0.4, margin: 0 }}>{l.product_name} • {new Date(l.assigned_at).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="glass" style={{ padding: '2.5rem', borderRadius: '35px' }}>
                                <h3 style={{ marginBottom: '1.8rem', fontWeight: '950', letterSpacing: '1px' }}>CRIAR PRODUTO</h3>
                                <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input type="text" placeholder="Nome do Software" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none', fontWeight: '700' }} />
                                    <textarea placeholder="Descrição Técnica" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none', minHeight: '100px', resize: 'vertical' }} />
                                    <div style={{ position: 'relative' }}>
                                        <select value={newProduct.category_id} onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none', appearance: 'none', cursor: 'pointer', fontWeight: '700' }}>
                                            <option value="">DEFINIR CATEGORIA</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                                        </select>
                                    </div>
                                    <input type="text" placeholder="URL da Imagem de Capa" value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none' }} />
                                    <select value={newProduct.status} onChange={e => setNewProduct({ ...newProduct, status: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none', appearance: 'none', cursor: 'pointer', fontWeight: '700' }}>
                                        <option value="UNDETECTED">UNDETECTED</option>
                                        <option value="MAINTENANCE">MAINTENANCE</option>
                                        <option value="TESTING">TESTING</option>
                                        <option value="DETECTED">DETECTED</option>
                                    </select>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                                        <input type="text" placeholder="Versão (ex: 1.0.2)" value={newProduct.current_version} onChange={e => setNewProduct({ ...newProduct, current_version: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none', fontWeight: '700' }} />
                                        <input type="text" placeholder="URL Direta de Download (.exe / .zip)" value={newProduct.download_url} onChange={e => setNewProduct({ ...newProduct, download_url: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none' }} />
                                    </div>
                                    <textarea placeholder="Changelog / Notas da Versão" value={newProduct.changelog} onChange={e => setNewProduct({ ...newProduct, changelog: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none', minHeight: '80px', resize: 'vertical' }} />
                                    <button type="submit" className="btn-primary" style={{ height: '55px', borderRadius: '18px', fontWeight: '950' }}>PUBLICAR SOFTWARE</button>
                                </form>
                            </div>
                            <div className="glass" style={{ padding: '2.5rem', borderRadius: '35px' }}>
                                <h3 style={{ marginBottom: '1.8rem', fontWeight: '950', letterSpacing: '1px' }}>GERENCIAR PLANOS</h3>
                                <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <select value={newPlan.product_id} onChange={e => setNewPlan({ ...newPlan, product_id: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                                        <option value="">SELECIONAR PRODUTO</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <input type="text" placeholder="Nome do Ciclo (ex: 30 Dias)" value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none' }} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input type="number" placeholder="Dias (0=Lifetime)" value={newPlan.duration_days} onChange={e => setNewPlan({ ...newPlan, duration_days: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none' }} />
                                        <input type="number" placeholder="Preço (R$)" value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none' }} />
                                    </div>
                                    <button type="submit" className="btn-primary" style={{ height: '55px', borderRadius: '18px', fontWeight: '950' }}>ADCIONAR PLANO</button>
                                </form>
                            </div>
                        </div>
                        <div className="glass" style={{ padding: '3rem', borderRadius: '45px' }}>
                            <h3 style={{ marginBottom: '2.5rem', fontWeight: '950', letterSpacing: '1px' }}>CENTRAL DE STOCKS</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {products.map(p => (
                                    <div key={p.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontWeight: '950', fontSize: '1.2rem', color: '#3b82f6' }}>{p.name.toUpperCase()}</span>
                                                    <span style={{
                                                        fontSize: '0.6rem',
                                                        fontWeight: '900',
                                                        background: p.status === 'UNDETECTED' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                                        color: p.status === 'UNDETECTED' ? '#22c55e' : '#ef4444',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px'
                                                    }}>{p.status}</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: '950', opacity: 0.3, letterSpacing: '2px', marginTop: '4px' }}>{p.category_name || 'NO CATEGORY'} • v{p.current_version || '1.0.0'}</p>
                                                {p.changelog && <p style={{ margin: 0, fontSize: '0.6rem', color: '#3b82f6', marginTop: '5px', cursor: 'pointer' }} onClick={() => alert(`CHANGELOG v${p.current_version}:\n\n${p.changelog}`)}>VER NOTAS DA VERSÃO</p>}
                                            </div>
                                            <button onClick={() => handleDeleteProduct(p.id)} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer', padding: '8px 15px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '950' }}>DELETAR</button>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                            {p.plans && p.plans.map(plan => (
                                                <div key={plan.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 15px', borderRadius: '12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.05)', fontWeight: '800' }}>
                                                    {plan.name} - <span style={{ color: '#22c55e' }}>R${plan.price}</span>
                                                    <button onClick={() => handleDeletePlan(plan.id)} style={{ color: 'rgba(255,255,255,0.2)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                                                </div>
                                            ))}
                                            {(!p.plans || p.plans.length === 0) && <p style={{ fontSize: '0.75rem', opacity: 0.2, margin: 0 }}>Sem planos ativos.</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem' }}>
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '35px' }}>
                            <h3 style={{ marginBottom: '1.8rem', fontWeight: '950' }}>IDENTIFICADORES</h3>
                            <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input type="text" placeholder="Nome da Tag" value={newCatName} onChange={e => setNewCatName(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none' }} />
                                <button type="submit" className="btn-primary" style={{ height: '55px', borderRadius: '18px', fontWeight: '950' }}>CRIAR IDENTIFICADOR</button>
                            </form>
                        </div>
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '35px' }}>
                            <h3 style={{ marginBottom: '1.8rem', fontWeight: '950' }}>TAGS OPERACIONAIS</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                                {categories.map(c => (
                                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '18px', background: 'rgba(255,255,255,0.02)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ fontWeight: '950', fontSize: '0.9rem' }}>{c.name.toUpperCase()}</span>
                                        <button onClick={() => handleDeleteCategory(c.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '950' }}>REVOGAR</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'updates' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="glass" style={{ padding: '2.5rem', borderRadius: '35px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontWeight: '950', letterSpacing: '1px' }}>LAUNCHER UPDATER</h3>
                                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>Configure a versão global do launcher para forçar a atualização automática em todos os usuários.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.65rem', fontWeight: '900', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '8px' }}>VERSÃO ATUAL DO LAUNCHER</label>
                                        <input
                                            type="text"
                                            value={localSettings.launcher_version || ''}
                                            onChange={e => setLocalSettings({ ...localSettings, launcher_version: e.target.value })}
                                            placeholder="ex: 1.5.0"
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.65rem', fontWeight: '900', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '8px' }}>LINK DE DOWNLOAD DO NOVO .EXE</label>
                                        <input
                                            type="text"
                                            value={localSettings.launcher_download_url || ''}
                                            onChange={e => setLocalSettings({ ...localSettings, launcher_download_url: e.target.value })}
                                            placeholder="https://..."
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none' }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleUpdateSetting('launcher_version', localSettings.launcher_version);
                                            handleUpdateSetting('launcher_download_url', localSettings.launcher_download_url);
                                            notify('SISTEMA DE AUTO-UPDATE ATUALIZADO!');
                                        }}
                                        className="btn-primary"
                                        style={{ height: '50px', borderRadius: '15px', marginTop: '10px' }}
                                    >
                                        SALVAR CONFIGURAÇÃO
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '35px' }}>
                            <h3 style={{ marginBottom: '2rem', fontWeight: '950' }}>HISTÓRICO DE UPDATES DE SOFTWARES</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {products.map(p => (
                                    <div key={p.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '950', fontSize: '0.9rem' }}>{p.name.toUpperCase()}</p>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#3b82f6' }}>Versão Atual: v{p.current_version}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>STATUS: {p.status}</p>
                                            {p.download_url && <span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '5px' }}>🔗 LINK VINCULADO</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'licenses' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem' }}>
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '35px' }}>
                            <h3 style={{ marginBottom: '1.8rem', fontWeight: '950' }}>GERAÇÃO SERIAL</h3>
                            <form onSubmit={handleCreateLicense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input type="text" placeholder="Discord ID do Destinatário" value={newLicense.discord_id} onChange={e => setNewLicense({ ...newLicense, discord_id: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none' }} />
                                <select value={newLicense.product_id} onChange={e => setNewLicense({ ...newLicense, product_id: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                                    <option value="">VINCULAR SOFTWARE</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
                                </select>
                                <select value={newLicense.plan_id} onChange={e => setNewLicense({ ...newLicense, plan_id: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                                    <option value="">DEFINIR CICLO DE ASSINATURA</option>
                                    {newLicense.product_id && products.find(p => p.id == newLicense.product_id)?.plans?.map(pl => (
                                        <option key={pl.id} value={pl.id}>{pl.name.toUpperCase()} ({pl.duration_days === 0 ? 'VITALÍCIO' : pl.duration_days + ' DIAS'})</option>
                                    ))}
                                </select>
                                <input type="number" placeholder="DIAS MANUAIS (0 = VITALÍCIO)" value={newLicense.duration_days} onChange={e => setNewLicense({ ...newLicense, duration_days: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none' }} />
                                <button type="submit" className="btn-primary" style={{ height: '55px', borderRadius: '18px', fontWeight: '950' }}>AUTORIZAR ACESSO</button>
                            </form>
                        </div>
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '45px', overflowX: 'auto' }}>
                            <h3 style={{ marginBottom: '2rem', fontWeight: '950' }}>LOG DE LICENÇAS ATIVAS</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
                                        <th style={{ padding: '15px', fontWeight: '950' }}>USUÁRIO</th>
                                        <th style={{ padding: '15px', fontWeight: '950' }}>SOFTWARE</th>
                                        <th style={{ padding: '15px', fontWeight: '950' }}>SERIAL KEY</th>
                                        <th style={{ padding: '15px', fontWeight: '950' }}>STATUS</th>
                                        <th style={{ padding: '15px', textAlign: 'right', fontWeight: '950' }}>AÇÕES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {licenses.map(l => (
                                        <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: '0.3s' }}>
                                            <td style={{ padding: '15px', fontWeight: '800' }}>{l.username}</td>
                                            <td style={{ padding: '15px', color: '#3b82f6', fontWeight: '950' }}>{l.product_name}</td>
                                            <td style={{ padding: '15px', fontFamily: '"JetBrains Mono", monospace', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{l.license_key}</td>
                                            <td style={{ padding: '15px' }}><span style={{ color: l.status === 'active' ? '#22c55e' : '#ef4444', fontWeight: '950', fontSize: '0.7rem', padding: '4px 10px', background: l.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{l.status.toUpperCase()}</span></td>
                                            <td style={{ padding: '15px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleUpdateLicenseStatus(l.id, l.status === 'active' ? 'suspended' : 'active')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', padding: '6px 12px', fontSize: '0.7rem', fontWeight: '950', cursor: 'pointer' }}>{l.status === 'active' ? 'PAUSAR' : 'ATIVAR'}</button>
                                                    <button onClick={() => handleDeleteLicense(l.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', borderRadius: '10px', padding: '6px 12px', fontSize: '0.7rem', fontWeight: '950', cursor: 'pointer' }}>REVOGAR</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'moderators' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <div className="glass" style={{ padding: '2.5rem', borderRadius: '35px' }}>
                                <h3 style={{ marginBottom: '1.8rem', fontWeight: '950' }}>WHITE-LIST ADMIN</h3>
                                <form onSubmit={handleAddModerator} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input type="text" placeholder="Discord ID do Moderador" value={newModId} onChange={e => setNewModId(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none' }} />
                                    <button type="submit" className="btn-primary" style={{ height: '55px', borderRadius: '18px', fontWeight: '950' }}>AUTORIZAR MODERADOR</button>
                                </form>
                            </div>
                            <div className="glass" style={{ padding: '2.5rem', borderRadius: '35px', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                                <h3 style={{ marginBottom: '1rem', fontWeight: '950', color: '#8b5cf6' }}>FORÇAR ENTRADA (OAUTH2)</h3>
                                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', lineHeight: '1.5' }}>Puxa todos os membros que já logaram no banco de dados para dentro do seu servidor principal do Discord.</p>
                                <button onClick={handlePullMembers} style={{ width: '100%', height: '55px', borderRadius: '18px', fontWeight: '950', background: '#8b5cf6', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <span>PUXAR USUÁRIOS PRO DISCORD</span>
                                </button>
                            </div>
                        </div>
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '35px' }}>
                            <h3 style={{ marginBottom: '2rem', fontWeight: '950' }}>ESTAFE AUTORIZADA</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {moderators.map(m => (
                                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '950', fontSize: '0.95rem' }}>Discord ID: {m.discord_id}</p>
                                            <p style={{ margin: 0, fontSize: '0.65rem', color: '#3b82f6', fontWeight: '950', letterSpacing: '1px', marginTop: '4px' }}>ACCESS LEVEL: ADMINISTRATOR</p>
                                        </div>
                                        <button onClick={() => handleRemoveModerator(m.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '10px 20px', borderRadius: '12px', fontWeight: '950', fontSize: '0.75rem', cursor: 'pointer' }}>REVOGAR ACESSO</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'news' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem' }}>
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '35px' }}>
                            <h3 style={{ marginBottom: '1.8rem', fontWeight: '950' }}>POSTAR ATUALIZAÇÃO</h3>
                            <form onSubmit={handleCreateNews} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input type="text" placeholder="Título da Notícia" value={newNews.title} onChange={e => setNewNews({ ...newNews, title: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none' }} />
                                <textarea placeholder="Conteúdo da Atualização" value={newNews.description} onChange={e => setNewNews({ ...newNews, description: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none', minHeight: '120px' }} />
                                <button type="submit" className="btn-primary" style={{ height: '55px', borderRadius: '18px', fontWeight: '950' }}>PUBLICAR NO FEED</button>
                            </form>
                        </div>
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '35px' }}>
                            <h3 style={{ marginBottom: '2rem', fontWeight: '950' }}>FEED HISTÓRICO</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {newsList.map(n => (
                                    <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '950', fontSize: '0.95rem' }}>{n.title}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{new Date(n.created_at).toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => handleDeleteNews(n.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '10px 20px', borderRadius: '12px', fontWeight: '950', fontSize: '0.75rem', cursor: 'pointer' }}>REMOVER</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div style={{ maxWidth: '800px' }}>
                        <div className="glass" style={{ padding: '3rem', borderRadius: '45px' }}>
                            <h3 style={{ marginBottom: '2.5rem', fontWeight: '950', letterSpacing: '1px' }}>CONFIGURAÇÕES DA COMUNIDADE</h3>
                            <div style={{ display: 'grid', gap: '2rem' }}>
                                {[
                                    { key: 'stats_active_users', label: 'USUÁRIOS ATIVOS EXIBIDOS', type: 'text' },
                                    { key: 'stats_uptime', label: 'UPTIME DO SISTEMA (%)', type: 'text' },
                                    { key: 'stats_detection', label: 'TAXA DE DETECÇÃO (%)', type: 'text' },
                                    { key: 'stats_delivery', label: 'TAXA DE ENTREGA (%)', type: 'text' },
                                    { key: 'discord_link', label: 'LINK DO DISCORD', type: 'text' },
                                    { key: 'broadcast_message', label: 'MENSAGEM DO LAUNCHER (BROADCAST)', type: 'text' },
                                    { key: 'launcher_integrity_hash', label: 'HASH DE INTEGRIDADE DO EXE (SHA256)', type: 'text' }
                                ].map(s => (
                                    <div key={s.key}>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '950', color: 'rgba(255,255,255,0.3)', marginBottom: '10px', letterSpacing: '1px' }}>{s.label}</label>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <input
                                                type="text"
                                                value={localSettings[s.key] !== undefined ? localSettings[s.key] : ''}
                                                onChange={(e) => setLocalSettings({ ...localSettings, [s.key]: e.target.value })}
                                                onBlur={(e) => handleUpdateSetting(s.key, e.target.value)}
                                                style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none', fontWeight: '700' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default AdminPage
