import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
//  ⚠️  CHANGE THIS IP BEFORE RUNNING ON YOUR PHONE!
//
//  Windows: open cmd → type "ipconfig" → look for IPv4 Address
//  Mac/Linux: open terminal → type "hostname -I"
//
//  ✅ Phone and PC must be on the SAME WiFi network
//  ✅ Format: http://YOUR_PC_IP:5000/api
//  ❌ Never use "localhost" on a physical phone
// ============================================================
export const BASE_URL = 'http://192.168.43.132:5000/api';

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
