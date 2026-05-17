export const ROLE_META = {
    user: { label: 'Member', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', level: 0 },
    client: { label: 'Client', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', level: 1 },
    tester: { label: 'Tester', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', level: 2 },
    beta: { label: 'Beta', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', level: 2 },
    reseller: { label: 'Reseller', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', level: 3 },
    admin: { label: 'Admin', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', level: 4 },
    owner: { label: 'Owner', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', level: 5 }
}

export const normalizeRole = (role) => String(role || 'user').toLowerCase()

export const getRoleMeta = (role) => ROLE_META[normalizeRole(role)] || ROLE_META.user

export const canAccessRole = (userRole, requiredRole = 'user') => {
    const user = getRoleMeta(userRole)
    const required = getRoleMeta(requiredRole)
    return user.level >= required.level
}

export const saleModeMeta = (saleMode) => {
    const mode = String(saleMode || 'available').toLowerCase()
    if (mode === 'presale') return { label: 'Pre-venda', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
    if (mode === 'blocked') return { label: 'Venda bloqueada', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
    return { label: 'Disponivel', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' }
}
