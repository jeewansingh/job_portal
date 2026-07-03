// import { Code, Stethoscope, Landmark, ShoppingCart, Cpu, Film, Truck, BarChart3, TrendingUp, Flame } from "lucide-react";
import "../styles/TopIndustries.css";

const industries = [
  {
    name: "Technology",
    
    jobs: "4,200+",
    growth: "+18%",
    growthType: "up",
    color: "linear-gradient(135deg, oklch(0.5 0.12 255), oklch(0.55 0.14 270))",
  },
  {
    name: "Healthcare",
    
    jobs: "2,800+",
    growth: "+24%",
    growthType: "up",
    color: "linear-gradient(135deg, oklch(0.55 0.14 25), oklch(0.6 0.12 30))",
  },
  {
    name: "Finance",
    
    jobs: "1,900+",
    growth: "+12%",
    growthType: "up",
    color: "linear-gradient(135deg, oklch(0.5 0.1 145), oklch(0.55 0.12 150))",
  },
    {
    name: "Travel & Hospitality",
    
    jobs: "1,900+",
    growth: "+12%",
    growthType: "up",
    color: "linear-gradient(135deg, oklch(0.5 0.1 145), oklch(0.55 0.12 150))",
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
          {industries.map((ind) => {
            
            return (
              <div key={ind.name} className="industry-card">
                <div className="industry-card__icon-wrap" style={{ background: ind.color }}>
                  {/* <Icon className="industry-card__icon" /> */}
                </div>
                <h3 className="industry-card__name">{ind.name}</h3>
                <p className="industry-card__count">{ind.jobs} open roles</p>
                <span className={`industry-card__growth industry-card__growth--${ind.growthType}`}>
                  {ind.growthType === "hot" ? <Flame size={12} /> : "Up" }
                  {ind.growth} this quarter
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
