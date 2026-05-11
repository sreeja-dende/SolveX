import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('solvex_token');
      const storedUser  = await AsyncStorage.getItem('solvex_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Refresh user data from server so points/certs are always current
        refreshUserFromServer(storedToken);
      }
    } catch (e) {
      console.log('Storage load error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Silently re-fetch latest user data from backend
  const refreshUserFromServer = async (tkn) => {
    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: 'Bearer ' + (tkn || token) },
      });
      if (res.data?.user) {
        const fresh = res.data.user;
        setUser(fresh);
        await AsyncStorage.setItem('solvex_user', JSON.stringify(fresh));
      }
    } catch (e) {
      // Silently fail — stored data is still used
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = response.data;
      await AsyncStorage.setItem('solvex_token', newToken);
      await AsyncStorage.setItem('solvex_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.log('Login API error:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      await AsyncStorage.setItem('solvex_token', newToken);
      await AsyncStorage.setItem('solvex_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.log('Register API error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('solvex_token');
      await AsyncStorage.removeItem('solvex_user');
    } catch (e) {}
    setToken(null);
    setUser(null);
  };

  const updateUserData = async (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    try {
      await AsyncStorage.setItem('solvex_user', JSON.stringify(merged));
    } catch (e) {}
  };

  // Call this from any screen to force-refresh user (e.g. after winning)
  const refreshUser = () => refreshUserFromServer();

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      updateUserData, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
