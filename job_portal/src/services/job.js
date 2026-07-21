import axios from 'axios';
import { API_BASE_URL } from './api';

/**
 * Post a new job (Recruiter only)
 * @param {FormData} formData - Form data containing job information
 * @returns {Promise<Object>} - Created job data
 */
export async function postJob(formData) {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(`${API_BASE_URL}/jobs`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to post job');
  }
}

/**
 * Get all jobs posted by current recruiter
 * @returns {Promise<Array>} - List of jobs
 */
export async function getMyJobs() {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_BASE_URL}/jobs/my-jobs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to fetch jobs');
  }
}

/**
 * Get job details by ID
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} - Job details
 */
export async function getJobDetails(jobId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to fetch job details');
  }
}

/**
 * Update a job posting
 * @param {number} jobId - Job ID
 * @param {FormData} formData - Form data with updated job information
 * @returns {Promise<Object>} - Updated job data
 */
export async function updateJob(jobId, formData) {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.put(`${API_BASE_URL}/jobs/${jobId}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to update job');
  }
}

/**
 * Close a job posting
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} - Response
 */
export async function closeJob(jobId) {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(`${API_BASE_URL}/jobs/${jobId}/close`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to close job');
  }
}

/**
 * Delete a job posting
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} - Response
 */
export async function deleteJob(jobId) {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.delete(`${API_BASE_URL}/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to delete job');
  }
}

/**
 * Browse all active jobs (Public endpoint)
 * @param {Object} filters - Filter parameters
 * @param {string} filters.title - Filter by job title (optional)
 * @param {string} filters.company - Filter by company name (optional)
 * @param {string} filters.employment_type - Filter by employment type (optional)
 * @param {number} filters.skip - Number of records to skip (optional)
 * @param {number} filters.limit - Maximum number of records (optional)
 * @returns {Promise<Object>} - Object with jobs array, total count, skip, limit
 */
export async function getBrowseJobs(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.title) params.append('title', filters.title);
    if (filters.company) params.append('company', filters.company);
    if (filters.employment_type && filters.employment_type !== 'All') {
      params.append('employment_type', filters.employment_type);
    }
    if (filters.skip !== undefined) params.append('skip', filters.skip);
    if (filters.limit !== undefined) params.append('limit', filters.limit);
    
    const response = await axios.get(`${API_BASE_URL}/jobs/browse?${params.toString()}`);
    return response.data; // Returns { jobs: [...], total: number, skip: number, limit: number }
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to fetch jobs');
  }
}
