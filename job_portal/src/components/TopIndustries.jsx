// import { Code, Stethoscope, Landmark, ShoppingCart, Cpu, Film, Truck, BarChart3, TrendingUp, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/TopIndustries.css";
import { useEffect, useState } from "react";
import {  getTopIndustries } from "../services/categories";


export default function TopIndustries() {
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    const fetchTopIndustries = async () => {
      try {
        const data = await getTopIndustries();
        setIndustries(data);
      } catch (error) {
        console.error("Error fetching top industries:", error);
      }
    };

    fetchTopIndustries();
  }, []);

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
