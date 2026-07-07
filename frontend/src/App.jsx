// frontend/src/App.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LandingPageView from './components/LandingPageView';
import UserDashboardView from './components/UserDashboardView';
import AdminDashboardView from './components/AdminDashboardView';

// const api = axios.create({ baseURL: 'http://localhost:5000/api' });y
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [authError, setAuthError] = useState('');

  const loadUser = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await api.get('/wallet/details');
      const savedUser = JSON.parse(localStorage.getItem('userData'));
      if (savedUser) {
        setUser({ ...savedUser, walletBalance: res.data.walletBalance });
        if (savedUser.role === 'admin') setCurrentView('admin');
      }
    } catch (err) { logout(); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUser(); }, [token]);

  const addNotification = (title, msg, type) => {
    const newNotif = { id: Date.now(), title, message: msg, type, date: new Date() };
    setNotifications(prev => [newNotif, ...prev]);
    toast.info(() => (
      <div><p className="font-bold text-sm">{title}</p><p className="text-xs text-slate-500">{msg}</p></div>
    ), { position: "top-right", autoClose: 4000 });
  };

  const login = async (email, password) => {

    setAuthError('');

    try {

      const res = await api.post('/auth/login', {
        email,
        password,
      });

      const { token: userToken, ...userData } = res.data;

      localStorage.setItem('token', userToken);
      localStorage.setItem('userData', JSON.stringify(userData));

      setToken(userToken);
      setUser(userData);

      setCurrentView(
        userData.role === 'admin'
          ? 'admin'
          : 'overview'
      );

    } catch (err) {

      const message =
        err.response?.data?.message ||
        'Invalid email or password';

      setAuthError(message);

      toast.error(message);

    }

  };

  const register = async (name, email, password, role) => {

    setAuthError('');

    try {

      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
      });

      const { token: userToken, ...userData } = res.data;

      localStorage.setItem('token', userToken);
      localStorage.setItem('userData', JSON.stringify(userData));

      setToken(userToken);
      setUser(userData);

      setCurrentView(
        userData.role === 'admin'
          ? 'admin'
          : 'overview'
      );

    } catch (err) {

      const message =
        err.response?.data?.message ||
        'Registration Failed';

      setAuthError(message);

      toast.error(message);

    }

  };

  const logout = () => {
    localStorage.clear(); setToken(null); setUser(null); setSelectedEvent(null); setCurrentView('login');
  };

  const refreshUserWallet = async () => {
    try {
      const res = await api.get('/wallet/details');
      setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, walletBalance: res.data.walletBalance };
        localStorage.setItem('userData', JSON.stringify(updated));
        return updated;
      });
      return res.data;
    } catch (err) { console.error(err); }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentView,
        setCurrentView,
        selectedEvent,
        setSelectedEvent,

        login,
        register,
        logout,

        refreshUserWallet,

        loading,

        api,

        notifications,
        setNotifications,

        addNotification,

        supportTickets,
        setSupportTickets,

        authError,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function AppContent() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0EA5E9]" />
      </div>
    );
  }

  if (!user) {
    return <LandingPageView />;
  }

  if (user.role === 'admin') {
    return <AdminDashboardView />;
  }

  return <UserDashboardView />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}