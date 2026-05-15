import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [role, setRole] = useState('USER');
    const [userProducts, setUserProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
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
        checkAuth();
    }, []);

    const loginWithDiscord = () => {
        window.location.href = `${API_URL}/api/auth/discord`;
    };

    const logout = async () => {
        try {
            await axios.get(`${API_URL}/api/auth/logout`, { withCredentials: true });
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
