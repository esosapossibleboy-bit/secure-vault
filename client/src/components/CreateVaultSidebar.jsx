import { useState } from "react";
import API from "../api/axios";
import { zkEncrypt } from "../utils/zkCrypto";

function CreateVaultSidebar({ onCreated, isOpen, setIsOpen }) {
  const [title, setTitle] = useState(""); const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [url, setUrl] = useState(""); const [loading, setLoading] = useState(false);
  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const encUser = await zkEncrypt(username); const encPass = await zkEncrypt(password);
      const res = await API.post("/vault", { title, content: `${encUser} | ${encPass} | ${url}`, username: encUser, password: encPass, url });
      onCreated(res.data); setTitle(""); setUsername(""); setPassword(""); setUrl(""); setIsOpen(false);
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} onClick={() => setIsOpen(false)}></div>
      <div style={{ width: "100%", maxWidth: "400px", background: "white", height: "100%", boxShadow: "-2px 0 20px rgba(0,0,0,0.2)", padding: "24px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}><h2 style={{ fontSize: "20px", fontWeight: "bold" }}>New Vault Record 🔒 ZK</h2><button onClick={() => setIsOpen(false)}>×</button></div>
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title e.g. Gmail" required style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }} />
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }} />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" required style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }} />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL https://..." style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }} />
          <button disabled={loading} style={{ background: "black", color: "white", padding: "12px", borderRadius: "8px" }}>{loading ? "Encrypting locally..." : "Create ZK Encrypted Record"}</button>
        </form>
      </div>
    </div>
  );
}

export default CreateVaultSidebar;