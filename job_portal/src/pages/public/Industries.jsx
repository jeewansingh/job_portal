import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import "../../styles/Industries.css";

const industries = [
  {
    name: "Technology",
    slug: "technology",
    logoLetter: "T",
    jobs: "4,200+",
    description: "Software, AI, cloud engineering, and product roles.",
    color: "linear-gradient(135deg, oklch(0.5 0.12 255), oklch(0.55 0.14 270))",
  },
  {
    name: "Healthcare",
    slug: "healthcare",
    logoLetter: "H",
    jobs: "2,800+",
    growth: "+24%",
    description: "Clinical operations, biopharma, and health-tech opportunities.",
    color: "linear-gradient(135deg, oklch(0.55 0.14 25), oklch(0.6 0.12 30))",
  },
  {
    name: "Finance",
    slug: "finance",
    logoLetter: "F",
    jobs: "1,900+",
    growth: "+12%",
    description: "Banking, fintech, analytics, and investment roles.",
    color: "linear-gradient(135deg, oklch(0.5 0.1 145), oklch(0.55 0.12 150))",
  },
  {
    name: "Travel & Hospitality",
    slug: "travel-hospitality",
    logoLetter: "TH",
    jobs: "1,900+",
    growth: "+12%",
    description: "Hospitality, customer experience, and travel operations roles.",
    color: "linear-gradient(135deg, oklch(0.45 0.12 300), oklch(0.5 0.14 310))",
  },
];

export default function Industries() {
  return (
    <DashboardLayout>
      <div className="industries-page">
        <div className="industries-page__container">
          <section className="industries-page__header">
            <span className="industries-page__label">Industries</span>
            <h1 className="industries-page__title">Industries Hiring Now</h1>
            <p className="industries-page__subtitle">
              Explore fast-growing sectors and find the right fit for your next move.
            </p>
            <Link to="/dashboard" className="dashboard__back-link">
              ← Back to Dashboard
            </Link>
          </section>

          <div className="industries-page__grid">
            {industries.map((industry) => (
              <Link key={industry.name} to={`/industries/${industry.slug}`} className="industry-card-page-link">
                <article className="industry-card-page">
                  <div className="industry-card-page__icon" style={{ background: industry.color }}>
                    {industry.logoLetter}
                  </div>
                  <h2 className="industry-card-page__name">{industry.name}</h2>
                  <p className="industry-card-page__description">{industry.description}</p>
                  <div className="industry-card-page__meta">
                    <span>{industry.jobs} open roles</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
