import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, setAuthToken } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
const USER_STORAGE_KEY = 'user';

const readStoredUser = () => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = readStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
      if (token) {
        setAuthToken(token);
        const tokenAtStart = token;
        try {
          const response = await authService.getProfile();
          const shouldHandle = localStorage.getItem('token') === tokenAtStart;
          if (shouldHandle) {
            setUser(response.data);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
          }
        } catch (error) {
          const shouldHandle = localStorage.getItem('token') === tokenAtStart;
          if (shouldHandle) {
            const status = error.response?.status;
            if (status === 401 || status === 422) {
              localStorage.removeItem('token');
              localStorage.removeItem(USER_STORAGE_KEY);
              setUser(null);
              navigate('/login');
            } else {
              console.error('Failed to load user', error);
            }
          }
        }
      } else {
        setAuthToken(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      }
      setIsLoading(false);
    };
    loadUser();
  }, [navigate]);

  useEffect(() => {
    const handleLogout = () => {
      setAuthToken(null);
      setUser(null);
      if (!window.location.pathname.includes('/login')) {
        navigate('/login');
      }
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [navigate]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const token = response.data?.access_token;
      if (!token) {
        return { success: false, message: 'Token manquant, reessayez.' };
      }
      localStorage.setItem('token', token);
      setAuthToken(token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
      setUser(response.data.user);
      navigate('/recettes');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const token = response.data?.access_token;
      if (!token) {
        return { success: false, message: 'Token manquant, reessayez.' };
      }
      localStorage.setItem('token', token);
      setAuthToken(token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
      setUser(response.data.user);
      navigate('/recettes');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    navigate('/login');
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);