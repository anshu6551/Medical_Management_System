import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper: Cookie se token turant padhne ke liye
const getTokenFromCookie = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

// Automatic Bearer Token Interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Pehle LocalStorage dekho, agar late-hydrate hone se null mile toh Cookie se utha lo
      let token = localStorage.getItem('token') || getTokenFromCookie();

      if (token) {
        const cleanToken = token.replace(/^"(.*)"$/, '$1').trim();
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;