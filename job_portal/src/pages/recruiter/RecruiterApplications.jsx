import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RecruiterSidebar from "../../components/recruiter/RecruiterSidebar";
import { recruiterJobs } from "../../data/recruiterJobs";
import "../../styles/RecruiterDashboard.css";
import "../../styles/RecruiterJobs.css";

const PAGE_SIZE = 10;

const applicantStatusClassMap = {
  Shortlisted: "recruiter-job-detail__applicant-badge--shortlisted",
  Interview: "recruiter-job-detail__applicant-badge--interview",
  Offer: "recruiter-job-detail__applicant-badge--offer",
  Hired: "recruiter-job-detail__applicant-badge--hired",
  Rejected: "recruiter-job-detail__applicant-badge--rejected",
  "Under Review": "recruiter-job-detail__applicant-badge--review",
  Closed: "recruiter-job-detail__applicant-badge--review",
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

function normalizeApplicant(applicant, job) {
  const matchScores = {
    Shortlisted: 94,
    Interview: 89,
    Offer: 96,
    Hired: 98,
    Rejected: 61,
    "Under Review": 82,
  };
  const status = applicant.status || applicant.stage || "Under Review";

  return {
    ...applicant,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    status,
    matchScore: applicant.matchScore || `${matchScores[status] || 80}%`,
  };
}

export default function RecruiterApplications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [jobTitleFilter, setJobTitleFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest");
  const [page, setPage] = useState(1);
  const [applicationsById, setApplicationsById] = useState(() => {
    const entries = recruiterJobs.flatMap((job) =>
      (job.applicants || []).map((applicant) => normalizeApplicant(applicant, job))
    );

    return Object.fromEntries(entries.map((applicant) => [applicant.id, applicant]));
  });

  const applications = useMemo(() => Object.values(applicationsById), [applicationsById]);

  const filteredApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = applications.filter((application) => {
      const matchesSearch =
        !query ||
        application.name.toLowerCase().includes(query) ||
        application.jobTitle.toLowerCase().includes(query) ||
        application.company.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || application.status === statusFilter;
      const matchesJobTitle =
        jobTitleFilter === "All" || application.jobTitle === jobTitleFilter;
      return matchesSearch && matchesStatus && matchesJobTitle;
    });

    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case "oldest":
          return new Date(a.appliedDate) - new Date(b.appliedDate);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "job-asc":
          return a.jobTitle.localeCompare(b.jobTitle);
        case "score-desc":
          return parseInt(b.matchScore, 10) - parseInt(a.matchScore, 10);
        case "latest":
        default:
          return new Date(b.appliedDate) - new Date(a.appliedDate);
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
    () => ["All", ...new Set(applications.map((application) => application.jobTitle))],
    [applications]
  );

  const handleApplicationAction = (applicationId, nextStatus) => {
    setApplicationsById((currentMap) => ({
      ...currentMap,
      [applicationId]: {
        ...currentMap[applicationId],
        status: nextStatus,
      },
    }));
  };

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
                    <th>Match Score</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApplications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <div className="recruiter-job-detail__applicant-cell">
                          <strong>{application.name}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="recruiter-manage-jobs__job-cell">
                          <strong>{application.jobTitle}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="recruiter-job-detail__match-score">{application.matchScore}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="recruiter-job-detail__resume-btn"
                          onClick={() => console.log("Download resume", application.resumeName)}
                        >
                          Download
                        </button>
                      </td>
                      <td>
                        <span
                          className={`${
                            applicantStatusClassMap[application.status] ||
                            "recruiter-job-detail__applicant-badge--review"
                          }`}
                        >
                          {application.status}
                        </span>
                      </td>
                      <td>
                        <div className="recruiter-job-detail__action-list">
                          <Link
                            to={`/recruiter/applicants/${application.id}`}
                            className="recruiter-manage-jobs__action"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--warn"
                            onClick={() => handleApplicationAction(application.id, "Interview")}
                          >
                            Interview
                          </button>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--danger"
                            onClick={() => handleApplicationAction(application.id, "Rejected")}
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--success"
                            onClick={() => handleApplicationAction(application.id, "Offer")}
                          >
                            Offer
                          </button>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--success"
                            onClick={() => handleApplicationAction(application.id, "Hired")}
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
