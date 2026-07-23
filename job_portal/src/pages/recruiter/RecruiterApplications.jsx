import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RecruiterSidebar from "../../components/recruiter/RecruiterSidebar";
import { getRecruiterApplications, updateApplicationStatus } from "../../services/recruiter";
import { getFileUrl } from "../../services/api";
import "../../styles/RecruiterDashboard.css";
import "../../styles/RecruiterJobs.css";

const PAGE_SIZE = 10;

const applicantStatusClassMap = {
  SHORTLISTED: "recruiter-job-detail__applicant-badge--shortlisted",
  INTERVIEW: "recruiter-job-detail__applicant-badge--interview",
  OFFERED: "recruiter-job-detail__applicant-badge--offer",
  HIRED: "recruiter-job-detail__applicant-badge--hired",
  REJECTED: "recruiter-job-detail__applicant-badge--rejected",
  UNDER_REVIEW: "recruiter-job-detail__applicant-badge--review",
};

const sortOptions = [
  { value: "latest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Applicant A-Z" },
  { value: "job-asc", label: "Job title A-Z" },
  { value: "score-desc", label: "Highest match" },
];

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function RecruiterApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [jobTitleFilter, setJobTitleFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecruiterApplications();
      setApplications(data);
    } catch (err) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId, nextStatus) => {
    try {
      await updateApplicationStatus(applicationId, nextStatus);
      setApplications((current) =>
        current.map((app) =>
          app.id === applicationId ? { ...app, status: nextStatus } : app
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update application status");
    }
  };

  const filteredApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = applications.filter((application) => {
      const matchesSearch =
        !query ||
        application.applicant_name.toLowerCase().includes(query) ||
        application.job_title.toLowerCase().includes(query) ||
        application.applicant_email.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || application.status === statusFilter;
      const matchesJobTitle =
        jobTitleFilter === "All" || application.job_title === jobTitleFilter;
      return matchesSearch && matchesStatus && matchesJobTitle;
    });

    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case "oldest":
          return new Date(a.applied_at) - new Date(b.applied_at);
        case "name-asc":
          return a.applicant_name.localeCompare(b.applicant_name);
        case "job-asc":
          return a.job_title.localeCompare(b.job_title);
        case "score-desc":
          return b.match_score - a.match_score;
        case "latest":
        default:
          return new Date(b.applied_at) - new Date(a.applied_at);
      }
    });
  }, [applications, searchQuery, sortOrder, statusFilter, jobTitleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredApplications.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredApplications]);

  const statusOptions = useMemo(
    () => ["All", ...new Set(applications.map((application) => application.status))],
    [applications]
  );

  const jobTitleOptions = useMemo(
    () => ["All", ...new Set(applications.map((application) => application.job_title))],
    [applications]
  );

  if (loading) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterSidebar activeItem="Applications" />
        <main className="recruiter-dashboard__main">
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading applications...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterSidebar activeItem="Applications" />
        <main className="recruiter-dashboard__main">
          <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
            Error: {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="recruiter-dashboard">
      <RecruiterSidebar activeItem="Applications" />

      <main className="recruiter-dashboard__main">
        <section className="recruiter-dashboard__hero">
          <div>
            <span className="recruiter-dashboard__eyebrow">Recruiter Dashboard</span>
            <h1 className="recruiter-dashboard__title">Applications</h1>
            <p className="recruiter-dashboard__subtitle">
              Browse every incoming application, filter by status, and review candidates from a
              single place.
            </p>
          </div>
        </section>

        <section className="recruiter-panel recruiter-manage-jobs__panel">
          <div className="recruiter-panel__header recruiter-panel__header--stacked">
            <div>
              <span className="recruiter-panel__eyebrow">Applications</span>
              <h2 className="recruiter-panel__title">All Applications</h2>
              <p className="recruiter-panel__subtitle">
                Similar layout to the job detail applicant table, with all applications combined.
              </p>
            </div>
          </div>

          <div className="recruiter-manage-jobs__filters recruiter-applications__filters">
            <input
              className="recruiter-manage-jobs__search"
              type="search"
              placeholder="Search applicant or job title"
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
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All statuses" : status}
                </option>
              ))}
            </select>

            <select
              className="recruiter-manage-jobs__filter"
              value={jobTitleFilter}
              onChange={(event) => {
                setJobTitleFilter(event.target.value);
                setPage(1);
              }}
            >
              {jobTitleOptions.map((jobTitle) => (
                <option key={jobTitle} value={jobTitle}>
                  {jobTitle === "All" ? "All job titles" : jobTitle}
                </option>
              ))}
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

          <div className="recruiter-job-detail__results-meta">
            <span>{filteredApplications.length} applications found</span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {filteredApplications.length > 0 ? (
            <div className="recruiter-job-detail__table-wrap recruiter-applications__table-wrap">
              <table className="recruiter-job-detail__table recruiter-applications__table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Job Title</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th style={{ width: "280px", minWidth: "280px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApplications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <div className="recruiter-job-detail__applicant-cell">
                          <strong>{application.applicant_name}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="recruiter-manage-jobs__job-cell">
                          <strong>{application.job_title}</strong>
                        </div>
                      </td>
                      <td>
                        {application.resume_url ? (
                          <a
                            href={getFileUrl(application.resume_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="recruiter-job-detail__resume-btn"
                          >
                            Download
                          </a>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>No resume</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`${
                            applicantStatusClassMap[application.status] ||
                            "recruiter-job-detail__applicant-badge--review"
                          }`}
                        >
                          {application.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        <div className="recruiter-job-detail__action-list">
                          <Link
                            to={`/recruiter/applicants/${application.user_id}`}
                            className="recruiter-manage-jobs__action"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--warn"
                            onClick={() => handleApplicationAction(application.id, "INTERVIEW")}
                          >
                            Interview
                          </button>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--danger"
                            onClick={() => handleApplicationAction(application.id, "REJECTED")}
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--success"
                            onClick={() => handleApplicationAction(application.id, "OFFERED")}
                          >
                            Offer
                          </button>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--success"
                            onClick={() => handleApplicationAction(application.id, "HIRED")}
                          >
                            Hired
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
              <h3>No applications found</h3>
              <p>Try a different search term or filter to see matching candidates.</p>
            </div>
          )}

          <div className="recruiter-manage-jobs__pagination">
            <button
              type="button"
              className="recruiter-manage-jobs__pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </button>

            <div className="recruiter-manage-jobs__pagination-pages">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`recruiter-manage-jobs__pagination-page${
                    pageNumber === currentPage ? " recruiter-manage-jobs__pagination-page--active" : ""
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
              disabled={currentPage === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              Next
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
