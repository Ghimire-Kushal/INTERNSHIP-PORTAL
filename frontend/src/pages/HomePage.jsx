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
  const [contentError, setContentError] = useState("");

  const load = async () => {
    setConnection({ loading: true, success: false, message: "Connecting to the portal…" });
    setContentError("");
    const [health, jobsResponse, companiesResponse] = await Promise.allSettled([
      api.get("/health/"),
      api.get("/jobs/"),
      api.get("/companies/"),
    ]);

    if (health.status === "fulfilled") {
      setConnection({ loading: false, success: true, message: health.value.data.message || "Portal services are online" });
    } else {
      setConnection({ loading: false, success: false, message: "Some live data is unavailable. Start Django at http://127.0.0.1:8000." });
    }
    if (jobsResponse.status === "fulfilled") setJobs(getItems(jobsResponse.value.data));
    if (companiesResponse.status === "fulfilled") setCompanies(getItems(companiesResponse.value.data));
    if (jobsResponse.status === "rejected" || companiesResponse.status === "rejected") setContentError("Live opportunities could not be loaded just now.");
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
    <section className="content-section company-strip">
      <div className="section-heading"><div><p className="eyebrow">EMPLOYERS</p><h2>Companies on CareerBridge</h2></div><Link to="/companies">Explore companies →</Link></div>
      <div className="company-grid">{companies.slice(0, 4).map((company) => <Link className="company-card" key={company.id} to={`/companies/${company.id}`}><div className="company-mark">{company.company_name?.[0] || "C"}</div><h3>{company.company_name}</h3><p>{company.industry || "Growing team"}</p><span>{[company.city, company.country].filter(Boolean).join(", ") || "Remote-friendly"}</span></Link>)}</div>
    </section>
  </main>;
}
