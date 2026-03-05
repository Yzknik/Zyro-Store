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

const ActivityChart = ({ data, color = "#3b82f6" }) => {
    if (!data || data.length === 0) return <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>Nenhum dado disponível</div>;

    const maxVal = Math.max(...data, 1);
    const points = data.map((val, i) => `${(i / (data.length - 1)) * 100},${90 - (val / maxVal) * 70}`).join(" ");

    return (
        <div style={{ width: '100%', height: '180px', position: 'relative', marginTop: '30px' }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M0,100 L0,${90 - (data[0] / maxVal) * 70} L${points} L100,100 Z`} fill="url(#chartGradient)" />
                <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 1.5s cubic-bezier(0.16, 1, 0.3, 1)', filter: 'drop-shadow(0 0 8px ' + color + '55)' }} />
                {data.map((val, i) => (
                    <circle key={i} cx={(i / (data.length - 1)) * 100} cy={90 - (val / maxVal) * 70} r="1.5" fill="#fff" stroke={color} strokeWidth="1" />
                ))}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', fontWeight: '950', letterSpacing: '1px' }}>
                <span>ÚLTIMOS 7 DIAS</span>
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

const AdminPage = () => {
    const { isAdmin, loading: authLoading } = useAuth()
    const [activeTab, setActiveTab] = useState('dashboard')
    const [notification, setNotification] = useState(null)
    const notify = (msg, type = 'success') => setNotification({ msg, type })

    const [stats, setStats] = useState({ users: 0, discordMembers: 0, products: 0, totalSales: 0, activeLicenses: 0, monthlySales: 0, chartData: [] })
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [licenses, setLicenses] = useState([])
    const [moderators, setModerators] = useState([])
    const [logs, setLogs] = useState([])

    const [newCatName, setNewCatName] = useState('')
    const [newProduct, setNewProduct] = useState({ name: '', description: '', category_id: '', image_url: '' })
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


    const refreshData = async () => {
        if (activeTab === 'dashboard') await fetchStats();
        await fetchProducts();
        await fetchCategories();
        await fetchLicenses();
        await fetchModerators();
        await fetchNews();
        await fetchSettings();
        if (activeTab === 'updates') await fetchVersions();
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
            setNewProduct({ name: '', description: '', category_id: '', image_url: '' })
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
                        ['moderators', 'ACCESS'],
                        ['logs', 'LOGS TÁTICOS']
                    ].map(([tab, label]) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', color: activeTab === tab ? '#3b82f6' : 'rgba(255,255,255,0.2)', fontSize: '0.85rem', fontWeight: '950', cursor: 'pointer', transition: '0.3s', letterSpacing: '2px', whiteSpace: 'nowrap' }}>
                            {label}
                        </button>
                    ))}
                </div>

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
                                <ActivityChart data={stats.chartData} />
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
                                                <span style={{ fontWeight: '950', fontSize: '1.2rem', color: '#3b82f6' }}>{p.name.toUpperCase()}</span>
                                                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: '950', opacity: 0.3, letterSpacing: '2px', marginTop: '4px' }}>{p.category_name || 'NO CATEGORY'}</p>
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
                                    { key: 'discord_link', label: 'LINK DO DISCORD', type: 'text' }
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
