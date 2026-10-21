import { useAuth } from "../hooks/useAuth";
import Login from "../pages/Login";
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: "40px" }}>Checking auth - ProtectedRoute...</p>;
  if (!user) return <Login />;
  return children;
}