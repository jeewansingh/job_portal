import { useAuth } from '../hooks/useAuth';

/**
 * Protected Route wrapper that checks authentication
 * Shows loading state while verifying token
 * Blocks rendering until authentication is verified
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string[]} props.allowedRoles - Array of allowed roles (optional, for future use)
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('[ProtectedRoute] Render with:', { isAuthenticated, isLoading });

  // CRITICAL: Always show loading if not authenticated yet
  // This prevents content from flashing before redirect
  if (isLoading || !isAuthenticated) {
    console.log('[ProtectedRoute] Showing loading state or blocking render');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, oklch(0.12 0.06 260) 0%, oklch(0.18 0.09 265) 40%, oklch(0.22 0.11 270) 100%)',
        color: '#ffffff',
        fontSize: '1.125rem',
      }}>
        Verifying authentication...
      </div>
    );
  }

  // Only reach here if isAuthenticated === true AND isLoading === false
  console.log('[ProtectedRoute] Authenticated, rendering children');
  return children;
}
