import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import RecruiterSidebar from "../../components/recruiter/RecruiterSidebar";
import { recruiterJobs } from "../../data/recruiterJobs";
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

const SKILL_OPTIONS = [
  "React",
  "JavaScript",
  "TypeScript",
  "Node.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "UI/UX Design",
  "Figma",
  "HTML",
  "CSS",
  "Python",
  "Java",
  "C#",
  "Communication",
  "Leadership",
  "Project Management",
  "SQL",
  "AWS",
  "Docker",
];

const applicantStatusClassMap = {
  Shortlisted: "recruiter-job-detail__applicant-badge--shortlisted",
  Interview: "recruiter-job-detail__applicant-badge--interview",
  Rejected: "recruiter-job-detail__applicant-badge--rejected",
  Offer: "recruiter-job-detail__applicant-badge--offer",
  Hired: "recruiter-job-detail__applicant-badge--hired",
  "Under Review": "recruiter-job-detail__applicant-badge--review",
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

const initialForm = {
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
};

function normalizeSkill(value) {
  return value.trim().replace(/\s+/g, " ");
}

function splitLines(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

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

function mapJobToForm(job) {
  return {
    jobTitle: job.title || "",
    category: job.category || "",
    employmentType: job.employmentType || "",
    experience: job.experience || "",
    salary: job.salary || "",
    skills: job.skills || [],
    openings: job.openings ? String(job.openings) : "",
    jobDescription: job.description || "",
    responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join("\n") : "",
    deadline: job.deadline || "",
    location: job.location || "",
  };
}

function normalizeApplicant(applicant) {
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
    status,
    matchScore: applicant.matchScore || `${matchScores[status] || 80}%`,
  };
}

function mapJobApplicants(job) {
  return (job.applicants || []).map(normalizeApplicant);
}

export default function RecruiterJobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const selectedJob = useMemo(
    () => recruiterJobs.find((item) => String(item.id) === String(jobId)) || null,
    [jobId]
  );

  const [editedJob, setEditedJob] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [form, setForm] = useState(() => (selectedJob ? mapJobToForm(selectedJob) : initialForm));
  const [skillInput, setSkillInput] = useState("");
  const [skillOpen, setSkillOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [employmentTypeOpen, setEmploymentTypeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest");
  const [applicantsByJobId, setApplicantsByJobId] = useState(() =>
    selectedJob ? { [selectedJob.id]: mapJobApplicants(selectedJob) } : {}
  );
  const categoryWrapRef = useRef(null);
  const employmentTypeWrapRef = useRef(null);
  const skillWrapRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryWrapRef.current && !categoryWrapRef.current.contains(event.target)) {
        setCategoryOpen(false);
      }
      if (
        employmentTypeWrapRef.current &&
        !employmentTypeWrapRef.current.contains(event.target)
      ) {
        setEmploymentTypeOpen(false);
      }
      if (skillWrapRef.current && !skillWrapRef.current.contains(event.target)) {
        setSkillOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const currentJob =
    editedJob && selectedJob && String(editedJob.id) === String(selectedJob.id)
      ? editedJob
      : selectedJob;

  const currentApplicants = useMemo(() => {
    if (!currentJob) return [];
    return applicantsByJobId[currentJob.id] || mapJobApplicants(currentJob);
  }, [applicantsByJobId, currentJob]);

  const categorySuggestions = useMemo(() => CATEGORY_OPTIONS, []);

  const skillSuggestions = useMemo(() => {
    const query = skillInput.trim().toLowerCase();
    return SKILL_OPTIONS.filter(
      (item) =>
        item.toLowerCase().includes(query) &&
        !form.skills.some((skill) => skill.toLowerCase() === item.toLowerCase())
    );
  }, [form.skills, skillInput]);

  const filteredApplicants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = currentApplicants.filter((applicant) => {
      const matchesSearch =
        !query ||
        applicant.name.toLowerCase().includes(query) ||
        applicant.experience.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || applicant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case "oldest":
          return new Date(a.appliedDate) - new Date(b.appliedDate);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "experience-desc":
          return parseInt(b.experience, 10) - parseInt(a.experience, 10);
        case "latest":
        default:
          return new Date(b.appliedDate) - new Date(a.appliedDate);
      }
    });
  }, [currentApplicants, searchQuery, sortOrder, statusFilter]);

  if (!currentJob) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterSidebar activeItem="Manage Jobs" />

        <main className="recruiter-dashboard__main">
          <section className="recruiter-dashboard__hero">
            <div>
              <span className="recruiter-dashboard__eyebrow">Recruiter Dashboard</span>
              <h1 className="recruiter-dashboard__title">Job not found</h1>
              <p className="recruiter-dashboard__subtitle">
                The requested job is not available in the current demo dataset.
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

  const displayJob = currentJob;
  const displayStatus = currentJob.status === "Closed" ? "Open" : "Close";
  const nextStatus = currentJob.status === "Closed" ? "Active" : "Closed";

  const overviewCards = [
    { label: "Applications", value: currentJob.applications, meta: "Applications received", tone: "primary" },
    { label: "Days Remaining", value: getDaysRemaining(currentJob.deadline), meta: "Until deadline", tone: "success" },
  ];

  const startEditing = () => {
    setForm(mapJobToForm(currentJob));
    setSkillInput("");
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setCategoryOpen(false);
    setEmploymentTypeOpen(false);
    setSkillOpen(false);
  };

  const handleSetField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addSkill = (rawSkill) => {
    const skill = normalizeSkill(rawSkill);
    if (!skill) return;

    setForm((prev) => {
      const exists = prev.skills.some((item) => item.toLowerCase() === skill.toLowerCase());
      if (exists) return prev;
      return { ...prev, skills: [...prev.skills, skill] };
    });
  };

  const selectCategory = (value) => {
    handleSetField("category", value);
    setCategoryOpen(false);
  };

  const selectEmploymentType = (value) => {
    handleSetField("employmentType", value);
    setEmploymentTypeOpen(false);
  };

  const selectSkill = (value) => {
    addSkill(value);
    setSkillInput("");
    setSkillOpen(false);
  };

  const removeSkill = (skillToRemove) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const saveJob = (event) => {
    event.preventDefault();

    const updated = {
      ...currentJob,
      title: form.jobTitle.trim(),
      category: form.category.trim(),
      employmentType: form.employmentType,
      experience: form.experience.trim(),
      salary: form.salary.trim(),
      skills: form.skills,
      openings: form.openings ? Number(form.openings) : null,
      description: form.jobDescription.trim(),
      responsibilities: splitLines(form.responsibilities),
      deadline: form.deadline,
      location: form.location.trim(),
    };

    setEditedJob(updated);
    closeEditModal();

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setShowToast(true);
    toastTimerRef.current = window.setTimeout(() => setShowToast(false), 1400);
  };

  const handleApplicantAction = (applicantId, nextApplicantStatus) => {
    setApplicantsByJobId((currentMap) => {
      const existingApplicants = currentMap[currentJob.id] || mapJobApplicants(currentJob);
      return {
        ...currentMap,
        [currentJob.id]: existingApplicants.map((applicant) =>
          applicant.id === applicantId ? { ...applicant, status: nextApplicantStatus } : applicant
        ),
      };
    });
  };

  const handleToggleJobStatus = () => {
    setEditedJob((prev) => {
      const baseJob = prev && String(prev.id) === String(currentJob.id) ? prev : currentJob;
      return { ...baseJob, status: nextStatus };
    });
  };

  const handleDeleteJob = () => {
    navigate("/recruiter/manage-jobs");
  };

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
              <h1 className="recruiter-dashboard__title">{displayJob.title}</h1>
              <p className="recruiter-dashboard__subtitle">
                {currentJob.category} · {currentJob.salary} · {currentJob.location} · {currentJob.employmentType}
              </p>
              <div className="recruiter-job-detail__meta-row">
                <span className={`recruiter-manage-jobs__badge ${jobStatusClassMap[currentJob.status]}`}>
                  {currentJob.status}
                </span>
                <span className="recruiter-job-detail__meta-pill">{currentJob.category}</span>
              </div>
            </div>

            <div className="recruiter-dashboard__hero-side">
              <div className="recruiter-dashboard__hero-actions">
                <button
                  type="button"
                  className="recruiter-dashboard__primary-action"
                  onClick={startEditing}
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
                <strong>{displayJob.title}</strong>
              </div>
              <div className="recruiter-job-detail__info-item">
                <span>Category</span>
                <strong>{displayJob.category}</strong>
              </div>
              <div className="recruiter-job-detail__info-item">
                <span>Salary</span>
                <strong>{displayJob.salary}</strong>
              </div>
              <div className="recruiter-job-detail__info-item">
                <span>Experience</span>
                <strong>{displayJob.experience}</strong>
              </div>
              <div className="recruiter-job-detail__info-item">
                <span>Location</span>
                <strong>{displayJob.location}</strong>
              </div>
              <div className="recruiter-job-detail__info-item">
                <span>Work Mode</span>
                <strong>{displayJob.workMode}</strong>
              </div>
              <div className="recruiter-job-detail__info-item">
                <span>Vacancies</span>
                <strong>{displayJob.openings}</strong>
              </div>
              <div className="recruiter-job-detail__info-item">
                <span>Deadline</span>
                <strong>{formatDate(displayJob.deadline)}</strong>
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
            <p className="recruiter-job-detail__body">{displayJob.description}</p>
          </article>

          <article className="recruiter-panel">
            <div className="recruiter-panel__header">
              <div>
                <span className="recruiter-panel__eyebrow">Role Scope</span>
                <h2 className="recruiter-panel__title">Specifications</h2>
              </div>
            </div>
            <ul className="recruiter-job-detail__list">
              {currentJob.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="recruiter-panel">
            <div className="recruiter-panel__header">
              <div>
                <span className="recruiter-panel__eyebrow">Skills</span>
                <h2 className="recruiter-panel__title">Skill Chips</h2>
              </div>
            </div>
            <div className="recruiter-job-detail__tag-list">
              {displayJob.skills.map((skill) => (
                <span key={skill} className="recruiter-pill">
                  {skill}
                </span>
              ))}
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
              {[...new Set(currentApplicants.map((applicant) => applicant.status))].map((status) => (
                <option key={status} value={status}>
                  {status}
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
                    <th>Match Score</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((applicant) => (
                    <tr key={applicant.id}>
                      <td>
                        <div className="recruiter-job-detail__applicant-cell">
                          <strong>{applicant.name}</strong>
                        </div>
                      </td>
                      <td>{applicant.experience}</td>
                      <td>
                        <span className="recruiter-job-detail__match-score">{applicant.matchScore}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="recruiter-job-detail__resume-btn"
                          onClick={() => console.log("Download resume", applicant.resumeName)}
                        >
                          Download
                        </button>
                      </td>
                      <td>
                        <span
                          className={`${
                            applicantStatusClassMap[applicant.status] ||
                            "recruiter-job-detail__applicant-badge--review"
                          }`}
                        >
                          {applicant.status}
                        </span>
                      </td>
                      <td>
                        <div className="recruiter-job-detail__action-list">
                          <Link
                            to={`/recruiter/applicants/${applicant.id}`}
                            className="recruiter-manage-jobs__action"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--warn"
                            onClick={() => handleApplicantAction(applicant.id, "Interview")}
                          >
                            Interview
                          </button>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--danger"
                            onClick={() => handleApplicantAction(applicant.id, "Rejected")}
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--success"
                            onClick={() => handleApplicantAction(applicant.id, "Offer")}
                          >
                            Offer
                          </button>
                          <button
                            type="button"
                            className="recruiter-manage-jobs__action recruiter-manage-jobs__action--success"
                            onClick={() => handleApplicantAction(applicant.id, "Hired")}
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

        {editModalOpen && (
          <div
            className="recruiter-post-job__modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recruiter-edit-job-title"
            onClick={closeEditModal}
          >
            <div
              className="recruiter-post-job__modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="recruiter-post-job__modal-header">
                <div>
                  <span className="recruiter-post-job__eyebrow">Edit Job</span>
                  <h2 id="recruiter-edit-job-title" className="recruiter-post-job__title">
                    Update Job Details
                  </h2>
                  <p className="recruiter-post-job__subtitle">
                    Save changes or cancel to keep the current job information.
                  </p>
                </div>
                <button
                  type="button"
                  className="recruiter-post-job__modal-close"
                  onClick={closeEditModal}
                  aria-label="Close edit job modal"
                >
                  ×
                </button>
              </div>

              <form className="recruiter-post-job__form recruiter-post-job__form--modal" onSubmit={saveJob}>
                <section className="recruiter-post-job__section">
                  <div className="recruiter-post-job__grid">
                    <div className="recruiter-post-job__field recruiter-post-job__field--full">
                      <label htmlFor="jobTitle">
                        Job title <span>*</span>
                      </label>
                      <input
                        id="jobTitle"
                        type="text"
                        value={form.jobTitle}
                        onChange={(event) => handleSetField("jobTitle", event.target.value)}
                        required
                      />
                    </div>

                    <div className="recruiter-post-job__field">
                      <label htmlFor="category">
                        Category <span>*</span>
                      </label>
                      <div className="recruiter-post-job__combo" ref={categoryWrapRef}>
                        <input
                          id="category"
                          type="text"
                          value={form.category}
                          readOnly
                          onFocus={() => setCategoryOpen(true)}
                          onClick={() => setCategoryOpen(true)}
                          placeholder="Select a category"
                          autoComplete="off"
                          aria-readonly="true"
                          required
                        />
                        {categoryOpen && (
                          <div className="recruiter-post-job__dropdown" role="listbox">
                            {categorySuggestions.map((option) => (
                              <button
                                key={option}
                                type="button"
                                className="recruiter-post-job__option"
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  selectCategory(option);
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
                      <label htmlFor="employmentType">
                        Employment type <span>*</span>
                      </label>
                      <div className="recruiter-post-job__combo" ref={employmentTypeWrapRef}>
                        <input
                          id="employmentType"
                          type="text"
                          value={form.employmentType}
                          readOnly
                          onFocus={() => setEmploymentTypeOpen(true)}
                          onClick={() => setEmploymentTypeOpen(true)}
                          placeholder="Select employment type"
                          autoComplete="off"
                          aria-readonly="true"
                          required
                        />
                        {employmentTypeOpen && (
                          <div className="recruiter-post-job__dropdown" role="listbox">
                            {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                              <button
                                key={option}
                                type="button"
                                className="recruiter-post-job__option"
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  selectEmploymentType(option);
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
                      <label htmlFor="experience">
                        Experience <span>*</span>
                      </label>
                      <input
                        id="experience"
                        type="text"
                        value={form.experience}
                        onChange={(event) => handleSetField("experience", event.target.value)}
                        required
                      />
                    </div>

                    <div className="recruiter-post-job__field">
                      <label htmlFor="salary">
                        Salary <span>*</span>
                      </label>
                      <input
                        id="salary"
                        type="text"
                        value={form.salary}
                        onChange={(event) => handleSetField("salary", event.target.value)}
                        required
                      />
                    </div>

                    <div className="recruiter-post-job__field">
                      <label htmlFor="openings">
                        Vacancies <span>*</span>
                      </label>
                      <input
                        id="openings"
                        type="number"
                        min="1"
                        value={form.openings}
                        onChange={(event) => handleSetField("openings", event.target.value)}
                        required
                      />
                    </div>

                    <div className="recruiter-post-job__field">
                      <label htmlFor="location">
                        Location <span>*</span>
                      </label>
                      <input
                        id="location"
                        type="text"
                        value={form.location}
                        onChange={(event) => handleSetField("location", event.target.value)}
                        required
                      />
                    </div>
                  </div>
                </section>

                <section className="recruiter-post-job__section">
                  <h2>Skills</h2>
                  <div className="recruiter-post-job__field">
                    <label htmlFor="skills">
                      Skills <span>*</span>
                    </label>
                    <div className="recruiter-post-job__skills" ref={skillWrapRef}>
                      {form.skills.map((skill) => (
                        <span key={skill} className="recruiter-post-job__chip">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            aria-label={`Remove ${skill}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        id="skills"
                        type="text"
                        value={skillInput}
                        onChange={(event) => {
                          setSkillInput(event.target.value);
                          setSkillOpen(true);
                        }}
                        onFocus={() => setSkillOpen(true)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") event.preventDefault();
                        }}
                        placeholder="Search skills"
                        autoComplete="off"
                        required={form.skills.length === 0}
                      />
                    </div>
                    {skillOpen && skillSuggestions.length > 0 && (
                      <div
                        className="recruiter-post-job__dropdown recruiter-post-job__dropdown--skills"
                        role="listbox"
                      >
                        {skillSuggestions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className="recruiter-post-job__option"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              selectSkill(option);
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <section className="recruiter-post-job__section recruiter-post-job__section--compact">
                  <h2>Job details</h2>
                  <div className="recruiter-post-job__field">
                    <label htmlFor="jobDescription">
                      Job description <span>*</span>
                    </label>
                    <textarea
                      id="jobDescription"
                      value={form.jobDescription}
                      onChange={(event) => handleSetField("jobDescription", event.target.value)}
                      required
                    />
                  </div>

                  <div className="recruiter-post-job__field">
                    <label htmlFor="responsibilities">
                      Responsibilities <span>*</span>
                    </label>
                    <textarea
                      id="responsibilities"
                      value={form.responsibilities}
                      onChange={(event) => handleSetField("responsibilities", event.target.value)}
                      required
                    />
                  </div>

                  <div className="recruiter-post-job__field">
                    <label htmlFor="deadline">
                      Deadline <span>*</span>
                    </label>
                    <input
                      id="deadline"
                      type="date"
                      value={form.deadline}
                      onChange={(event) => handleSetField("deadline", event.target.value)}
                      required
                    />
                  </div>
                </section>

                <div className="recruiter-post-job__modal-actions">
                  <button
                    type="button"
                    className="recruiter-dashboard__secondary-action"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="recruiter-dashboard__primary-action">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showToast && <div className="recruiter-job-detail__toast">Job saved successfully.</div>}
      </main>
    </div>
  );
}
