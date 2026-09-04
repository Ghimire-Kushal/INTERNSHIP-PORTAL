import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import api from "../services/api";

const statuses = ["applied", "under_review", "shortlisted", "interview", "selected", "rejected", "withdrawn"];
const label = (value) => value.replaceAll("_", " ");
const getItems = (data) => data?.results || data || [];

export default function EmployerApplicationsPage() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [interview, setInterview] = useState({ scheduled_at: "", interview_type: "online", location_or_link: "", notes: "" });
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const loadJobs = async () => {
    setLoadingJobs(true);
    setError("");
    try {
      const { data } = await api.get("/jobs/mine/");
      const items = getItems(data);
      setJobs(items);
      const requestedId = searchParams.get("job");
      setJobId(items.some((job) => String(job.id) === requestedId) ? requestedId : items[0] ? String(items[0].id) : "");
    } catch {
      setError("Unable to load your jobs.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadApplications = async () => {
    if (!jobId) {
      setApplications([]);
      return;
    }
    setLoadingApplications(true);
    setError("");
    try {
      const { data } = await api.get(`/applications/jobs/${jobId}/applicants/`, { params: { status: statusFilter || undefined, search: search || undefined } });
      setApplications(getItems(data));
    } catch {
      setError("Unable to load applicants for this job.");
    } finally {
      setLoadingApplications(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);
  useEffect(() => { loadApplications(); }, [jobId, statusFilter]);

  const submitSearch = (event) => { event.preventDefault(); loadApplications(); };

  const updateStatus = async (application, status) => {
    setBusyId(application.id);
    setError("");
    setMessage("");
    try {
      const { data } = await api.patch(`/applications/${application.id}/status/`, { status });
      setApplications((items) => items.map((item) => item.id === application.id ? data : item));
      setMessage("Applicant status updated.");
    } catch {
      setError("Unable to update this application.");
    } finally {
      setBusyId(null);
    }
  };

  const scheduleInterview = async (event) => {
    event.preventDefault();
    setBusyId(selectedApplication.id);
    setError("");
    try {
      await api.post("/applications/interviews/", { ...interview, application: selectedApplication.id });
      setApplications((items) => items.map((item) => item.id === selectedApplication.id ? { ...item, status: "interview" } : item));
      setSelectedApplication(null);
      setInterview({ scheduled_at: "", interview_type: "online", location_or_link: "", notes: "" });
      setMessage("Interview scheduled and the applicant has been moved to interview.");
    } catch {
      setError("Unable to schedule this interview.");
    } finally {
      setBusyId(null);
    }
  };

  const loading = loadingJobs || loadingApplications;

  return <main className="page">
    <SiteHeader />
    <section className="profile-shell applicants-shell"><div className="page-heading"><div><p className="eyebrow">EMPLOYER TOOLS</p><h1>Review applicants.</h1><p className="intro">Keep every candidate moving with a clear and current application status.</p></div><Link className="secondary-button inline-button" to="/employer/jobs">Manage jobs</Link></div>
      {jobs.length > 0 && <label className="job-picker">Job posting<select value={jobId} onChange={(event) => setJobId(event.target.value)}>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select></label>}
      {jobs.length > 0 && <form className="jobs-search applicant-search" onSubmit={submitSearch}><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applicants by name or email" /><button type="submit">Search</button><select aria-label="Filter applicants by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></form>}
      {message && <p className="form-success">{message}</p>}
      {error && <div className="page-feedback error"><p>{error}</p><button type="button" onClick={jobId ? loadApplications : loadJobs}>Try again</button></div>}
      {loading ? <p className="page-feedback">Loading applicants…</p> : !jobs.length ? <div className="empty-state"><h2>Post a job to begin</h2><p>Once candidates apply, you can review and manage them here.</p><Link className="action-button" to="/employer/jobs/create">Post a job</Link></div> : applications.length ? <div className="applicant-list">{applications.map((application) => <article className="applicant-card" key={application.id}><div><div className="job-status-row"><span className={`status-pill ${application.status}`}>{label(application.status)}</span><span>Applied {new Date(application.applied_at).toLocaleDateString()}</span></div><h2>{application.student_name || application.student_email}</h2><p>{application.student_email}</p>{application.cover_letter && <p className="cover-letter">{application.cover_letter}</p>}{application.cv && <a className="external-link" href={application.cv} target="_blank" rel="noreferrer">View CV ↗</a>}</div><div className="applicant-actions"><label>Status<select disabled={busyId === application.id || application.status === "withdrawn"} value={application.status} onChange={(event) => updateStatus(application, event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></label>{application.status !== "withdrawn" && <button className="secondary-button" type="button" disabled={busyId === application.id} onClick={() => setSelectedApplication(application)}>Schedule interview</button>}</div></article>)}</div> : <div className="empty-state compact"><h2>No applications for this job yet</h2><p>Share your posting to reach more candidates.</p></div>}
      {selectedApplication && <section className="interview-card"><div className="section-heading"><div><p className="eyebrow">INTERVIEW</p><h2>Schedule with {selectedApplication.student_name || selectedApplication.student_email}</h2></div></div><form className="resource-form" onSubmit={scheduleInterview}><label>Date and time<input required type="datetime-local" value={interview.scheduled_at} onChange={(event) => setInterview({ ...interview, scheduled_at: event.target.value })} /></label><label>Format<select value={interview.interview_type} onChange={(event) => setInterview({ ...interview, interview_type: event.target.value })}><option value="online">Online</option><option value="in_person">In person</option><option value="phone">Phone</option></select></label><label>Location or meeting link<input required value={interview.location_or_link} onChange={(event) => setInterview({ ...interview, location_or_link: event.target.value })} /></label><label>Notes<textarea value={interview.notes} onChange={(event) => setInterview({ ...interview, notes: event.target.value })} /></label><div className="form-actions"><button disabled={busyId === selectedApplication.id}>{busyId === selectedApplication.id ? "Scheduling…" : "Schedule interview"}</button><button type="button" className="secondary-button" onClick={() => setSelectedApplication(null)}>Cancel</button></div></form></section>}
    </section>
  </main>;
}
