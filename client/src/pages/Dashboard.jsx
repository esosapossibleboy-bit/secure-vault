import { useVaults } from "../hooks/useVaults";
export default function Dashboard() {
  const { vaults, loading } = useVaults();
  if (loading) return <p>Loading vaults...</p>;
  return (
    <div style={{ padding: "20px" }}>
      <h2>Vaults ({vaults.length}) — Only yours, BOLA blocks others</h2>
      {vaults.map(v => (
        <div key={v._id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}>
          <strong>{v.title}</strong> / {v.content}
        </div>
      ))}
      {vaults.length === 0 && <p>No vaults - create one</p>}
    </div>
  );
}