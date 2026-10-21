import { useVaults } from "../hooks/useVaults";

export default function Dashboard() {
  const { vaults, loading } = useVaults();

  if (loading) return <p>Loading vaults...</p>;

  return (
    <div>
      <h2>Vaults ({vaults.length}) — Only yours, BOLA blocks others</h2>
      {vaults.length === 0 ? (
        <p>You are not logged in - BOLA blocked (401) / No vaults - Create one</p>
      ) : (
        vaults.map(v => (
          <div key={v._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <strong>{v.title}</strong> / {v.content}
          </div>
        ))
      )}
    </div>
  );
}