import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import DashboardLayout from "../../components/DashboardLayout";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import JobCard from "../../components/JobCard";
import { getBrowseJobs } from "../../services/job";
import "../../styles/BrowseJobs.css";

const PAGE_SIZE = 12;

export default function BrowseJobs() {
  const { isLoggedIn } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Read state from URL (source of truth)
  const urlPage = parseInt(searchParams.get("page")) || 1;
  const urlTitle = searchParams.get("title") || "";
  const urlCompany = searchParams.get("company") || "";
  const urlType = searchParams.get("type") || "All";
  
  // Local input states (what user is typing)
  const [titleQuery, setTitleQuery] = useState(urlTitle);
  const [companyQuery, setCompanyQuery] = useState(urlCompany);
  
  // Sync local input with URL when URL changes (e.g., back button)
  useEffect(() => {
    setTitleQuery(urlTitle);
    setCompanyQuery(urlCompany);
  }, [urlTitle, urlCompany]);

  // Fetch jobs from backend when URL params change
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        setError("");
        
        const skip = (urlPage - 1) * PAGE_SIZE;
        
        const response = await getBrowseJobs({
          title: urlTitle.trim() || undefined,
          company: urlCompany.trim() || undefined,
          employment_type: urlType !== "All" ? urlType : undefined,
          skip: skip,
          limit: PAGE_SIZE,
        });
        
        setJobs(response.jobs);
        setTotalJobs(response.total);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError(err.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    }
    
    fetchJobs();
  }, [urlTitle, urlCompany, urlType, urlPage]);

  // Get unique job types from fetched jobs
  const jobTypes = useMemo(() => {
    const types = ["All", ...new Set(jobs.map((job) => job.employment_type))];
    return types;
  }, [jobs]);

  // Update URL params function
  const updateFilters = (newParams) => {
    const params = { ...Object.fromEntries(searchParams) };
    
    // Update params
    Object.keys(newParams).forEach(key => {
      if (newParams[key] && newParams[key] !== "All") {
        params[key] = newParams[key];
      } else {
        delete params[key];
      }
    });
    
    // Reset to page 1 when filters change (but not when just changing page)
    if (!newParams.page && (newParams.title !== undefined || newParams.company !== undefined || newParams.type !== undefined)) {
      delete params.page;
    }
    
    setSearchParams(params);
  };

  // Handle Enter key press on filter inputs
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

  // Handle blur (clicking outside) on filter inputs
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

  // Handle job type change
  const handleJobTypeChange = (event) => {
    updateFilters({ type: event.target.value });
  };

  // Handle page change
  const goToPage = (newPage) => {
    updateFilters({ page: newPage > 1 ? newPage.toString() : undefined });
  };

  // Helper function to convert backend job data to frontend format
  const transformJob = (job) => {
    // Calculate days since posted
    const createdDate = new Date(job.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let posted;
    if (diffDays === 0) {
      posted = "Today";
    } else if (diffDays === 1) {
      posted = "1 day ago";
    } else if (diffDays < 7) {
      posted = `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      posted = weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      posted = months === 1 ? "1 month ago" : `${months} months ago`;
    }
    
    // Calculate deadline days left
    const deadlineDate = new Date(job.deadline);
    const deadlineDiff = Math.floor((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    // Generate company logo letter (first letter of company name)
    const logoLetter = job.company_name.charAt(0).toUpperCase();
    
    // Generate a color based on company name (consistent color for same company)
    const hashCode = job.company_name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const hue = Math.abs(hashCode) % 360;
    const logoColor = `linear-gradient(135deg, oklch(0.5 0.12 ${hue}), oklch(0.55 0.14 ${hue + 15}))`;
    
    return {
      id: job.id,
      company: job.company_name,
      companyLogoUrl: job.company_logo_url,
      logoColor: logoColor,
      logoLetter: logoLetter,
      title: job.job_title,
      location: job.location,
      type: job.employment_type,
      salary: job.salary_per_month || "Negotiable",
      salaryDetail: job.salary_per_month ? "per month" : "",
      tags: job.skills.map(s => s.name),
      posted: posted,
      
      deadlineDaysLeft: deadlineDiff > 0 ? deadlineDiff : 0,
      
      overview: [],
      description: job.job_description,
      specification: job.job_specification,
      requiredSkills: job.skills.map(s => s.name),
      companyDescription: "",
    };
  };

  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));
  const displayJobs = jobs.map(transformJob);

  const content = (
    <div className="browse-jobs-page">
      <div className="browse-jobs-page__container">
        {loading ? (
          <div className="dashboard__empty-state">Loading jobs...</div>
        ) : error ? (
          <div className="dashboard__empty-state" style={{ color: 'red' }}>{error}</div>
        ) : (
          <>
            <section className="browse-jobs-page__header">
              <span className="dashboard__label">Browse</span>
              <h1 className="dashboard__title">Browse Jobs</h1>
              <p className="dashboard__subtitle">
                Explore opportunities across industries and discover the right fit.
              </p>
              {isLoggedIn && (
                <Link to="/dashboard" className="dashboard__back-link">
                  ← Back to Dashboard
                </Link>
              )}
            </section>

            <div className="browse-jobs-page__filters">
              <input
                className="browse-jobs-page__filter-input"
                placeholder="Filter by job title (press Enter or click outside)"
                value={titleQuery}
                onChange={(event) => setTitleQuery(event.target.value)}
                onKeyPress={handleTitleKeyPress}
                onBlur={handleTitleBlur}
              />
              <input
                className="browse-jobs-page__filter-input"
                placeholder="Filter by company (press Enter or click outside)"
                value={companyQuery}
                onChange={(event) => setCompanyQuery(event.target.value)}
                onKeyPress={handleCompanyKeyPress}
                onBlur={handleCompanyBlur}
              />
              <select className="browse-jobs-page__filter-select" value={urlType} onChange={handleJobTypeChange}>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="browse-jobs-page__results-meta">
              <span>{totalJobs} jobs found</span>
              <span>Showing {displayJobs.length} per page</span>
            </div>

            {displayJobs.length > 0 ? (
              <div className="dashboard__jobs-grid dashboard__jobs-grid--full">
                {displayJobs.map((job) => (
                  <JobCard key={job.id} job={job} href={`/jobs/${job.id}`} showMatchBadge={false} />
                ))}
              </div>
            ) : (
              <div className="dashboard__empty-state">No jobs match your filters right now.</div>
            )}

            <div className="browse-jobs-page__pagination">
              <button 
                className="browse-jobs-page__pagination-btn" 
                onClick={() => goToPage(Math.max(1, urlPage - 1))} 
                disabled={urlPage === 1 || loading}
              >
                Previous
              </button>
              <span className="browse-jobs-page__pagination-status">
                Page {urlPage} of {totalPages}
              </span>
              <button 
                className="browse-jobs-page__pagination-btn" 
                onClick={() => goToPage(Math.min(totalPages, urlPage + 1))} 
                disabled={urlPage >= totalPages || loading}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (isLoggedIn) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return (
    <>
      <Navbar />
      {content}
      <Footer />
    </>
  );
}
