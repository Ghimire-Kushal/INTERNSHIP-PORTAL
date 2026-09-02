import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const humanize = (value = "") => value.replaceAll("_", " ");
const getItems = (data) => data?.results || data || [];
const formatMoney = (value, currency) => value == null || value === "" ? null : new Intl.NumberFormat(undefined, { style: "currency", currency: currency || "NPR", maximumFractionDigits: 0 }).format(value);

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showApplication, setShowApplication] = useState(false);
  const [form, setForm] = useState({ cover_letter: "", cv: null });
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.get(`/jobs/${id}/`);
      setJob(data);
      if (user?.role === "student") {
        try {
          const applications = await api.get("/applications/my/");
          setApplication(getItems(applications.data).find((item) => String(item.job) === String(data.id)) || null);
        } catch {
          setApplication(null);
        }
      } else {
        setApplication(null);
      }
    } catch (requestError) {
      setError(requestError.response?.status === 404 ? "This opportunity is no longer available." : "We couldn’t load this opportunity right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id, user?.role]);

  const requireStudent = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/jobs/${id}` } } });
      return false;
    }
    return user?.role === "student";
  };

  const saveJob = async () => {
    if (!requireStudent()) return;
    setSaving(true);
    setMessage("");
    try {
      await api.post("/applications/saved/", { job: job.id });
      setMessage("Saved to your list.");
    } catch (requestError) {
      setMessage(requestError.response?.data?.detail || "Unable to save this job.");
    } finally {
      setSaving(false);
    }
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    if (!requireStudent()) return;
    setApplying(true);
    setMessage("");
    const payload = new FormData();
    if (form.cover_letter.trim()) payload.append("cover_letter", form.cover_letter.trim());
    if (form.cv) payload.append("cv", form.cv);
    try {
      const { data } = await api.post(`/applications/jobs/${job.id}/apply/`, payload);
      setApplication(data);
      setShowApplication(false);
      setForm({ cover_letter: "", cv: null });
      setMessage("Your application has been submitted.");
    } catch (requestError) {
      const data = requestError.response?.data;
      setMessage(typeof data === "string" ? data : data?.detail || (data ? Object.values(data).flat().join(" ") : "Unable to submit your application."));
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <main className="page"><SiteHeader /><p className="page-feedback">Loading opportunity…</p></main>;
  if (error) return <main className="page"><SiteHeader /><section className="page-feedback error"><p>{error}</p><button type="button" onClick={load}>Try again</button><Link to="/jobs">Browse all jobs</Link></section></main>;

  const deadline = job.application_deadline && new Date(`${job.application_deadline}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const salaryMin = formatMoney(job.salary_min, job.salary_currency);
  const salaryMax = formatMoney(job.salary_max, job.salary_currency);
  const salary = salaryMin && salaryMax ? `${salaryMin} – ${salaryMax}` : salaryMin || salaryMax;

  return <main className="page">
    <SiteHeader />
    <section className="job-detail-shell">
      <div className="job-detail-main">
        <Link className="back" to="/jobs">← All opportunities</Link>
        <p className="eyebrow">{job.category_name || humanize(job.job_type)}</p>
        <h1>{job.title}</h1>
        <p className="company-byline"><Link to={`/companies/${job.company}`}>{job.company_name}</Link> · {job.location}</p>
        <div className="detail-pills"><span>{humanize(job.job_type)}</span><span>{humanize(job.work_mode)}</span>{job.experience_level && <span>{job.experience_level}</span>}{salary && <span>{salary}</span>}</div>
        <section className="detail-section"><h2>About the role</h2><p>{job.description}</p></section>
        {job.responsibilities && <section className="detail-section"><h2>What you’ll do</h2><p>{job.responsibilities}</p></section>}
        <section className="detail-section"><h2>Requirements</h2><p>{job.requirements || "No additional requirements listed."}</p>{job.skills_required && <div className="skill-chips">{job.skills_required.split(",").map((skill) => <span key={skill}>{skill.trim()}</span>)}</div>}</section>
        {job.education_required && <section className="detail-section"><h2>Education</h2><p>{job.education_required}</p></section>}
      </div>
      <aside className="application-panel">
        <p className="eyebrow">APPLICATION</p>
        <h2>Ready to apply?</h2>
        {deadline && <p>Applications close <b>{deadline}</b>.</p>}
        {application ? <div className="application-status"><strong>Application {humanize(application.status)}</strong><p>You applied on {new Date(application.applied_at).toLocaleDateString()}.</p><Link to="/my-applications">View application</Link></div> : user?.role === "student" ? <>
          <button className="action-button" type="button" onClick={() => setShowApplication((visible) => !visible)}>{showApplication ? "Close application" : "Apply now"}</button>
          <button className="secondary-button" type="button" disabled={saving} onClick={saveJob}>{saving ? "Saving…" : "Save job"}</button>
        </> : !isAuthenticated ? <Link className="action-button" to="/login" state={{ from: { pathname: `/jobs/${id}` } }}>Log in to apply</Link> : <p className="muted">Only student accounts can apply for opportunities.</p>}
        {message && <p className={message.includes("submitted") || message.includes("Saved") ? "form-success" : "form-error"}>{message}</p>}
        {showApplication && <form className="application-form" onSubmit={submitApplication}><label>Cover letter <span className="optional">Optional</span><textarea value={form.cover_letter} onChange={(event) => setForm({ ...form, cover_letter: event.target.value })} placeholder="Briefly introduce yourself and explain your interest." rows="6" /></label><label>CV / résumé <span className="optional">Optional</span><input type="file" accept=".pdf,.doc,.docx" onChange={(event) => setForm({ ...form, cv: event.target.files?.[0] || null })} /></label><button className="action-button" disabled={applying}>{applying ? "Submitting…" : "Submit application"}</button></form>}
      </aside>
    </section>
  </main>;
}
