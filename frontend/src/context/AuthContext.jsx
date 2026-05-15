import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';

// Configure axios interceptor to send token in all requests
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${API_URL}/api/auth/me`, { 
                withCredentials: true,
                headers 
            });
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
        // Check for token in URL query parameter (from OAuth redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        
        if (tokenFromUrl) {
            // Store token and use it for authentication
            localStorage.setItem('token', tokenFromUrl);
            // Remove token from URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        checkAuth();
    }, []);

    const loginWithDiscord = () => {
        window.location.href = `${API_URL}/api/auth/discord`;
    };

    const logout = async () => {
        try {
            await axios.get(`${API_URL}/api/auth/logout`, { withCredentials: true });
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
