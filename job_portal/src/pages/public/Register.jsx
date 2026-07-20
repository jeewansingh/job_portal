import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SkillCapsules from "../../components/SkillCapsules";
import { useUser } from "../../context/UserContext";
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
  const [skills, setSkills] = useState([]);
  const [resumePdf, setResumePdf] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const resumeInputRef = useRef(null);
  const profileInputRef = useRef(null);

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

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      e.target.value = "";
      return;
    }
    setResumePdf(file);
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

  const buildPayload = () => ({
    fullName: form.fullName.trim(),
    gender: form.gender,
    address: form.address.trim(),
    dateOfBirth: form.dateOfBirth,
    skills,
    education: form.education.trim(),
    experienceYears: form.experienceYears
      ? Number(form.experienceYears)
      : null,
    email: form.email.trim(),
    phoneNumber: form.phoneNumber.trim(),
    desiredPosition: form.desiredPosition.trim(),
    preferredJobTypes: form.preferredJobTypes,
    portfolioLink: form.portfolioLink.trim(),
    password: form.password,
    agreedToTerms: form.agreedToTerms,
    resumePdf: fileMeta(resumePdf),
    profilePicture: fileMeta(profilePicture),
  });

  const buildFormData = (payload) => {
    const formData = new FormData();

    formData.append("fullName", payload.fullName);
    formData.append("gender", payload.gender);
    formData.append("address", payload.address);
    formData.append("dateOfBirth", payload.dateOfBirth);
    formData.append("skills", JSON.stringify(payload.skills));
    formData.append("education", payload.education);
    if (payload.experienceYears !== null) {
      formData.append("experienceYears", String(payload.experienceYears));
    }
    formData.append("email", payload.email);
    formData.append("phoneNumber", payload.phoneNumber);
    formData.append("desiredPosition", payload.desiredPosition);
    formData.append(
      "preferredJobTypes",
      JSON.stringify(payload.preferredJobTypes)
    );
    formData.append("portfolioLink", payload.portfolioLink);
    formData.append("password", payload.password);
    formData.append("agreedToTerms", String(payload.agreedToTerms));

    if (resumePdf) formData.append("resumePdf", resumePdf);
    if (profilePicture) formData.append("profilePicture", profilePicture);

    return formData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!form.agreedToTerms) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    const payload = buildPayload();
    let profilePictureUrl = "";

    if (profilePicture) {
      profilePictureUrl = await readFileAsDataURL(profilePicture);
    }

    const profileData = {
      ...payload,
      profilePictureUrl,
    };

    console.log("Register payload (ready to send):", profileData);
    console.log("Register JSON:", JSON.stringify(profileData, null, 2));

    const formData = buildFormData(payload);
    console.log("Register FormData entries (for multipart upload):");
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    register(profileData, "candidate");
    navigate("/dashboard");
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
              <SkillCapsules skills={skills} onChange={setSkills} />
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

          <button type="submit" className="auth-card__btn">
            Create Account
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
