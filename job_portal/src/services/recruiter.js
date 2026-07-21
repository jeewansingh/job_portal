import axios from 'axios';
import { API_BASE_URL } from './api';

/**
 * Register a new recruiter
 * @param {FormData} formData - Form data containing recruiter registration information
 * @returns {Promise<Object>} - Registered recruiter data
 */
export async function registerRecruiter(formData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/recruiters/register`, formData, {
      headers: {
        // Let browser set Content-Type with boundary for multipart/form-data
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Recruiter registration failed');
  }
}

/**
 * Get recruiter profile
 * @returns {Promise<Object>} - Recruiter profile data
 */
export async function getRecruiterProfile() {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_BASE_URL}/recruiters/me/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to fetch recruiter profile');
  }
}

/**
 * Update recruiter profile
 * @param {FormData} formData - Form data with updated recruiter information
 * @returns {Promise<Object>} - Updated recruiter data
 */
export async function updateRecruiterProfile(formData) {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.put(`${API_BASE_URL}/recruiters/me/profile`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to update recruiter profile');
  }
}
