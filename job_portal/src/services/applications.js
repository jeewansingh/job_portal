import {recentApplications, allApplications, applicationStatusLabels} from "../data/applications";

export async function getRecentApplications() {
  // Later this will be replaced by an API call
  return recentApplications;
}

export async function getAllApplications() {
  // Later this will be replaced by an API call
  return allApplications;
}
export async function getApplicationStatusLabels() {
  return applicationStatusLabels;
}
