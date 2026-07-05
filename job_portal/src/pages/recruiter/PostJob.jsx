import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import RecruiterSidebar from "../../components/recruiter/RecruiterSidebar";
import "../../styles/RecruiterPostJob.css";

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

export default function PostJob() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [showToast, setShowToast] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [employmentTypeOpen, setEmploymentTypeOpen] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [skillOpen, setSkillOpen] = useState(false);
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

  const categorySuggestions = useMemo(() => CATEGORY_OPTIONS, []);

  const skillSuggestions = useMemo(() => {
    const query = skillInput.trim().toLowerCase();
    return SKILL_OPTIONS.filter(
      (item) =>
        item.toLowerCase().includes(query) &&
        !form.skills.some((skill) => skill.toLowerCase() === item.toLowerCase())
    );
  }, [form.skills, skillInput]);

  const setField = (name, value) => {
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
    setField("category", value);
    setCategoryOpen(false);
  };

  const selectEmploymentType = (value) => {
    setField("employmentType", value);
    setEmploymentTypeOpen(false);
  };

  const handleSkillChange = (event) => {
    setSkillInput(event.target.value);
    setSkillOpen(true);
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
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

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      recruiterName: user?.fullName || "",
      companyName: user?.companyName || "",
      jobTitle: form.jobTitle.trim(),
      category: form.category.trim(),
      employmentType: form.employmentType,
      experience: form.experience.trim(),
      salary: form.salary.trim(),
      skills: form.skills,
      openings: form.openings ? Number(form.openings) : null,
      jobDescription: form.jobDescription.trim(),
      responsibilities: form.responsibilities.trim(),
      deadline: form.deadline,
      location: form.location.trim(),
    };

    console.log("Post job payload (ready to send):", payload);
    console.log("Post job JSON:", JSON.stringify(payload, null, 2));

    setShowToast(true);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setShowToast(false);
      navigate("/recruiter/dashboard");
    }, 1200);
  };

  return (
    <div className="recruiter-post-job">
      <RecruiterSidebar activeItem="Post Job" />

      <main className="recruiter-post-job__main">
        <section className="recruiter-post-job__hero">
          <div>
            <span className="recruiter-post-job__eyebrow">Recruiter Dashboard</span>
            <h1 className="recruiter-post-job__title">Post a new job</h1>
            <p className="recruiter-post-job__subtitle">
              Create a detailed job listing and publish it to the hiring pipeline.
            </p>
          </div>
        </section>

        <div className="recruiter-post-job__content">
          <form className="recruiter-post-job__form" onSubmit={handleSubmit}>
            <section className="recruiter-post-job__section">
              <h2>Job basics</h2>
              <div className="recruiter-post-job__grid">
                <div className="recruiter-post-job__field recruiter-post-job__field--full">
                  <label htmlFor="jobTitle">
                    Job title <span>*</span>
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    value={form.jobTitle}
                    onChange={(event) => setField("jobTitle", event.target.value)}
                    placeholder="Senior React Developer"
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
                    {categoryOpen && categorySuggestions.length > 0 && (
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
                    {employmentTypeOpen && EMPLOYMENT_TYPE_OPTIONS.length > 0 && (
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
                    Experience (in years) <span>*</span>
                  </label>
                  <input
                    id="experience"
                    type="number"
                    value={form.experience}
                    onChange={(event) => setField("experience", event.target.value)}
                    placeholder="3"
                    required
                  />
                </div>

                <div className="recruiter-post-job__field">
                  <label htmlFor="salary">
                    Salary per Month<span>*</span>
                  </label>
                  <input
                    id="salary"
                    type="text"
                    value={form.salary}
                    onChange={(event) => setField("salary", event.target.value)}
                    placeholder="Rs. 120,000 - 180,000"
                    required
                  />
                </div>

                <div className="recruiter-post-job__field">
                  <label htmlFor="openings">
                    Openings <span>*</span>
                  </label>
                  <input
                    id="openings"
                    type="number"
                    min="1"
                    value={form.openings}
                    onChange={(event) => setField("openings", event.target.value)}
                    placeholder="2"
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
                    onChange={(event) => setField("location", event.target.value)}
                    placeholder="Kathmandu, Nepal"
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
                    onChange={handleSkillChange}
                    onKeyDown={handleSkillKeyDown}
                    onFocus={() => setSkillOpen(true)}
                    placeholder="Search skills"
                    autoComplete="off"
                    required={form.skills.length === 0}
                  />
                </div>
                <p className="recruiter-post-job__hint">
                  Search and pick from the dropdown. You can add multiple skills, but only from the predefined list.
                </p>
                {skillOpen && skillSuggestions.length > 0 && (
                  <div className="recruiter-post-job__dropdown recruiter-post-job__dropdown--skills" role="listbox">
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
                  onChange={(event) => setField("jobDescription", event.target.value)}
                  placeholder="Describe the role, team, and what success looks like"
                  required
                />
              </div>

              <div className="recruiter-post-job__field">
                <label htmlFor="responsibilities">
                  Job Specification <span>*</span>
                </label>
                <textarea
                  id="responsibilities"
                  value={form.responsibilities}
                  onChange={(event) => setField("responsibilities", event.target.value)}
                  placeholder="List the main responsibilities"
                  required
                />
              </div>

            </section>

            <section className="recruiter-post-job__section">
              <h2>Publishing</h2>
              <div className="recruiter-post-job__grid">
                <div className="recruiter-post-job__field recruiter-post-job__field--full">
                  <label htmlFor="deadline">
                    Deadline <span>*</span>
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(event) => setField("deadline", event.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            <div className="recruiter-post-job__actions">
              <button type="submit" className="recruiter-post-job__publish-btn">
                Publish Job
              </button>
            </div>
          </form>

          {showToast && <div className="recruiter-post-job__toast">Job published successfully!</div>}
        </div>
      </main>
    </div>
  );
}
