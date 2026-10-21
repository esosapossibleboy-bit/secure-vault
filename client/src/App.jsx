import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { useAuth } from "./hooks/useAuth";

// This part decides what to show
function AppContent() {
  const { user, loading, logout } = useAuth();

  if (loading) return <p style={{ padding: "40px" }}>Loading...</p>;

  return (
    <div>
      {user && (
        <div style={{ padding: "10px", background: "#f0f0f0", display: "flex", justifyContent: "space-between" }}>
          <span>Logged in as {user.email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      )}
      {user ? <Dashboard /> : <Login />}
    </div>
  );
}

// Main App only wraps with AuthProvider (Global State)
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}