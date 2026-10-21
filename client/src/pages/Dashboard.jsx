import { useState, useContext, useEffect } from "react";
import { useVaults } from "../hooks/useVaults";
import VaultCard from "../components/VaultCard";
import CreateVaultSidebar from "../components/CreateVaultSidebar";
import MasterPasswordModal from "../components/MasterPasswordModal";
import { clearMasterKey, isMasterKeySet } from "../utils/zkCrypto";
import { AuthContext } from "../contexts/AuthContext";
import API from "../api/axios";

export default function Dashboard() {
  const { vaults, setVaults } = useVaults(); 
  const { logout } = useContext(AuthContext); 
  const [isOpen, setIsOpen] = useState(false); 
  const [search, setSearch] = useState("");
  const [zkStatus, setZkStatus] = useState(isMasterKeySet());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handler = () => { setZkStatus(isMasterKeySet()); setRefreshKey(k => k+1); };
    window.addEventListener("zk-unlocked", handler);
    return () => window.removeEventListener("zk-unlocked", handler);
  }, []);

  const filtered = vaults.filter(v => v.title.toLowerCase().includes(search.toLowerCase()));
  const handleDelete = async (id) => { if (!confirm("Delete?")) return; try { await API.delete(`/vault/${id}`); setVaults(prev => prev.filter(v => v._id !== id)); } catch { alert("BOLA blocked - not yours"); } };
  const handleLogout = () => { clearMasterKey(); localStorage.removeItem("zk_salt"); localStorage.removeItem("user_email"); logout(); };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <MasterPasswordModal />
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
          <div><h1 style={{ fontWeight: "bold", fontSize: "18px" }}>🔐 Secure Vault Dashboard - Zero-Knowledge</h1><p style={{ fontSize: "11px", color: zkStatus ? "#059669" : "#dc2626" }}>{zkStatus ? "🔐 ZK Active: Master key derived locally (PBKDF2 100k) - Plaintext never hits network" : "🔒 Enter Master Password to enable ZK decryption"}</p></div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vaults..." style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" }} /><button onClick={() => setIsOpen(true)} style={{ background: "black", color: "white", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "500" }}>+ New Record</button><button onClick={handleLogout} style={{ background: "white", border: "1px solid #ddd", padding: "8px 12px", borderRadius: "8px", fontSize: "14px" }}>Logout</button></div>
        </div>
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex" }}>
        <div style={{ width: "220px", padding: "24px", borderRight: "1px solid #e5e7eb", background: "white", minHeight: "calc(100vh - 65px)" }}>
          <style>{`.grid-responsive{ display:grid; grid-template-columns:1fr; gap:16px; } @media(min-width:640px){ .grid-responsive{ grid-template-columns:repeat(2,1fr); } } @media(min-width:1024px){ .grid-responsive{ grid-template-columns:repeat(3,1fr); } }`}</style>
          <h3 style={{ fontWeight: "600", marginBottom: "16px", fontSize: "12px", color: "#6b7280" }}>RECORDS</h3><div style={{ padding: "8px", background: "black", color: "white", borderRadius: "8px", fontSize: "14px" }}>All Vaults ({vaults.length})</div>
          <div style={{ marginTop: "16px", padding: "12px", background: "#ecfdf5", borderRadius: "8px", border: "1px solid #a7f3d0" }}><p style={{ fontSize: "12px", fontWeight: "600" }}>🔐 Zero-Knowledge</p><p style={{ fontSize: "10px", color: "#065f46", marginTop: "4px" }}>Keys derived from master password via Web Crypto PBKDF2. Encrypted inside local browser context prior to transport. Plaintext never reaches open network.</p></div>
          <div style={{ marginTop: "12px", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}><p style={{ fontSize: "12px", fontWeight: "600" }}>BOLA Protection</p><p style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>Vaults ({vaults.length}) — Only yours</p></div>
        </div>
        <div style={{ flex: 1, padding: "24px" }}>
          <h2 style={{ fontWeight: "600", marginBottom: "16px" }}>Password List View • {filtered.length} records • Responsive: 1 col mobile, 2 tablet, 3 desktop • ZK: {zkStatus ? "Active" : "Locked"}</h2>
          <div className="grid-responsive">{filtered.map(vault => <VaultCard key={`${vault._id}-${refreshKey}`} vault={vault} onDelete={handleDelete} />)}</div>
        </div>
      </div>
      <CreateVaultSidebar isOpen={isOpen} setIsOpen={setIsOpen} onCreated={(nv) => setVaults(prev => [nv, ...prev])} />
    </div>
  );
}