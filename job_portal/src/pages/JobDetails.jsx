import { Link, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { recommendedJobs } from "../data/recommendedJobs";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Dashboard.css";

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();

  const job = recommendedJobs.find((item) => item.id === Number(jobId));

  if (!job) {
    return (
      <DashboardLayout>
        <div className="dashboard">
          <div className="dashboard__container">
            <div className="dashboard__empty-state">This job is no longer available.</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleApply = () => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=/jobs/${job.id}`);
      return;
    }

    alert(`Application started for ${job.title} at ${job.company}.`);
  };

  const overviewSummary = [
    { icon: "👥", label: "Openings", value: "3 openings" },
    { icon: "📈", label: "Job Level", value: job.title.includes("Senior") ? "Senior" : job.title.includes("Manager") ? "Manager" : "Mid-Level" },
    { icon: "🗂️", label: "Category", value: job.tags[0] || "Engineering" },
    { icon: "🔄", label: "Job Shift", value: job.type },
    { icon: "🏢", label: "Company", value: job.company },
  ];

  const relatedJobs = recommendedJobs.filter((item) => item.id !== job.id).slice(0, 3);

  return (
    <DashboardLayout>
      <div className="dashboard">
        <div className="dashboard__container">
          <section className="dashboard__page-header">
            <Link to="/recommended-jobs" className="dashboard__back-link">
              ← Back to recommended jobs
            </Link>
            <div className="dashboard__detail-hero">
              <div className="dashboard__detail-summary">
                <span className="dashboard__label">Job Details</span>
                <div className="dashboard__job_name">{job.title}</div>
                <p className="dashboard__subtitle">{job.company} • {job.location}</p>
                <div className="dashboard__detail-meta">
                  <span>{job.type}</span>
                  <span>{job.salary}</span>
                  <span>Posted {job.posted}</span>
                </div>
              </div>
              <div className="dashboard__detail-actions">
                <button className="dashboard__detail-btn" onClick={handleApply}>
                  Apply Now
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
                <p>{job.description}</p>
              </div>

              <div className="dashboard__detail-card dashboard__detail-card--wide">
                <h2>Job Specification</h2>
                <p>{job.specification}</p>
              </div>

              <div className="dashboard__detail-card">
                <h2>Required Skills</h2>
                <div className="dashboard__tag-list">
                  {job.requiredSkills.map((skill) => (
                    <span key={skill} className="dashboard__tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <aside className="dashboard__detail-sidebar">
              <div className="dashboard__detail-card dashboard__detail-card--sticky">
                <h2>Company</h2>
                <div className="dashboard__company-card">
                  <div className="dashboard__company-logo" style={{ background: job.logoColor }}>
                    {job.logoLetter}
                  </div>
                  <div>
                    <h3>{job.company}</h3>
                    <p>{job.companyDescription}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <section className="dashboard__detail-related">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Jobs You May Like</h2>
            </div>
            {/* <div className="dashboard__jobs-grid">
              {relatedJobs.map((jobItem) => (
                <JobCard key={jobItem.id} job={jobItem} href={`/jobs/${jobItem.id}`} />
              ))}
            </div> */}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
