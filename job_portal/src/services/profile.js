import axios from 'axios';
import { API_BASE_URL } from './api';
import { getAccessToken } from './auth';

/**
 * Get current user's profile with skills (uses token authentication)
 * @returns {Promise<Object>} - User profile data with skills
 */
export async function getUserProfile() {
  try {
    const token = getAccessToken();
    const response = await axios.get(`${API_BASE_URL}/users/me/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to fetch profile');
  }
}

/**
 * Update current user's profile (uses token authentication)
 * @param {FormData} formData - Form data containing profile information
 * @returns {Promise<Object>} - Updated user profile data
 */
export async function updateUserProfile(formData) {
  try {
    const token = getAccessToken();
    const response = await axios.put(`${API_BASE_URL}/users/me/profile`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        // Let browser set Content-Type with boundary for multipart/form-data
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to update profile');
  }
}
