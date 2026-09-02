import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import api from "../services/api";

const getItems = (data) => data?.results || data || [];
const label = (value) => value.replaceAll("_", " ");

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/jobs/mine/");
      setJobs(getItems(data));
    } catch {
      setError("We couldn’t load your job postings right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (job, status) => {
    setBusyId(job.id);
    setError("");
    try {
      const { data } = await api.patch(`/jobs/${job.id}/`, { status });
      setJobs((current) => current.map((item) => item.id === job.id ? data : item));
    } catch {
      setError("Unable to update this job posting.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (job) => {
    if (!window.confirm(`Delete “${job.title}”? This cannot be undone.`)) return;
    setBusyId(job.id);
    setError("");
    try {
      await api.delete(`/jobs/${job.id}/`);
      setJobs((current) => current.filter((item) => item.id !== job.id));
    } catch {
      setError("Unable to delete this job posting.");
    } finally {
      setBusyId(null);
    }
  };

  return <main className="page">
    <SiteHeader />
    <section className="profile-shell employer-jobs-shell">
      <div className="page-heading"><div><p className="eyebrow">EMPLOYER TOOLS</p><h1>Manage your job postings.</h1><p className="intro">Edit details, control visibility, and move directly into applicant review.</p></div><Link className="action-button" to="/employer/jobs/create">Post a job</Link></div>
      {error && <div className="page-feedback error"><p>{error}</p><button type="button" onClick={load}>Try again</button></div>}
      {loading ? <p className="page-feedback">Loading your jobs…</p> : jobs.length ? <div className="managed-job-list">{jobs.map((job) => <article className="managed-job" key={job.id}><div><div className="job-status-row"><span className={`status-pill ${job.status}`}>{label(job.status)}</span><span>{job.application_deadline ? `Closes ${new Date(`${job.application_deadline}T00:00:00`).toLocaleDateString()}` : "No deadline"}</span></div><h2>{job.title}</h2><p>{job.location} · {label(job.job_type)} · {label(job.work_mode)}</p></div><div className="managed-job-actions"><button type="button" className="link-button" onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}>Edit</button><Link to={`/employer/applications?job=${job.id}`}>Applicants</Link><label>Status<select disabled={busyId === job.id} value={job.status} onChange={(event) => changeStatus(job, event.target.value)}><option value="draft">Draft</option><option value="open">Open</option><option value="closed">Closed</option></select></label><button type="button" className="danger-link" disabled={busyId === job.id} onClick={() => remove(job)}>Delete</button></div></article>)}</div> : <div className="empty-state"><h2>No job postings yet</h2><p>Publish your first opportunity to start connecting with candidates.</p><Link className="action-button" to="/employer/jobs/create">Post a job</Link></div>}
    </section>
  </main>;
}
