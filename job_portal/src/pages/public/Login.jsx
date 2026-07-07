import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useUser } from "../../context/UserContext";
import "../../styles/Auth.css";

export default function Login() {
  const { login, isLoggedIn, user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!isLoggedIn) return;
    const fallback = user?.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard";
    navigate(fallback, { replace: true });
  }, [isLoggedIn, navigate, user?.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      email: form.email.trim(),
      password: form.password,
    };

    console.log("Login payload (ready to send):", payload);
    console.log("Login JSON:", JSON.stringify(payload));

    login(payload.email, "candidate");

    const params = new URLSearchParams(location.search);
    const redirectTo = params.get("redirect");
    const safeRedirect =
      redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("/recruiter/")
        ? redirectTo
        : "/dashboard";

    navigate(safeRedirect);
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
              />
            </div>

            <button type="submit" className="auth-card__btn">
              Sign In
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
