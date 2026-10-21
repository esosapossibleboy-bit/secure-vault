import { useState } from "react";
import API from "../api/axios";
import { encryptData } from "../utils/crypto";

export default function CreateVaultSidebar({ onCreated, isOpen, setIsOpen }) {
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const encryptedPassword = encryptData(password);
      const encryptedUsername = encryptData(username);
      const res = await API.post("/vault", { 
        title, 
        content: `${encryptedUsername} | ${encryptedPassword} | ${url}`,
        username: encryptedUsername,
        password: encryptedPassword,
        url 
      });
      onCreated(res.data);
      setTitle(""); setUsername(""); setPassword(""); setUrl("");
      setIsOpen(false);
    } catch { alert("Create failed"); } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} onClick={() => setIsOpen(false)}></div>
      <div style={{ width: "100%", maxWidth: "400px", background: "white", height: "100%", boxShadow: "-2px 0 20px rgba(0,0,0,0.2)", padding: "24px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>New Vault Record 🔒 Encrypted</h2>
          <button onClick={() => setIsOpen(false)} style={{ fontSize: "24px" }}>×</button>
        </div>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "8px", borderRadius: "6px", fontSize: "11px", marginBottom: "12px" }}>
          🔐 Client-side crypto: Password will be encrypted in browser with Web Crypto before sending to server.
        </div>
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div><label style={{ fontSize: "13px", fontWeight: "600" }}>Title / Service</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Gmail" required
              style={{ width: "100%", marginTop: "4px", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }} /></div>
          <div><label style={{ fontSize: "13px", fontWeight: "600" }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="esosa@test.com"
              style={{ width: "100%", marginTop: "4px", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }} /></div>
          <div><label style={{ fontSize: "13px", fontWeight: "600" }}>Password (will be encrypted client-side)</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" required
              style={{ width: "100%", marginTop: "4px", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }} /></div>
          <div><label style={{ fontSize: "13px", fontWeight: "600" }}>URL</label>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
              style={{ width: "100%", marginTop: "4px", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }} /></div>
          <button disabled={loading} style={{ width: "100%", background: "black", color: "white", padding: "12px", borderRadius: "8px", fontWeight: "500" }}>
            {loading ? "Encrypting in browser..." : "Create Encrypted Vault Record"}</button>
        </form>
      </div>
    </div>
  );
}