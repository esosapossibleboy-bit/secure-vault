import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking localStorage token
  if (loading) {
    return <p style={{ padding: "40px" }}>Checking auth - BOLA protected...</p>;
  }

  // If NOT logged in → automatically route back to index (Login)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If logged in → show the page (Dashboard)
  return children;
}