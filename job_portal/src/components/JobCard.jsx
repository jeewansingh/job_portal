import { Link } from "react-router-dom";
import "../styles/TopJobs.css";

export default function JobCard({ job, href }) {
  const cardContent = (
    <article className="job-card">
      {job.featured && <span className="job-card__featured">Featured</span>}

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

      <div className="job-card__match-score">Match score: {job.matchScore}%</div>

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
