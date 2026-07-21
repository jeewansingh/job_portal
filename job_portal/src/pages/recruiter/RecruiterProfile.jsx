import { useEffect, useMemo, useRef, useState } from "react";
import RecruiterSidebar from "../../components/recruiter/RecruiterSidebar";
import { useUser } from "../../context/UserContext";
import { getRecruiterProfile, updateRecruiterProfile } from "../../services/recruiter";
import { getFileUrl } from "../../services/api";
import "../../styles/RecruiterDashboard.css";
import "../../styles/RecruiterPostJob.css";
import "../../styles/RecruiterJobs.css";

const INDUSTRY_OPTIONS = [
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

function mapUserToForm(user) {
  return {
    fullName: user?.fullName || "",
    workEmail: user?.workEmail || user?.email || "",
    companyName: user?.companyName || "",
    industry: user?.industry || "",
    website: user?.website || "",
    country: user?.country || "",
    city: user?.city || "",
    workPhoneNumber: user?.workPhoneNumber || "",
    companyDescription: user?.companyDescription || "",
    companyLogoUrl: user?.companyLogoUrl || "",
    companyLogo: null,
  };
}

function ProfileField({ label, value, children }) {
  return (
    <div className="recruiter-profile__field">
      <span className="recruiter-profile__field-label">{label}</span>
      {children ?? <span className="recruiter-profile__field-value">{value || "—"}</span>}
    </div>
  );
}

export default function RecruiterProfile() {
  const { user, updateProfile: updateContextProfile } = useUser();
  const [recruiterData, setRecruiterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(() => mapUserToForm(user));
  const [preview, setPreview] = useState(user?.companyLogoUrl || "");
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(false);
  const [error, setError] = useState("");
  const [industryOpen, setIndustryOpen] = useState(false);
  const logoInputRef = useRef(null);
  const industryWrapRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Fetch recruiter profile from backend on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const profile = await getRecruiterProfile();
        
        // Convert snake_case to camelCase for frontend
        const formattedProfile = {
          id: profile.id,
          fullName: profile.full_name,
          workEmail: profile.work_email,
          companyName: profile.company_name,
          industry: profile.industry,
          website: profile.website,
          country: profile.country,
          city: profile.city,
          workPhoneNumber: profile.work_phone,
          companyDescription: profile.company_description,
          companyLogoUrl: getFileUrl(profile.company_logo_url),
          isActive: profile.is_active,
        };
        
        setRecruiterData(formattedProfile);
        setForm(mapUserToForm(formattedProfile));
        setPreview(formattedProfile.companyLogoUrl || "");
      } catch (err) {
        console.error("Failed to fetch recruiter profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (industryWrapRef.current && !industryWrapRef.current.contains(event.target)) {
        setIndustryOpen(false);
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

  const industrySuggestions = useMemo(() => INDUSTRY_OPTIONS, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const selectIndustry = (value) => {
    setForm((prev) => ({ ...prev, industry: value }));
    setIndustryOpen(false);
  };

  const handleLogoChange = async (event) => {
    const file = event.target.files?.[0] ?? null;

    if (file && !file.type.startsWith("image/")) {
      alert("Please upload an image file for the company logo.");
      event.target.value = "";
      return;
    }

    if (!file) {
      setForm((prev) => ({ ...prev, companyLogo: null, companyLogoUrl: recruiterData?.companyLogoUrl || "" }));
      setPreview(recruiterData?.companyLogoUrl || "");
      return;
    }

    const nextPreview = await readFileAsDataURL(file);
    setForm((prev) => ({ ...prev, companyLogo: file, companyLogoUrl: nextPreview }));
    setPreview(nextPreview);
  };

  const resetForm = () => {
    setForm(mapUserToForm(recruiterData));
    setPreview(recruiterData?.companyLogoUrl || "");
    setIndustryOpen(false);
    setIsEditing(false);
    setError("");
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  const startEditing = () => {
    setForm(mapUserToForm(recruiterData));
    setPreview(recruiterData?.companyLogoUrl || "");
    setIndustryOpen(false);
    setError("");
    setIsEditing(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      // Build FormData for backend
      const formData = new FormData();
      formData.append("full_name", form.fullName.trim());
      formData.append("work_phone", form.workPhoneNumber.trim());
      formData.append("country", form.country.trim());
      formData.append("city", form.city.trim());
      formData.append("company_name", form.companyName.trim());
      formData.append("industry", form.industry);
      
      if (form.website.trim()) {
        formData.append("website", form.website.trim());
      }
      if (form.companyDescription.trim()) {
        formData.append("company_description", form.companyDescription.trim());
      }
      if (form.companyLogo) {
        formData.append("company_logo", form.companyLogo);
      }

      // Call backend API to update profile
      const updatedProfile = await updateRecruiterProfile(formData);
      
      // Convert response to frontend format
      const formattedProfile = {
        id: updatedProfile.id,
        fullName: updatedProfile.full_name,
        workEmail: updatedProfile.work_email,
        companyName: updatedProfile.company_name,
        industry: updatedProfile.industry,
        website: updatedProfile.website,
        country: updatedProfile.country,
        city: updatedProfile.city,
        workPhoneNumber: updatedProfile.work_phone,
        companyDescription: updatedProfile.company_description,
        companyLogoUrl: getFileUrl(updatedProfile.company_logo_url),
        isActive: updatedProfile.is_active,
      };

      // Update local state
      setRecruiterData(formattedProfile);
      setPreview(formattedProfile.companyLogoUrl || "");
      
      // Update context (for navbar, etc.)
      updateContextProfile({
        fullName: formattedProfile.fullName,
        email: formattedProfile.workEmail,
        companyName: formattedProfile.companyName,
        companyLogoUrl: formattedProfile.companyLogoUrl,
        role: "recruiter",
        isLoggedIn: true,
      });

      setToast(true);
      setIsEditing(false);
      
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = window.setTimeout(() => setToast(false), 1400);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.message || "Failed to update profile");
    }
  };

  const displayName = recruiterData?.fullName || "Recruiter Profile";
  const initial = displayName.charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterSidebar activeItem="Profile" />
        <main className="recruiter-dashboard__main">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !recruiterData) {
    return (
      <div className="recruiter-dashboard">
        <RecruiterSidebar activeItem="Profile" />
        <main className="recruiter-dashboard__main">
          <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
            <p>Error: {error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="recruiter-dashboard">
      <RecruiterSidebar activeItem="Profile" />

      <main className="recruiter-dashboard__main">
        <section className="recruiter-dashboard__hero">
          <div>
            <span className="recruiter-dashboard__eyebrow">Recruiter Profile</span>
            <h1 className="recruiter-dashboard__title">Company & Account Details</h1>
            <p className="recruiter-dashboard__subtitle">
              Review and update your recruiter account, company identity, and contact information.
            </p>
          </div>
        </section>

        <section className="recruiter-panel recruiter-profile__panel">
          <header className="recruiter-profile__header">
            <div className="recruiter-profile__header-main">
              <div className="recruiter-profile__avatar-wrap">
                {preview ? (
                  <img src={preview} alt={displayName} className="recruiter-profile__avatar-img" />
                ) : (
                  <span className="recruiter-profile__avatar">{initial}</span>
                )}
              </div>
              <div>
                <span className="recruiter-profile__label">Company Profile</span>
                <h2 className="recruiter-profile__title">{recruiterData?.companyName || "Your Company Name"}</h2>
                <p className="recruiter-profile__email">
                  {recruiterData?.workEmail || "No email available"}
                </p>
              </div>
            </div>

            {!isEditing && (
              <div className="recruiter-profile__header-actions">
                <button type="button" className="recruiter-dashboard__primary-action" onClick={startEditing}>
                  Edit Profile
                </button>
              </div>
            )}
          </header>

          {!isEditing ? (
            <div className="recruiter-profile__view">
              <section className="recruiter-profile__section">
                <h3 className="recruiter-profile__section-title">Account Details</h3>
                <div className="recruiter-profile__grid">
                  <ProfileField label="Full Name" value={recruiterData?.fullName} />
                  <ProfileField label="Work Email" value={recruiterData?.workEmail} />
                </div>
              </section>

              <section className="recruiter-profile__section">
                <h3 className="recruiter-profile__section-title">Company Details</h3>
                <div className="recruiter-profile__grid">
                  <ProfileField label="Company Name" value={recruiterData?.companyName} />
                  <ProfileField label="Industry" value={recruiterData?.industry} />
                  <ProfileField label="Website">
                    {recruiterData?.website ? (
                      <a href={recruiterData.website} target="_blank" rel="noreferrer" className="recruiter-profile__link">
                        {recruiterData.website}
                      </a>
                    ) : (
                      <span className="recruiter-profile__field-value">—</span>
                    )}
                  </ProfileField>
                  <ProfileField label="Country" value={recruiterData?.country} />
                  <ProfileField label="City" value={recruiterData?.city} />
                  <ProfileField label="Work Phone Number" value={recruiterData?.workPhoneNumber} />
                </div>
              </section>

              <section className="recruiter-profile__section">
                <h3 className="recruiter-profile__section-title">Company Description</h3>
                <div className="recruiter-profile__description">
                  <p>{recruiterData?.companyDescription || "—"}</p>
                </div>
              </section>
            </div>
          ) : (
            <form id="recruiter-profile-form" className="recruiter-post-job__form recruiter-profile__form" onSubmit={handleSubmit}>
              {error && (
                <div style={{ 
                  padding: '1rem', 
                  marginBottom: '1rem', 
                  background: '#fee', 
                  color: '#c00', 
                  borderRadius: '8px' 
                }}>
                  {error}
                </div>
              )}
              
              <section className="recruiter-profile__section recruiter-profile__section--hero">
                <h3 className="recruiter-profile__section-title">Profile Photo</h3>
                <div className="recruiter-profile__summary">
                  <div className="recruiter-profile__logo-card">
                    <span className="recruiter-applicant-profile__field-label">Company Logo</span>
                    <div className="recruiter-profile__logo-preview">
                      {preview ? <img src={preview} alt="Company logo preview" /> : <span>CL</span>}
                    </div>
                    <p className="recruiter-profile__hint">
                      Upload a new image if you want to replace the current company logo.
                    </p>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="recruiter-profile__file-input"
                      id="companyLogo"
                    />
                    <label htmlFor="companyLogo" className="recruiter-dashboard__secondary-action recruiter-profile__upload-btn">
                      Upload New Image
                    </label>
                  </div>

                  <div className="recruiter-profile__summary-copy">
                    <span className="recruiter-applicant-profile__field-label">Profile Preview</span>
                    <h3>{form.companyName || recruiterData?.companyName || "Your Company Name"}</h3>
                    <p>{form.companyDescription || recruiterData?.companyDescription || "Company description appears here."}</p>
                    <div className="recruiter-job-detail__tag-list">
                      <span className="recruiter-pill">{form.industry || recruiterData?.industry || "Industry"}</span>
                      <span className="recruiter-pill">{form.country || recruiterData?.country || "Country"}</span>
                      <span className="recruiter-pill">{form.city || recruiterData?.city || "City"}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="recruiter-profile__section">
                <h3 className="recruiter-profile__section-title">Account Details</h3>
                <div className="recruiter-post-job__grid">
                  <div className="recruiter-post-job__field recruiter-post-job__field--full">
                    <label htmlFor="fullName">
                      Full Name <span>*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="recruiter-post-job__field recruiter-post-job__field--full">
                    <label htmlFor="workEmail">
                      Work Email <span>*</span>
                    </label>
                    <input
                      id="workEmail"
                      name="workEmail"
                      type="email"
                      value={form.workEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="recruiter-profile__section">
                <h3 className="recruiter-profile__section-title">Company Details</h3>
                <div className="recruiter-post-job__grid">
                  <div className="recruiter-post-job__field recruiter-post-job__field--full">
                    <label htmlFor="companyName">
                      Company Name <span>*</span>
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      value={form.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="recruiter-post-job__field">
                    <label htmlFor="industry">
                      Industry <span>*</span>
                    </label>
                    <div className="recruiter-post-job__combo" ref={industryWrapRef}>
                      <input
                        id="industry"
                        name="industry"
                        type="text"
                        value={form.industry}
                        readOnly
                        placeholder="Select industry"
                        onFocus={() => setIndustryOpen(true)}
                        onClick={() => setIndustryOpen(true)}
                        aria-readonly="true"
                        required
                      />
                      {industryOpen && (
                        <div className="recruiter-post-job__dropdown" role="listbox">
                          {industrySuggestions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className="recruiter-post-job__option"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                selectIndustry(option);
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
                    <label htmlFor="website">
                      Website <span>*</span>
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="https://company.com"
                      required
                    />
                  </div>

                  <div className="recruiter-post-job__field">
                    <label htmlFor="country">
                      Country <span>*</span>
                    </label>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      value={form.country}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="recruiter-post-job__field">
                    <label htmlFor="city">
                      City <span>*</span>
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="recruiter-post-job__field">
                    <label htmlFor="workPhoneNumber">
                      Work Phone Number <span>*</span>
                    </label>
                    <input
                      id="workPhoneNumber"
                      name="workPhoneNumber"
                      type="tel"
                      value={form.workPhoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="recruiter-post-job__field recruiter-post-job__field--full">
                    <label htmlFor="companyDescription">
                      Company Description <span>*</span>
                    </label>
                    <textarea
                      id="companyDescription"
                      name="companyDescription"
                      value={form.companyDescription}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </section>

              <div className="recruiter-profile__actions">
                <button
                  type="button"
                  className="recruiter-dashboard__secondary-action recruiter-profile__cancel-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button type="submit" className="recruiter-dashboard__primary-action">
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </section>

        {toast && <div className="recruiter-job-detail__toast">Profile saved successfully.</div>}
      </main>
    </div>
  );
}
