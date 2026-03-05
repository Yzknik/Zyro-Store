import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmModal, InputModal } from '../components/Modals';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', confirmText: 'CONFIRMAR', onConfirm: () => { } });
    const [inputConfig, setInputConfig] = useState({ isOpen: false, title: '', subtitle: '', accentColor: '#22c55e', confirmText: 'CONFIRMAR', onConfirm: () => { } });

    const askConfirm = useCallback((title, message, confirmText, action) => {
        setConfirmConfig({
            isOpen: true,
            title,
            message,
            confirmText,
            onConfirm: () => { action(); setConfirmConfig(prev => ({ ...prev, isOpen: false })); }
        });
    }, []);

    const askInput = useCallback((title, subtitle, accentColor, confirmText, onConfirm) => {
        setInputConfig({
            isOpen: true,
            title,
            subtitle,
            accentColor,
            confirmText,
            onConfirm: (val) => { onConfirm(val); setInputConfig(prev => ({ ...prev, isOpen: false })); }
        });
    }, []);

    return (
        <ModalContext.Provider value={{ askConfirm, askInput }}>
            {children}
            <ConfirmModal
                {...confirmConfig}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
            <InputModal
                {...inputConfig}
                onCancel={() => setInputConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
