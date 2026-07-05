import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import JobCard from "../../components/JobCard";
import "../../styles/RecommendedJobs.css";

const PAGE_SIZE = 12;

const industryJobsMap = {
  technology: [
    {
      id: 1,
      company: "Neon Labs",
      logoColor: "linear-gradient(135deg, oklch(0.5 0.12 255), oklch(0.55 0.14 270))",
      logoLetter: "N",
      title: "Senior Frontend Engineer",
      location: "Remote — Global",
      matchScore: 93,
      type: "Full-time",
      salary: "$145K - $185K",
      salaryDetail: "per year",
      tags: ["React", "TypeScript", "Remote"],
      posted: "2 days ago",
      description: "Build polished web experiences for a high-growth SaaS platform.",
      specification: "5+ years with modern frontend stacks and a strong product mindset.",
      requiredSkills: ["React", "TypeScript", "Design Systems"],
      companyDescription: "Neon Labs is building developer-first infrastructure for modern teams.",
    },
    {
      id: 2,
      company: "Nova AI",
      matchScore: 93,
      logoColor: "linear-gradient(135deg, oklch(0.2 0.06 260), oklch(0.35 0.1 270))",
      logoLetter: "N",
      title: "Machine Learning Engineer",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$170K - $220K",
      salaryDetail: "per year",
      tags: ["Python", "ML", "AWS"],
      posted: "1 day ago",
      description: "Design and ship ML systems for large-scale personalization workflows.",
      specification: "Experience delivering production ML models and data pipelines.",
      requiredSkills: ["Python", "PyTorch", "MLOps"],
      companyDescription: "Nova AI helps teams automate product insight with intelligent systems.",
    },
    {
      id: 3,
      company: "Aether Cloud",
      matchScore: 93,
      logoColor: "linear-gradient(135deg, oklch(0.45 0.1 255), oklch(0.5 0.12 265))",
      logoLetter: "A",
      title: "Platform Engineer",
      location: "Austin, TX",
      type: "Hybrid",
      salary: "$155K - $195K",
      salaryDetail: "per year",
      tags: ["Kubernetes", "AWS", "Go"],
      posted: "3 days ago",
      description: "Improve developer tooling and platform reliability for a modern cloud stack.",
      specification: "Hands-on experience with Kubernetes, cloud infrastructure, and backend systems.",
      requiredSkills: ["Go", "Kubernetes", "AWS"],
      companyDescription: "Aether Cloud provides scalable infrastructure for next-generation products.",
    },
  ],
  healthcare: [
    {
      id: 4,
      matchScore: 93,
      company: "CareBridge",
      logoColor: "linear-gradient(135deg, oklch(0.55 0.14 25), oklch(0.6 0.12 30))",
      logoLetter: "C",
      title: "Healthcare Operations Analyst",
      location: "Chicago, IL",
      type: "Full-time",
      salary: "$90K - $120K",
      salaryDetail: "per year",
      tags: ["Operations", "Data"],
      posted: "4 days ago",
      description: "Drive operational planning and reporting across a growing healthcare network.",
      specification: "Experience with healthcare workflows, reporting, and cross-functional planning.",
      requiredSkills: ["Excel", "Reporting", "Operations"],
      companyDescription: "CareBridge improves care coordination for health systems and clinics.",
    },
    {
      id: 5,
      matchScore: 93,
      company: "Luma Health",
      logoColor: "linear-gradient(135deg, oklch(0.45 0.12 145), oklch(0.5 0.14 160))",
      logoLetter: "L",
      title: "Clinical Product Designer",
      location: "Boston, MA",
      type: "Hybrid",
      salary: "$110K - $145K",
      salaryDetail: "per year",
      tags: ["UX", "Healthcare"],
      posted: "2 days ago",
      description: "Design patient-centered experiences for digital care teams.",
      specification: "Strong product design background and familiarity with healthcare workflows.",
      requiredSkills: ["Figma", "UX Research", "Healthcare"],
      companyDescription: "Luma Health makes care experiences simpler and smarter for patients.",
    },
  ],
  finance: [
    {
      id: 6,
      matchScore: 93,
      company: "Northstar Capital",
      logoColor: "linear-gradient(135deg, oklch(0.5 0.1 145), oklch(0.55 0.12 150))",
      logoLetter: "N",
      title: "Financial Analyst",
      location: "New York, NY",
      type: "Full-time",
      salary: "$95K - $130K",
      salaryDetail: "per year",
      tags: ["Finance", "Excel"],
      posted: "5 days ago",
      description: "Support investment planning and strategic forecasting for a high-growth firm.",
      specification: "Analytical finance experience and clear communication skills.",
      requiredSkills: ["Excel", "Forecasting", "Financial Modeling"],
      companyDescription: "Northstar Capital supports growth-stage ventures across multiple markets.",
    },
    {
      id: 7,
      matchScore: 93,
      company: "LedgerOne",
      logoColor: "linear-gradient(135deg, oklch(0.45 0.14 300), oklch(0.5 0.12 315))",
      logoLetter: "L",
      title: "Fintech Product Manager",
      location: "Remote — US",
      type: "Full-time",
      salary: "$125K - $160K",
      salaryDetail: "per year",
      tags: ["Product", "Fintech"],
      posted: "1 day ago",
      description: "Shape features for a modern financial operations platform.",
      specification: "Experience in fintech products, user research, and cross-functional execution.",
      requiredSkills: ["Product Strategy", "Analytics", "Roadmapping"],
      companyDescription: "LedgerOne helps teams manage payments and operating workflows in one place.",
    },
  ],
  'travel-hospitality': [
    {
      id: 8,
      matchScore: 93,
      company: "Harbor Stay",
      logoColor: "linear-gradient(135deg, oklch(0.45 0.12 300), oklch(0.5 0.14 310))",
      logoLetter: "H",
      title: "Guest Experience Manager",
      location: "Miami, FL",
      type: "Full-time",
      salary: "$70K - $95K",
      salaryDetail: "per year",
      tags: ["Hospitality", "Operations"],
      posted: "3 days ago",
      description: "Lead guest experience initiatives for a premium hospitality brand.",
      specification: "Customer-first leadership and experience in hospitality operations.",
      requiredSkills: ["Leadership", "Guest Experience", "Operations"],
      companyDescription: "Harbor Stay creates memorable stays for travelers and business guests alike.",
    },
    {
      id: 9,
      company: "Atlas Travel",
      logoColor: "linear-gradient(135deg, oklch(0.5 0.12 255), oklch(0.55 0.14 270))",
      logoLetter: "A",
      title: "Travel Operations Coordinator",
      location: "Denver, CO",
      type: "Internship",
      salary: "$65K - $85K",
      salaryDetail: "per year",
      tags: ["Travel", "Customer Support"],
      posted: "6 days ago",
      description: "Coordinate travel experiences and support high-value customer journeys.",
      specification: "Strong coordination skills and comfortable working across teams.",
      requiredSkills: ["Customer Support", "Organization", "Travel"],
      companyDescription: "Atlas Travel helps travelers plan seamless, premium trips.",
    },
  ],
};

const industryLabels = {
  technology: "Technology",
  healthcare: "Healthcare",
  finance: "Finance",
  'travel-hospitality': "Travel & Hospitality",
};

export default function IndustryJobs() {
  const { industrySlug } = useParams();
  const [titleQuery, setTitleQuery] = useState("");
  const [companyQuery, setCompanyQuery] = useState("");
  const [jobType, setJobType] = useState("All");
  const [page, setPage] = useState(1);

  const industryName = industryLabels[industrySlug] || "Industry";
  const jobs = industryJobsMap[industrySlug] || [];
  const jobTypes = useMemo(() => ["All", ...new Set(jobs.map((job) => job.type))], [jobs]);

  const filteredJobs = useMemo(() => {
    const normalizedTitle = titleQuery.trim().toLowerCase();
    const normalizedCompany = companyQuery.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesTitle = !normalizedTitle || job.title.toLowerCase().includes(normalizedTitle);
      const matchesCompany = !normalizedCompany || job.company.toLowerCase().includes(normalizedCompany);
      const matchesType = jobType === "All" || job.type === jobType;

      return matchesTitle && matchesCompany && matchesType;
    });
  }, [companyQuery, jobType, jobs, titleQuery]);

  useEffect(() => {
    setPage(1);
  }, [companyQuery, jobType, titleQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const paginatedJobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <DashboardLayout>
      <div className="recommended-jobs-page">
        <div className="recommended-jobs-page__container">
          <section className="recommended-jobs-page__header">
            <span className="dashboard__label">Industry</span>
            <h1 className="dashboard__title">{industryName} Jobs</h1>
            <p className="dashboard__subtitle">
              Explore curated opportunities from this category using dummy data.
            </p>
            <Link to="/industries" className="dashboard__back-link">
              ← Back to Industries
            </Link>
          </section>

          <div className="recommended-jobs-page__filters">
            <input
              className="recommended-jobs-page__filter-input"
              placeholder="Filter by job title"
              value={titleQuery}
              onChange={(event) => setTitleQuery(event.target.value)}
            />
            <input
              className="recommended-jobs-page__filter-input"
              placeholder="Filter by company"
              value={companyQuery}
              onChange={(event) => setCompanyQuery(event.target.value)}
            />
            <select className="recommended-jobs-page__filter-select" value={jobType} onChange={(event) => setJobType(event.target.value)}>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="recommended-jobs-page__results-meta">
            <span>{filteredJobs.length} jobs found</span>
            <span>Showing {paginatedJobs.length} per page</span>
          </div>

          {paginatedJobs.length > 0 ? (
            <div className="dashboard__jobs-grid dashboard__jobs-grid--full">
              {paginatedJobs.map((job) => (
                <JobCard key={job.id} job={job} href={`/jobs/${job.id}`} showMatchBadge={true} />
              ))}
            </div>
          ) : (
            <div className="dashboard__empty-state">No jobs match your filters right now.</div>
          )}

          <div className="recommended-jobs-page__pagination">
            <button className="recommended-jobs-page__pagination-btn" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}>
              Previous
            </button>
            <span className="recommended-jobs-page__pagination-status">
              Page {page} of {totalPages}
            </span>
            <button className="recommended-jobs-page__pagination-btn" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
