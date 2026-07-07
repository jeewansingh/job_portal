import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import RecruiterSidebar from "../../components/recruiter/RecruiterSidebar";
import "../../styles/RecruiterDashboard.css";

const summaryCards = [
  { label: "Active Jobs", value: "18", meta: "+3 this week", tone: "primary" },
  { label: "Total Applicants", value: "246", meta: "42 new today", tone: "accent" },
  { label: "Interviews", value: "12", meta: "Next: 2:30 PM", tone: "warm" },
  { label: "New Applications", value: "31", meta: "Today", tone: "success" },
  { label: "Shortlisted", value: "22", meta: "Strong fit rate", tone: "neutral" },
  { label: "Hired", value: "8", meta: "This month", tone: "calm" },
];

const recentApplications = [
  {
    name: "Aarav Sharma",
    role: "Frontend Developer",
    company: "Nimbus Tech",
    stage: "Shortlisted",
    date: "Today",
  },
  {
    name: "Nisha Rai",
    role: "Product Designer",
    company: "Nimbus Tech",
    stage: "Interview",
    date: "Yesterday",
  },
  {
    name: "Kiran Basnet",
    role: "Backend Engineer",
    company: "Nimbus Tech",
    stage: "Under Review",
    date: "2 days ago",
  },
];

const recentJobs = [
  {
    title: "Senior React Developer",
    location: "Kathmandu, Nepal",
    type: "Full-time",
    applicants: 38,
    posted: "2 days ago",
  },
  {
    title: "HR Business Partner",
    location: "Remote",
    type: "Hybrid",
    applicants: 24,
    posted: "4 days ago",
  },
  {
    title: "UI/UX Designer",
    location: "Pokhara, Nepal",
    type: "Contract",
    applicants: 17,
    posted: "1 week ago",
  },
];

export default function RecruiterDashboard() {
  const { user } = useUser();
  const displayName = user?.companyName || user?.fullName || "Recruiter";

  return (
    <div className="recruiter-dashboard" id="dashboard">
      <RecruiterSidebar activeItem="Dashboard" />

      <main className="recruiter-dashboard__main">
        <section className="recruiter-dashboard__hero">
          <div>
            <span className="recruiter-dashboard__eyebrow">Recruiter Dashboard</span>
            <h1 className="recruiter-dashboard__title">
              Welcome back, {displayName}
            </h1>
            <p className="recruiter-dashboard__subtitle">
              Track hiring activity, manage open roles, and stay on top of interviews from one place.
            </p>
          </div>

          <div className="recruiter-dashboard__hero-side">
            

            <div className="recruiter-dashboard__hero-actions">
              <a href="#posted-jobs" className="recruiter-dashboard__primary-action">
                Post Job
              </a>
              <Link to="/recruiter/applications" className="recruiter-dashboard__secondary-action">
                View Applicants
              </Link>
            </div>
          </div>
        </section>

        <section className="recruiter-dashboard__summary" aria-label="Hiring summary">
          {summaryCards.map((card) => (
            <article key={card.label} className={`recruiter-kpi recruiter-kpi--${card.tone}`}>
              <span className="recruiter-kpi__label">{card.label}</span>
              <strong className="recruiter-kpi__value">{card.value}</strong>
              <span className="recruiter-kpi__meta">{card.meta}</span>
            </article>
          ))}
        </section>

        <section className="recruiter-dashboard__content-grid">
          <article className="recruiter-panel" id="applications">
            <div className="recruiter-panel__header">
              <div>
                <span className="recruiter-panel__eyebrow">Activity</span>
                <h2 className="recruiter-panel__title">Recent Applications</h2>
              </div>
              <a href="#quick-actions" className="recruiter-panel__link">
                Review all
              </a>
            </div>

            <div className="recruiter-application-list">
              {recentApplications.map((item) => (
                <article key={`${item.name}-${item.role}`} className="recruiter-application-card">
                  <div className="recruiter-application-card__main">
                    <div className="recruiter-application-card__avatar">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.role}</p>
                      <span>{item.company}</span>
                    </div>
                  </div>

                  <div className="recruiter-application-card__meta">
                    <span className="recruiter-pill">{item.stage}</span>
                    <small>{item.date}</small>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="recruiter-panel" id="posted-jobs">
            <div className="recruiter-panel__header">
              <div>
                <span className="recruiter-panel__eyebrow">Jobs</span>
                <h2 className="recruiter-panel__title">Recently Posted Jobs</h2>
              </div>
              <a href="#quick-actions" className="recruiter-panel__link">
                Manage jobs
              </a>
            </div>

            <div className="recruiter-job-list">
              {recentJobs.map((job) => (
                <article key={job.title} className="recruiter-job-card">
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.location}</p>
                  </div>
                  <div className="recruiter-job-card__meta">
                    <span>{job.type}</span>
                    <strong>{job.applicants} applicants</strong>
                    <small>Posted {job.posted}</small>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
