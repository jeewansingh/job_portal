import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/Navbar.css";

export default function Navbar() {
  const { isLoggedIn } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [seekerDropdownOpen, setSeekerDropdownOpen] = useState(false);
  const [recruiterDropdownOpen, setRecruiterDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.landing-navbar__dropdown')) {
        setSeekerDropdownOpen(false);
        setRecruiterDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Don't render public navbar if user is logged in (pages should show DashboardNavbar instead)
  if (isLoggedIn) {
    return null;
  }

  const toggleSeekerDropdown = (e) => {
    e.stopPropagation();
    setSeekerDropdownOpen(!seekerDropdownOpen);
    setRecruiterDropdownOpen(false);
  };

  const toggleRecruiterDropdown = (e) => {
    e.stopPropagation();
    setRecruiterDropdownOpen(!recruiterDropdownOpen);
    setSeekerDropdownOpen(false);
  };

  return (
    <nav className={`landing-navbar ${scrolled ? "landing-navbar--scrolled" : ""}`}>
      <div className="landing-navbar__container">
        <Link to="/" className="landing-navbar__logo">
          <span className="landing-navbar__logo-icon">
            {/* <Briefcase size={20} strokeWidth={2.5} /> */}
          </span>
          CareerHub
        </Link>

        <ul className="landing-navbar__links">
          <li><Link to="/browse-jobs" className="landing-navbar__link">Browse Jobs</Link></li>
          <li><Link to="/industries" className="landing-navbar__link">Categories</Link></li>
        </ul>

        <div className="landing-navbar__actions">
          {/* For Job Seeker Dropdown */}
          <div className="landing-navbar__dropdown">
            <button 
              className="landing-navbar__link landing-navbar__dropdown-trigger"
              onClick={toggleSeekerDropdown}
            >
              For Job Seeker
              <svg 
                className={`landing-navbar__dropdown-icon ${seekerDropdownOpen ? 'landing-navbar__dropdown-icon--open' : ''}`} 
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="none"
              >
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {seekerDropdownOpen && (
              <ul className="landing-navbar__dropdown-menu">
                <li><Link to="/login" className="landing-navbar__dropdown-item">Login</Link></li>
                <li><Link to="/register" className="landing-navbar__dropdown-item">Register</Link></li>
              </ul>
            )}
          </div>

          {/* For Recruiter Dropdown */}
          <div className="landing-navbar__dropdown">
            <button 
              className="landing-navbar__link landing-navbar__dropdown-trigger"
              onClick={toggleRecruiterDropdown}
            >
              For Recruiter
              <svg 
                className={`landing-navbar__dropdown-icon ${recruiterDropdownOpen ? 'landing-navbar__dropdown-icon--open' : ''}`} 
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="none"
              >
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {recruiterDropdownOpen && (
              <ul className="landing-navbar__dropdown-menu">
                <li><Link to="/recruiter/login" className="landing-navbar__dropdown-item">Login</Link></li>
                <li><Link to="/recruiter/register" className="landing-navbar__dropdown-item">Register</Link></li>
              </ul>
            )}
          </div>

          <button
            className="landing-navbar__mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {/* {menuOpen ? <X size={24} /> : <Menu size={24} />} */}
          </button>
        </div>
      </div>
    </nav>
  );
}
