import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get(`/jobs/${id}/`).then(({ data }) => setJob(data));
  }, [id]);

  const saveJob = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.post("/applications/saved/", { job: job.id });
      setMessage("Saved to your list.");
    } catch (error) {
      setMessage(error.response?.data?.detail || "Unable to save this job.");
    } finally {
      setSaving(false);
    }
  };

  if (!job) return <p className="auth-loading">Loading job…</p>;

  return <main className="page"><nav><Link className="brand" to="/">CareerBridge</Link><Link to="/jobs">All jobs</Link></nav><section className="hero"><p className="eyebrow">{job.company_name} · {job.location}</p><h1>{job.title}</h1><p className="intro">{job.description}</p>{user?.role === "student" && <><button className="action-button" disabled={saving} onClick={saveJob}>{saving ? "Saving…" : "Save job"}</button>{message && <p className="form-error">{message}</p>}</>}<h2>Requirements</h2><p>{job.requirements || "No additional requirements listed."}</p></section></main>;
}
