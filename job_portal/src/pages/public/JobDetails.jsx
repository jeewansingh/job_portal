import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { getJobDetails, getSimilarJobs } from "../../services/job";
import { checkApplicationStatus, applyForJob } from "../../services/applications";
import { getFileUrl } from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import JobCard from "../../components/JobCard";
import "../../styles/Dashboard.css";
import "../../styles/JobDetails.css";

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useUser();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applicationStatus, setApplicationStatus] = useState(null); // null = not applied
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [matchScore, setMatchScore] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Fetch job details from backend
  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);
        setError("");
        
        const jobData = await getJobDetails(jobId);
        setJob(jobData);
        
        if (isLoggedIn && user && jobData.match_score !== null && jobData.match_score !== undefined) {
          setMatchScore(jobData.match_score);
        } else {
          setMatchScore(0);
        }
      } catch (err) {
        console.error("Failed to fetch job:", err);
        setError(err.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    }
    
    fetchJob();
  }, [jobId, isLoggedIn, user]);

  // Check application status once job is loaded and user is logged in
  useEffect(() => {
    if (!isLoggedIn || !job) return;

    async function fetchStatus() {
      try {
        const data = await checkApplicationStatus(jobId);
        if (data.applied) {
          setApplicationStatus(data.status);
        }
      } catch (err) {
        // If 401, token is invalid - user needs to re-login
        if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
          // Don't show error, just leave as not applied
          return;
        }
        // Non-critical for other errors — just leave button as "Apply Now"
      }
    }

    fetchStatus();
  }, [jobId, isLoggedIn, job]);

  // Fetch related jobs (only for logged-in users)
  useEffect(() => {
    async function fetchRelatedJobs() {
      if (!job) return;
      
      try {
        setLoadingRelated(true);
        
        // Use new KNN-based similar jobs endpoint
        const response = await getSimilarJobs(jobId, 3);
        
        // Transform jobs for JobCard component
        const transformed = response.jobs.map(transformJobForCard);
        
        setRelatedJobs(transformed);
      } catch (err) {
        console.error("Failed to fetch similar jobs:", err);
        // Don't show error, just leave related jobs empty
      } finally {
        setLoadingRelated(false);
      }
    }
    
    fetchRelatedJobs();
  }, [job, jobId]);

  useEffect(() => {
    if (!showToast) return undefined;

    const timer = window.setTimeout(() => setShowToast(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  const handleApply = async () => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=/jobs/${jobId}`);
      return;
    }

    setApplying(true);
    setApplyError("");

    try {
      await applyForJob(jobId);
      setApplicationStatus("UNDER_REVIEW");
      setShowToast(true);
    } catch (err) {
      const errorMsg = err.message || "Failed to submit application";
      
      // If token is invalid/expired, redirect to login
      if (errorMsg.includes("Not authenticated")) {
        navigate(`/login?redirect=/jobs/${jobId}`);
        return;
      }
      
      setApplyError(errorMsg);
    } finally {
      setApplying(false);
    }
  };

  // Helper to format date
  const getPostedTime = (createdAt) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    }
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  };

  // Helper to get deadline days left
  const getDeadlineDays = (deadline) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate - now;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Helper to transform job data for JobCard component
  const transformJobForCard = (job) => {
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
    };
  };

  if (loading) {
    const loadingContent = (
      <div className="dashboard">
        <div className="dashboard__container">
          <div className="dashboard__empty-state">Loading job details...</div>
        </div>
      </div>
    );
    return isLoggedIn ? (
      <DashboardLayout>{loadingContent}</DashboardLayout>
    ) : (
      <><Navbar />{loadingContent}<Footer /></>
    );
  }

  if (error || !job) {
    const errorContent = (
      <div className="dashboard">
        <div className="dashboard__container">
          <div className="dashboard__empty-state">
            {error || "This job is no longer available."}
          </div>
        </div>
      </div>
    );
    return isLoggedIn ? (
      <DashboardLayout>{errorContent}</DashboardLayout>
    ) : (
      <><Navbar />{errorContent}<Footer /></>
    );
  }

  const deadlineDays = getDeadlineDays(job.deadline);
  const postedTime = getPostedTime(job.created_at);

  const overviewSummary = [
    { icon: "👥", label: "Openings", value: `${job.openings} opening${job.openings > 1 ? 's' : ''}` },
    { icon: "📈", label: "Experience", value: `${job.experience_years} years` },
    { icon: "🗂️", label: "Category", value: job.category },
    { icon: "🔄", label: "Job Type", value: job.employment_type },
    { icon: "🏢", label: "Company", value: job.company_name },
    { icon: "⏰", label: "Deadline", value: deadlineDays ? `${deadlineDays} days left` : "Expired" },
  ];

  const content = (
    <div className="dashboard">
      <div className="dashboard__container">
        <section className="dashboard__page-header">
          <Link
              className="dashboard__back-link"
              onClick={() => navigate(-1)}
          >
          ← Go Back 
          </Link>
          <div className="dashboard__detail-hero">
            <div className="dashboard__detail-summary">
              <span className="dashboard__label">Job Details</span>
              <div className="dashboard__job_name">{job.job_title}</div>
              <p className="dashboard__subtitle">{job.company_name} • {job.location}</p>
              <div className="dashboard__detail-meta">
                <span>{job.employment_type}</span>
                <span>{job.salary_per_month || "Salary not disclosed"}</span>
                <span>Posted {postedTime}</span>
              </div>
            </div>
            <div className="dashboard__detail-actions">
              {isLoggedIn && (
                <div className="dashboard__match-score">
                  <div className="dashboard__match-score-ring" style={{ "--score-percent": `${matchScore}%` }}>
                    <span>{matchScore}%</span>
                  </div>
                  <span className="dashboard__match-score-label">Match Score</span>
                </div>
              )}
              {applyError && (
                <p className="dashboard__apply-error">{applyError}</p>
              )}
              <button
                className={`dashboard__detail-btn ${
                  applicationStatus ? "dashboard__detail-btn--applied" : ""
                }`}
                onClick={handleApply}
                disabled={Boolean(applicationStatus) || applying}
              >
                {applying
                  ? "Submitting..."
                  : applicationStatus
                  ? applicationStatus.replace(/_/g, " ")
                  : "Apply Now"}
              </button>
            </div>
          </div>
        </section>

        <div className="dashboard__detail-layout">
          <div className="dashboard__detail-main">
            <div className="dashboard__detail-card">
              <h2>Job Overview</h2>
              <div className="dashboard__summary-grid">
                {overviewSummary.map((item) => (
                  <div className="dashboard__summary-item" key={item.label}>
                    <div className="dashboard__summary-icon" aria-hidden="true">
                      {item.icon}
                    </div>
                    <div>
                      <p className="dashboard__summary-label">{item.label}</p>
                      <p className="dashboard__summary-value">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard__detail-card dashboard__detail-card--wide">
              <h2>Job Description</h2>
              <p>{job.job_description}</p>
            </div>

            <div className="dashboard__detail-card dashboard__detail-card--wide">
              <h2>Job Specification</h2>
              <p>{job.job_specification}</p>
            </div>

            <div className="dashboard__detail-card">
              <h2>Required Skills</h2>
              <div className="dashboard__tag-list">
                {job.skills && job.skills.length > 0 ? (
                  job.skills.map((skill) => (
                    <span key={skill.id} className="dashboard__tag">
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <p>No specific skills required</p>
                )}
              </div>
            </div>
          </div>

          <aside className="dashboard__detail-sidebar">
            <div className="dashboard__detail-card dashboard__detail-card--sticky">
              <h2>Company</h2>
              <div className="dashboard__company-card">
                {job.company_logo_url ? (
                  <img 
                    src={getFileUrl(job.company_logo_url)} 
                    alt={`${job.company_name} logo`}
                    className="dashboard__company-logo"
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ) : (
                  <div className="dashboard__company-logo" style={{ 
                    background: `linear-gradient(135deg, oklch(0.5 0.12 ${Math.abs(job.company_name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)) % 360}), oklch(0.55 0.14 ${(Math.abs(job.company_name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)) % 360) + 15}))` 
                  }}>
                    {job.company_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3>{job.company_name}</h3>
                  <p>{job.company_description || "A leading company in the industry."}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {relatedJobs.length > 0 && (
          <section className="dashboard__detail-related">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Jobs You May Like</h2>
            </div>
            {loadingRelated ? (
              <div className="dashboard__empty-state">Loading similar jobs...</div>
            ) : (
              <div className="dashboard__jobs-grid">
                {relatedJobs.map((jobItem) => (
                  <JobCard key={jobItem.id} job={jobItem} href={`/jobs/${jobItem.id}`} showMatchBadge={false} />
                ))}
              </div>
            )}
          </section>
        )}

        {showToast && <div className="dashboard__toast">Application submitted successfully!</div>}
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