// import { MapPin, Clock, ArrowRight } from "lucide-react";
import "../styles/TopJobs.css";

const jobs = [
  {
    company: "Stripe",
    logoColor: "linear-gradient(135deg, oklch(0.5 0.12 255), oklch(0.55 0.14 270))",
    logoLetter: "S",
    title: "Senior Frontend Engineer",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$165K - $210K",
    salaryDetail: "per year",
    tags: ["React", "TypeScript", "Remote"],
    posted: "2 days ago",
    featured: true,
  },
  {
    company: "Airbnb",
    logoColor: "linear-gradient(135deg, oklch(0.55 0.12 25), oklch(0.6 0.1 30))",
    logoLetter: "A",
    title: "Senior Product Designer",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$140K - $185K",
    salaryDetail: "per year",
    tags: ["Figma", "Design Systems"],
    posted: "3 days ago",
    featured: false,
  },
  {
    company: "Notion",
    logoColor: "linear-gradient(135deg, oklch(0.1 0.05 260), oklch(0.15 0.06 270))",
    logoLetter: "N",
    title: "Backend Engineer — Infrastructure",
    location: "New York, NY",
    type: "Full-time",
    salary: "$155K - $200K",
    salaryDetail: "per year",
    tags: ["Go", "Kubernetes", "AWS"],
    posted: "1 day ago",
    featured: true,
  },
  {
    company: "Figma",
    logoColor: "linear-gradient(135deg, oklch(0.55 0.14 300), oklch(0.6 0.12 310))",
    logoLetter: "F",
    title: "Engineering Manager, Platform",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$200K - $280K",
    salaryDetail: "per year",
    tags: ["Leadership", "Scaling"],
    posted: "5 days ago",
    featured: false,
  },
  {
    company: "Linear",
    logoColor: "linear-gradient(135deg, oklch(0.45 0.1 255), oklch(0.5 0.12 265))",
    logoLetter: "L",
    title: "Staff Software Engineer",
    location: "Remote — Global",
    type: "Full-time",
    salary: "$180K - $250K",
    salaryDetail: "per year",
    tags: ["Rust", "TypeScript", "Remote"],
    posted: "12 hours ago",
    featured: true,
  },
  {
    company: "Vercel",
    logoColor: "linear-gradient(135deg, oklch(0.1 0.04 260), oklch(0.2 0.06 270))",
    logoLetter: "V",
    title: "Developer Relations Lead",
    location: "Remote — US/EU",
    type: "Full-time",
    salary: "$130K - $170K",
    salaryDetail: "per year",
    tags: ["Community", "Content"],
    posted: "4 days ago",
    featured: false,
  },
];

export default function TopJobs() {
  return (
    <section id="jobs" className="top-jobs">
      <div className="top-jobs__container">
        <div className="top-jobs__header">
          <span className="top-jobs__label">Featured</span>
          <h2 className="top-jobs__title">Top Jobs This Week</h2>
          <p className="top-jobs__subtitle">
            Hand-picked opportunities from the world&apos;s most innovative companies.
          </p>
        </div>

        <div className="top-jobs__grid">
          {jobs.map((job, i) => (
            <div key={i} className="job-card">
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
                <span className="job-card__detail">
                 Mpin {job.location}
                </span>
                <span className="job-card__detail">
                  Clock{job.type}
                </span>
              </div>

              <div className="job-card__tags">
                {job.tags.map((tag) => (
                  <span key={tag} className="job-card__tag">{tag}</span>
                ))}
              </div>

              <div className="job-card__footer">
                <div>
                  <div className="job-card__salary">{job.salary}</div>
                  <div className="job-card__salary-range">{job.salaryDetail}</div>
                </div>
                <span className="job-card__time">{job.posted}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="top-jobs__cta">
          <a href="#" className="top-jobs__btn">
            View All Jobs
          </a>
        </div>
      </div>
    </section>
  );
}
