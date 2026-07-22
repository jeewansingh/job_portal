import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import JobCard from "../../components/JobCard";
import { getRecommendedJobs } from "../../services/job";
import "../../styles/RecommendedJobs.css";

const PAGE_SIZE = 12;

export default function RecommendedJobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Read page from URL
  const urlPage = parseInt(searchParams.get("page")) || 1;
  const urlTitle = searchParams.get("title") || "";
  const urlCompany = searchParams.get("company") || "";
  const urlType = searchParams.get("type") || "All";
  
  // Local input states
  const [titleQuery, setTitleQuery] = useState(urlTitle);
  const [companyQuery, setCompanyQuery] = useState(urlCompany);
  
  // Sync inputs with URL
  useEffect(() => {
    setTitleQuery(urlTitle);
    setCompanyQuery(urlCompany);
  }, [urlTitle, urlCompany]);

  // Fetch recommended jobs from backend
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        setError("");
        
        const skip = (urlPage - 1) * PAGE_SIZE;
        
        const response = await getRecommendedJobs({
          skip: skip,
          limit: PAGE_SIZE,
        });
        
        setJobs(response.jobs);
        setTotalJobs(response.total);
      } catch (err) {
        console.error("Failed to fetch recommended jobs:", err);
        setError(err.message || "Failed to load recommended jobs");
      } finally {
        setLoading(false);
      }
    }
    
    fetchJobs();
  }, [urlPage]);

  const jobTypes = useMemo(() => {
    return ["All", ...new Set(jobs.map((job) => job.employment_type))];
  }, [jobs]);

  // Client-side filtering (optional - backend already ranks by match score)
  const filteredJobs = useMemo(() => {
    const normalizedTitle = titleQuery.trim().toLowerCase();
    const normalizedCompany = companyQuery.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesTitle =
        !normalizedTitle ||
        job.job_title.toLowerCase().includes(normalizedTitle);

      const matchesCompany =
        !normalizedCompany ||
        job.company_name.toLowerCase().includes(normalizedCompany);

      const matchesType =
        urlType === "All" || job.employment_type === urlType;

      return matchesTitle && matchesCompany && matchesType;
    });
  }, [jobs, titleQuery, companyQuery, urlType]);

  // Update URL params
  const updateFilters = (newParams) => {
    const params = { ...Object.fromEntries(searchParams) };
    
    Object.keys(newParams).forEach(key => {
      if (newParams[key] && newParams[key] !== "All") {
        params[key] = newParams[key];
      } else {
        delete params[key];
      }
    });
    
    if (!newParams.page && (newParams.title !== undefined || newParams.company !== undefined || newParams.type !== undefined)) {
      delete params.page;
    }
    
    setSearchParams(params);
  };

  const handleTitleKeyPress = (event) => {
    if (event.key === "Enter") {
      updateFilters({ title: titleQuery });
    }
  };

  const handleCompanyKeyPress = (event) => {
    if (event.key === "Enter") {
      updateFilters({ company: companyQuery });
    }
  };

  const handleTitleBlur = () => {
    if (titleQuery !== urlTitle) {
      updateFilters({ title: titleQuery });
    }
  };

  const handleCompanyBlur = () => {
    if (companyQuery !== urlCompany) {
      updateFilters({ company: companyQuery });
    }
  };

  const handleJobTypeChange = (event) => {
    updateFilters({ type: event.target.value });
  };

  const goToPage = (newPage) => {
    updateFilters({ page: newPage > 1 ? newPage.toString() : undefined });
  };

  // Transform backend job data to frontend format
  const transformJob = (job) => {
    const createdDate = new Date(job.created_at);
    const now = new Date();
    const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    
    let posted;
    if (diffDays === 0) posted = "Today";
    else if (diffDays === 1) posted = "1 day ago";
    else if (diffDays < 7) posted = `${diffDays} days ago`;
    else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      posted = weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      posted = months === 1 ? "1 month ago" : `${months} months ago`;
    }
    
    const hashCode = job.company_name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const hue = Math.abs(hashCode) % 360;
    
    return {
      id: job.id,
      company: job.company_name,
      companyLogoUrl: job.company_logo_url,
      logoColor: `linear-gradient(135deg, oklch(0.5 0.12 ${hue}), oklch(0.55 0.14 ${hue + 15}))`,
      logoLetter: job.company_name.charAt(0).toUpperCase(),
      title: job.job_title,
      location: job.location,
      type: job.employment_type,
      salary: job.salary_per_month || "Negotiable",
      salaryDetail: job.salary_per_month ? "per month" : "",
      tags: job.skills.map(s => s.name),
      posted: posted,
      matchScore: Math.round(job.match_score),
    };
  };

  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));
  const displayJobs = filteredJobs.map(transformJob);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="recommended-jobs-page">
          <div className="recommended-jobs-page__container">
            <div className="dashboard__empty-state">Loading recommended jobs...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="recommended-jobs-page">
          <div className="recommended-jobs-page__container">
            <div className="dashboard__empty-state" style={{ color: 'red' }}>{error}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="recommended-jobs-page">
        <div className="recommended-jobs-page__container">
          <section className="recommended-jobs-page__header">
            <span className="dashboard__label">For You</span>

            <h1 className="dashboard__title">
              Recommended Jobs
            </h1>

            <p className="dashboard__subtitle">
              Roles matched to your skills, experience, and preferred
              job types.
            </p>

            <Link
              to="/dashboard"
              className="dashboard__back-link"
            >
              ← Back to Dashboard
            </Link>
          </section>

          <div className="recommended-jobs-page__filters">
            <input
              className="recommended-jobs-page__filter-input"
              placeholder="Filter by job title (press Enter or click outside)"
              value={titleQuery}
              onChange={(e) => setTitleQuery(e.target.value)}
              onKeyPress={handleTitleKeyPress}
              onBlur={handleTitleBlur}
            />

            <input
              className="recommended-jobs-page__filter-input"
              placeholder="Filter by company (press Enter or click outside)"
              value={companyQuery}
              onChange={(e) => setCompanyQuery(e.target.value)}
              onKeyPress={handleCompanyKeyPress}
              onBlur={handleCompanyBlur}
            />

            <select
              className="recommended-jobs-page__filter-select"
              value={urlType}
              onChange={handleJobTypeChange}
            >
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="recommended-jobs-page__results-meta">
            <span>{totalJobs} jobs found</span>

            <span>
              Showing {displayJobs.length} per page
            </span>
          </div>

          {displayJobs.length > 0 ? (
            <div className="dashboard__jobs-grid dashboard__jobs-grid--full">
              {displayJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  href={`/jobs/${job.id}`}
                  showMatchBadge={true}
                />
              ))}
            </div>
          ) : (
            <div className="dashboard__empty-state">
              No jobs match your filters right now.
            </div>
          )}

          <div className="recommended-jobs-page__pagination">
            <button
              className="recommended-jobs-page__pagination-btn"
              onClick={() => goToPage(Math.max(1, urlPage - 1))}
              disabled={urlPage === 1 || loading}
            >
              Previous
            </button>

            <span className="recommended-jobs-page__pagination-status">
              Page {urlPage} of {totalPages}
            </span>

            <button
              className="recommended-jobs-page__pagination-btn"
              onClick={() => goToPage(Math.min(totalPages, urlPage + 1))}
              disabled={urlPage >= totalPages || loading}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}