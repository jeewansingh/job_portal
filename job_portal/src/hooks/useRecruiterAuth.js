import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAccessToken, logoutUser, getStoredUser } from '../services/auth';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

/**
 * Hook to verify if recruiter is authenticated with valid token
 * Redirects to recruiter login if not authenticated or token is invalid
 * Also checks that the user has "recruiter" role
 * Re-checks on every route change to catch token invalidation
 * 
 * @returns {Object} - { isAuthenticated, isLoading }
 */
export function useRecruiterAuth() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let redirected = false;

    async function checkAuth() {
      // Reset state when checking
      if (isMounted) {
        setIsLoading(true);
        setIsAuthenticated(false);
      }

      try {
        const token = getAccessToken();

        // No token found - redirect immediately
        if (!token) {
          console.log('[useRecruiterAuth] No token found, redirecting to recruiter login');
          if (!redirected) {
            redirected = true;
            logoutUser(); // Clear any stale data
            window.location.href = '/recruiter/login';
          }
          return;
        }

        // Check role from stored user data
        const storedUser = getStoredUser();
        if (storedUser && storedUser.role === 'candidate') {
          console.log('[useRecruiterAuth] Candidate trying to access recruiter page, redirecting to dashboard');
          if (!redirected) {
            redirected = true;
            window.location.href = '/dashboard';
          }
          return;
        }

        // Verify token with backend (recruiters endpoint for recruiters only)
        console.log('[useRecruiterAuth] Verifying token with backend...');
        const response = await axios.get(`${API_BASE_URL}/recruiters/me/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          timeout: 10000,
        });

        // Token is valid
        console.log('[useRecruiterAuth] Token verified successfully');
        if (isMounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        // Token is invalid or expired
        console.error('[useRecruiterAuth] Token verification failed:', error.response?.status || error.message);
        
        if (!redirected) {
          redirected = true;
          // Clear invalid token
          logoutUser();
          console.log('[useRecruiterAuth] Invalid token, redirecting to recruiter login');
          window.location.href = '/recruiter/login';
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]); // Re-run when route changes

  console.log('[useRecruiterAuth] Current state:', { isAuthenticated, isLoading });
  return { isAuthenticated, isLoading };
}
