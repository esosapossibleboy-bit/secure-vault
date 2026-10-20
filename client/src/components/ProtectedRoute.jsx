import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if(loading) return <div className="p-10">Loading secure vault...</div>;
  if(!user) return <Navigate to="/login" replace />;
  return children;
}