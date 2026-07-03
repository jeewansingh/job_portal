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
          <li><a href="#jobs" className="landing-navbar__link">Jobs</a></li>
          <li><a href="#industries" className="landing-navbar__link">Industries</a></li>
          <li><a href="#stats" className="landing-navbar__link">Companies</a></li>
          <li><a href="#" className="landing-navbar__link">Salaries</a></li>
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
