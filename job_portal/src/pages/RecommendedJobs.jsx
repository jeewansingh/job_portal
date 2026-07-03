import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import JobCard from "../components/JobCard";
import { recommendedJobs } from "../data/recommendedJobs";
import "../styles/Dashboard.css";

export default function RecommendedJobs() {
  return (
    <DashboardLayout>
      <div className="dashboard">
        <div className="dashboard__container">
          <section className="dashboard__page-header">
            <span className="dashboard__label">Browse</span>
            <h1 className="dashboard__title">Recommended Jobs</h1>
            <p className="dashboard__subtitle">
              Roles matched to your skills, experience, and preferred job types.
            </p>
            <Link to="/dashboard" className="dashboard__back-link">
              ← Back to Dashboard
            </Link>
          </section>

          <div className="dashboard__jobs-grid dashboard__jobs-grid--full">
            {recommendedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
