import { useContext, useState, useEffect } from 'react'
import { LangContext } from '../App'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import axios from 'axios'

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
            animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
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

const AdminPage = () => {
    const { isAdmin, loading: authLoading } = useAuth()
    const [activeTab, setActiveTab] = useState('dashboard')
    const [notification, setNotification] = useState(null)
    const notify = (msg, type = 'success') => setNotification({ msg, type })

    const [stats, setStats] = useState({ users: 0, products: 0, totalSales: 0, activeLicenses: 0, monthlySales: 0, chartData: [] })
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [licenses, setLicenses] = useState([])
    const [moderators, setModerators] = useState([])

    const [newCatName, setNewCatName] = useState('')
    const [newProduct, setNewProduct] = useState({ name: '', description: '', category_id: '', image_url: '' })
    const [newPlan, setNewPlan] = useState({ product_id: '', name: '', duration_days: 0, price: 0 })
    const [newLicense, setNewLicense] = useState({ discord_id: '', product_id: '', plan_id: '', duration_days: 0 })
    const [newModId, setNewModId] = useState('')

    useEffect(() => { if (isAdmin) refreshData() }, [isAdmin, activeTab])

    const refreshData = async () => {
        if (activeTab === 'dashboard') await fetchStats();
        await fetchProducts();
        await fetchCategories();
        await fetchLicenses();
        await fetchModerators();
    }

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/stats', { withCredentials: true });
            setStats(res.data)
        } catch (e) { console.error('Stats error', e) }
    }
    const fetchCategories = async () => {
        try { const res = await axios.get('http://localhost:5000/api/admin/categories', { withCredentials: true }); setCategories(res.data) } catch (e) { }
    }
    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/products');
            const prodsWithPlans = await Promise.all(res.data.map(async p => {
                const plans = await axios.get(`http://localhost:5000/api/products/${p.id}/plans`);
                return { ...p, plans: plans.data };
            }));
            setProducts(prodsWithPlans)
        } catch (e) { }
    }
    const fetchLicenses = async () => {
        try { const res = await axios.get('http://localhost:5000/api/admin/licenses', { withCredentials: true }); setLicenses(res.data) } catch (e) { }
    }
    const fetchModerators = async () => {
        try { const res = await axios.get('http://localhost:5000/api/admin/moderators', { withCredentials: true }); setModerators(res.data) } catch (e) { }
    }

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/categories', { name: newCatName }, { withCredentials: true });
            setNewCatName(''); fetchCategories(); notify('CATEGORIA CRIADA!');
        } catch (err) { notify('ERRO AO CRIAR CATEGORIA', 'error') }
    }

    const handleDeleteCategory = async (id) => {
        if (!confirm('DESEJA REALMENTE DELETAR ESTA CATEGORIA?')) return
        try { await axios.delete(`http://localhost:5000/api/admin/categories/${id}`, { withCredentials: true }); fetchCategories(); notify('CATEGORIA REMOVIDA.') } catch (e) { }
    }

    const handleCreateProduct = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:5000/api/admin/products', newProduct, { withCredentials: true })
            setNewProduct({ name: '', description: '', category_id: '', image_url: '' })
            fetchProducts(); notify('PRODUTO LANÇADO COM SUCESSO!')
        } catch (err) { notify(err.response?.data?.error || err.message, 'error') }
    }

    const handleDeleteProduct = async (id) => {
        if (!confirm('DELETAR PRODUTO E TODOS OS PLANOS?')) return
        try { await axios.delete(`http://localhost:5000/api/admin/products/${id}`, { withCredentials: true }); fetchProducts(); notify('PRODUTO REMOVIDO.') } catch (e) { }
    }

    const handleCreatePlan = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:5000/api/admin/plans', newPlan, { withCredentials: true })
            setNewPlan({ product_id: '', name: '', duration_days: 0, price: 0 })
            fetchProducts(); notify('PLANO ADICIONADO!')
        } catch (err) { notify('ERRO AO CRIAR PLANO', 'error') }
    }

    const handleDeletePlan = async (id) => {
        try { await axios.delete(`http://localhost:5000/api/admin/plans/${id}`, { withCredentials: true }); fetchProducts(); notify('PLANO DELETADO.') } catch (e) { }
    }

    const handleCreateLicense = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:5000/api/admin/assign', newLicense, { withCredentials: true })
            setNewLicense({ discord_id: '', product_id: '', plan_id: '', duration_days: 0 })
            fetchLicenses(); notify('KEY GERADA COM SUCESSO!')
        } catch (err) { notify(err.response?.data?.error || err.message, 'error') }
    }

    const handleUpdateLicenseStatus = async (id, status) => {
        try { await axios.patch(`http://localhost:5000/api/admin/licenses/${id}/status`, { status }, { withCredentials: true }); fetchLicenses(); notify('STATUS ATUALIZADO.') } catch (e) { }
    }

    const handleDeleteLicense = async (id) => {
        if (!confirm('REVOGAR ESTA KEY PERMANENTEMENTE?')) return
        try { await axios.delete(`http://localhost:5000/api/admin/licenses/${id}`, { withCredentials: true }); fetchLicenses(); notify('KEY REVOGADA.') } catch (e) { }
    }

    const handleAddModerator = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:5000/api/admin/moderators', { discord_id: newModId }, { withCredentials: true })
            setNewModId(''); fetchModerators(); notify('MODERADOR ADICIONADO!')
        } catch (err) { notify('ERRO AO ADICIONAR MOD.', 'error') }
    }

    const handleRemoveModerator = async (id) => {
        if (!confirm('REMOVER PERMISSÕES DESTE MODERADOR?')) return
        try { await axios.delete(`http://localhost:5000/api/admin/moderators/${id}`, { withCredentials: true }); fetchModerators(); notify('MODERADOR REMOVIDO.') } catch (e) { }
    }

    if (authLoading) return null
    if (!isAdmin) return <Navigate to="/" />

    return (
        <div style={{ minHeight: '100vh', background: '#080c14', color: '#fff' }}>
            <Navbar />
            {notification && <Notification message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}

            <div style={{ paddingTop: '120px', paddingBottom: '100px', width: '90%', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', overflowX: 'auto' }}>
                    {[['dashboard', 'CENTRAL'], ['products', 'STOCKS'], ['categories', 'TAGS'], ['licenses', 'KEYS'], ['moderators', 'ACCESS']].map(([tab, label]) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', color: activeTab === tab ? '#3b82f6' : 'rgba(255,255,255,0.2)', fontSize: '0.85rem', fontWeight: '950', cursor: 'pointer', transition: '0.3s', letterSpacing: '2px' }}>
                            {label}
                        </button>
                    ))}
                </div>

                {activeTab === 'dashboard' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                            {[
                                { label: 'TOTAL USERS', val: stats.users, color: '#3b82f6' },
                                { label: 'INVENTORY', val: stats.products, color: '#3b82f6' },
                                { label: 'SALES FLOW', val: stats.totalSales, color: '#3b82f6' },
                                { label: 'ACTIVE SUBS', val: stats.activeLicenses, color: '#22c55e' }
                            ].map((s, i) => (
                                <div key={i} className="glass" style={{ padding: '2.5rem', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.02)', background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: '950', color: 'rgba(255,255,255,0.3)', marginBottom: '0.8rem', letterSpacing: '2px' }}>{s.label}</p>
                                    <h3 style={{ fontSize: '2.4rem', fontWeight: '950', color: s.color }}>{s.val}</h3>
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
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '35px' }}>
                            <h3 style={{ marginBottom: '1.8rem', fontWeight: '950' }}>WHITE-LIST ADMIN</h3>
                            <form onSubmit={handleAddModerator} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input type="text" placeholder="Discord ID do Moderador" value={newModId} onChange={e => setNewModId(e.target.value)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none' }} />
                                <button type="submit" className="btn-primary" style={{ height: '55px', borderRadius: '18px', fontWeight: '950' }}>AUTORIZAR MODERADOR</button>
                            </form>
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
            </div>
            <Footer />
        </div>
    )
}

export default AdminPage
