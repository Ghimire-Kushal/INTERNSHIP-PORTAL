import { useEffect, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import api from "../services/api";

const items = (data) => data?.results || data || [];
const initial = { name: "", keywords: "", location: "", job_type: "", work_mode: "" };

export default function JobAlertsPage() {
  const [alerts, setAlerts] = useState([]); const [form, setForm] = useState(initial); const [error, setError] = useState("");
  const load = () => api.get("/jobs/alerts/").then(({ data }) => setAlerts(items(data))).catch(() => setError("Unable to load job alerts."));
  useEffect(() => { load(); }, []);
  const create = async (event) => { event.preventDefault(); setError(""); try { const { data } = await api.post("/jobs/alerts/", form); setAlerts((current) => [data, ...current]); setForm(initial); } catch { setError("Unable to create this alert."); } };
  const remove = async (id) => { try { await api.delete(`/jobs/alerts/${id}/`); setAlerts((current) => current.filter((item) => item.id !== id)); } catch { setError("Unable to delete this alert."); } };
  return <main className="page"><SiteHeader /><section className="profile-shell"><div className="page-heading"><div><p className="eyebrow">JOB ALERTS</p><h1>Never miss a good fit.</h1><p className="intro">Save a search and get notified when matching roles are added.</p></div></div>{error && <p className="form-error">{error}</p>}<form className="resource-form" onSubmit={create}><label>Alert name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Remote frontend roles" /></label><label>Keywords<input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="React, Python, design" /></label><label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Kathmandu or Remote" /></label><label>Employment type<select value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })}><option value="">Any type</option><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="internship">Internship</option><option value="contract">Contract</option></select></label><label>Work style<select value={form.work_mode} onChange={(e) => setForm({ ...form, work_mode: e.target.value })}><option value="">Any style</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></label><button type="submit">Create alert</button></form><div className="resource-list">{alerts.map((alert) => <article className="resource-card" key={alert.id}><div><h2>{alert.name}</h2><p>{[alert.keywords, alert.location, alert.job_type, alert.work_mode].filter(Boolean).join(" · ") || "All new opportunities"}</p></div><button className="secondary-button" onClick={() => remove(alert.id)}>Delete</button></article>)}</div></section></main>;
}
