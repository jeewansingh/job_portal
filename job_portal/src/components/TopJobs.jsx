// import { MapPin, Clock, ArrowRight } from "lucide-react";
import JobCard from "./JobCard";
import { recommendedJobs } from "../data/recommendedJobs";
import "../styles/TopJobs.css";

export default function TopJobs() {
  const jobs = recommendedJobs.slice(0, 6);

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
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
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
