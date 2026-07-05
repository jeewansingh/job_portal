// import { Code, Stethoscope, Landmark, ShoppingCart, Cpu, Film, Truck, BarChart3, TrendingUp, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/TopIndustries.css";

const industries = [
  {
    name: "Technology",
    slug: "technology",
    logoLetter: "T",
    jobs: "4,200+",
    growth: "+18%",
    growthType: "up",
    description: "Software, AI, cloud engineering, and product roles.",
    color: "linear-gradient(135deg, oklch(0.5 0.12 255), oklch(0.55 0.14 270))",
  },
  {
    name: "Healthcare",
    slug: "healthcare",
    logoLetter: "H",
    jobs: "2,800+",
    growth: "+24%",
    growthType: "up",
    description: "Clinical operations, biopharma, and health-tech opportunities.",
    color: "linear-gradient(135deg, oklch(0.55 0.14 25), oklch(0.6 0.12 30))",
  },
  {
    name: "Finance",
    slug: "finance",
    logoLetter: "F",
    jobs: "1,900+",
    growth: "+12%",
    growthType: "up",
    description: "Banking, fintech, analytics, and investment roles.",
    color: "linear-gradient(135deg, oklch(0.5 0.1 145), oklch(0.55 0.12 150))",
  },
  {
    name: "Travel & Hospitality",
    slug: "travel-hospitality",
    logoLetter: "TH",
    jobs: "1,900+",
    growth: "+12%",
    growthType: "up",
    description: "Hospitality, customer experience, and travel operations roles.",
    color: "linear-gradient(135deg, oklch(0.45 0.12 300), oklch(0.5 0.14 310))",
  },
];

export default function TopIndustries() {
  return (
    <section id="industries" className="top-industries">
      <div className="top-industries__container">
        <div className="top-industries__header">
          <span className="top-industries__label">Trending</span>
          <h2 className="top-industries__title">Top Industries Hiring Now</h2>
          <p className="top-industries__subtitle">
            Explore opportunities across the fastest-growing sectors.
          </p>
        </div>

        <div className="top-industries__grid">
          {industries.map((ind) => (
            <Link key={ind.name} to={`/industries/${ind.slug}`} className="industry-card-link">
              <article className="industry-card">
                <div className="industry-card__icon-wrap" style={{ background: ind.color }}>
                  <span className="industry-card__letter">{ind.logoLetter}</span>
                </div>
                <h3 className="industry-card__name">{ind.name}</h3>
                <p className="industry-card__description">{ind.description}</p>
                <p className="industry-card__count">{ind.jobs} open roles</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
