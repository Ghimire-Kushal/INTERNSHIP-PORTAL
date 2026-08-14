import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function DashboardPage() {
  const { user, logout } = useAuth(); const [stats, setStats] = useState(null); const [recommendations, setRecommendations] = useState([]);
  useEffect(() => { api.get("/analytics/dashboard/").then(({ data }) => setStats(data)).catch(() => setStats({})); if (user.role === "student") api.get("/jobs/recommended/").then(({ data }) => setRecommendations(data.results || data)).catch(() => {}); }, [user.role]);
  const destination = user.role === "employer" ? "/employer/company" : "/profile";
  return <main className="page"><nav><Link className="brand" to="/">CareerBridge</Link><div><Link to={destination}>{user.role === "employer" ? "Company" : "Profile"}</Link>{user.role === "student" && <><Link to="/my-applications">Applications</Link><Link to="/saved-jobs">Saved jobs</Link><Link to="/interviews">Interviews</Link></>}{user.role === "employer" && <><Link to="/employer/jobs/create">Post job</Link><Link to="/employer/applications">Applicants</Link><Link to="/interviews">Interviews</Link></>}<Link to="/notifications">Notifications</Link><button className="link-button" onClick={logout}>Log out</button></div></nav><section className="hero"><p className="eyebrow">{user.role.toUpperCase()} DASHBOARD</p><h1>Welcome, {user.first_name || user.username}.</h1><div>{stats ? Object.entries(stats).map(([label, value]) => <p key={label}><strong>{value}</strong> {label.replaceAll("_", " ")}</p>) : <p>Loading dashboard…</p>}</div>{user.role === "student" && recommendations.length > 0 && <><h2>Recommended jobs</h2>{recommendations.map(job => <p key={job.id}><Link to={`/jobs/${job.id}`}>{job.title}</Link> — {job.match_percentage}% match</p>)}</>}</section></main>;
}
