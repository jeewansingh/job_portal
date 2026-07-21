// API configuration and base setup
const API_BASE_URL = 'http://localhost:8000';

/**
 * Get full URL for uploaded files
 * @param {string} relativePath - Relative path from backend (e.g., "uploads/profile_pictures/abc.jpg")
 * @returns {string} - Full URL
 */
export function getFileUrl(relativePath) {
  if (!relativePath) return '';
  // If path starts with http, it's already a full URL
  if (relativePath.startsWith('http')) return relativePath;
  // Remove leading slash if present
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${API_BASE_URL}/${cleanPath}`;
}

export { API_BASE_URL };
