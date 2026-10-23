import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL.
//  - Deployed / web build: set EXPO_PUBLIC_API_URL, e.g. https://solvex-api.onrender.com/api
//  - Local dev on a phone: set it to http://YOUR_PC_IP:5000/api (same WiFi), or edit the fallback below.
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.43.132:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('solvex_token');
      if (token) config.headers.Authorization = 'Bearer ' + token;
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('solvex_token');
        await AsyncStorage.removeItem('solvex_user');
      } catch (e) {}
    }
    return Promise.reject(error);
  }
);

export default api;
