import { useRef, useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import ProfileCompletionRing from "../../components/ProfileCompletionRing";
import SkillSelector from "../../components/SkillSelector";
import { useUser } from "../../context/UserContext";
import { formatDate, getDisplayName, calculateProfileCompletionFromBackend } from "../../utils/profile";
import { getUserProfile, updateUserProfile } from "../../services/profile";
import { fetchSkills } from "../../services/skills";
import { getFileUrl } from "../../services/api";
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [localProfileCompletion, setLocalProfileCompletion] = useState(0);
  const [form, setForm] = useState({
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
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const resumeInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const displayName = getDisplayName(user);
  const initial = displayName.charAt(0).toUpperCase();

  // Fetch available skills on mount
  useEffect(() => {
    async function loadSkills() {
      try {
        const skills = await fetchSkills();
        setAvailableSkills(skills);
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      }
    }
    
    loadSkills();
  }, []);

  // Fetch profile data on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);

        const profile = await getUserProfile(); // No user ID needed - uses token
        setProfileData(profile);

        // Calculate profile completion from backend data
        const completion = calculateProfileCompletionFromBackend(profile);
        setLocalProfileCompletion(completion);

        // Convert backend data to frontend format
        setForm({
          fullName: profile.full_name || "",
          gender: profile.gender || "",
          address: profile.address || "",
          dateOfBirth: profile.date_of_birth || "",
          education: profile.education || "",
          experienceYears: profile.experience_years ?? "",
          email: profile.email || "",
          phoneNumber: profile.phone || "",
          desiredPosition: profile.desired_position || "",
          preferredJobTypes: profile.preferred_job_type ? [profile.preferred_job_type] : [],
          portfolioLink: profile.portfolio_link || "",
        });

        // Set skills from backend
        if (profile.skills && profile.skills.length > 0) {
          setSelectedSkills(profile.skills.map(s => ({ id: s.id, name: s.name })));
        }

        // Don't set profilePictureUrl here - we'll use getFileUrl() in render

        // Don't update context here - Profile page will load full data when visited

      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      e.target.value = "";
      return;
    }
    setResumeFile(file);
  };

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      e.target.value = "";
      return;
    }
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onload = () => setProfilePictureUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    // Reset form to profile data
    if (profileData) {
      setForm({
        fullName: profileData.full_name || "",
        gender: profileData.gender || "",
        address: profileData.address || "",
        dateOfBirth: profileData.date_of_birth || "",
        education: profileData.education || "",
        experienceYears: profileData.experience_years ?? "",
        email: profileData.email || "",
        phoneNumber: profileData.phone || "",
        desiredPosition: profileData.desired_position || "",
        preferredJobTypes: profileData.preferred_job_type ? [profileData.preferred_job_type] : [],
        portfolioLink: profileData.portfolio_link || "",
      });
      if (profileData.skills) {
        setSelectedSkills(profileData.skills.map(s => ({ id: s.id, name: s.name })));
      }
    }
    setProfilePictureUrl("");
    setResumeFile(null);
    setProfilePictureFile(null);
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("full_name", form.fullName);
      formData.append("gender", form.gender);
      formData.append("date_of_birth", form.dateOfBirth);
      formData.append("phone", form.phoneNumber);
      formData.append("address", form.address);
      formData.append("education", form.education || "");
      formData.append("experience_years", form.experienceYears || "0");
      formData.append("desired_position", form.desiredPosition || "");
      formData.append("preferred_job_type", form.preferredJobTypes[0] || "");
      formData.append("portfolio_link", form.portfolioLink || "");

      // Add skill IDs
      selectedSkills.forEach(skill => {
        formData.append("skill_ids", skill.id);
      });

      // Add files if changed
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }
      if (profilePictureFile) {
        formData.append("profile_picture", profilePictureFile);
      }

      // Update profile (no user ID needed - uses token)
      const updatedProfile = await updateUserProfile(formData);
      setProfileData(updatedProfile);

      // Recalculate profile completion
      const completion = calculateProfileCompletionFromBackend(updatedProfile);
      setLocalProfileCompletion(completion);

      // Update context with full URLs
      updateProfile({
        fullName: updatedProfile.full_name,
        email: updatedProfile.email,
        profilePictureUrl: getFileUrl(updatedProfile.profile_picture_url),
        gender: updatedProfile.gender,
        address: updatedProfile.address,
        dateOfBirth: updatedProfile.date_of_birth,
        education: updatedProfile.education,
        experienceYears: updatedProfile.experience_years,
        phoneNumber: updatedProfile.phone,
        desiredPosition: updatedProfile.desired_position,
        preferredJobTypes: updatedProfile.preferred_job_type ? [updatedProfile.preferred_job_type] : [],
        portfolioLink: updatedProfile.portfolio_link,
        skills: updatedProfile.skills ? updatedProfile.skills.map(s => s.name) : [],
      });

      setProfilePictureUrl("");
      setResumeFile(null);
      setProfilePictureFile(null);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="profile-page">
          <div className="profile-page__container">
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Loading profile...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !profileData) {
    return (
      <DashboardLayout>
        <div className="profile-page">
          <div className="profile-page__container">
            <div className="auth-card__error" style={{ margin: '2rem auto', maxWidth: '600px' }}>
              {error}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="profile-page">
        <div className="profile-page__container">
          {error && (
            <div className="auth-card__error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          
          <header className="profile-header">
            <div className="profile-header__main">
              <div className="profile-header__avatar-wrap">
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt={displayName}
                    className="profile-header__avatar-img"
                  />
                ) : profileData?.profile_picture_url ? (
                  <img
                    src={getFileUrl(profileData.profile_picture_url)}
                    alt={displayName}
                    className="profile-header__avatar-img"
                  />
                ) : (
                  <span className="profile-header__avatar">{initial}</span>
                )}
              </div>
              <div>
                <span className="profile-header__label">My Profile</span>
                <h1 className="profile-header__title">{profileData?.full_name || displayName}</h1>
                <p className="profile-header__email">{profileData?.email}</p>
              </div>
            </div>

            <div className="profile-header__actions">
              <ProfileCompletionRing
                percentage={localProfileCompletion}
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
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
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
                  <ProfileField label="Full Name" value={profileData?.full_name} />
                  <ProfileField label="Gender" value={profileData?.gender} />
                  <ProfileField
                    label="Date of Birth"
                    value={formatDate(profileData?.date_of_birth)}
                  />
                  <ProfileField label="Phone Number" value={profileData?.phone} />
                  <ProfileField label="Address" value={profileData?.address} />
                </div>
              </section>

              <section className="profile-section">
                <h2 className="profile-section__title">Professional Details</h2>
                <div className="profile-grid">
                  <ProfileField label="Education" value={profileData?.education} />
                  <ProfileField
                    label="Experience"
                    value={
                      profileData?.experience_years !== "" &&
                      profileData?.experience_years != null
                        ? `${profileData.experience_years} years`
                        : ""
                    }
                  />
                  <ProfileField
                    label="Desired Position"
                    value={profileData?.desired_position}
                  />
                </div>
                <ProfileField label="Skills">
                  <div className="profile-skills">
                    {profileData?.skills?.length ? (
                      profileData.skills.map((skill) => (
                        <span key={skill.id} className="profile-skill">
                          {skill.name}
                        </span>
                      ))
                    ) : (
                      <span className="profile-field__value">—</span>
                    )}
                  </div>
                </ProfileField>
                <ProfileField label="Preferred Job Type">
                  <div className="profile-skills">
                    {profileData?.preferred_job_type ? (
                      <span className="profile-skill profile-skill--muted">
                        {profileData.preferred_job_type}
                      </span>
                    ) : (
                      <span className="profile-field__value">—</span>
                    )}
                  </div>
                </ProfileField>
              </section>

              <section className="profile-section">
                <h2 className="profile-section__title">Contact & Files</h2>
                <div className="profile-grid">
                  <ProfileField label="Email" value={profileData?.email} />
                  <ProfileField label="Portfolio Link">
                    {profileData?.portfolio_link ? (
                      <a
                        href={profileData.portfolio_link}
                        target="_blank"
                        rel="noreferrer"
                        className="profile-link"
                      >
                        {profileData.portfolio_link}
                      </a>
                    ) : (
                      <span className="profile-field__value">—</span>
                    )}
                  </ProfileField>
                  <ProfileField label="Resume PDF">
                    {profileData?.resume_url ? (
                      <a
                        href={getFileUrl(profileData.resume_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="profile-link"
                      >
                        View Resume
                      </a>
                    ) : (
                      <span className="profile-field__value">—</span>
                    )}
                  </ProfileField>
                  <ProfileField
                    label="Profile Picture"
                    value={profileData?.profile_picture_url ? "Uploaded" : "—"}
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
                  {resumeFile ? (
                    <span className="profile-upload__file">{resumeFile.name}</span>
                  ) : profileData?.resume_url ? (
                    <span className="profile-upload__file">Current: Uploaded</span>
                  ) : null}
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
                    <SkillSelector
                      availableSkills={availableSkills}
                      selectedSkills={selectedSkills}
                      onChange={setSelectedSkills}
                    />
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
                <div className="profile-form__field">
                  <label htmlFor="preferredJobType">Preferred Job Type</label>
                  <select
                    id="preferredJobType"
                    name="preferredJobType"
                    value={form.preferredJobTypes[0] || ""}
                    onChange={(e) => setForm(prev => ({ ...prev, preferredJobTypes: e.target.value ? [e.target.value] : [] }))}
                  >
                    <option value="">Select job type</option>
                    {JOB_TYPES.map((jobType) => (
                      <option key={jobType} value={jobType}>
                        {jobType}
                      </option>
                    ))}
                  </select>
                </div>
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
                    {profilePictureFile ? (
                      <span className="profile-upload__file">
                        {profilePictureFile.name}
                      </span>
                    ) : profileData?.profile_picture_url ? (
                      <span className="profile-upload__file">Current: Uploaded</span>
                    ) : null}
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
