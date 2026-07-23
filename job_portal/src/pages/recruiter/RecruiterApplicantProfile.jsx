import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import RecruiterSidebar from "../../components/recruiter/RecruiterSidebar";
import { getApplicantProfile, updateApplicationStatus } from "../../services/recruiter";
import { getFileUrl } from "../../services/api";
import "../../styles/RecruiterDashboard.css";
import "../../styles/RecruiterJobs.css";

const applicantStatusClassMap = {
  SHORTLISTED: "recruiter-job-detail__applicant-badge--shortlisted",
  INTERVIEW: "recruiter-job-detail__applicant-badge--interview",
  OFFER: "recruiter-job-detail__applicant-badge--offer",
  HIRED: "recruiter-job-detail__applicant-badge--hired",
  REJECTED: "recruiter-job-detail__applicant-badge--rejected",
  UNDER_REVIEW: "recruiter-job-detail__applicant-badge--review",
};

const statusOptions = ["UNDER_REVIEW", "INTERVIEW", "OFFERED", "HIRED", "REJECTED"];

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function RecruiterApplicantProfile() {
  const { applicantId } = useParams();
  const navigate = useNavigate();

  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState({});

  useEffect(() => {
    loadApplicantProfile();
  }, [applicantId]);

  const loadApplicantProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getApplicantProfile(parseInt(applicantId));
      setApplicant(data);
      
      // Initialize selected status for each application
      const statusMap = {};
      data.applications.forEach(app => {
        statusMap[app.application_id] = app.status;
      });
      setSelectedStatus(statusMap);
    } catch (err) {
      setError(err.message || "Failed to load applicant profile");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setSelectedStatus(prev => ({
        ...prev,
        [applicationId]: newStatus
      }));
      // Update the application status in the applicant data
      setApplicant(prev => ({
        ...prev,
        applications: prev.applications.map(app =>
          app.application_id === applicationId ? { ...app, status: newStatus } : app
        )
      }));
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterSidebar activeItem="Manage Jobs" />
        <main className="recruiter-dashboard__main">
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading applicant profile...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterSidebar activeItem="Manage Jobs" />
        <main className="recruiter-dashboard__main">
          <section className="recruiter-dashboard__hero">
            <div>
              <span className="recruiter-dashboard__eyebrow">Recruiter Dashboard</span>
              <h1 className="recruiter-dashboard__title">Access Denied</h1>
              <p className="recruiter-dashboard__subtitle">{error}</p>
            </div>
            <div className="recruiter-dashboard__hero-side">
              <div className="recruiter-dashboard__hero-actions">
                <button
                  onClick={() => navigate(-1)}
                  className="recruiter-dashboard__primary-action"
                >
                  Go Back
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterSidebar activeItem="Manage Jobs" />
        <main className="recruiter-dashboard__main">
          <div style={{ padding: "2rem", textAlign: "center" }}>Applicant not found</div>
        </main>
      </div>
    );
  }

  const profileImage = applicant.profile_picture_url ? getFileUrl(applicant.profile_picture_url) : "";
  const profileInitials = getInitials(applicant.full_name);
  const matchScore = 85; // Default score, can be enhanced later
  const scoreValue = matchScore;

  return (
    <div className="recruiter-dashboard">
      <RecruiterSidebar activeItem="Manage Jobs" />

      <main className="recruiter-dashboard__main">
        <section className="recruiter-job-detail__top">
          <button
            type="button"
            className="recruiter-job-detail__back-link recruiter-applicant-profile__back-button"
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>

          <div className="recruiter-dashboard__hero">
            <div>
              <span className="recruiter-dashboard__eyebrow">Applicant Profile</span>
              <h1 className="recruiter-dashboard__title">{applicant.full_name}</h1>
              <p className="recruiter-dashboard__subtitle">
                Applied to {applicant.applications.length} job{applicant.applications.length !== 1 ? 's' : ''}
              </p>
              <div className="recruiter-job-detail__meta-row">
                {applicant.applications.map((app) => (
                  <span
                    key={app.application_id}
                    className={
                      applicantStatusClassMap[app.status] ||
                      "recruiter-job-detail__applicant-badge--review"
                    }
                  >
                    {app.job_title}: {app.status.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>

            <div className="recruiter-dashboard__hero-side">
            </div>
          </div>
        </section>

        <section className="recruiter-panel recruiter-applicant-profile__panel">
          <div className="recruiter-panel__header recruiter-panel__header--stacked">
            <div>
              <span className="recruiter-panel__eyebrow">Application Details</span>
              <h2 className="recruiter-panel__title">Applicant Information</h2>
              <p className="recruiter-panel__subtitle">
                Clean application overview with contact and status controls.
              </p>
            </div>
          </div>

          <div className="recruiter-applicant-profile__profile-row">
            <div className="recruiter-applicant-profile__avatar-card">
              <span className="recruiter-applicant-profile__field-label">Profile Picture</span>
              <div className="recruiter-applicant-profile__avatar">
                {profileImage ? (
                  <img src={profileImage} alt={`${applicant.full_name} profile`} />
                ) : (
                  <span>{profileInitials}</span>
                )}
              </div>
              {applicant.resume_url ? (
                <a
                  href={getFileUrl(applicant.resume_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="recruiter-dashboard__primary-action recruiter-applicant-profile__download-btn"
                >
                  Download Resume
                </a>
              ) : (
                <button
                  type="button"
                  className="recruiter-dashboard__primary-action recruiter-applicant-profile__download-btn"
                  disabled
                  style={{ opacity: 0.5, cursor: "not-allowed" }}
                >
                  No Resume
                </button>
              )}
            </div>

            <div className="recruiter-applicant-profile__intro">
              <div className="recruiter-job-detail__info-grid recruiter-applicant-profile__grid">
                <div className="recruiter-job-detail__info-item">
                  <span>Full Name</span>
                  <strong>{applicant.full_name}</strong>
                </div>
                <div className="recruiter-job-detail__info-item">
                  <span>Gender</span>
                  <strong>{applicant.gender || "Not provided"}</strong>
                </div>
                <div className="recruiter-job-detail__info-item">
                  <span>Age</span>
                  <strong>{applicant.age ? `${applicant.age} years` : "Not provided"}</strong>
                </div>
                <div className="recruiter-job-detail__info-item">
                  <span>Phone Number</span>
                  <div className="recruiter-applicant-profile__inline-action-row">
                    <strong>{applicant.phone}</strong>
                    <a href={`tel:${applicant.phone}`} className="recruiter-manage-jobs__action">
                      Call
                    </a>
                  </div>
                </div>
                <div className="recruiter-job-detail__info-item recruiter-applicant-profile__field--wide">
                  <span>Address</span>
                  <strong>{applicant.address}</strong>
                </div>
                <div className="recruiter-job-detail__info-item">
                  <span>Email</span>
                  <div className="recruiter-applicant-profile__inline-action-row">
                    <strong>{applicant.email}</strong>
                    <a href={`mailto:${applicant.email}`} className="recruiter-manage-jobs__action">
                      Mail
                    </a>
                  </div>
                </div>
                <div className="recruiter-job-detail__info-item recruiter-applicant-profile__field--wide">
                  <span>Skills</span>
                  <div className="recruiter-job-detail__tag-list">
                    {applicant.skills.length > 0 ? (
                      applicant.skills.map((skill) => (
                        <span key={skill} className="recruiter-pill">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span>No skills listed</span>
                    )}
                  </div>
                </div>
                <div className="recruiter-job-detail__info-item">
                  <span>Education</span>
                  <strong>{applicant.education || "Not provided"}</strong>
                </div>
                <div className="recruiter-job-detail__info-item">
                  <span>Experience</span>
                  <strong>{applicant.experience_years ? `${applicant.experience_years} years` : "Not provided"}</strong>
                </div>
                <div className="recruiter-job-detail__info-item">
                  <span>Desired Position</span>
                  <strong>{applicant.desired_position || "Not provided"}</strong>
                </div>
                <div className="recruiter-job-detail__info-item">
                  <span>Preferred Job Type</span>
                  <strong>{applicant.preferred_job_type || "Not provided"}</strong>
                </div>
                <div className="recruiter-job-detail__info-item recruiter-applicant-profile__field--wide">
                  <span>Portfolio Link</span>
                  <strong>
                    {applicant.portfolio_link ? (
                      <a href={applicant.portfolio_link} target="_blank" rel="noreferrer">
                        {applicant.portfolio_link}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="recruiter-applicant-profile__status-block">
            <span className="recruiter-applicant-profile__field-label">Application Status Management</span>
            {applicant.applications.map((app) => (
              <div key={app.application_id} style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ marginBottom: "0.5rem", color: "var(--text)" }}>
                  {app.job_title}
                  <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                    (Applied: {formatDate(app.applied_at)})
                  </span>
                </h4>
                <div className="recruiter-applicant-profile__status-chips">
                  {statusOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`recruiter-applicant-profile__status-chip ${
                        option === selectedStatus[app.application_id]
                          ? "recruiter-applicant-profile__status-chip--active"
                          : ""
                      }`}
                      aria-pressed={option === selectedStatus[app.application_id]}
                      onClick={() => handleStatusChange(app.application_id, option)}
                    >
                      {option.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </section>
      </main>
    </div>
  );
}
