import axios from 'axios';
import { API_BASE_URL } from './api';

/**
 * Fetch all available skills from the backend
 * @returns {Promise<Array>} - Array of skill objects with id, name, category
 */
export async function fetchSkills() {
  try {
    const response = await axios.get(`${API_BASE_URL}/skills`);
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to fetch skills');
  }
}
