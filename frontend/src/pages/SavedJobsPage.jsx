import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => api.get("/applications/saved/").then(({ data }) => setJobs(data.results || data)).catch(() => setError("Unable to load saved jobs.")).finally(() => setLoading(false));

  useEffect(load, []);

  const remove = async (id) => {
    await api.delete(`/applications/saved/${id}/`);
    setJobs((items) => items.filter((job) => job.id !== id));
  };

  return <main className="page"><nav><Link className="brand" to="/dashboard">CareerBridge</Link><Link to="/jobs">All jobs</Link></nav><section className="hero"><p className="eyebrow">SAVED JOBS</p><h1>Saved jobs</h1>{loading ? <p>Loading…</p> : error ? <p className="form-error">{error}</p> : jobs.length ? <div className="job-list">{jobs.map((job) => <article className="job-card" key={job.id}><h2><Link to={`/jobs/${job.job}`}>{job.title}</Link></h2><p>{job.company_name}</p><button className="secondary-button" onClick={() => remove(job.id)}>Remove</button></article>)}</div> : <p>No saved jobs yet. Explore open roles to build your list.</p>}</section></main>;
}
