import { API_BASE_URL } from "./api";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Check whether the current user has applied for a job.
 * Returns { applied: bool, status: string | null }
 */
export async function checkApplicationStatus(jobId) {
  const response = await fetch(`${API_BASE_URL}/applications/status/${jobId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Not authenticated");
    }
    throw new Error("Failed to check application status");
  }
  return response.json();
}

/**
 * Get all applications submitted by the current user, with job details.
 */
export async function getUserApplications() {
  const response = await fetch(`${API_BASE_URL}/applications/my`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }
  return response.json();
}

/**
 * Apply for a job. Returns the created application object on success.
 * Throws on error (409 = already applied, 400 = job closed, etc.)
 */
export async function applyForJob(jobId) {
  const response = await fetch(`${API_BASE_URL}/applications/${jobId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Not authenticated");
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Failed to submit application");
  }
  return response.json();
}
