import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import JobCard from "../components/JobCard";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const getItems = (data) => data?.results || data || [];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [connection, setConnection] = useState({ loading: true, success: false, message: "Connecting to the portal…" });
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [contentError, setContentError] = useState("");

  const load = async () => {
    setConnection({ loading: true, success: false, message: "Connecting to the portal…" });
    setContentError("");
    const [health, jobsResponse, companiesResponse, categoriesResponse] = await Promise.allSettled([
      api.get("/health/"),
      api.get("/jobs/"),
      api.get("/companies/"),
      api.get("/jobs/categories/"),
    ]);

    if (health.status === "fulfilled") {
      setConnection({ loading: false, success: true, message: health.value.data.message || "Portal services are online" });
    } else {
      setConnection({ loading: false, success: false, message: "Some live data is unavailable. Start Django at http://127.0.0.1:8000." });
    }
    if (jobsResponse.status === "fulfilled") setJobs(getItems(jobsResponse.value.data));
    if (companiesResponse.status === "fulfilled") setCompanies(getItems(companiesResponse.value.data));
    if (categoriesResponse.status === "fulfilled") setCategories(getItems(categoriesResponse.value.data));
    if ([jobsResponse, companiesResponse, categoriesResponse].some((result) => result.status === "rejected")) setContentError("Some live portal content could not be loaded just now.");
  };

  useEffect(() => { load(); }, []);

  const featuredJobs = [...jobs].sort((first, second) => Number(second.is_featured) - Number(first.is_featured)).slice(0, 3);

  return <main className="page">
    <SiteHeader />
    <section className="home-hero">
      <div>
        <p className="eyebrow">JOB & INTERNSHIP PORTAL</p>
        <h1>Find the opportunity that moves you forward.</h1>
        <p className="intro">Discover current roles, track each application, and build a profile employers can act on.</p>
        <div className="hero-actions">
          <Link className="action-button" to="/jobs">Browse opportunities</Link>
          {!isAuthenticated && <Link className="secondary-button hero-secondary" to="/register">Create an account</Link>}
          {isAuthenticated && <Link className="secondary-button hero-secondary" to="/dashboard">Go to your dashboard</Link>}
        </div>
        <div className={`connection ${connection.success ? "success" : "pending"}`}>
          <span>{connection.loading ? "●" : connection.success ? "✓" : "!"}</span>{connection.message}
        </div>
      </div>
      <aside className="home-summary">
        <span>Live on CareerBridge</span>
        <strong>{jobs.length}</strong><small>open opportunities</small>
        <strong>{companies.length}</strong><small>companies hiring</small>
        {isAuthenticated && <p>Signed in as <b>{user?.first_name || user?.username}</b>.</p>}
      </aside>
    </section>
    <section className="content-section">
      <div className="section-heading"><div><p className="eyebrow">DISCOVER</p><h2>Latest opportunities</h2></div><Link to="/jobs">See all jobs →</Link></div>
      {contentError && <div className="inline-error"><span>{contentError}</span><button type="button" className="link-button" onClick={load}>Retry</button></div>}
      {featuredJobs.length ? <div className="job-grid">{featuredJobs.map((job) => <JobCard key={job.id} job={job} />)}</div> : !connection.loading && <div className="empty-state compact"><h3>No open roles yet</h3><p>Check back soon, or explore companies building their teams.</p></div>}
    </section>
    <section className="content-section home-categories"><div className="section-heading"><div><p className="eyebrow">EXPLORE BY FOCUS</p><h2>Find work that fits your direction</h2></div></div><div className="category-grid">{categories.slice(0, 6).map((category) => <Link className="category-link" key={category.id} to={`/jobs?category=${category.id}`}><strong>{category.name}</strong><span>Explore roles</span></Link>)}</div></section>
    <section className="content-section how-it-works"><div className="section-heading"><div><p className="eyebrow">HOW IT WORKS</p><h2>A clearer path from search to start date</h2></div></div><div className="steps-grid"><article><span>01</span><h3>Build your profile</h3><p>Showcase your skills and experience so the right employers can find you.</p></article><article><span>02</span><h3>Discover a role</h3><p>Search live jobs and internships using focused filters that match your goals.</p></article><article><span>03</span><h3>Move forward</h3><p>Apply, follow updates, and keep every next step organized in one place.</p></article></div></section>
    <section className="content-section company-strip">
      <div className="section-heading"><div><p className="eyebrow">EMPLOYERS</p><h2>Companies on CareerBridge</h2></div><Link to="/companies">Explore companies →</Link></div>
      <div className="company-grid">{companies.slice(0, 4).map((company) => <Link className="company-card" key={company.id} to={`/companies/${company.id}`}><div className="company-mark">{company.company_name?.[0] || "C"}</div><h3>{company.company_name}</h3><p>{company.industry || "Growing team"}</p><span>{[company.city, company.country].filter(Boolean).join(", ") || "Remote-friendly"}</span></Link>)}</div>
    </section>
    <section className="home-cta"><div><p className="eyebrow">READY FOR THE NEXT STEP?</p><h2>Bring your next opportunity closer.</h2><p>Whether you’re starting a career or building a team, CareerBridge keeps the journey moving.</p></div><Link className="action-button" to={isAuthenticated ? "/dashboard" : "/register"}>{isAuthenticated ? "Open dashboard" : "Join CareerBridge"}</Link></section>
    <footer className="footer"><div className="footer-inner"><div><Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">C</span>CareerBridge</Link><p>Connecting ambitious people with meaningful work.</p></div><nav className="footer-links" aria-label="Footer navigation"><Link to="/jobs">Browse jobs</Link><Link to="/internships">Internships</Link><Link to="/companies">Companies</Link>{!isAuthenticated && <Link to="/register">Create an account</Link>}</nav></div></footer>
  </main>;
}
