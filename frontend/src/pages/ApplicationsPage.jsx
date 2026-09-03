import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import api from "../services/api";

const getItems = (data) => data?.results || data || [];
const label = (value) => value.replaceAll("_", " ");

export default function ApplicationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/applications/my/");
      setItems(getItems(data));
    } catch {
      setError("We couldn’t load your applications right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const withdraw = async (item) => {
    if (!window.confirm(`Withdraw your application for “${item.job_title}”?`)) return;
    setBusyId(item.id);
    setError("");
    try {
      const { data } = await api.patch(`/applications/${item.id}/withdraw/`);
      setItems((current) => current.map((application) => application.id === item.id ? data : application));
    } catch {
      setError("Unable to withdraw this application.");
    } finally {
      setBusyId(null);
    }
  };

  return <main className="page"><SiteHeader /><section className="profile-shell"><div className="page-heading"><div><p className="eyebrow">APPLICATIONS</p><h1>Your applications.</h1><p className="intro">Track each opportunity from submission through decision.</p></div><Link className="action-button" to="/jobs">Find more jobs</Link></div>{error && <div className="page-feedback error"><p>{error}</p><button type="button" onClick={load}>Try again</button></div>}{loading ? <p className="page-feedback">Loading applications…</p> : items.length ? <div className="application-list">{items.map((item) => <article className="application-card" key={item.id}><div><div className="job-status-row"><span className={`status-pill ${item.status}`}>{label(item.status)}</span><span>Applied {new Date(item.applied_at).toLocaleDateString()}</span></div><h2><Link to={`/jobs/${item.job}`}>{item.job_title}</Link></h2><p>{item.company_name}</p>{item.cover_letter && <p className="cover-letter">{item.cover_letter}</p>}{item.cv && <a className="external-link" href={item.cv} target="_blank" rel="noreferrer">View submitted CV ↗</a>}</div>{item.status !== "withdrawn" && <button type="button" className="secondary-button" disabled={busyId === item.id} onClick={() => withdraw(item)}>{busyId === item.id ? "Withdrawing…" : "Withdraw application"}</button>}</article>)}</div> : <div className="empty-state"><h2>You have not applied to any jobs yet</h2><p>Explore current opportunities and apply when you find a great fit.</p><Link className="action-button" to="/jobs">Browse jobs</Link></div>}</section></main>;
}
