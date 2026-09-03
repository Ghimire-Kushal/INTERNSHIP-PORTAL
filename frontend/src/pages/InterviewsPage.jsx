import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const getItems = (data) => data?.results || data || [];
const label = (value) => value.replaceAll("_", " ");

export default function InterviewsPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/applications/interviews/");
      setInterviews(getItems(data));
    } catch {
      setError("Unable to load interviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return <main className="page"><SiteHeader /><section className="profile-shell"><div className="page-heading"><div><p className="eyebrow">INTERVIEWS</p><h1>Upcoming interviews.</h1><p className="intro">Keep every meeting detail close at hand.</p></div>{user?.role === "employer" && <Link className="secondary-button inline-button" to="/employer/applications">Review applicants</Link>}</div>{error && <div className="page-feedback error"><p>{error}</p><button type="button" onClick={load}>Try again</button></div>}{loading ? <p className="page-feedback">Loading interviews…</p> : interviews.length ? <div className="interview-list">{interviews.map((interview) => <article className="interview-item" key={interview.id}><div className="interview-date"><strong>{new Date(interview.scheduled_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</strong><span>{new Date(interview.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div><div><h2>{interview.job_title}</h2><p>{label(interview.interview_type)} · {interview.location_or_link}</p>{interview.notes && <p className="muted">{interview.notes}</p>}</div>{interview.location_or_link.startsWith("http") && <a className="external-link" href={interview.location_or_link} target="_blank" rel="noreferrer">Join meeting ↗</a>}</article>)}</div> : <div className="empty-state"><h2>No interviews scheduled</h2><p>{user?.role === "employer" ? "Schedule one from an applicant’s profile when you’re ready." : "When an employer schedules an interview, the details will appear here."}</p></div>}</section></main>;
}
