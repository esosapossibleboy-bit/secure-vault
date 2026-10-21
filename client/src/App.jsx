import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

// Decides where to go if already logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: "40px" }}>Loading...</p>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user, logout } = useAuth();

  return (
    <>
      {user && (
        <div style={{ padding: "10px", background: "#f0f0f0", display: "flex", justifyContent: "space-between" }}>
          <span>Logged in as {user.email} - Week 4 AuthContext + ProtectedRoute</span>
          <button onClick={logout}>Logout</button>
        </div>
      )}

      <Routes>
        {/* Index view - Login */}
        <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* Protected Dashboard - only if authenticated */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Any other route -> back to index */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}