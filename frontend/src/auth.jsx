import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const Ctx = createContext({ user: null, setUser: () => {}, logout: async () => {} });
export const useAuth = () => useContext(Ctx);

// user: undefined = still checking, null = signed out, object = signed in
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    api.get('/user/me').then((r) => setUser(r.data.user)).catch(() => setUser(null));
  }, []);

  const logout = async () => {
    try { await api.post('/user/logout'); } catch { /* ignore */ }
    setUser(null);
  };

  return <Ctx.Provider value={{ user, setUser, logout }}>{children}</Ctx.Provider>;
}