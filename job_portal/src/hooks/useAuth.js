import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAccessToken, logoutUser, getStoredUser } from '../services/auth';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

/**
 * Hook to verify if user (candidate) is authenticated with valid token
 * Redirects to login if not authenticated or token is invalid
 * Also checks that the user has "candidate" role
 * Re-checks on every route change to catch token invalidation
 * 
 * @returns {Object} - { isAuthenticated, isLoading }
 */
export function useAuth() {
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
          console.log('[useAuth] No token found, redirecting to login');
          if (!redirected) {
            redirected = true;
            logoutUser(); // Clear any stale data
            window.location.href = '/login';
          }
          return;
        }

        // Check role from stored user data
        const storedUser = getStoredUser();
        if (storedUser && storedUser.role === 'recruiter') {
          console.log('[useAuth] Recruiter trying to access candidate page, redirecting to recruiter dashboard');
          if (!redirected) {
            redirected = true;
            window.location.href = '/recruiter/dashboard';
          }
          return;
        }

        // Verify token with backend (users endpoint for candidates only)
        console.log('[useAuth] Verifying token with backend...');
        const response = await axios.get(`${API_BASE_URL}/users/me/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          timeout: 10000,
        });

        // Token is valid
        console.log('[useAuth] Token verified successfully');
        if (isMounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        // Token is invalid or expired
        console.error('[useAuth] Token verification failed:', error.response?.status || error.message);
        
        if (!redirected) {
          redirected = true;
          // Clear invalid token
          logoutUser();
          console.log('[useAuth] Invalid token, redirecting to login');
          window.location.href = '/login';
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]); // Re-run when route changes

  console.log('[useAuth] Current state:', { isAuthenticated, isLoading });
  return { isAuthenticated, isLoading };
}

/**
 * Hook for quick token check without API call
 * Only checks if token exists, doesn't verify validity
 * 
 * @returns {boolean} - true if token exists
 */
export function useHasToken() {
  return !!getAccessToken();
}
