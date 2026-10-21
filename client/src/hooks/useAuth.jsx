// Re-export from the REAL context so we don't have 2 contexts
export { useAuth as default, useAuth, AuthProvider } from '../contexts/AuthContext';