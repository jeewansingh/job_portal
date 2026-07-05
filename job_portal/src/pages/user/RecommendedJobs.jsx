import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import JobCard from "../../components/JobCard";
import { recommendedJobs } from "../../data/recommendedJobs";
import "../../styles/RecommendedJobs.css";

const PAGE_SIZE = 12;

export default function RecommendedJobs() {
  const [titleQuery, setTitleQuery] = useState("");
  const [companyQuery, setCompanyQuery] = useState("");
  const [jobType, setJobType] = useState("All");
  const [page, setPage] = useState(1);

  const jobTypes = useMemo(() => ["All", ...new Set(recommendedJobs.map((job) => job.type))], []);

  const filteredJobs = useMemo(() => {
    const normalizedTitle = titleQuery.trim().toLowerCase();
    const normalizedCompany = companyQuery.trim().toLowerCase();

    return recommendedJobs.filter((job) => {
      const matchesTitle = !normalizedTitle || job.title.toLowerCase().includes(normalizedTitle);
      const matchesCompany = !normalizedCompany || job.company.toLowerCase().includes(normalizedCompany);
      const matchesType = jobType === "All" || job.type === jobType;

      return matchesTitle && matchesCompany && matchesType;
    });
  }, [companyQuery, jobType, titleQuery]);

  useEffect(() => {
    setPage(1);
  }, [companyQuery, jobType, titleQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const paginatedJobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <DashboardLayout>
      <div className="recommended-jobs-page">
        <div className="recommended-jobs-page__container">
          <section className="recommended-jobs-page__header">
            <span className="dashboard__label">For You</span>
            <h1 className="dashboard__title">Recommended Jobs</h1>
            <p className="dashboard__subtitle">
              Roles matched to your skills, experience, and preferred job types.
            </p>
            <Link to="/dashboard" className="dashboard__back-link">
              ← Back to Dashboard
            </Link>
          </section>

          <div className="recommended-jobs-page__filters">
            <input
              className="recommended-jobs-page__filter-input"
              placeholder="Filter by job title"
              value={titleQuery}
              onChange={(event) => setTitleQuery(event.target.value)}
            />
            <input
              className="recommended-jobs-page__filter-input"
              placeholder="Filter by company"
              value={companyQuery}
              onChange={(event) => setCompanyQuery(event.target.value)}
            />
            <select className="recommended-jobs-page__filter-select" value={jobType} onChange={(event) => setJobType(event.target.value)}>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="recommended-jobs-page__results-meta">
            <span>{filteredJobs.length} jobs found</span>
            <span>Showing {paginatedJobs.length} per page</span>
          </div>

          {paginatedJobs.length > 0 ? (
            <div className="dashboard__jobs-grid dashboard__jobs-grid--full">
              {paginatedJobs.map((job) => (
                <JobCard key={job.id} job={job} href={`/jobs/${job.id}`} />
              ))}
            </div>
          ) : (
            <div className="dashboard__empty-state">No jobs match your filters right now.</div>
          )}

          <div className="recommended-jobs-page__pagination">
            <button className="recommended-jobs-page__pagination-btn" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}>
              Previous
            </button>
            <span className="recommended-jobs-page__pagination-status">
              Page {page} of {totalPages}
            </span>
            <button className="recommended-jobs-page__pagination-btn" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
