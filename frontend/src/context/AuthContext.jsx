import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';

axios.interceptors.request.use((config) => {
    const legacyToken = sessionStorage.getItem('legacy_auth_token');
    if (legacyToken) {
        config.headers.Authorization = `Bearer ${legacyToken}`;
    }
    return config;
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [role, setRole] = useState('USER');
    const [userProducts, setUserProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/auth/me`);
            setUser(res.data.user);
            setIsAdmin(res.data.isAdmin);
            setRole(res.data.role || 'USER');
            setUserProducts(res.data.products || []);
        } catch (err) {
            setUser(null);
            setIsAdmin(false);
            setRole('USER');
            setUserProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Temporary compatibility with the currently deployed backend. The new
        // backend uses httpOnly cookies and will not send tokens in the URL.
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');

        if (tokenFromUrl) {
            sessionStorage.setItem('legacy_auth_token', tokenFromUrl);
            localStorage.removeItem('token');
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        checkAuth();
    }, []);

    const loginWithDiscord = () => {
        window.location.href = `${API_URL}/api/auth/discord`;
    };

    const logout = async () => {
        try {
            await axios.get(`${API_URL}/api/auth/logout`);
            sessionStorage.removeItem('legacy_auth_token');
            localStorage.removeItem('token');
            setUser(null);
            setIsAdmin(false);
            setRole('USER');
            setUserProducts([]);
        } catch (err) {
            console.error('Logout failed');
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, role, userProducts, loading, loginWithDiscord, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
