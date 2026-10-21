import { useState } from "react";

export default function VaultCard({ vault, onDelete }) {
  const [show, setShow] = useState(false);
  const parts = vault.content ? vault.content.split("|") : [];
  const username = vault.username || parts[0]?.trim() || "—";
  const password = vault.password || parts[1]?.trim() || vault.content;
  const url = vault.url || parts[2]?.trim() || "";

  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "40px", height: "40px", background: "black", color: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
            {vault.title?.[0]?.toUpperCase() || "V"}
          </div>
          <div>
            <div style={{ fontWeight: "600" }}>{vault.title}</div>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>{url || "No URL"}</div>
          </div>
        </div>
        <button onClick={() => onDelete(vault._id)} style={{ color: "#9ca3af" }}>🗑️</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", background: "#f9fafb", padding: "8px", borderRadius: "6px" }}>
          <span style={{ color: "#6b7280" }}>Username</span>
          <span style={{ fontFamily: "monospace" }}>{username} <button onClick={() => navigator.clipboard.writeText(username)}>📋</button></span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", background: "#f9fafb", padding: "8px", borderRadius: "6px" }}>
          <span style={{ color: "#6b7280" }}>Password</span>
          <span style={{ fontFamily: "monospace" }}>{show ? password : "••••••••"} <button onClick={() => setShow(!show)}>{show ? "🙈" : "👁️"}</button> <button onClick={() => navigator.clipboard.writeText(password)}>📋</button></span>
        </div>
      </div>
      <div style={{ marginTop: "8px", fontSize: "10px", color: "#9ca3af" }}>BOLA ID: {vault._id.slice(-6)} • Only yours</div>
    </div>
  );
}