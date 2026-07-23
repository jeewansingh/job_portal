import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import RecruiterSidebar from "../../components/recruiter/RecruiterSidebar";
import { getJobDetails, updateJob } from "../../services/job";
import { closeJob, deleteJob, getJobApplications, updateApplicationStatus } from "../../services/recruiter";
import { fetchSkills } from "../../services/skills";
import { getFileUrl } from "../../services/api";
import "../../styles/RecruiterDashboard.css";
import "../../styles/RecruiterPostJob.css";
import "../../styles/RecruiterJobs.css";

const CATEGORY_OPTIONS = [
  "Information Technology",
  "Software Development",
  "Finance",
  "Banking",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Telecommunications",
  "Hospitality",
  "E-commerce",
  "Marketing",
  "Construction",
  "Government",
  "NGO/INGO",
  "Others",
];

const EMPLOYMENT_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Remote",
  "Hybrid",
  "Contract",
  "Internship",
];

const applicantStatusClassMap = {
  SHORTLISTED: "recruiter-job-detail__applicant-badge--shortlisted",
  INTERVIEW: "recruiter-job-detail__applicant-badge--interview",
  REJECTED: "recruiter-job-detail__applicant-badge--rejected",
  OFFERED: "recruiter-job-detail__applicant-badge--offer",
  HIRED: "recruiter-job-detail__applicant-badge--hired",
  UNDER_REVIEW: "recruiter-job-detail__applicant-badge--review",
};

const jobStatusClassMap = {
  Active: "recruiter-manage-jobs__badge--active",
  Closed: "recruiter-manage-jobs__badge--closed",
};

const sortOptions = [
  { value: "latest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Applicant A-Z" },
  { value: "experience-desc", label: "Most experience" },
];

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getDaysRemaining(deadline) {
  const end = new Date(`${deadline}T00:00:00`);
  const now = new Date();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export default function RecruiterJobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest");
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    jobTitle: "",
    category: "",
    employmentType: "",
    experience: "",
    salary: "",
    skills: [],
    openings: "",
    jobDescription: "",
    responsibilities: "",
    deadline: "",
    location: "",
  });
  const [availableSkills, setAvailableSkills] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [employmentTypeOpen, setEmploymentTypeOpen] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [skillOpen, setSkillOpen] = useState(false);
  const categoryWrapRef = useRef(null);
  const employmentTypeWrapRef = useRef(null);
  const skillWrapRef = useRef(null);

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryWrapRef.current && !categoryWrapRef.current.contains(event.target)) {
        setCategoryOpen(false);
      }
      if (employmentTypeWrapRef.current && !employmentTypeWrapRef.current.contains(event.target)) {
        setEmploymentTypeOpen(false);
      }
      if (skillWrapRef.current && !skillWrapRef.current.contains(event.target)) {
        setSkillOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadJobData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [jobData, applicationsData] = await Promise.all([
        getJobDetails(jobId),
        getJobApplications(parseInt(jobId))
      ]);
      setJob(jobData);
      setApplications(applicationsData);
    } catch (err) {
      setError(err.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleApplicantAction = async (applicationId, nextStatus) => {
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

  const handleToggleJobStatus = async () => {
    try {
      const response = await closeJob(parseInt(jobId));
      // Backend now returns the new status
      setJob(prev => ({ ...prev, is_closed: response.is_closed }));
    } catch (err) {
      alert(err.message || "Failed to toggle job status");
    }
  };

  const handleDeleteJob = async () => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteJob(parseInt(jobId));
      navigate("/recruiter/manage-jobs");
    } catch (err) {
      alert(err.message || "Failed to delete job");
    }
  };

  const openEditModal = async () => {
    try {
      // Load skills if not already loaded
      if (availableSkills.length === 0) {
        const skills = await fetchSkills();
        setAvailableSkills(skills);
      }
      
      // Populate form with current job data
      setEditForm({
        jobTitle: job.job_title || "",
        category: job.category || "",
        employmentType: job.employment_type || "",
        experience: job.experience_years ? String(job.experience_years) : "",
        salary: job.salary_per_month || "",
        skills: job.skills ? job.skills.map(s => s.name) : [],
        openings: job.openings ? String(job.openings) : "",
        jobDescription: job.job_description || "",
        responsibilities: job.job_specification || "",
        deadline: job.deadline || "",
        location: job.location || "",
      });
      setEditError("");
      setEditModalOpen(true);
    } catch (err) {
      alert("Failed to load skills: " + err.message);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setCategoryOpen(false);
    setEmploymentTypeOpen(false);
    setSkillOpen(false);
    setSkillInput("");
    setEditError("");
  };

  const handleEditFieldChange = (name, value) => {
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = (skillName) => {
    const normalized = skillName.trim();
    if (!normalized) return;
    
    setEditForm(prev => {
      const exists = prev.skills.some(s => s.toLowerCase() === normalized.toLowerCase());
      if (exists) return prev;
      return { ...prev, skills: [...prev.skills, normalized] };
    });
  };

  const removeSkill = (skillName) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillName)
    }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    setEditLoading(true);
    setEditError("");

    try {
      const formData = new FormData();
      formData.append("job_title", editForm.jobTitle.trim());
      formData.append("category", editForm.category.trim());
      formData.append("employment_type", editForm.employmentType);
      formData.append("experience_years", editForm.experience || "0");
      formData.append("salary_per_month", editForm.salary.trim());
      formData.append("openings", editForm.openings || "1");
      formData.append("location", editForm.location.trim());
      formData.append("job_description", editForm.jobDescription.trim());
      formData.append("job_specification", editForm.responsibilities.trim());
      formData.append("deadline", editForm.deadline);

      // Add skill IDs
      if (editForm.skills && editForm.skills.length > 0) {
        editForm.skills.forEach((skillName) => {
          const skill = availableSkills.find(s => s.name === skillName);
          if (skill) {
            formData.append("skill_ids", skill.id.toString());
          }
        });
      }

      await updateJob(jobId, formData);
      
      // Reload job data
      await loadJobData();
      closeEditModal();
    } catch (err) {
      setEditError(err.message || "Failed to update job");
    } finally {
      setEditLoading(false);
    }
  };

  const skillSuggestions = useMemo(() => {
    const query = skillInput.trim().toLowerCase();
    return availableSkills.filter(
      skill =>
        skill.name.toLowerCase().includes(query) &&
        !editForm.skills.some(s => s.toLowerCase() === skill.name.toLowerCase())
    );
  }, [availableSkills, skillInput, editForm.skills]);

  const filteredApplicants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = applications.filter((applicant) => {
      const matchesSearch =
        !query ||
        applicant.applicant_name.toLowerCase().includes(query) ||
        applicant.experience_years.toString().includes(query);
      const matchesStatus = statusFilter === "All" || applicant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case "oldest":
          return new Date(a.applied_at) - new Date(b.applied_at);
        case "name-asc":
          return a.applicant_name.localeCompare(b.applicant_name);
        case "experience-desc":
          return b.experience_years - a.experience_years;
        case "latest":
        default:
          return new Date(b.applied_at) - new Date(a.applied_at);
      }
    });
  }, [applications, searchQuery, sortOrder, statusFilter]);

  if (loading) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterSidebar activeItem="Manage Jobs" />
        <main className="recruiter-dashboard__main">
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading job details...</div>
        </main>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterSidebar activeItem="Manage Jobs" />
        <main className="recruiter-dashboard__main">
          <section className="recruiter-dashboard__hero">
            <div>
              <span className="recruiter-dashboard__eyebrow">Recruiter Dashboard</span>
              <h1 className="recruiter-dashboard__title">Job not found</h1>
              <p className="recruiter-dashboard__subtitle">
                {error || "The requested job could not be loaded."}
              </p>
            </div>
            <div className="recruiter-dashboard__hero-side">
              <div className="recruiter-dashboard__hero-actions">
                <Link to="/recruiter/manage-jobs" className="recruiter-dashboard__primary-action">
                  Back to Manage Jobs
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const displayStatus = job.is_closed ? "Reopen" : "Close";
  const overviewCards = [
    { label: "Applications", value: applications.length, meta: "Applications received", tone: "primary" },
    { label: "Days Remaining", value: getDaysRemaining(job.deadline), meta: "Until deadline", tone: "success" },
  ];

  return (
    <div className="recruiter-dashboard">
      <RecruiterSidebar activeItem="Manage Jobs" />

      <main className="recruiter-dashboard__main">
        <section className="recruiter-job-detail__top">
          <Link to="/recruiter/manage-jobs" className="recruiter-job-detail__back-link">
            ← Back to Manage Jobs
          </Link>

          <div className="recruiter-dashboard__hero">
            <div>
              <span className="recruiter-dashboard__eyebrow">Recruiter Job Detail</span>
              <h1 className="recruiter-dashboard__title">{job.job_title}</h1>
              <p className="recruiter-dashboard__subtitle">
                {job.category} · {job.salary_per_month || "Not specified"} · {job.location} · {job.employment_type}
              </p>
              <div className="recruiter-job-detail__meta-row">
                <span className={`recruiter-manage-jobs__badge ${jobStatusClassMap[job.is_closed ? "Closed" : "Active"]}`}>
                  {job.is_closed ? "Closed" : "Active"}
                </span>
                <span className="recruiter-job-detail__meta-pill">{job.category}</span>
              </div>
            </div>

            <div className="recruiter-dashboard__hero-side">
              <div className="recruiter-dashboard__hero-actions">
                <button
                  type="button"
                  className="recruiter-dashboard__primary-action"
                  onClick={openEditModal}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="recruiter-dashboard__secondary-action"
                  onClick={handleToggleJobStatus}
                >
                  {displayStatus}
                </button>
                <button
                  type="button"
                  className="recruiter-dashboard__secondary-action"
                  onClick={handleDeleteJob}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="recruiter-dashboard__summary" aria-label="Job overview">
          {overviewCards.map((card) => (
            <article key={card.label} className={`recruiter-kpi recruiter-kpi--${card.tone}`}>
              <span className="recruiter-kpi__label">{card.label}</span>
              <strong className="recruiter-kpi__value">{card.value}</strong>
              <span className="recruiter-kpi__meta">{card.meta}</span>
            </article>
          ))}
        </section>

        <section className="recruiter-job-detail__content">
          <article className="recruiter-panel">
            <div className="recruiter-panel__header">
              <div>
                <span className="recruiter-panel__eyebrow">Job Profile</span>
                <h2 className="recruiter-panel__title">Complete Job Information</h2>
              </div>
            </div>

            <div className="recruiter-job-detail__info-grid">
              <div className="recruiter-job-detail__info-item">
                <span>Title</span>
                <strong>{job.job_title}</strong>
              </div>
              <div className="recruiter-job-detail__info-item">
                <span>Category</span>
                <strong>{job.category}</strong>
              </div>
              <div className="recruiter-job-detail__info-item">
                <span>Salary</span>
                <strong>{job.salary_per_month || "Not specified"}</strong>
              </div>
              <div className="recruiter-job-detail__info-item">
                <span>Experience</span>
                <strong>{job.experience_years ? `${job.experience_years} years` : "Not specified"}</strong>
              </div>
              <div className="recruiter-job-detail__info-item">
                <span>Location</span>
                <strong>{job.location}</strong>
              </div>
              <div className="recruiter-job-detail__info-item">
                <span>Work Mode</span>
                <strong>{job.employment_type}</strong>
              </div>
              <div className="recruiter-job-detail__info-item">
                <span>Vacancies</span>
                <strong>{job.openings}</strong>
              </div>
              <div className="recruiter-job-detail__info-item">
                <span>Deadline</span>
                <strong>{formatDate(job.deadline)}</strong>
              </div>
            </div>
          </article>

          <article className="recruiter-panel">
            <div className="recruiter-panel__header">
              <div>
                <span className="recruiter-panel__eyebrow">Overview</span>
                <h2 className="recruiter-panel__title">Description</h2>
              </div>
            </div>
            <p className="recruiter-job-detail__body">{job.job_description}</p>
          </article>

          <article className="recruiter-panel">
            <div className="recruiter-panel__header">
              <div>
                <span className="recruiter-panel__eyebrow">Role Scope</span>
                <h2 className="recruiter-panel__title">Specifications</h2>
              </div>
            </div>
            <div className="recruiter-job-detail__body" style={{ whiteSpace: "pre-wrap" }}>
              {job.job_specification}
            </div>
          </article>

          <article className="recruiter-panel">
            <div className="recruiter-panel__header">
              <div>
                <span className="recruiter-panel__eyebrow">Skills</span>
                <h2 className="recruiter-panel__title">Required Skills</h2>
              </div>
            </div>
            <div className="recruiter-job-detail__tag-list">
              {job.skills && job.skills.length > 0 ? (
                job.skills.map((skill) => (
                  <span key={skill.id} className="recruiter-pill">
                    {skill.name}
                  </span>
                ))
              ) : (
                <span>No skills specified</span>
              )}
            </div>
          </article>
        </section>

        <section className="recruiter-panel recruiter-job-detail__applications-panel">
          <div className="recruiter-panel__header recruiter-panel__header--stacked">
            <div>
              <span className="recruiter-panel__eyebrow">Applications</span>
              <h2 className="recruiter-panel__title">Applicants for This Job</h2>
              <p className="recruiter-panel__subtitle">
                Search and manage candidates for this specific role.
              </p>
            </div>
          </div>

          <div className="recruiter-manage-jobs__filters recruiter-job-detail__filters">
            <input
              className="recruiter-manage-jobs__search"
              type="search"
              placeholder="Search applicant or experience"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />

            <select
              className="recruiter-manage-jobs__filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All statuses</option>
              {[...new Set(applications.map((applicant) => applicant.status))].map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>

            <select
              className="recruiter-manage-jobs__filter"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="recruiter-job-detail__results-meta">
            <span>{filteredApplicants.length} applicants found</span>
          </div>

          {filteredApplicants.length > 0 ? (
            <div className="recruiter-job-detail__table-wrap">
              <table className="recruiter-job-detail__table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Experience</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th style={{ width: "280px", minWidth: "280px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((applicant) => (
                    <tr key={applicant.id}>
                      <td>
                        <div className="recruiter-job-detail__applicant-cell">
                          <strong>{applicant.applicant_name}</strong>
                        </div>
                      </td>
                      <td>{applicant.experience_years ? `${applicant.experience_years} years` : "N/A"}</td>
                      <td>
                        {applicant.resume_url ? (
                          <a
                            href={getFileUrl(applicant.resume_url)}
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
                            applicantStatusClassMap[applicant.status] ||
                            "recruiter-job-detail__applicant-badge--review"
                          }`}
                        >
                          {applicant.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        <div className="recruiter-job-detail__action-list">
                          <Link
                            to={`/recruiter/applicants/${applicant.user_id}`}
                            className="recruiter-manage-jobs__action"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--warn"
                            onClick={() => handleApplicantAction(applicant.id, "INTERVIEW")}
                          >
                            Interview
                          </button>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--danger"
                            onClick={() => handleApplicantAction(applicant.id, "REJECTED")}
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--success"
                            onClick={() => handleApplicantAction(applicant.id, "OFFERED")}
                          >
                            Offer
                          </button>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--success"
                            onClick={() => handleApplicantAction(applicant.id, "HIRED")}
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
              <h3>No applications yet</h3>
              <p>This role does not have any applicants in the current demo dataset.</p>
            </div>
          )}
        </section>

        {/* Edit Job Modal */}
        {editModalOpen && (
          <div
            className="recruiter-post-job__modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={closeEditModal}
          >
            <div
              className="recruiter-post-job__modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="recruiter-post-job__modal-header">
                <div>
                  <span className="recruiter-post-job__eyebrow">Edit Job</span>
                  <h2 className="recruiter-post-job__title">Update Job Details</h2>
                  <p className="recruiter-post-job__subtitle">
                    Save changes or cancel to keep current information.
                  </p>
                </div>
                <button
                  type="button"
                  className="recruiter-post-job__modal-close"
                  onClick={closeEditModal}
                >
                  ×
                </button>
              </div>

              <form className="recruiter-post-job__form recruiter-post-job__form--modal" onSubmit={handleEditSubmit}>
                {editError && (
                  <div style={{ padding: '1rem', marginBottom: '1rem', background: '#fee', color: '#c00', borderRadius: '8px' }}>
                    {editError}
                  </div>
                )}

                <section className="recruiter-post-job__section">
                  <h2>Job basics</h2>
                  <div className="recruiter-post-job__grid">
                    <div className="recruiter-post-job__field recruiter-post-job__field--full">
                      <label htmlFor="jobTitle">Job title <span>*</span></label>
                      <input
                        id="jobTitle"
                        type="text"
                        value={editForm.jobTitle}
                        onChange={(e) => handleEditFieldChange("jobTitle", e.target.value)}
                        required
                      />
                    </div>

                    <div className="recruiter-post-job__field">
                      <label htmlFor="category">Category <span>*</span></label>
                      <div className="recruiter-post-job__combo" ref={categoryWrapRef}>
                        <input
                          id="category"
                          type="text"
                          value={editForm.category}
                          readOnly
                          onFocus={() => setCategoryOpen(true)}
                          onClick={() => setCategoryOpen(true)}
                          placeholder="Select category"
                          required
                        />
                        {categoryOpen && (
                          <div className="recruiter-post-job__dropdown">
                            {CATEGORY_OPTIONS.map((option) => (
                              <button
                                key={option}
                                type="button"
                                className="recruiter-post-job__option"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleEditFieldChange("category", option);
                                  setCategoryOpen(false);
                                }}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="recruiter-post-job__field">
                      <label htmlFor="employmentType">Employment type <span>*</span></label>
                      <div className="recruiter-post-job__combo" ref={employmentTypeWrapRef}>
                        <input
                          id="employmentType"
                          type="text"
                          value={editForm.employmentType}
                          readOnly
                          onFocus={() => setEmploymentTypeOpen(true)}
                          onClick={() => setEmploymentTypeOpen(true)}
                          placeholder="Select employment type"
                          required
                        />
                        {employmentTypeOpen && (
                          <div className="recruiter-post-job__dropdown">
                            {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                              <button
                                key={option}
                                type="button"
                                className="recruiter-post-job__option"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleEditFieldChange("employmentType", option);
                                  setEmploymentTypeOpen(false);
                                }}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="recruiter-post-job__field">
                      <label htmlFor="experience">Experience (years) <span>*</span></label>
                      <input
                        id="experience"
                        type="number"
                        min="0"
                        step="0.5"
                        value={editForm.experience}
                        onChange={(e) => handleEditFieldChange("experience", e.target.value)}
                        required
                      />
                    </div>

                    <div className="recruiter-post-job__field">
                      <label htmlFor="salary">Salary <span>*</span></label>
                      <input
                        id="salary"
                        type="text"
                        value={editForm.salary}
                        onChange={(e) => handleEditFieldChange("salary", e.target.value)}
                        required
                      />
                    </div>

                    <div className="recruiter-post-job__field">
                      <label htmlFor="openings">Openings <span>*</span></label>
                      <input
                        id="openings"
                        type="number"
                        min="1"
                        value={editForm.openings}
                        onChange={(e) => handleEditFieldChange("openings", e.target.value)}
                        required
                      />
                    </div>

                    <div className="recruiter-post-job__field">
                      <label htmlFor="location">Location <span>*</span></label>
                      <input
                        id="location"
                        type="text"
                        value={editForm.location}
                        onChange={(e) => handleEditFieldChange("location", e.target.value)}
                        required
                      />
                    </div>

                    <div className="recruiter-post-job__field">
                      <label htmlFor="deadline">Deadline <span>*</span></label>
                      <input
                        id="deadline"
                        type="date"
                        value={editForm.deadline}
                        onChange={(e) => handleEditFieldChange("deadline", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </section>

                <section className="recruiter-post-job__section">
                  <h2>Skills</h2>
                  <div className="recruiter-post-job__field">
                    <label htmlFor="skills">Skills <span>*</span></label>
                    <div className="recruiter-post-job__skills" ref={skillWrapRef}>
                      {editForm.skills.map((skill) => (
                        <span key={skill} className="recruiter-post-job__chip">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)}>×</button>
                        </span>
                      ))}
                      <input
                        id="skills"
                        type="text"
                        value={skillInput}
                        onChange={(e) => {
                          setSkillInput(e.target.value);
                          setSkillOpen(true);
                        }}
                        onFocus={() => setSkillOpen(true)}
                        placeholder="Search skills"
                        required={editForm.skills.length === 0}
                      />
                    </div>
                    {skillOpen && skillSuggestions.length > 0 && (
                      <div className="recruiter-post-job__dropdown recruiter-post-job__dropdown--skills">
                        {skillSuggestions.map((skill) => (
                          <button
                            key={skill.id}
                            type="button"
                            className="recruiter-post-job__option"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              addSkill(skill.name);
                              setSkillInput("");
                              setSkillOpen(false);
                            }}
                          >
                            {skill.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <section className="recruiter-post-job__section">
                  <h2>Job details</h2>
                  <div className="recruiter-post-job__field">
                    <label htmlFor="jobDescription">Job description <span>*</span></label>
                    <textarea
                      id="jobDescription"
                      value={editForm.jobDescription}
                      onChange={(e) => handleEditFieldChange("jobDescription", e.target.value)}
                      rows="5"
                      required
                    />
                  </div>

                  <div className="recruiter-post-job__field">
                    <label htmlFor="responsibilities">Responsibilities <span>*</span></label>
                    <textarea
                      id="responsibilities"
                      value={editForm.responsibilities}
                      onChange={(e) => handleEditFieldChange("responsibilities", e.target.value)}
                      rows="5"
                      required
                    />
                  </div>
                </section>

                <div className="recruiter-post-job__modal-actions">
                  <button
                    type="button"
                    className="recruiter-dashboard__secondary-action"
                    onClick={closeEditModal}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="recruiter-dashboard__primary-action"
                    disabled={editLoading}
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
