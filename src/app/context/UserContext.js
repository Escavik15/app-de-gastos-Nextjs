'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie, parseCookies, destroyCookie } from 'nookies';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Verificar sesión al iniciar
  useEffect(() => {
    const cookies = parseCookies();
    if (cookies.userData) {
      setUser(JSON.parse(cookies.userData));
    }
  }, []);

  const login = async (credentials) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    const userData = await res.json();
    
    setUser(userData);
    setCookie(null, 'userData', JSON.stringify(userData), {
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: '/',
    });
  };

  const logout = () => {
    destroyCookie(null, 'userData');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);