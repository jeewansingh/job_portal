// import { Briefcase, Twitter, Linkedin, Github, Instagram } from "lucide-react";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__container">
        <div className="landing-footer__content">
          <a href="/" className="landing-footer__logo">
            <span className="landing-footer__logo-icon">
              {/* <Briefcase size={20} strokeWidth={2.5} /> */}
            </span>
            CareerHub
          </a>
          
          <p className="landing-footer__copyright">
            &copy; {new Date().getFullYear()} CareerHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}