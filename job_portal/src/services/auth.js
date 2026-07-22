import axios from 'axios';
import { API_BASE_URL } from './api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Register a new user
 * @param {FormData} formData - Form data containing user registration information
 * @returns {Promise<Object>} - Registered user data
 */
export async function registerUser(formData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/register`, formData, {
      headers: {
        // Let browser set Content-Type with boundary for multipart/form-data
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Registration failed');
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Login response with token and user info
 */
export async function loginUser(email, password) {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    // Store token in localStorage
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('token_type', response.data.token_type);
    }
    
    // Store user info
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Login failed');
  }
}

/**
 * Logout user (clear localStorage)
 */
export function logoutUser() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token_type');
  localStorage.removeItem('user');
}

/**
 * Get stored access token
 * @returns {string|null} - Access token or null
 */
export function getAccessToken() {
  return localStorage.getItem('access_token');
}

/**
 * Get stored user info
 * @returns {Object|null} - User object or null
 */
export function getStoredUser() {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if access token exists
 */
export function isAuthenticated() {
  return !!getAccessToken();
}


/**
 * Upload and parse resume to extract information
 * @param {File} resumeFile - PDF file to parse
 * @returns {Promise<Object>} - Extracted resume data (name, email, phone, skills, etc.)
 */
export async function uploadResume(resumeFile) {
  try {
    const formData = new FormData();
    formData.append('file', resumeFile);
    
    const response = await axios.post(`${API_BASE_URL}/resume/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to parse resume');
  }
}
