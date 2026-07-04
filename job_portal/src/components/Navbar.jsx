import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import { Briefcase, Menu, X } from "lucide-react";
import "../styles/Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <li><Link to="/recommended-jobs" className="landing-navbar__link">Recommended Jobs</Link></li>
          <li><Link to="/industries" className="landing-navbar__link">Industries</Link></li>
        </ul>

        <div className="landing-navbar__actions">
          <Link to="/login" className="landing-navbar__btn landing-navbar__btn--ghost">Sign In</Link>
          <Link to="/register" className="landing-navbar__btn landing-navbar__btn--primary">Get Started</Link>
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
