import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationContext = createContext();

const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed', bottom: '30px', right: '30px', zIndex: 10000,
            background: 'rgba(5, 8, 18, 0.95)', backdropFilter: 'blur(12px)',
            borderLeft: `4px solid ${type === 'error' ? '#ef4444' : (type === 'warning' ? '#f59e0b' : '#3b82f6')}`,
            padding: '18px 24px', borderRadius: '16px', color: '#fff',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', gap: '15px',
            animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            minWidth: '280px'
        }}>
            <style>{`
                @keyframes slideIn { 
                    from { transform: translateX(100%) scale(0.9); opacity: 0; } 
                    to { transform: translateX(0) scale(1); opacity: 1; } 
                }
            `}</style>
            <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: type === 'error' ? 'rgba(239, 68, 68, 0.1)' : (type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {type === 'error' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                ) : type === 'warning' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                )}
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '950', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>
                    {type === 'error' ? 'SYSTEM ERROR' : (type === 'warning' ? 'SYSTEM WARNING' : 'SYSTEM SUCCESS')}
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', marginTop: '2px' }}>{message}</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '4px', transition: '0.2s' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
        </div>
    );
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const notify = useCallback((msg, type = 'success') => {
        setNotification({ msg, type });
    }, []);

    const closeNotification = useCallback(() => {
        setNotification(null);
    }, []);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            {notification && (
                <Notification
                    message={notification.msg}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
