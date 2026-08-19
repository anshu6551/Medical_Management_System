// lib/utils/auth.ts

export const handleLogout = () => {
  // 1. Clear LocalStorage Session
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 2. Clear Cookies 
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

    // 3. Hard Redirect to Login 
    window.location.href = '/login';
  }
};