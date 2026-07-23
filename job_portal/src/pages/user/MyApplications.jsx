import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../components/DashboardLayout";
import { getUserApplications } from "../../services/applications";
import { getFileUrl } from "../../services/api";
import { formatDate } from "../../utils/profile";

import "../../styles/MyApplications.css";

const STATUS_LABEL = {
  UNDER_REVIEW: "Under Review",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

const statusClassMap = {
  UNDER_REVIEW: "application-card__status--review",
  INTERVIEW: "application-card__status--interview",
  OFFER: "application-card__status--offer",
  REJECTED: "application-card__status--rejected",
};

const PAGE_SIZE = 10;

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  useEffect(() => {
    async function loadApplications() {
      try {
        const data = await getUserApplications();
        setApplications(data);
      } catch {
        // leave empty on error
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = applications.filter((application) => {
      const matchesStatus =
        statusFilter === "All" || application.status === statusFilter;

      const matchesSearch =
        !normalizedQuery ||
        application.job_title?.toLowerCase().includes(normalizedQuery) ||
        application.company_name?.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.applied_at);
      const dateB = new Date(b.applied_at);
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });
  }, [applications, searchQuery, statusFilter, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));

  const paginatedApplications = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredApplications.slice(start, start + PAGE_SIZE);
  }, [filteredApplications, page]);

  const getLogoStyle = (companyName = "") => {
    const hash = companyName
      .split("")
      .reduce((acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0);
    const hue = Math.abs(hash) % 360;
    return {
      letter: companyName.charAt(0).toUpperCase(),
      color: `linear-gradient(135deg, oklch(0.5 0.12 ${hue}), oklch(0.55 0.14 ${hue + 15}))`,
    };
  };

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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="my-applications-page__filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All statuses</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              className="my-applications-page__filter-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="latest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          <div className="my-applications-page__results-meta">
            <span>{filteredApplications.length} applications found</span>
            <span>Showing {paginatedApplications.length} per page</span>
          </div>

          {loading ? (
            <div className="dashboard__empty-state">Loading applications...</div>
          ) : paginatedApplications.length === 0 ? (
            <div className="dashboard__empty-state">No applications found.</div>
          ) : (
            <div className="my-applications-page__list">
              {paginatedApplications.map((application) => {
                const logo = getLogoStyle(application.company_name);
                return (
                  <article key={application.id} className="application-card">
                    <div className="application-card__main">
                      {application.company_logo_url ? (
                        <img
                          src={getFileUrl(application.company_logo_url)}
                          alt={application.company_name}
                          className="application-card__logo"
                          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }}
                        />
                      ) : (
                        <div
                          className="application-card__logo"
                          style={{ background: logo.color }}
                        >
                          {logo.letter}
                        </div>
                      )}
                      <div className="application-card__details">
                        <h3 className="application-card__title">{application.job_title}</h3>
                        <p className="application-card__company">
                          {application.company_name} · {application.location}
                        </p>
                        <p className="application-card__date">
                          Applied on {formatDate(application.applied_at)}
                        </p>
                      </div>
                    </div>

                    <div className="application-card__actions">
                      <span
                        className={`application-card__status ${statusClassMap[application.status] || ""}`}
                      >
                        {STATUS_LABEL[application.status] || application.status}
                      </span>
                      <Link to={`/jobs/${application.job_id}`} className="application-card__view">
                        View
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="my-applications-page__pagination">
            <button
              className="my-applications-page__pagination-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="my-applications-page__pagination-status">
              Page {page} of {totalPages}
            </span>
            <button
              className="my-applications-page__pagination-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
