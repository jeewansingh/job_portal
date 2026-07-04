import { Link } from "react-router-dom";
import "../styles/TopJobs.css";

export default function JobCard({ job, href, showMatchBadge = true }) {
  const cardContent = (
    <article className="job-card">
      {showMatchBadge && job.matchScore !== undefined && (
        <span className="job-card__match-badge">Match score: {job.matchScore}%</span>
      )}

      <div className="job-card__header">
        <div className="job-card__logo" style={{ background: job.logoColor }}>
          {job.logoLetter}
        </div>
        <div className="job-card__meta">
          <p className="job-card__company">{job.company}</p>
          <h3 className="job-card__title">{job.title}</h3>
        </div>
      </div>

      <div className="job-card__details">
        <span className="job-card__detail">{job.location}</span>
        <span className="job-card__detail">{job.type}</span>
      </div>

      <div className="job-card__tags">
        {job.tags.map((tag) => (
          <span key={tag} className="job-card__tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="job-card__footer">
        <div>
          <div className="job-card__salary">{job.salary}</div>
          <div className="job-card__salary-range">{job.salaryDetail}</div>
        </div>
        <span className="job-card__time">{job.posted}</span>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link to={href} className="job-card-link">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
