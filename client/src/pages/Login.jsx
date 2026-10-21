import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("esosa2026@test.com");
  const [password, setPassword] = useState("123456");
  const { login } = useAuth();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try { 
      await login(email, password); 
    }
    catch { 
      setError("Login failed - BOLA protected"); 
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "0 auto", fontFamily: "system-ui" }}>
      
      {/* === WEEK 6: DEMO WARNING BANNER === */}
      <div style={{ 
        background: "#fef2f2", 
        border: "1px solid #fecaca", 
        color: "#dc2626", 
        padding: "10px", 
        borderRadius: "6px", 
        fontSize: "12px", 
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "16px"
      }}>
        ⚠️ Academic Demo Only - Week 6<br/>
        <span style={{fontWeight:"normal"}}>Do NOT store real passwords. Data may be wiped. Hosted on Render free tier.</span>
      </div>

      <h2 style={{marginBottom:"4px"}}>Secure Vault - Login</h2>
      <p style={{ color: "gray", fontSize:"13px", marginTop:0 }}>BOLA Protected - Week 3 + 4 + ZK Active</p>
      <p style={{ color: "#16a34a", fontSize:"11px", background:"#f0fdf4", padding:"6px", borderRadius:"4px" }}>
        🔐 ZK: Master key derived locally (PBKDF2 100k) - Plaintext never hits network
      </p>

      <form onSubmit={handleLogin} style={{marginTop:"16px"}}>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Email"
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius:"6px", border:"1px solid #ddd" }} 
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Password"
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius:"6px", border:"1px solid #ddd" }} 
        />
        <button type="submit" style={{ width: "100%", padding: "10px", background: "black", color: "white", borderRadius:"6px", cursor:"pointer", fontWeight:"bold" }}>
          Login
        </button>
      </form>

      {error && <p style={{ color: "red", background:"#fef2f2", padding:"8px", borderRadius:"4px", marginTop:"10px" }}>{error}</p>}

      <p style={{ fontSize: "11px", color: "gray", marginTop: "20px", textAlign:"center", lineHeight:"1.4" }}>
        If not logged in: You are not logged in - BOLA blocked (401)<br/>
        Live: secure-vault-woad.vercel.app | API: secure-vault-xyt5.onrender.com<br/>
        Week 6: Helmet + RateLimit + CORS locked + 0 vuln
      </p>
    </div>
  );
}