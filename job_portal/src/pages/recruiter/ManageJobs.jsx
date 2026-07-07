import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RecruiterSidebar from "../../components/recruiter/RecruiterSidebar";
import { recruiterJobs } from "../../data/recruiterJobs";
import "../../styles/RecruiterDashboard.css";
import "../../styles/RecruiterJobs.css";

const PAGE_SIZE = 5;

const statusClassMap = {
  Active: "recruiter-manage-jobs__badge--active",
  Closed: "recruiter-manage-jobs__badge--closed",
};

const sortOptions = [
  { value: "latest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "applications-desc", label: "Most applications" },
  { value: "applications-asc", label: "Least applications" },
  { value: "title-asc", label: "Title A-Z" },
];

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export default function ManageJobs() {
  const [jobs, setJobs] = useState(() => recruiterJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest");
  const [page, setPage] = useState(1);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = jobs.filter((job) => {
      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.category.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.postedDate);
      const dateB = new Date(b.postedDate);

      switch (sortOrder) {
        case "oldest":
          return dateA - dateB;
        case "applications-desc":
          return b.applications - a.applications;
        case "applications-asc":
          return a.applications - b.applications;
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "latest":
        default:
          return dateB - dateA;
      }
    });
  }, [jobs, searchQuery, sortOrder, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredJobs.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredJobs]);

  const summary = useMemo(() => {
    const totalApplications = jobs.reduce((sum, job) => sum + job.applications, 0);

    return [
      { label: "Total Jobs", value: jobs.length, meta: "All listings", tone: "accent" },
      { label: "Active Jobs", value: jobs.filter((job) => job.status === "Active").length, meta: "Open roles", tone: "primary" },
      { label: "Closed Jobs", value: jobs.filter((job) => job.status === "Closed").length, meta: "Archived roles", tone: "neutral" },
      { label: "Total Applications", value: totalApplications, meta: "Across all jobs", tone: "success" },
    ];
  }, [jobs]);

  const handleClose = (jobId) => {
    setJobs((currentJobs) =>
      currentJobs.map((job) => (job.id === jobId ? { ...job, status: "Closed" } : job))
    );
  };

  const handleDelete = (jobId) => {
    setJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId));
  };

  return (
    <div className="recruiter-dashboard">
      <RecruiterSidebar activeItem="Manage Jobs" />

      <main className="recruiter-dashboard__main">
        <section className="recruiter-dashboard__hero">
          <div>
            <span className="recruiter-dashboard__eyebrow">Recruiter Dashboard</span>
            <h1 className="recruiter-dashboard__title">Manage Jobs</h1>
            <p className="recruiter-dashboard__subtitle">
              Review every listing, filter quickly, and keep your hiring pipeline moving with one
              clean workspace.
            </p>
          </div>

          <div className="recruiter-dashboard__hero-side">
            <div className="recruiter-dashboard__hero-actions">
              <Link to="/recruiter/post-job" className="recruiter-dashboard__primary-action">
                Post New Job
              </Link>
            </div>
          </div>
        </section>

        <section className="recruiter-dashboard__summary" aria-label="Job summary">
          {summary.map((card) => (
            <article key={card.label} className={`recruiter-kpi recruiter-kpi--${card.tone}`}>
              <span className="recruiter-kpi__label">{card.label}</span>
              <strong className="recruiter-kpi__value">{card.value}</strong>
              <span className="recruiter-kpi__meta">{card.meta}</span>
            </article>
          ))}
        </section>

        <section className="recruiter-panel recruiter-manage-jobs__panel">
          <div className="recruiter-panel__header recruiter-panel__header--stacked">
            <div>
              <span className="recruiter-panel__eyebrow">Jobs</span>
              <h2 className="recruiter-panel__title">All Posted Jobs</h2>
              <p className="recruiter-panel__subtitle">
                Search, filter, and manage published and closed listings.
              </p>
            </div>
          </div>

          <div className="recruiter-manage-jobs__filters">
            <input
              className="recruiter-manage-jobs__search"
              type="search"
              placeholder="Search job title, category, or location"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(1);
              }}
            />

            <select
              className="recruiter-manage-jobs__filter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              className="recruiter-manage-jobs__filter"
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value);
                setPage(1);
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="recruiter-manage-jobs__results-meta">
            <span>{filteredJobs.length} jobs found</span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="recruiter-manage-jobs__table-wrap">
              <table className="recruiter-manage-jobs__table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Category</th>
                    <th>Applications</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedJobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <div className="recruiter-manage-jobs__job-cell">
                          <strong>{job.title}</strong>
                        </div>
                      </td>
                      <td>{job.category}</td>
                      <td>
                        <Link
                          to={`/recruiter/jobs/${job.id}`}
                          className="recruiter-manage-jobs__applications-link"
                        >
                          {job.applications}
                        </Link>
                      </td>
                      <td>
                        <span className={`recruiter-manage-jobs__badge ${statusClassMap[job.status]}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>{formatDate(job.deadline)}</td>
                      <td>
                        <div className="recruiter-manage-jobs__actions">
                          <Link to={`/recruiter/jobs/${job.id}`} className="recruiter-manage-jobs__action">
                            View
                          </Link>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--warn"
                            onClick={() => handleClose(job.id)}
                            disabled={job.status === "Closed"}
                          >
                            Close Job
                          </button>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--danger"
                            onClick={() => handleDelete(job.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="recruiter-manage-jobs__empty">
              <div className="recruiter-manage-jobs__empty-icon">◎</div>
              <h3>No jobs match your filters</h3>
              <p>
                Try clearing the filters or create a new opening to keep your hiring pipeline
                moving.
              </p>
              <Link to="/recruiter/post-job" className="recruiter-dashboard__primary-action">
                Post New Job
              </Link>
            </div>
          )}

          {filteredJobs.length > 0 && (
            <div className="recruiter-manage-jobs__pagination">
              <button
                type="button"
                className="recruiter-manage-jobs__pagination-btn"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <div className="recruiter-manage-jobs__pagination-pages">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`recruiter-manage-jobs__pagination-page${
                      pageNumber === currentPage
                        ? " recruiter-manage-jobs__pagination-page--active"
                        : ""
                    }`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="recruiter-manage-jobs__pagination-btn"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
