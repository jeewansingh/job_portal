import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useUser } from "../../context/UserContext";
import { loginUser } from "../../services/auth";
import { getFileUrl } from "../../services/api";
import "../../styles/Auth.css";

export default function Login() {
  const { isLoggedIn, user, refreshUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) return;
    const fallback = user?.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard";
    navigate(fallback, { replace: true });
  }, [isLoggedIn, navigate, user?.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
      };

      // Call backend login API
      await loginUser(payload.email, payload.password);

      // Refresh UserContext to load user from localStorage
      refreshUser();
      
      // Small delay to ensure UserContext is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to dashboard (always go to dashboard after login)
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Navbar />

      <div className="auth-page auth-page--with-nav auth-page--center">
        <div className="auth-page__glow auth-page__glow--1" />
        <div className="auth-page__glow auth-page__glow--2" />
        <div className="auth-page__grid" />

        <div className="auth-page__container">
          <form className="auth-card" onSubmit={handleSubmit}>
            <span className="auth-card__badge">Sign In</span>

            <h1 className="auth-card__title">Welcome back</h1>
            <p className="auth-card__subtitle">
              Sign in to continue your job search
            </p>

            {error && (
              <div className="auth-card__error">
                {error}
              </div>
            )}

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
                placeholder="Enter your email"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

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
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-card__btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <p className="auth-card__footer">
              Don&apos;t have an account?{" "}
              <Link to="/register">Register here</Link>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
