import { useState } from "react";
import { deriveKeyFromMasterPassword, isMasterKeySet } from "../utils/zkCrypto";

export default function MasterPasswordModal() {
  const [masterPwd, setMasterPwd] = useState(""); 
  const [isSet, setIsSet] = useState(isMasterKeySet()); 
  const [loading, setLoading] = useState(false);

  const handleSet = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    try { 
      await deriveKeyFromMasterPassword(masterPwd); 
      setIsSet(true); 
      setMasterPwd(""); 
      // NO RELOAD - key stays in RAM
      window.dispatchEvent(new Event("zk-unlocked"));
    } catch (err) { 
      alert(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  if (isSet) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", padding: "32px", borderRadius: "16px", maxWidth: "420px", width: "90%" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "8px" }}>🔐 Zero-Knowledge Unlock</h2>
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>Enter Master Password. Derived locally with PBKDF2 100k iterations via Web Crypto API. <b>Plaintext never reaches network.</b></p>
        <div style={{ background: "#fef3c7", padding: "8px", borderRadius: "6px", fontSize: "11px", marginBottom: "16px" }}>Zero-Knowledge: Master Password stays in browser RAM only. Network shows encrypted only.</div>
        <form onSubmit={handleSet}>
          <input type="password" value={masterPwd} onChange={e=>setMasterPwd(e.target.value)} placeholder="Master Password e.g. MyVault2026!" required autoComplete="new-password" style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" }} />
          <button disabled={loading} style={{ width: "100%", background: "black", color: "white", padding: "12px", borderRadius: "8px" }}>{loading ? "Deriving AES-GCM key locally..." : "Unlock Vault - Derive Key Locally"}</button>
        </form>
        <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: "12px" }}>PBKDF2(SHA-256, 100k) → AES-GCM 256 • Key in RAM only - NO RELOAD</p>
      </div>
    </div>
  );
}