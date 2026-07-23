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

/**
 * Get all jobs posted by the recruiter
 * @returns {Promise<Array>} - List of recruiter's jobs
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
 * Close a job posting
 * @param {number} jobId - Job ID to close
 * @returns {Promise<Object>} - Response data
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
 * @param {number} jobId - Job ID to delete
 * @returns {Promise<Object>} - Response data
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
 * Get all applications for recruiter's jobs
 * @returns {Promise<Array>} - List of applications with applicant details
 */
export async function getRecruiterApplications() {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_BASE_URL}/applications/recruiter/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to fetch applications');
  }
}

/**
 * Get applications for a specific job
 * @param {number} jobId - Job ID
 * @returns {Promise<Array>} - List of applications for the job
 */
export async function getJobApplications(jobId) {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_BASE_URL}/applications/recruiter/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    // Filter applications for the specific job on the client side
    return response.data.filter(app => app.job_id === jobId);
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to fetch job applications');
  }
}

/**
 * Get applicant profile
 * @param {number} userId - User ID of the applicant
 * @returns {Promise<Object>} - Applicant profile with all details
 */
export async function getApplicantProfile(userId) {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_BASE_URL}/applications/recruiter/applicant/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('Access denied. This applicant has not applied to any of your jobs.');
    }
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to fetch applicant profile');
  }
}

/**
 * Update application status
 * @param {number} applicationId - Application ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated application
 */
export async function updateApplicationStatus(applicationId, status) {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.put(
      `${API_BASE_URL}/applications/${applicationId}/status`,
      { status },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to update application status');
  }
}

