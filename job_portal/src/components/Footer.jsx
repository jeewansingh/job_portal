// import { Briefcase, Twitter, Linkedin, Github, Instagram } from "lucide-react";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__container">
        <div className="landing-footer__grid">
          <div className="landing-footer__brand">
            <a href="/" className="landing-footer__logo">
              <span className="landing-footer__logo-icon">
                {/* <Briefcase size={20} strokeWidth={2.5} /> */}
              </span>
              CareerHub
            </a>
            <p className="landing-footer__desc">
              The modern job platform connecting exceptional talent with world-class companies. Find your next career move today.
            </p>
            <div className="landing-footer__socials">
              <a href="#" className="landing-footer__social" aria-label="Twitter">
                {/* <Twitter size={18} /> */}
              </a>
              <a href="#" className="landing-footer__social" aria-label="LinkedIn">
                {/* <Linkedin size={18} /> */}
              </a>
              <a href="#" className="landing-footer__social" aria-label="GitHub">
                {/* <Github size={18} /> */}
              </a>
              <a href="#" className="landing-footer__social" aria-label="Instagram">
                {/* <Instagram size={18} /> */}
              </a>
            </div>
          </div>

          <div>
            <h4 className="landing-footer__column-title">For Candidates</h4>
            <ul className="landing-footer__links">
              <li><a href="#" className="landing-footer__link">Browse Jobs</a></li>
              <li><a href="#" className="landing-footer__link">Browse Companies</a></li>
              <li><a href="#" className="landing-footer__link">Salary Calculator</a></li>
              <li><a href="#" className="landing-footer__link">Career Advice</a></li>
              <li><a href="#" className="landing-footer__link">Resume Builder</a></li>
            </ul>
          </div>

          <div>
            <h4 className="landing-footer__column-title">For Employers</h4>
            <ul className="landing-footer__links">
              <li><a href="#" className="landing-footer__link">Post a Job</a></li>
              <li><a href="#" className="landing-footer__link">Sourcing Solutions</a></li>
              <li><a href="#" className="landing-footer__link">Pricing</a></li>
              <li><a href="#" className="landing-footer__link">Enterprise</a></li>
              <li><a href="#" className="landing-footer__link">Recruiting Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="landing-footer__column-title">Company</h4>
            <ul className="landing-footer__links">
              <li><a href="#" className="landing-footer__link">About Us</a></li>
              <li><a href="#" className="landing-footer__link">Careers</a></li>
              <li><a href="#" className="landing-footer__link">Press</a></li>
              <li><a href="#" className="landing-footer__link">Contact</a></li>
              <li><a href="#" className="landing-footer__link">Help Center</a></li>
            </ul>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <p className="landing-footer__copyright">
            &copy; {new Date().getFullYear()} CareerHub. All rights reserved.
          </p>
          <div className="landing-footer__legal">
            <a href="#" className="landing-footer__legal-link">Privacy Policy</a>
            <a href="#" className="landing-footer__legal-link">Terms of Service</a>
            <a href="#" className="landing-footer__legal-link">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
// 