import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import RecruiterSidebar from "../../components/recruiter/RecruiterSidebar";
import { recruiterJobs } from "../../data/recruiterJobs";
import "../../styles/RecruiterDashboard.css";
import "../../styles/RecruiterJobs.css";

const applicantStatusClassMap = {
  Shortlisted: "recruiter-job-detail__applicant-badge--shortlisted",
  Interview: "recruiter-job-detail__applicant-badge--interview",
  Offer: "recruiter-job-detail__applicant-badge--offer",
  Hired: "recruiter-job-detail__applicant-badge--hired",
  Rejected: "recruiter-job-detail__applicant-badge--rejected",
  "Under Review": "recruiter-job-detail__applicant-badge--review",
  Closed: "recruiter-job-detail__applicant-badge--review",
};

const statusOptions = ["Under Review", "Shortlisted", "Interview", "Offer", "Hired", "Rejected", "Closed"];

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

  const applicantMatch = useMemo(
    () =>
      recruiterJobs
        .flatMap((job) => (job.applicants || []).map((applicant) => ({ ...applicant, job })))
        .find((applicant) => String(applicant.id) === String(applicantId)) || null,
    [applicantId]
  );

  const [status, setStatus] = useState(applicantMatch?.status || applicantMatch?.stage || "Under Review");

  useEffect(() => {
    if (!applicantMatch) return;
    setStatus(applicantMatch.status || applicantMatch.stage || "Under Review");
  }, [applicantMatch]);

  if (!applicantMatch) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterSidebar activeItem="Manage Jobs" />

        <main className="recruiter-dashboard__main">
          <section className="recruiter-dashboard__hero">
            <div>
              <span className="recruiter-dashboard__eyebrow">Recruiter Dashboard</span>
              <h1 className="recruiter-dashboard__title">Applicant not found</h1>
              <p className="recruiter-dashboard__subtitle">
                The selected applicant is not available in the current demo dataset.
              </p>
            </div>

            <div className="recruiter-dashboard__hero-side">
              <div className="recruiter-dashboard__hero-actions">
                <Link to="/recruiter/manage-jobs" className="recruiter-dashboard__primary-action">
                  Back to Manage Jobs
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const { job } = applicantMatch;
  const applicant = {
    ...applicantMatch,
    status: status || applicantMatch.status || applicantMatch.stage || "Under Review",
  };

  const matchScore = applicant.matchScore || "85%";
  const profileImage = applicant.profilePicture || "";
  const profileInitials = getInitials(applicant.name);
  const scoreValue = Number.parseInt(matchScore, 10) || 85;

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
              <h1 className="recruiter-dashboard__title">{applicant.name}</h1>
              <p className="recruiter-dashboard__subtitle">
                Applied for {job.title} at {job.company}
              </p>
              <div className="recruiter-job-detail__meta-row">
                <span
                  className={
                    applicantStatusClassMap[applicant.status] ||
                    "recruiter-job-detail__applicant-badge--review"
                  }
                >
                  {applicant.status}
                </span>
              </div>
            </div>

            <div className="recruiter-dashboard__hero-side">
              <div
                className="recruiter-applicant-profile__score-ring"
                aria-label={`Match score ${matchScore}`}
                style={{
                  background: `conic-gradient(var(--primary) 0deg, var(--primary) ${scoreValue * 3.6}deg, rgba(148, 163, 184, 0.22) ${scoreValue * 3.6}deg)`,
                }}
              >
                <div className="recruiter-applicant-profile__score-ring-inner">
                  <strong>{matchScore}</strong>
                  <span>Match</span>
                </div>
              </div>
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
                  <img src={profileImage} alt={`${applicant.name} profile`} />
                ) : (
                  <span>{profileInitials}</span>
                )}
              </div>
              <button
                type="button"
                className="recruiter-dashboard__primary-action recruiter-applicant-profile__download-btn"
                onClick={() => console.log("Download resume", applicant.resumeName)}
              >
                Download Resume
              </button>
            </div>

            <div className="recruiter-applicant-profile__intro">
              <div className="recruiter-job-detail__info-grid recruiter-applicant-profile__grid">
                <div className="recruiter-job-detail__info-item">
                  <span>Full Name</span>
                  <strong>{applicant.name}</strong>
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
                  <strong>{applicant.location}</strong>
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
                    {(applicant.skills || job.skills || []).map((skill) => (
                      <span key={skill} className="recruiter-pill">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="recruiter-job-detail__info-item">
                  <span>Education</span>
                  <strong>{applicant.education}</strong>
                </div>
                <div className="recruiter-job-detail__info-item">
                  <span>Experience</span>
                  <strong>{applicant.experience}</strong>
                </div>
                <div className="recruiter-job-detail__info-item recruiter-applicant-profile__field--wide">
                  <span>Portfolio Link</span>
                  <strong>
                    <a href={applicant.portfolioLink} target="_blank" rel="noreferrer">
                      {applicant.portfolioLink}
                    </a>
                  </strong>
                </div>
                <div className="recruiter-job-detail__info-item">
                  <span>Applied Date</span>
                  <strong>{formatDate(applicant.appliedDate)}</strong>
                </div>
                <div className="recruiter-job-detail__info-item">
                  <span>Applied For</span>
                  <strong>
                    {job.title} {job.company ? `· ${job.company}` : ""}
                  </strong>
                </div>
                <div className="recruiter-job-detail__info-item">
                  <span>Match Score</span>
                  <strong>{matchScore}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="recruiter-applicant-profile__status-block">
            <span className="recruiter-applicant-profile__field-label">Status</span>
            <div className="recruiter-applicant-profile__status-chips">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`recruiter-applicant-profile__status-chip ${
                    option === status ? "recruiter-applicant-profile__status-chip--active" : ""
                  }`}
                  aria-pressed={option === status}
                  onClick={() => setStatus(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
