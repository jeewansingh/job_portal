import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import DashboardLayout from "../../components/DashboardLayout";
import JobCard from "../../components/JobCard";
import ProfileCompletionRing from "../../components/ProfileCompletionRing";

import { getRecommendedJobs } from "../../services/jobs";
import { getRecentApplications } from "../../services/applications";
import { getUserProfile } from "../../services/profile";

import { useUser } from "../../context/UserContext";
import { formatDate, getDisplayName, calculateProfileCompletionFromBackend } from "../../utils/profile";

import "../../styles/Dashboard.css";

const statusClassMap = {
  Applied: "application-card__status--applied",
  "Under Review": "application-card__status--review",
  Interview: "application-card__status--interview",
  Offer: "application-card__status--offer",
  Rejected: "application-card__status--rejected",
};

export default function Dashboard() {
  const { user, profileCompletion } = useUser();

  const displayName = getDisplayName(user);

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [realProfileCompletion, setRealProfileCompletion] = useState(profileCompletion);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const jobs = await getRecommendedJobs();
        const applications = await getRecentApplications();

        setRecommendedJobs(jobs);
        setRecentApplications(applications);

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

            <div className="dashboard__jobs-grid">
              {topJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  href={`/jobs/${job.id}`}
                />
              ))}
            </div>
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
                    <div
                      className="application-card__logo"
                      style={{
                        background: application.logoColor,
                      }}
                    >
                      {application.logoLetter}
                    </div>

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
                        statusClassMap[application.status]
                      }`}
                    >
                      {application.status}
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