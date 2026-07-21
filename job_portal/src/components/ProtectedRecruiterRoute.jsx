import { useRecruiterAuth } from '../hooks/useRecruiterAuth';

/**
 * Protected Route wrapper for recruiters that checks authentication
 * Shows loading state while verifying token
 * Blocks rendering until authentication is verified
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 */
export default function ProtectedRecruiterRoute({ children }) {
  const { isAuthenticated, isLoading } = useRecruiterAuth();

  console.log('[ProtectedRecruiterRoute] Render with:', { isAuthenticated, isLoading });

  // CRITICAL: Always show loading if not authenticated yet
  // This prevents content from flashing before redirect
  if (isLoading || !isAuthenticated) {
    console.log('[ProtectedRecruiterRoute] Showing loading state or blocking render');
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
  console.log('[ProtectedRecruiterRoute] Authenticated, rendering children');
  return children;
}
