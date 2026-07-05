import { useRef, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import ProfileCompletionRing from "../../components/ProfileCompletionRing";
import SkillCapsules from "../../components/SkillCapsules";
import { useUser } from "../../context/UserContext";
import { formatDate, getDisplayName } from "../../utils/profile";
import "../../styles/Profile.css";

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Remote",
  "Hybrid",
  "Contract",
  "Internship",
];

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

function fileMeta(file) {
  if (!file) return null;
  return { name: file.name, size: file.size, type: file.type };
}

function ProfileField({ label, value, children }) {
  return (
    <div className="profile-field">
      <span className="profile-field__label">{label}</span>
      {children ?? (
        <span className="profile-field__value">{value || "—"}</span>
      )}
    </div>
  );
}

export default function Profile() {
  const { user, updateProfile, profileCompletion } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    gender: user?.gender || "",
    address: user?.address || "",
    dateOfBirth: user?.dateOfBirth || "",
    education: user?.education || "",
    experienceYears: user?.experienceYears ?? "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    desiredPosition: user?.desiredPosition || "",
    preferredJobTypes: user?.preferredJobTypes || [],
    portfolioLink: user?.portfolioLink || "",
  });
  const [skills, setSkills] = useState(user?.skills || []);
  const [resumePdf, setResumePdf] = useState(user?.resumePdf || null);
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || null
  );
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    user?.profilePictureUrl || ""
  );
  const resumeInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const displayName = getDisplayName(user);
  const initial = displayName.charAt(0).toUpperCase();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
    setResumePdf(fileMeta(file));
  };

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      e.target.value = "";
      return;
    }
    if (file) {
      setProfilePicture(fileMeta(file));
      const reader = new FileReader();
      reader.onload = () => setProfilePictureUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const startEditing = () => {
    setForm({
      fullName: user?.fullName || "",
      gender: user?.gender || "",
      address: user?.address || "",
      dateOfBirth: user?.dateOfBirth || "",
      education: user?.education || "",
      experienceYears: user?.experienceYears ?? "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      desiredPosition: user?.desiredPosition || "",
      preferredJobTypes: user?.preferredJobTypes || [],
      portfolioLink: user?.portfolioLink || "",
    });
    setSkills(user?.skills || []);
    setResumePdf(user?.resumePdf || null);
    setProfilePicture(user?.profilePicture || null);
    setProfilePictureUrl(user?.profilePictureUrl || "");
    setIsEditing(true);
  };

  const cancelEditing = () => setIsEditing(false);

  const handleSave = (e) => {
    e.preventDefault();

    const updates = {
      ...form,
      experienceYears:
        form.experienceYears === "" ? "" : Number(form.experienceYears),
      skills,
      resumePdf,
      profilePicture,
      profilePictureUrl,
    };

    updateProfile(updates);
    console.log("Profile updated (ready to send):", updates);
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="profile-page">
        <div className="profile-page__container">
          <header className="profile-header">
            <div className="profile-header__main">
              <div className="profile-header__avatar-wrap">
                {profilePictureUrl || user?.profilePictureUrl ? (
                  <img
                    src={profilePictureUrl || user.profilePictureUrl}
                    alt={displayName}
                    className="profile-header__avatar-img"
                  />
                ) : (
                  <span className="profile-header__avatar">{initial}</span>
                )}
              </div>
              <div>
                <span className="profile-header__label">My Profile</span>
                <h1 className="profile-header__title">{user?.fullName || displayName}</h1>
                <p className="profile-header__email">{user?.email}</p>
              </div>
            </div>

            <div className="profile-header__actions">
              <ProfileCompletionRing
                percentage={profileCompletion}
                size={96}
                showLink={false}
              />
              {!isEditing ? (
                <button
                  type="button"
                  className="profile-btn profile-btn--primary"
                  onClick={startEditing}
                >
                  Edit Profile
                </button>
              ) : (
                <div className="profile-header__edit-actions">
                  <button
                    type="button"
                    className="profile-btn profile-btn--ghost"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="profile-form"
                    className="profile-btn profile-btn--primary"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </header>

          {!isEditing ? (
            <div className="profile-view">
              <section className="profile-section">
                <h2 className="profile-section__title">Personal Information</h2>
                <div className="profile-grid">
                  <ProfileField label="Full Name" value={user?.fullName} />
                  <ProfileField label="Gender" value={user?.gender} />
                  <ProfileField
                    label="Date of Birth"
                    value={formatDate(user?.dateOfBirth)}
                  />
                  <ProfileField label="Phone Number" value={user?.phoneNumber} />
                  <ProfileField label="Address" value={user?.address} />
                </div>
              </section>

              <section className="profile-section">
                <h2 className="profile-section__title">Professional Details</h2>
                <div className="profile-grid">
                  <ProfileField label="Education" value={user?.education} />
                  <ProfileField
                    label="Experience"
                    value={
                      user?.experienceYears !== "" &&
                      user?.experienceYears != null
                        ? `${user.experienceYears} years`
                        : ""
                    }
                  />
                  <ProfileField
                    label="Desired Position"
                    value={user?.desiredPosition}
                  />
                </div>
                <ProfileField label="Skills">
                  <div className="profile-skills">
                    {user?.skills?.length ? (
                      user.skills.map((skill) => (
                        <span key={skill} className="profile-skill">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="profile-field__value">—</span>
                    )}
                  </div>
                </ProfileField>
                <ProfileField label="Preferred Job Types">
                  <div className="profile-skills">
                    {user?.preferredJobTypes?.length ? (
                      user.preferredJobTypes.map((type) => (
                        <span key={type} className="profile-skill profile-skill--muted">
                          {type}
                        </span>
                      ))
                    ) : (
                      <span className="profile-field__value">—</span>
                    )}
                  </div>
                </ProfileField>
              </section>

              <section className="profile-section">
                <h2 className="profile-section__title">Contact & Files</h2>
                <div className="profile-grid">
                  <ProfileField label="Email" value={user?.email} />
                  <ProfileField label="Portfolio Link">
                    {user?.portfolioLink ? (
                      <a
                        href={user.portfolioLink}
                        target="_blank"
                        rel="noreferrer"
                        className="profile-link"
                      >
                        {user.portfolioLink}
                      </a>
                    ) : (
                      <span className="profile-field__value">—</span>
                    )}
                  </ProfileField>
                  <ProfileField
                    label="Resume PDF"
                    value={user?.resumePdf?.name}
                  />
                  <ProfileField
                    label="Profile Picture"
                    value={user?.profilePicture?.name || (user?.profilePictureUrl ? "Uploaded" : "")}
                  />
                </div>
              </section>
            </div>
          ) : (
            <form id="profile-form" className="profile-form" onSubmit={handleSave}>
              <section className="profile-section">
                <h2 className="profile-section__title">Resume</h2>
                <div className="profile-upload">
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleResumeChange}
                    hidden
                  />
                  <button
                    type="button"
                    className="profile-btn profile-btn--ghost"
                    onClick={() => resumeInputRef.current?.click()}
                  >
                    Upload PDF Resume
                  </button>
                  {resumePdf?.name && (
                    <span className="profile-upload__file">{resumePdf.name}</span>
                  )}
                </div>
              </section>

              <section className="profile-section">
                <h2 className="profile-section__title">Personal Information</h2>
                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      id="fullName"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="profile-form__field">
                    <label htmlFor="gender">Gender *</label>
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
                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label htmlFor="dateOfBirth">Date of Birth *</label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="profile-form__field">
                    <label htmlFor="phoneNumber">Phone Number *</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="profile-form__field">
                  <label htmlFor="address">Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
              </section>

              <section className="profile-section">
                <h2 className="profile-section__title">Professional Details</h2>
                <div className="profile-form__field">
                  <label>Skills</label>
                  <div className="profile-form__skills">
                    <SkillCapsules skills={skills} onChange={setSkills} />
                  </div>
                </div>
                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label htmlFor="education">Education</label>
                    <input
                      id="education"
                      name="education"
                      value={form.education}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-form__field">
                    <label htmlFor="experienceYears">Experience (years)</label>
                    <input
                      type="number"
                      id="experienceYears"
                      name="experienceYears"
                      value={form.experienceYears}
                      onChange={handleChange}
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
                <div className="profile-form__field">
                  <label htmlFor="desiredPosition">Desired Position</label>
                  <input
                    id="desiredPosition"
                    name="desiredPosition"
                    value={form.desiredPosition}
                    onChange={handleChange}
                  />
                </div>
                <fieldset className="profile-form__fieldset">
                  <legend>Preferred Job Types</legend>
                  <div className="profile-form__checkboxes">
                    {JOB_TYPES.map((jobType) => (
                      <label key={jobType} className="profile-form__checkbox">
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
              </section>

              <section className="profile-section">
                <h2 className="profile-section__title">Contact & Profile</h2>
                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="profile-form__field">
                    <label htmlFor="portfolioLink">Portfolio Link</label>
                    <input
                      type="url"
                      id="portfolioLink"
                      name="portfolioLink"
                      value={form.portfolioLink}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="profile-form__field">
                  <label>Profile Picture</label>
                  <div className="profile-upload">
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileChange}
                      hidden
                    />
                    <button
                      type="button"
                      className="profile-btn profile-btn--ghost"
                      onClick={() => profileInputRef.current?.click()}
                    >
                      Choose Image
                    </button>
                    {profilePicture?.name && (
                      <span className="profile-upload__file">
                        {profilePicture.name}
                      </span>
                    )}
                  </div>
                </div>
              </section>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
