import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SkillSelector from "../../components/SkillSelector";
import { useUser } from "../../context/UserContext";
import { fetchSkills } from "../../services/skills";
import { registerUser, uploadResume, loginUser } from "../../services/auth";
import "../../styles/Auth.css";

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Remote",
  "Hybrid",
  "Contract",
  "Internship",
];

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

const initialForm = {
  fullName: "",
  gender: "",
  address: "",
  dateOfBirth: "",
  education: "",
  experienceYears: "",
  email: "",
  phoneNumber: "",
  desiredPosition: "",
  preferredJobTypes: [],
  portfolioLink: "",
  password: "",
  confirmPassword: "",
  agreedToTerms: false,
};

function fileMeta(file) {
  if (!file) return null;
  return {
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Register() {
  const { register } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumePdf, setResumePdf] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [parsingResume, setParsingResume] = useState(false);
  const resumeInputRef = useRef(null);
  const profileInputRef = useRef(null);

  // Fetch available skills on component mount
  useEffect(() => {
    const loadSkills = async () => {
      try {
        // console.log("Fetching skills from backend...");
        const skills = await fetchSkills();
        // console.log("Skills fetched successfully:", skills);
        setAvailableSkills(skills);
      } catch (err) {
        console.error("Failed to fetch skills:", err);
        setError("Failed to load skills. You can still register without selecting skills.");
      }
    };

    loadSkills();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleJobTypeChange = (jobType) => {
    setForm((prev) => {
      const selected = prev.preferredJobTypes.includes(jobType)
        ? prev.preferredJobTypes.filter((type) => type !== jobType)
        : [...prev.preferredJobTypes, jobType];
      return { ...prev, preferredJobTypes: selected };
    });
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      e.target.value = "";
      return;
    }
    
    setResumePdf(file);
    
    // Auto-parse resume and fill form
    try {
      setParsingResume(true);
      setError("");
      
      const extractedData = await uploadResume(file);
      
      // Auto-fill form fields with extracted data
      setForm((prev) => ({
        ...prev,
        fullName: extractedData.name || prev.fullName,
        email: extractedData.email || prev.email,
        phoneNumber: extractedData.phone || prev.phoneNumber,
        education: extractedData.education || prev.education,
        portfolioLink: extractedData.portfolio && extractedData.portfolio.length > 0 
          ? extractedData.portfolio[0] 
          : prev.portfolioLink,
      }));
      
      // Auto-fill skills (matched skills with IDs)
      if (extractedData.skills && extractedData.skills.length > 0) {
        setSelectedSkills(extractedData.skills);
      }
      
      // Show success message
      alert(`Resume parsed successfully! Found ${extractedData.skills.length} skills. You can edit the information before submitting.`);
      
    } catch (err) {
      console.error("Resume parsing error:", err);
      setError(`Resume parsing failed: ${err.message}. You can still fill the form manually.`);
    } finally {
      setParsingResume(false);
    }
  };

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      e.target.value = "";
      return;
    }
    setProfilePicture(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.agreedToTerms) {
      setError("Please agree to the terms and conditions.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Build FormData for multipart/form-data request
      const formData = new FormData();
      
      // Map frontend field names to backend field names
      formData.append("full_name", form.fullName.trim());
      formData.append("gender", form.gender);
      formData.append("date_of_birth", form.dateOfBirth);
      formData.append("phone", form.phoneNumber.trim());
      formData.append("email", form.email.trim());
      formData.append("password", form.password);
      formData.append("address", form.address.trim());
      formData.append("education", form.education.trim() || "");
      formData.append("experience_years", form.experienceYears || "0");
      formData.append("desired_position", form.desiredPosition.trim() || "");
      
      // Convert preferredJobTypes array to single string (or send first one)
      const preferredJobType = form.preferredJobTypes.length > 0 
        ? form.preferredJobTypes[0] 
        : "";
      formData.append("preferred_job_type", preferredJobType);
      
      formData.append("portfolio_link", form.portfolioLink.trim() || "");
      
      // Add skill IDs (only if skills are selected)
      if (selectedSkills.length > 0) {
        selectedSkills.forEach(skill => {
          formData.append("skill_ids", skill.id);
        });
      }
      
      // Add files if present
      if (resumePdf) {
        formData.append("resume", resumePdf);
      }
      if (profilePicture) {
        formData.append("profile_picture", profilePicture);
      }

      // Step 1: Register user
      const userData = await registerUser(formData);
      
      // Step 2: Automatically log them in to get token
      try {
        const loginData = await loginUser(form.email.trim(), form.password);
        
        // Step 3: Store user data in context (loginUser already stored token)
        // Map the backend response to match what UserContext expects
        register({
          id: loginData.user.id,
          fullName: loginData.user.full_name,
          email: loginData.user.email,
          profilePictureUrl: loginData.user.profile_picture_url,
          preferredJobType: loginData.user.preferred_job_type,
          role: loginData.user.role || "candidate",
        }, "candidate");
        
        // Step 4: Navigate to dashboard
        navigate("/dashboard");
      } catch (loginErr) {
        console.error("Auto-login failed:", loginErr);
        // Registration succeeded but auto-login failed
        // Redirect to login page with message
        alert("Account created successfully! Please log in.");
        navigate("/login");
      }
      
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Navbar />

      <div className="auth-page auth-page--with-nav auth-page--scroll">
        <div className="auth-page__glow auth-page__glow--1" />
        <div className="auth-page__glow auth-page__glow--2" />
        <div className="auth-page__grid" />

        <div className="auth-page__container auth-page__container--wide">
          <form
            className="auth-card auth-card--register"
            onSubmit={handleSubmit}
          >
          <span className="auth-card__badge">Create Account</span>

          <h1 className="auth-card__title">Join CareerHub</h1>
          <p className="auth-card__subtitle">
            Create your profile and start applying to top jobs
          </p>

          {error && (
            <div className="auth-card__error">
              {error}
            </div>
          )}

          <div className="auth-section">
            <h2 className="auth-section__title">Quick fill from resume</h2>
            <div className="auth-upload">
              <input
                ref={resumeInputRef}
                type="file"
                id="resumePdf"
                accept="application/pdf,.pdf"
                onChange={handleResumeChange}
                hidden
              />
              <button
                type="button"
                className="auth-upload__btn"
                onClick={() => resumeInputRef.current?.click()}
              >
                Upload PDF Resume
              </button>
              <p className="auth-upload__hint">
                Upload your resume PDF — form autofill from PDF coming soon.
              </p>
              {resumePdf && (
                <p className="auth-upload__file">{resumePdf.name}</p>
              )}
            </div>
          </div>

          <div className="auth-section">
            <h2 className="auth-section__title">Personal information</h2>
            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="fullName">
                  Full Name <span className="auth-required">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="gender">
                  Gender <span className="auth-required">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="dateOfBirth">
                  Date of Birth <span className="auth-required">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="phoneNumber">
                  Phone Number <span className="auth-required">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="+977 9800000000"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="address">
                Address <span className="auth-required">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street, City, State, Country"
                rows={3}
                required
              />
            </div>
          </div>

          <div className="auth-section">
            <h2 className="auth-section__title">Professional details</h2>

            <div className="auth-field">
              <label htmlFor="skills">Skills</label>
              <SkillSelector
                availableSkills={availableSkills}
                selectedSkills={selectedSkills}
                onChange={setSelectedSkills}
                required={false}
              />
              <p className="auth-field__hint">
                Search and select skills from the dropdown. Optional but recommended.
              </p>
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="education">Education</label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  value={form.education}
                  onChange={handleChange}
                  placeholder="B.Tech in Computer Science"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="experienceYears">Experience (years)</label>
                <input
                  type="number"
                  id="experienceYears"
                  name="experienceYears"
                  value={form.experienceYears}
                  onChange={handleChange}
                  placeholder="2"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="desiredPosition">Desired Position</label>
              <input
                type="text"
                id="desiredPosition"
                name="desiredPosition"
                value={form.desiredPosition}
                onChange={handleChange}
                placeholder="Frontend Developer"
              />
            </div>

            <fieldset className="auth-fieldset">
              <legend>Preferred Job Types</legend>
              <div className="auth-checkboxes">
                {JOB_TYPES.map((jobType) => (
                  <label key={jobType} className="auth-checkbox">
                    <input
                      type="checkbox"
                      checked={form.preferredJobTypes.includes(jobType)}
                      onChange={() => handleJobTypeChange(jobType)}
                    />
                    <span>{jobType}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="auth-section">
            <h2 className="auth-section__title">Contact & profile</h2>

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="email">
                  Email <span className="auth-required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="portfolioLink">Portfolio Link</label>
                <input
                  type="url"
                  id="portfolioLink"
                  name="portfolioLink"
                  value={form.portfolioLink}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="profilePicture">Profile Picture</label>
              <div className="auth-upload auth-upload--inline">
                <input
                  ref={profileInputRef}
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleProfileChange}
                  hidden
                />
                <button
                  type="button"
                  className="auth-upload__btn auth-upload__btn--secondary"
                  onClick={() => profileInputRef.current?.click()}
                >
                  Choose Image
                </button>
                {profilePicture && (
                  <p className="auth-upload__file">{profilePicture.name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="auth-section">
            <h2 className="auth-section__title">Account security</h2>

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="password">
                  Password <span className="auth-required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="confirmPassword">
                  Confirm Password <span className="auth-required">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          </div>

          <label className="auth-checkbox auth-checkbox--terms">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={form.agreedToTerms}
              onChange={handleChange}
              required
            />
            <span>
              I agree to the{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>
                Privacy Policy
              </a>
            </span>
          </label>

          <button type="submit" className="auth-card__btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="auth-card__footer">
            Already have an account?{" "}
            <Link to="/login">Sign in here</Link>
          </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
