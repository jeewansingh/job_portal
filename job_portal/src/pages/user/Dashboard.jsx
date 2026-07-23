import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import DashboardLayout from "../../components/DashboardLayout";
import JobCard from "../../components/JobCard";
import ProfileCompletionRing from "../../components/ProfileCompletionRing";

import { getRecommendedJobs } from "../../services/job";
import { getUserApplications } from "../../services/applications";
import { getUserProfile } from "../../services/profile";
import { getFileUrl } from "../../services/api";

import { useUser } from "../../context/UserContext";
import { formatDate, getDisplayName, calculateProfileCompletionFromBackend } from "../../utils/profile";

import "../../styles/Dashboard.css";

const STATUS_LABEL = {
  UNDER_REVIEW: "Under Review",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

const statusClassMap = {
  UNDER_REVIEW: "application-card__status--review",
  INTERVIEW: "application-card__status--interview",
  OFFER: "application-card__status--offer",
  REJECTED: "application-card__status--rejected",
};

export default function Dashboard() {
  const { user, profileCompletion } = useUser();

  const displayName = getDisplayName(user);

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [realProfileCompletion, setRealProfileCompletion] = useState(profileCompletion);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Fetch recommended jobs from backend API (limit to 6 for dashboard)
        setLoadingJobs(true);
        const jobsResponse = await getRecommendedJobs({ skip: 0, limit: 6 });
        
        // Transform backend data to frontend format
        const transformedJobs = jobsResponse.jobs.map(job => {
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
          
          // Generate color based on company name
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
        });
        
        setRecommendedJobs(transformedJobs);
        setLoadingJobs(false);

        // Fetch recent applications (last 3)
        try {
          const applications = await getUserApplications();
          const mapped = applications.slice(0, 3).map((app) => {
            const hash = (app.company_name || "").split("").reduce(
              (acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0
            );
            const hue = Math.abs(hash) % 360;
            return {
              id: app.id,
              jobId: app.job_id,
              jobTitle: app.job_title,
              company: app.company_name,
              location: app.location,
              appliedDate: app.applied_at,
              status: app.status,
              companyLogoUrl: app.company_logo_url,
              logoLetter: (app.company_name || "?").charAt(0).toUpperCase(),
              logoColor: `linear-gradient(135deg, oklch(0.5 0.12 ${hue}), oklch(0.55 0.14 ${hue + 15}))`,
            };
          });
          setRecentApplications(mapped);
        } catch {
          // non-critical, leave empty
        }

        // Load profile completion from backend (no user ID needed)
        try {
          const profile = await getUserProfile();
          const completion = calculateProfileCompletionFromBackend(profile);
          setRealProfileCompletion(completion);
        } catch (err) {
          console.error("Failed to load profile completion:", err);
          // Fallback to context value
          setRealProfileCompletion(profileCompletion);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setLoadingJobs(false);
      }
    }

    loadDashboard();
  }, [profileCompletion]);

  const topJobs = recommendedJobs.slice(0, 6);

  return (
    <DashboardLayout>
      <div className="dashboard">
        <div className="dashboard__container">
          <section className="dashboard__hero">
            <div className="dashboard__welcome">
              <span className="dashboard__label">Your Dashboard</span>

              <h1 className="dashboard__title">
                Welcome, {displayName}
              </h1>

              <p className="dashboard__subtitle">
                Track applications, explore recommended roles, and keep your
                profile up to date.
              </p>
            </div>

            <div className="dashboard__profile-card">
              <ProfileCompletionRing percentage={realProfileCompletion} />

              <div className="dashboard__profile-info">
                <h2>Profile Completion</h2>

                <p>
                  {realProfileCompletion === 100
                    ? "Your profile is fully complete. Great job!"
                    : "Complete your profile to get better job matches."}
                </p>

                {realProfileCompletion < 100 && (
                  <Link
                    to="/profile"
                    className="dashboard__profile-btn"
                  >
                    Complete Profile
                  </Link>
                )}
              </div>
            </div>
          </section>

          <section className="dashboard__section">
            <div className="dashboard__section-header">
              <div>
                <span className="dashboard__section-label">
                  For You
                </span>

                <h2 className="dashboard__section-title">
                  Recommended Jobs
                </h2>
              </div>

              <Link
                to="/recommended-jobs"
                className="dashboard__view-all"
              >
                View All
              </Link>
            </div>

            {loadingJobs ? (
              <div className="dashboard__empty-state">Loading recommended jobs...</div>
            ) : topJobs.length > 0 ? (
              <div className="dashboard__jobs-grid">
                {topJobs.map((job) => (
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
                No recommended jobs available. Complete your profile to get personalized recommendations!
              </div>
            )}
          </section>

          <section className="dashboard__section">
            <div className="dashboard__section-header">
              <div>
                <span className="dashboard__section-label">
                  Activity
                </span>

                <h2 className="dashboard__section-title">
                  Recent Applications
                </h2>
              </div>

              <Link
                to="/my-applications"
                className="dashboard__view-all"
              >
                View All
              </Link>
            </div>

            <div className="dashboard__applications">
              {recentApplications.map((application) => (
                <article
                  key={application.id}
                  className="application-card"
                >
                  <div className="application-card__main">
                    {application.companyLogoUrl ? (
                      <img
                        src={getFileUrl(application.companyLogoUrl)}
                        alt={application.company}
                        className="application-card__logo"
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <div
                        className="application-card__logo"
                        style={{
                          background: application.logoColor,
                        }}
                      >
                        {application.logoLetter}
                      </div>
                    )}

                    <div className="application-card__details">
                      <h3 className="application-card__title">
                        {application.jobTitle}
                      </h3>

                      <p className="application-card__company">
                        {application.company} ·{" "}
                        {application.location}
                      </p>

                      <p className="application-card__date">
                        Applied on{" "}
                        {formatDate(application.appliedDate)}
                      </p>
                    </div>
                  </div>

                  <div className="application-card__actions">
                    <span
                      className={`application-card__status ${
                        statusClassMap[application.status] || ""
                      }`}
                    >
                      {STATUS_LABEL[application.status] || application.status}
                    </span>

                    <Link
                      to={`/jobs/${application.jobId}`}
                      className="application-card__view"
                    >
                      View
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}