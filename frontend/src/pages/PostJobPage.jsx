import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import api from "../services/api";

const blank = {
  title: "", category: "", description: "", responsibilities: "", requirements: "", skills_required: "", location: "", job_type: "full_time", work_mode: "onsite", experience_level: "", education_required: "", salary_min: "", salary_max: "", salary_currency: "NPR", number_of_openings: "1", application_deadline: "", status: "open",
};
const getItems = (data) => data?.results || data || [];

export default function PostJobPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [categoriesResponse, jobResponse] = await Promise.all([
        api.get("/jobs/categories/"),
        isEditing ? api.get(`/jobs/${id}/`) : Promise.resolve(null),
      ]);
      setCategories(getItems(categoriesResponse.data));
      if (jobResponse) setForm({ ...blank, ...jobResponse.data, category: jobResponse.data.category ? String(jobResponse.data.category) : "", salary_min: jobResponse.data.salary_min ?? "", salary_max: jobResponse.data.salary_max ?? "", number_of_openings: jobResponse.data.number_of_openings ?? "1" });
    } catch (requestError) {
      setError(requestError.response?.status === 404 ? "This job posting could not be found." : "We couldn’t load the job form right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const payload = {
      ...form,
      category: form.category || null,
      salary_min: form.salary_min === "" ? null : form.salary_min,
      salary_max: form.salary_max === "" ? null : form.salary_max,
      number_of_openings: Number(form.number_of_openings || 1),
    };
    try {
      if (isEditing) await api.patch(`/jobs/${id}/`, payload);
      else await api.post("/jobs/", payload);
      navigate("/employer/jobs");
    } catch (requestError) {
      const data = requestError.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : `Unable to ${isEditing ? "update" : "publish"} this job.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="page"><SiteHeader /><p className="page-feedback">Loading job form…</p></main>;

  return <main className="page">
    <SiteHeader />
    <section className="job-form-shell">
      <div className="page-heading"><div><p className="eyebrow">EMPLOYER TOOLS</p><h1>{isEditing ? "Edit job posting" : "Post a new opportunity"}</h1><p className="intro">Clear details help the right candidates recognize a good fit.</p></div><Link className="back" to="/employer/jobs">← Manage jobs</Link></div>
      {error && <div className="page-feedback error"><p>{error}</p>{!submitting && <button type="button" onClick={load}>Try again</button>}</div>}
      <form className="job-form" onSubmit={submit}>
        <section className="profile-card"><h2>Role overview</h2><div className="form-grid"><Input label="Job title" required value={form.title} onChange={(value) => update("title", value)} /><label>Category<select value={form.category} onChange={(event) => update("category", event.target.value)}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Employment type<select value={form.job_type} onChange={(event) => update("job_type", event.target.value)}><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="contract">Contract</option><option value="temporary">Temporary</option><option value="freelance">Freelance</option><option value="internship">Internship</option></select></label><label>Work style<select value={form.work_mode} onChange={(event) => update("work_mode", event.target.value)}><option value="onsite">On-site</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option></select></label><Input label="Location" required value={form.location} onChange={(value) => update("location", value)} /><Input label="Application deadline" required type="date" value={form.application_deadline} onChange={(value) => update("application_deadline", value)} /></div><label>Job description<textarea required rows="7" value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Explain the impact, day-to-day work, and why this role matters." /></label></section>
        <section className="profile-card"><h2>Candidate fit</h2><label>Responsibilities<textarea rows="5" value={form.responsibilities} onChange={(event) => update("responsibilities", event.target.value)} /></label><label>Requirements<textarea rows="5" value={form.requirements} onChange={(event) => update("requirements", event.target.value)} /></label><div className="form-grid"><Input label="Skills required" value={form.skills_required} onChange={(value) => update("skills_required", value)} placeholder="React, Django, communication" /><Input label="Experience level" value={form.experience_level} onChange={(value) => update("experience_level", value)} placeholder="e.g. 1–3 years" /><Input label="Education required" value={form.education_required} onChange={(value) => update("education_required", value)} placeholder="e.g. Bachelor’s degree" /></div></section>
        <section className="profile-card"><h2>Compensation and publishing</h2><div className="form-grid"><Input label="Minimum salary" type="number" min="0" value={form.salary_min} onChange={(value) => update("salary_min", value)} /><Input label="Maximum salary" type="number" min="0" value={form.salary_max} onChange={(value) => update("salary_max", value)} /><Input label="Currency" value={form.salary_currency} onChange={(value) => update("salary_currency", value)} /><Input label="Number of openings" required type="number" min="1" value={form.number_of_openings} onChange={(value) => update("number_of_openings", value)} /><label>Posting status<select value={form.status} onChange={(event) => update("status", event.target.value)}><option value="draft">Save as draft</option><option value="open">Open for applications</option><option value="closed">Closed</option></select></label></div></section>
        <div className="form-actions"><button className="action-button" disabled={submitting}>{submitting ? "Saving…" : isEditing ? "Save changes" : form.status === "draft" ? "Save draft" : "Publish job"}</button><Link className="secondary-button inline-button" to="/employer/jobs">Cancel</Link></div>
      </form>
    </section>
  </main>;
}

function Input({ label, value, onChange, required = false, type = "text", ...props }) {
  return <label>{label}<input type={type} required={required} value={value ?? ""} onChange={(event) => onChange(event.target.value)} {...props} /></label>;
}
