import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) { 
        setLoading(false); 
        return; 
      }
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
        // Keep email for crypto engine to derive master key
        if (res.data?.email) {
          localStorage.setItem("user_email", JSON.stringify(res.data.email));
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user_email");
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    // NEW: Store email for client-side crypto key derivation - cryptography params inside client engine
    localStorage.setItem("user_email", JSON.stringify(res.data.user.email));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email"); // Clear crypto key material
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};