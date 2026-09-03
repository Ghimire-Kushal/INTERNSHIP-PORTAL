import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import api from "../services/api";

const getItems = (data) => data?.results || data || [];

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/applications/saved/");
      setJobs(getItems(data));
    } catch {
      setError("Unable to load saved jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (item) => {
    setBusyId(item.id);
    setError("");
    try {
      await api.delete(`/applications/saved/${item.id}/`);
      setJobs((items) => items.filter((job) => job.id !== item.id));
    } catch {
      setError("Unable to remove this saved job.");
    } finally {
      setBusyId(null);
    }
  };

  return <main className="page"><SiteHeader /><section className="profile-shell"><div className="page-heading"><div><p className="eyebrow">SAVED JOBS</p><h1>Keep promising roles close.</h1><p className="intro">Return to saved opportunities whenever you are ready to apply.</p></div><Link className="action-button" to="/jobs">Browse jobs</Link></div>{error && <div className="page-feedback error"><p>{error}</p><button type="button" onClick={load}>Try again</button></div>}{loading ? <p className="page-feedback">Loading saved jobs…</p> : jobs.length ? <div className="saved-job-list">{jobs.map((job) => <article className="saved-job-card" key={job.id}><div><h2><Link to={`/jobs/${job.job}`}>{job.title}</Link></h2><p>{job.company_name}</p><span>Saved {new Date(job.saved_at).toLocaleDateString()}</span></div><button className="secondary-button" disabled={busyId === job.id} onClick={() => remove(job)}>{busyId === job.id ? "Removing…" : "Remove"}</button></article>)}</div> : <div className="empty-state"><h2>No saved jobs yet</h2><p>Explore open roles and save the ones you want to revisit.</p><Link className="action-button" to="/jobs">Explore jobs</Link></div>}</section></main>;
}
