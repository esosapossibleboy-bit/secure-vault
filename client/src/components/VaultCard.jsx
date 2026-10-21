import { useState, useEffect } from "react";
import { zkDecrypt } from "../utils/zkCrypto";
import { decryptData } from "../utils/crypto";
export default function VaultCard({ vault, onDelete }) {
  const [show, setShow] = useState(false); const [username, setUsername] = useState("Decrypting..."); const [password, setPassword] = useState("Decrypting...");
  useEffect(() => {
    const decrypt = async () => {
      const rawUser = vault.username || vault.content?.split("|")[0] || "—"; const rawPass = vault.password || vault.content?.split("|")[1] || "";
      let u = await zkDecrypt(rawUser.trim()); if (u.startsWith("U2Fsd")) u = decryptData(rawUser.trim());
      let p = await zkDecrypt(rawPass.trim()); if (p.startsWith("U2Fsd")) p = decryptData(rawPass.trim());
      setUsername(u); setPassword(p);
    }; decrypt();
  }, [vault]);
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}><div style={{ width: "40px", height: "40px", background: "black", color: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{vault.title?.[0]?.toUpperCase() || "V"}</div><div><div style={{ fontWeight: "600" }}>{vault.title}</div><div style={{ fontSize: "11px", color: "#6b7280" }}>{vault.url || vault.content?.split("|")[2] || "No URL"}</div></div></div>
        <button onClick={() => onDelete(vault._id)} style={{ color: "#9ca3af" }}>🗑️</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", background: "#f9fafb", padding: "8px", borderRadius: "6px" }}><span style={{ color: "#6b7280" }}>Username (ZK decrypted)</span><span style={{ fontFamily: "monospace" }}>{username} <button onClick={() => navigator.clipboard.writeText(username)}>📋</button></span></div>
        <div style={{ display: "flex", justifyContent: "space-between", background: "#ecfdf5", padding: "8px", borderRadius: "6px", border: "1px solid #a7f3d0" }}><span style={{ color: "#065f46" }}>Password 🔐 ZK AES-GCM</span><span style={{ fontFamily: "monospace" }}>{show ? password : "••••••••"} <button onClick={() => setShow(!show)}>{show ? "🙈" : "👁️"}</button> <button onClick={() => navigator.clipboard.writeText(password)}>📋</button></span></div>
      </div>
      <div style={{ marginTop: "8px", fontSize: "10px", color: "#9ca3af" }}>Encrypted in DB: {(vault.password || "").slice(0,20)}... • BOLA: {vault._id.slice(-6)} • ZK: Plaintext never in network</div>
    </div>
  );
}