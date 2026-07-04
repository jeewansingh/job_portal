import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { recentApplications } from "../data/applications";
import { formatDate } from "../utils/profile";
import "../styles/MyApplications.css";

const statusClassMap = {
  Applied: "application-card__status--applied",
  "Under Review": "application-card__status--review",
  Interview: "application-card__status--interview",
  Offer: "application-card__status--offer",
  Rejected: "application-card__status--rejected",
};

const PAGE_SIZE = 10;

export default function MyApplications() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  const filteredApplications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = recentApplications.filter((application) => {
      const matchesStatus = statusFilter === "All" || application.status === statusFilter;
      const matchesSearch =
        !normalizedQuery ||
        application.jobTitle.toLowerCase().includes(normalizedQuery) ||
        application.company.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.appliedDate);
      const dateB = new Date(b.appliedDate);

      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });
  }, [searchQuery, sortOrder, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const paginatedApplications = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredApplications.slice(start, start + PAGE_SIZE);
  }, [filteredApplications, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortOrder, statusFilter]);

  return (
    <DashboardLayout>
      <div className="my-applications-page">
        <div className="my-applications-page__container">
          <section className="my-applications-page__header">
            <span className="dashboard__label">Applications</span>
            <h1 className="dashboard__title">My Applications</h1>
            <p className="dashboard__subtitle">
              Keep track of every application you have submitted.
            </p>
            <Link to="/dashboard" className="dashboard__back-link">
              ← Back to Dashboard
            </Link>
          </section>

          <div className="my-applications-page__filters">
            <input
              className="my-applications-page__filter-input"
              placeholder="Search by role or company"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <select
              className="my-applications-page__filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All statuses</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              className="my-applications-page__filter-select"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option value="latest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          <div className="my-applications-page__results-meta">
            <span>{filteredApplications.length} applications found</span>
            <span>Showing {paginatedApplications.length} per page</span>
          </div>

          <div className="my-applications-page__list">
            {paginatedApplications.map((application) => (
              <article key={application.id} className="application-card">
                <div className="application-card__main">
                  <div
                    className="application-card__logo"
                    style={{ background: application.logoColor }}
                  >
                    {application.logoLetter}
                  </div>
                  <div className="application-card__details">
                    <h3 className="application-card__title">{application.jobTitle}</h3>
                    <p className="application-card__company">
                      {application.company} · {application.location}
                    </p>
                    <p className="application-card__date">
                      Applied on {formatDate(application.appliedDate)}
                    </p>
                  </div>
                </div>

                <div className="application-card__actions">
                  <span className={`application-card__status ${statusClassMap[application.status]}`}>
                    {application.status}
                  </span>
                  <Link to={`/jobs/${application.jobId}`} className="application-card__view">
                    View
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="my-applications-page__pagination">
            <button className="my-applications-page__pagination-btn" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}>
              Previous
            </button>
            <span className="my-applications-page__pagination-status">
              Page {page} of {totalPages}
            </span>
            <button className="my-applications-page__pagination-btn" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
