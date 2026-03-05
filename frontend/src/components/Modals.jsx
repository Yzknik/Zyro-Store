import React from 'react';

export const ConfirmModal = ({ isOpen, title, message, confirmText = "CONFIRMAR", onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001,
            animation: 'fadeIn 0.3s ease'
        }} onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes pop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #0a0f1e 100%)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px', padding: '40px', width: '90%', maxWidth: '420px',
                textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                animation: 'pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                <div style={{
                    width: '60px', height: '60px', background: 'rgba(51, 102, 255, 0.1)',
                    borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 25px'
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3366ff" strokeWidth="2.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '12px', fontWeight: '950', letterSpacing: '-0.5px', color: '#fff' }}>{title}</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '35px' }}>{message}</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)',
                        background: 'transparent', color: '#fff', fontWeight: '800', cursor: 'pointer',
                        transition: 'all 0.3s', fontSize: '0.8rem'
                    }}>CANCELAR</button>
                    <button onClick={() => { onConfirm(); onCancel(); }} style={{
                        flex: 1, padding: '16px', borderRadius: '14px', border: 'none',
                        background: '#3366ff', color: '#fff', fontWeight: '950', cursor: 'pointer',
                        boxShadow: '0 10px 20px -5px rgba(51, 102, 255, 0.3)',
                        transition: 'all 0.3s', fontSize: '0.8rem'
                    }}> {confirmText} </button>
                </div>
            </div>
        </div>
    )
}

export const InputModal = ({ isOpen, title, subtitle, placeholder, defaultValue = '', accentColor = '#22c55e', confirmText = 'CONFIRMAR', onConfirm, onCancel }) => {
    const [value, setValue] = React.useState(defaultValue);

    React.useEffect(() => {
        if (isOpen) setValue(defaultValue);
    }, [isOpen, defaultValue]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!value || isNaN(value) || parseFloat(value) <= 0) return;
        onConfirm(parseFloat(value));
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002,
            animation: 'fadeIn 0.25s ease'
        }} onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
            <div style={{
                background: 'linear-gradient(135deg, #0d1525 0%, #0a0f1e 100%)',
                border: `1px solid ${accentColor}22`,
                borderRadius: '28px', padding: '42px', width: '90%', maxWidth: '440px',
                boxShadow: `0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)`,
                animation: 'pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                <div style={{
                    width: '65px', height: '65px',
                    background: `${accentColor}15`,
                    border: `1px solid ${accentColor}30`,
                    borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 25px'
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: '950', textAlign: 'center', color: '#fff' }}>{title}</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '35px', fontWeight: '700' }}>{subtitle}</p>

                <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder || "0.00"}
                    autoFocus
                    style={{
                        width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px', padding: '20px', color: '#fff', fontSize: '1.4rem', fontWeight: '950',
                        textAlign: 'center', marginBottom: '30px', outline: 'none', transition: '0.3s'
                    }}
                    onFocus={e => e.target.style.borderColor = accentColor}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={onCancel} style={{ flex: 1, padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.07)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontWeight: '800', cursor: 'pointer' }}>CANCELAR</button>
                    <button onClick={handleConfirm} style={{ flex: 2, padding: '18px', borderRadius: '15px', border: 'none', background: accentColor, color: '#fff', fontWeight: '950', cursor: 'pointer', boxShadow: `0 10px 25px -5px ${accentColor}44` }}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};
