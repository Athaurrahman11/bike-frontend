import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // the JWT lives in an HTTP-only cookie, so the only way to know who is logged in is to ask the API
  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (data) => {
    const res = await api.post('/auth/login', data);
    setUser(res.data.user);
    return res.data.user;
  };
  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    setUser(res.data.user);
    return res.data.user;
  };
  const logout = async () => {
    await api.post('/auth/logout').catch(() => {});
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const homeFor = (user) => (user?.role === 'admin' ? '/admin' : '/dashboard');
