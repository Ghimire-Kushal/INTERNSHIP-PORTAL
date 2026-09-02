import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import JobCard from "../components/JobCard";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const getItems = (data) => data?.results || data || [];
const humanize = (value) => value.replaceAll("_", " ");

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [error, setError] = useState("");

  const actions = user.role === "employer"
    ? [["Company profile", "/employer/company", "Keep your employer page current."], ["Manage jobs", "/employer/jobs", "Edit, close, or review your job postings."], ["Review applicants", "/employer/applications", "Move candidates through your hiring process."]]
    : [["Complete profile", "/profile", "Help employers understand your strengths."], ["My applications", "/my-applications", "Track every application in one place."], ["Saved jobs", "/saved-jobs", "Return to roles you want to revisit."]];

  const load = async () => {
    setError("");
    const requests = [api.get("/analytics/dashboard/")];
    if (user.role === "student") requests.push(api.get("/jobs/recommended/"));
    const results = await Promise.allSettled(requests);
    if (results[0].status === "fulfilled") setStats(results[0].value.data);
    else setError("Your dashboard data could not be loaded right now.");
    if (results[1]?.status === "fulfilled") setRecommended(getItems(results[1].value.data));
  };

  useEffect(() => { load(); }, [user.role]);

  return <main className="page dashboard">
    <SiteHeader />
    <section className="dashboard-shell">
      <div className="dashboard-head"><div><p className="eyebrow">{user.role} dashboard</p><h1>Welcome back, {user.first_name || user.username}.</h1><p className="intro">Here’s what’s moving in your career journey.</p></div><Link className="action-button dashboard-primary" to={user.role === "employer" ? "/employer/jobs/create" : "/jobs"}>{user.role === "employer" ? "Post a job" : "Browse jobs"}</Link></div>
      {error && <div className="inline-error"><span>{error}</span><button type="button" className="link-button" onClick={load}>Retry</button></div>}
      <div className="stats-grid">{stats ? Object.entries(stats).map(([key, value]) => <article className="stat-card" key={key}><span>{humanize(key)}</span><strong>{value}</strong></article>) : <article className="stat-card loading-card"><span>Loading your dashboard…</span></article>}</div>
      <div className="dashboard-actions">{actions.map(([title, to, description]) => <Link className="dashboard-action" to={to} key={to}><h2>{title} <span>→</span></h2><p>{description}</p></Link>)}</div>
      {user.role === "student" && <section className="content-section dashboard-recommended"><div className="section-heading"><div><p className="eyebrow">FOR YOU</p><h2>Recommended opportunities</h2></div><Link to="/jobs">All jobs →</Link></div>{recommended.length ? <div className="job-grid">{recommended.slice(0, 3).map((job) => <JobCard key={job.id} job={job} showMatch />)}</div> : <div className="empty-state compact"><h3>Your recommendations will appear here</h3><p>Add your location and skills to your profile, then explore current roles.</p><Link to="/profile">Complete profile</Link></div>}</section>}
    </section>
  </main>;
}
