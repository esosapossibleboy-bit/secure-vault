import { useState } from "react";
import { useVaults } from "../hooks/useVaults";
import VaultCard from "../components/VaultCard";
import CreateVaultSidebar from "../components/CreateVaultSidebar";
import API from "../api/axios";

export default function Dashboard() {
  const { vaults, setVaults } = useVaults();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = vaults.filter(v => v.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    try { await API.delete(`/vault/${id}`); setVaults(prev => prev.filter(v => v._id !== id)); }
    catch { alert("BOLA blocked - not yours"); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontWeight: "bold", fontSize: "18px" }}>🔐 Secure Vault Dashboard</h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vaults..."
              style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" }} />
            <button onClick={() => setIsOpen(true)} style={{ background: "black", color: "white", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "500" }}>+ New Record</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex" }}>
        {/* Sidebar */}
        <div style={{ display: "none", width: "220px", padding: "24px", borderRight: "1px solid #e5e7eb", background: "white", minHeight: "calc(100vh - 65px)" }} className="sidebar">
          <style>{`@media(min-width: 768px){ .sidebar{ display:block !important; } } .grid-responsive{ display:grid; grid-template-columns:1fr; gap:16px; } @media(min-width:640px){ .grid-responsive{ grid-template-columns:repeat(2,1fr); } } @media(min-width:1024px){ .grid-responsive{ grid-template-columns:repeat(3,1fr); } }`}</style>
          <h3 style={{ fontWeight: "600", marginBottom: "16px", fontSize: "12px", color: "#6b7280" }}>RECORDS</h3>
          <div style={{ padding: "8px", background: "black", color: "white", borderRadius: "8px", fontSize: "14px" }}>All Vaults ({vaults.length})</div>
          <div style={{ marginTop: "24px", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
            <p style={{ fontSize: "12px", fontWeight: "600" }}>BOLA Protection</p>
            <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>Vaults ({vaults.length}) — Only yours, BOLA blocks others</p>
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ flex: 1, padding: "24px" }}>
          <h2 style={{ fontWeight: "600", marginBottom: "16px" }}>Password List View • {filtered.length} records • Responsive: 1 col mobile, 2 tablet, 3 desktop</h2>
          <div className="grid-responsive">
            {filtered.map(vault => <VaultCard key={vault._id} vault={vault} onDelete={handleDelete} />)}
          </div>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "80px", background: "white", borderRadius: "12px", border: "1px dashed #ddd" }}><p style={{ fontSize: "32px" }}>🔒</p><p>No vault records yet</p><button onClick={() => setIsOpen(true)} style={{ marginTop: "12px", background: "black", color: "white", padding: "8px 16px", borderRadius: "8px" }}>Create Record</button></div>}
        </div>
      </div>

      <CreateVaultSidebar isOpen={isOpen} setIsOpen={setIsOpen} onCreated={(nv) => setVaults(prev => [nv, ...prev])} />
    </div>
  );
}