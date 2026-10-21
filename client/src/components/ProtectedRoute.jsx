import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  
  // This prevents crash
  if (!auth) return <div>Loading auth...</div>;
  
  const { user, loading } = auth;

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;