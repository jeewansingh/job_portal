import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getDisplayName } from "../utils/profile";
import "../styles/DashboardNavbar.css";

export default function DashboardNavbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = getDisplayName(user);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <nav
      className={`dashboard-navbar ${scrolled ? "dashboard-navbar--scrolled" : ""}`}
    >
      <div className="dashboard-navbar__container">
        <Link to="/dashboard" className="dashboard-navbar__logo">
          <span className="dashboard-navbar__logo-icon" />
          CareerHub
        </Link>

        <ul className="dashboard-navbar__links">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `dashboard-navbar__link ${isActive ? "dashboard-navbar__link--active" : ""}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/recommended-jobs"
              className={({ isActive }) =>
                `dashboard-navbar__link ${isActive ? "dashboard-navbar__link--active" : ""}`
              }
            >
              Recommended Jobs
            </NavLink>
          </li>
          {/* <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `dashboard-navbar__link ${isActive ? "dashboard-navbar__link--active" : ""}`
              }
            >
              Profile
            </NavLink>
          </li> */}
        </ul>

        <div className="dashboard-navbar__actions">
          <Link to="/profile" className="dashboard-navbar__user">
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={displayName}
                className="dashboard-navbar__avatar-img"
              />
            ) : (
              <span className="dashboard-navbar__avatar">{initial}</span>
            )}
            <span className="dashboard-navbar__username">{displayName}</span>
          </Link>
          <button
            type="button"
            className="dashboard-navbar__btn dashboard-navbar__btn--ghost"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
