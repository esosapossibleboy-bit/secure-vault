import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
export default function Login() {
  const [email, setEmail] = useState("esosa2026@test.com");
  const [password, setPassword] = useState("123456");
  const { login } = useAuth();
  const [error, setError] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    try { await login(email, password); }
    catch { setError("Login failed"); }
  };
  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Secure Vault - Login</h2>
      <p style={{ color: "gray" }}>BOLA Protected - Week 3 + 4</p>
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px" }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px" }} />
        <button type="submit" style={{ width: "100%", padding: "10px", background: "black", color: "white" }}>Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p style={{ fontSize: "12px", color: "gray", marginTop: "20px" }}>If not logged in: You are not logged in - BOLA blocked (401)</p>
    </div>
  );
}