import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useUser } from "../../context/UserContext";
import { registerRecruiter } from "../../services/recruiter";
import { loginUser } from "../../services/auth";
import "../../styles/Auth.css";

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

const initialForm = {
  fullName: "",
  workEmail: "",
  password: "",
  confirmPassword: "",
  companyName: "",
  industry: "",
  website: "",
  country: "",
  city: "",
  workPhoneNumber: "",
  companyDescription: "",
  agreeToTerms: false,
};

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function RecruiterRegister() {
  const { refreshUser } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState("");
  const logoInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0] ?? null;

    if (file && !file.type.startsWith("image/")) {
      alert("Please upload an image file for the company logo.");
      e.target.value = "";
      return;
    }

    setCompanyLogo(file);

    if (file) {
      const preview = await readFileAsDataURL(file);
      setCompanyLogoPreview(preview);
      return;
    }

    setCompanyLogoPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!form.agreeToTerms) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    try {
      // Build FormData for backend
      const formData = new FormData();
      formData.append("full_name", form.fullName.trim());
      formData.append("work_email", form.workEmail.trim());
      formData.append("password", form.password);
      formData.append("company_name", form.companyName.trim());
      formData.append("industry", form.industry);
      formData.append("work_phone", form.workPhoneNumber.trim());
      formData.append("country", form.country.trim());
      formData.append("city", form.city.trim());
      
      // Optional fields
      if (form.website.trim()) {
        formData.append("website", form.website.trim());
      }
      if (form.companyDescription.trim()) {
        formData.append("company_description", form.companyDescription.trim());
      }
      if (companyLogo) {
        formData.append("company_logo", companyLogo);
      }

      // Call backend API to register
      const response = await registerRecruiter(formData);
      
      console.log("Recruiter registered successfully:", response);

      // Now log them in automatically to get the token
      const loginResponse = await loginUser(form.workEmail.trim(), form.password);
      
      // Refresh UserContext to load user from localStorage
      refreshUser();
      
      // Small delay to ensure UserContext is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to recruiter dashboard
      navigate("/recruiter/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.message || "Registration failed. Please try again.");
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
          <form className="auth-card auth-card--register" onSubmit={handleSubmit}>
            <span className="auth-card__badge">Recruiter Sign Up</span>

            <h1 className="auth-card__title">Create recruiter account</h1>
            <p className="auth-card__subtitle">
              Set up your company profile and start hiring the right talent.
            </p>

            <div className="auth-section">
              <h2 className="auth-section__title">Account details</h2>
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
                  <label htmlFor="workEmail">
                    Work Email <span className="auth-required">*</span>
                  </label>
                  <input
                    type="email"
                    id="workEmail"
                    name="workEmail"
                    value={form.workEmail}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

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
                    placeholder="Enter your password"
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

            <div className="auth-section">
              <h2 className="auth-section__title">Company details</h2>
              <div className="auth-row">
                <div className="auth-field">
                  <label htmlFor="companyName">
                    Company Name <span className="auth-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Company name"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="industry">
                    Industry <span className="auth-required">*</span>
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select industry</option>
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="auth-row">
                <div className="auth-field">
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://company.com"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="workPhoneNumber">
                    Work Phone Number <span className="auth-required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="workPhoneNumber"
                    name="workPhoneNumber"
                    value={form.workPhoneNumber}
                    onChange={handleChange}
                    placeholder="+977 9800000000"
                    required
                  />
                </div>
              </div>

              <div className="auth-row">
                <div className="auth-field">
                  <label htmlFor="country">
                    Country <span className="auth-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Country"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="city">
                    City <span className="auth-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="companyDescription">
                  Company Description <span className="auth-required">*</span>
                </label>
                <textarea
                  id="companyDescription"
                  name="companyDescription"
                  value={form.companyDescription}
                  onChange={handleChange}
                  placeholder="Describe your company, team, and culture"
                  required
                />
              </div>
            </div>

            <div className="auth-section">
              <h2 className="auth-section__title">Branding</h2>
              <div className="auth-upload">
                <input
                  ref={logoInputRef}
                  type="file"
                  id="companyLogo"
                  accept="image/*"
                  onChange={handleLogoChange}
                  hidden
                />
                <button
                  type="button"
                  className="auth-upload__btn"
                  onClick={() => logoInputRef.current?.click()}
                >
                  Upload Company Logo
                </button>
                <p className="auth-upload__hint">
                  Upload your company logo as an image file.
                </p>
                {companyLogo && (
                  <p className="auth-upload__file">{companyLogo.name}</p>
                )}
                {companyLogoPreview && (
                  <img
                    src={companyLogoPreview}
                    alt="Company logo preview"
                    style={{
                      width: "72px",
                      height: "72px",
                      objectFit: "cover",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.14)",
                    }}
                  />
                )}
              </div>
            </div>

            <div className="auth-section">
              <label className="auth-checkbox auth-checkbox--terms">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={form.agreeToTerms}
                  onChange={handleChange}
                  required
                />
                <span>
                  I agree to the <a href="#">Terms & Conditions</a>.
                </span>
              </label>
            </div>

            <button type="submit" className="auth-card__btn">
              Create Recruiter Account
            </button>

            <p className="auth-card__footer">
              Already have an account?{" "}
              <Link to="/recruiter/login">Sign in here</Link>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
