import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userProducts, setUserProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/me', { withCredentials: true });
            setUser(res.data.user);
            setIsAdmin(res.data.isAdmin);
            setUserProducts(res.data.products || []);
        } catch (err) {
            setUser(null);
            setIsAdmin(false);
            setUserProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const loginWithDiscord = () => {
        window.location.href = 'http://localhost:5000/api/auth/discord';
    };

    const logout = async () => {
        try {
            await axios.get('http://localhost:5000/api/auth/logout', { withCredentials: true });
            setUser(null);
            setIsAdmin(false);
            setUserProducts([]);
        } catch (err) {
            console.error('Logout failed');
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, userProducts, loading, loginWithDiscord, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
