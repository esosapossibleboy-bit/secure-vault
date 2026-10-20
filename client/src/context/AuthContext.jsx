import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    api.post('/auth/refresh').then(r=>{
      setAccessToken(r.data.accessToken);
      setUser({ logged: true });
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const login = async (email,password) => {
    const res = await api.post('/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
    setUser({ email });
    return res.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setAccessToken(null); setUser(null);
  };

  return <AuthContext.Provider value={{user, login, logout, loading}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);