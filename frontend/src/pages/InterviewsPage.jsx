import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/applications/interviews/")
      .then(({ data }) => setInterviews(data.results || data))
      .catch(() => setError("Unable to load interviews."))
      .finally(() => setLoading(false));
  }, []);

  return <main className="page"><nav><Link className="brand" to="/dashboard">CareerBridge</Link></nav><section className="hero"><p className="eyebrow">INTERVIEWS</p><h1>Upcoming interviews</h1>{loading ? <p>Loading…</p> : error ? <p className="form-error">{error}</p> : interviews.length ? <div className="job-list">{interviews.map((interview) => <article className="job-card" key={interview.id}><h2>{interview.job_title}</h2><p>{new Date(interview.scheduled_at).toLocaleString()}</p><p>{interview.interview_type} · {interview.location_or_link}</p>{interview.notes && <p>{interview.notes}</p>}</article>)}</div> : <p>No interviews are scheduled.</p>}</section></main>;
}
