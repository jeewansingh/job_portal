import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import JobCard from "../../components/JobCard";
import { getBrowseJobs } from "../../services/job";
import "../../styles/BrowseJobs.css";

const PAGE_SIZE = 12;

export default function BrowseJobs() {
  const [titleQuery, setTitleQuery] = useState("");
  const [companyQuery, setCompanyQuery] = useState("");
  const [jobType, setJobType] = useState("All");
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Active filter values (applied when user presses Enter)
  const [activeTitle, setActiveTitle] = useState("");
  const [activeCompany, setActiveCompany] = useState("");

  // Fetch jobs from backend when filters or page changes
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        setError("");
        
        const skip = (page - 1) * PAGE_SIZE;
        
        const response = await getBrowseJobs({
          title: activeTitle.trim() || undefined,
          company: activeCompany.trim() || undefined,
          employment_type: jobType !== "All" ? jobType : undefined,
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
  }, [activeTitle, activeCompany, jobType, page]);

  // Get unique job types from fetched jobs
  const jobTypes = useMemo(() => {
    const types = ["All", ...new Set(jobs.map((job) => job.employment_type))];
    return types;
  }, [jobs]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTitle, activeCompany, jobType]);

  // Handle Enter key press on filter inputs
  const handleTitleKeyPress = (event) => {
    if (event.key === "Enter") {
      setActiveTitle(titleQuery);
    }
  };

  const handleCompanyKeyPress = (event) => {
    if (event.key === "Enter") {
      setActiveCompany(companyQuery);
    }
  };

  // Handle blur (clicking outside) on filter inputs
  const handleTitleBlur = () => {
    setActiveTitle(titleQuery);
  };

  const handleCompanyBlur = () => {
    setActiveCompany(companyQuery);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="browse-jobs-page">
          <div className="browse-jobs-page__container">
            <div className="dashboard__empty-state">Loading jobs...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="browse-jobs-page">
          <div className="browse-jobs-page__container">
            <div className="dashboard__empty-state" style={{ color: 'red' }}>{error}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="browse-jobs-page">
        <div className="browse-jobs-page__container">
          <section className="browse-jobs-page__header">
            <span className="dashboard__label">Browse</span>
            <h1 className="dashboard__title">Browse Jobs</h1>
            <p className="dashboard__subtitle">
              Explore opportunities across industries and discover the right fit.
            </p>
            <Link to="/dashboard" className="dashboard__back-link">
              ← Back to Dashboard
            </Link>
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
            <select className="browse-jobs-page__filter-select" value={jobType} onChange={(event) => setJobType(event.target.value)}>
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
              onClick={() => setPage((prev) => Math.max(1, prev - 1))} 
              disabled={page === 1 || loading}
            >
              Previous
            </button>
            <span className="browse-jobs-page__pagination-status">
              Page {page} of {totalPages}
            </span>
            <button 
              className="browse-jobs-page__pagination-btn" 
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} 
              disabled={page >= totalPages || loading}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
