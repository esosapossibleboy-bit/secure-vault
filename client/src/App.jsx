import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  const { user, logout, loading } = useAuth();
  if (loading) return <p style={{ padding: "40px" }}>Loading Week 4 AuthContext layer...</p>;
  return (
    <div>
      {user && (
        <div style={{ padding: "10px", background: "#f0f0f0", display: "flex", justifyContent: "space-between" }}>
          <span>Logged in as {user.email} - Week 4 AuthContext + ProtectedRoute + Axios Interceptors</span>
          <button onClick={logout}>Logout</button>
        </div>
      )}
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}