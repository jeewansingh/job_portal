// import { Star } from "lucide-react";
import "../styles/Stats.css";

const stats = [
  { number: "50K+", label: "Jobs Posted" },
  { number: "12K+", label: "Companies" },
  { number: "1.2M", label: "Professionals" },
  { number: "94%", label: "Hire Success Rate" },
];


export default function Stats() {
  return (
    <section id="stats" className="stats-section">
      <div className="stats-section__gradient">
        <div className="stats-section__glow stats-section__glow--1" />
        <div className="stats-section__glow stats-section__glow--2" />

        <div className="stats-section__container">
          <div className="stats-section__header">
            <h2 className="stats-section__title">Trusted by the Best</h2>
            <p className="stats-section__subtitle">
              Join thousands of professionals and companies already using CareerHub.
            </p>
          </div>

          <div className="stats-section__grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="stat-card__number">{stat.number}</div>
                <div className="stat-card__label">{stat.label}</div>
              </div>
            ))}
          </div>

          
        </div>
      </div>
    </section>
  );
}
