// import { ArrowRight, MapPin, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/Hero.css";
import heroImage from "../assets/hero-image.png";

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-section__glow hero-section__glow--1" />
      <div className="hero-section__glow hero-section__glow--2" />
      <div className="hero-section__glow hero-section__glow--3" />
      <div className="hero-section__grid" />

      <div className="hero-section__container">
        <div className="hero-section__content">
          <div className="hero-section__badge">
            <span className="hero-section__badge-dot" />
            12,400+ jobs added this week
          </div>

          <h1 className="hero-section__title">
            Find Your <span className="hero-section__title-accent">Dream Career</span> in Minutes
          </h1>

          <p className="hero-section__subtitle">
            Connect with top employers, discover roles that match your skills, and land interviews faster with AI-powered job matching.
          </p>

          <div className="hero-section__cta-group">
            <Link to="/register" className="hero-section__btn hero-section__btn--primary">
              Register Free
            </Link>
            <Link to="/browse-jobs" className="hero-section__btn hero-section__btn--secondary">
              Explore Jobs
            </Link>
          </div>
        </div>

        <div className="hero-section__image">
          <div className="hero-section__image">
  <img src={heroImage} alt="Hero" />
</div>
        </div>
      </div>
    </section>
  );
}
