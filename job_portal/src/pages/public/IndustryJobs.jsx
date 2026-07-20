import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../../components/DashboardLayout";
import JobCard from "../../components/JobCard";

import { getIndustryJobs } from "../../services/jobs";

import "../../styles/RecommendedJobs.css";

const PAGE_SIZE = 12;

const industryLabels = {
  technology: "Technology",
  healthcare: "Healthcare",
  finance: "Finance",
  "travel-hospitality": "Travel & Hospitality",
};

export default function IndustryJobs() {
  const { industrySlug } = useParams();

  const [jobs, setJobs] = useState([]);

  const [titleQuery, setTitleQuery] = useState("");
  const [companyQuery, setCompanyQuery] = useState("");
  const [jobType, setJobType] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadJobs() {
      const data = await getIndustryJobs(industrySlug);
      setJobs(data);
    }

    loadJobs();
  }, [industrySlug]);

  const industryName =
    industryLabels[industrySlug] || "Industry";

  const jobTypes = useMemo(
    () => ["All", ...new Set(jobs.map((job) => job.type))],
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const normalizedTitle = titleQuery.trim().toLowerCase();
    const normalizedCompany = companyQuery.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesTitle =
        !normalizedTitle ||
        job.title.toLowerCase().includes(normalizedTitle);

      const matchesCompany =
        !normalizedCompany ||
        job.company.toLowerCase().includes(normalizedCompany);

      const matchesType =
        jobType === "All" || job.type === jobType;

      return (
        matchesTitle &&
        matchesCompany &&
        matchesType
      );
    });
  }, [jobs, titleQuery, companyQuery, jobType]);

  useEffect(() => {
    setPage(1);
  }, [titleQuery, companyQuery, jobType]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredJobs.length / PAGE_SIZE)
  );

  const paginatedJobs = filteredJobs.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <DashboardLayout>
      <div className="recommended-jobs-page">
        <div className="recommended-jobs-page__container">

          <section className="recommended-jobs-page__header">
            <span className="dashboard__label">
              Industry
            </span>

            <h1 className="dashboard__title">
              {industryName} Jobs
            </h1>

            <p className="dashboard__subtitle">
              Explore curated opportunities from this
              category.
            </p>

            <Link
              to="/industries"
              className="dashboard__back-link"
            >
              ← Back to Industries
            </Link>
          </section>

          <div className="recommended-jobs-page__filters">

            <input
              className="recommended-jobs-page__filter-input"
              placeholder="Filter by job title"
              value={titleQuery}
              onChange={(e) =>
                setTitleQuery(e.target.value)
              }
            />

            <input
              className="recommended-jobs-page__filter-input"
              placeholder="Filter by company"
              value={companyQuery}
              onChange={(e) =>
                setCompanyQuery(e.target.value)
              }
            />

            <select
              className="recommended-jobs-page__filter-select"
              value={jobType}
              onChange={(e) =>
                setJobType(e.target.value)
              }
            >
              {jobTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>

          </div>

          <div className="recommended-jobs-page__results-meta">
            <span>
              {filteredJobs.length} jobs found
            </span>

            <span>
              Showing {paginatedJobs.length} per page
            </span>
          </div>

          {paginatedJobs.length > 0 ? (
            <div className="dashboard__jobs-grid dashboard__jobs-grid--full">
              {paginatedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  href={`/jobs/${job.id}`}
                  showMatchBadge
                />
              ))}
            </div>
          ) : (
            <div className="dashboard__empty-state">
              No jobs match your filters right now.
            </div>
          )}

          <div className="recommended-jobs-page__pagination">

            <button
              className="recommended-jobs-page__pagination-btn"
              onClick={() =>
                setPage((prev) =>
                  Math.max(1, prev - 1)
                )
              }
              disabled={page === 1}
            >
              Previous
            </button>

            <span className="recommended-jobs-page__pagination-status">
              Page {page} of {totalPages}
            </span>

            <button
              className="recommended-jobs-page__pagination-btn"
              onClick={() =>
                setPage((prev) =>
                  Math.min(totalPages, prev + 1)
                )
              }
              disabled={page === totalPages}
            >
              Next
            </button>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}