import { recommendedJobs, topJobs, industryJobs } from "../data/jobs";


export async function getRecommendedJobs() {
  // Later this will be replaced by an API call
  return recommendedJobs;
}


// export async function getRecommendedJobs() {
//   const response = await api.get("/jobs/recommended");
//   return response.data;
// }

export async function getTopJobs() {
  // Later this will be replaced by an API call
  return topJobs;
}

export async function getIndustryJobs(industrySlug) {
  return industryJobs[industrySlug] || [];
}


export async function getJobById(id) {
    return recommendedJobs.find(job => job.id === id);
}

export async function getRelatedJobs(jobId, limit = 3) {
    return recommendedJobs
        .filter(job => job.id !== jobId)
        .slice(0, limit);
}