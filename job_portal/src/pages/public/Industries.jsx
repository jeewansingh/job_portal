import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";

import DashboardLayout from "../../components/DashboardLayout";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getIndustries } from "../../services/industries";

import "../../styles/Industries.css";

export default function Industries() {
  const { isLoggedIn } = useUser();
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    async function loadIndustries() {
      const data = await getIndustries();
      setIndustries(data);
    }

    loadIndustries();
  }, []);

  const content = (
    <div className="industries-page">
      <div className="industries-page__container">
        <section className="industries-page__header">
          <span className="industries-page__label">Industries</span>

          <h1 className="industries-page__title">
            Industries Hiring Now
          </h1>

          <p className="industries-page__subtitle">
            Explore fast-growing sectors and find the right fit for your next move.
          </p>

          {isLoggedIn && (
            <Link
              to="/dashboard"
              className="dashboard__back-link"
            >
              ← Back to Dashboard
            </Link>
          )}
        </section>

        <div className="industries-page__grid">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              to={`/industries/${industry.slug}`}
              className="industry-card-page-link"
            >
              <article className="industry-card-page">
                <div
                  className="industry-card-page__icon"
                  style={{ background: industry.color }}
                >
                  {industry.logoLetter}
                </div>

                <h2 className="industry-card-page__name">
                  {industry.name}
                </h2>

                <p className="industry-card-page__description">
                  {industry.description}
                </p>

                <div className="industry-card-page__meta">
                  <span>{industry.jobs} open roles</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoggedIn) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return (
    <>
      <Navbar />
      {content}
      <Footer />
    </>
  );
}