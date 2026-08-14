import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const statuses = ["under_review", "shortlisted", "interview", "selected", "rejected"];
const label = (value) => value.replaceAll("_", " ");

export default function EmployerApplicationsPage() {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [interview, setInterview] = useState({ scheduled_at: "", interview_type: "online", location_or_link: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/jobs/mine/")
      .then(({ data }) => {
        const items = data.results || data;
        setJobs(items);
        if (items.length) setJobId(String(items[0].id));
      })
      .catch(() => setError("Unable to load your jobs."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    api.get(`/applications/jobs/${jobId}/applicants/`)
      .then(({ data }) => setApplications(data.results || data))
      .catch(() => setError("Unable to load applicants."))
      .finally(() => setLoading(false));
  }, [jobId]);

  const updateStatus = async (application, status) => {
    try {
      const { data } = await api.patch(`/applications/${application.id}/status/`, { status });
      setApplications((items) => items.map((item) => item.id === application.id ? data : item));
    } catch {
      setError("Unable to update this application.");
    }
  };

  const scheduleInterview = async (event) => {
    event.preventDefault();
    try {
      await api.post("/applications/interviews/", { ...interview, application: selectedApplication.id });
      await updateStatus(selectedApplication, "interview");
      setSelectedApplication(null);
      setInterview({ scheduled_at: "", interview_type: "online", location_or_link: "", notes: "" });
    } catch {
      setError("Unable to schedule this interview.");
    }
  };

  return <main className="page"><nav><Link className="brand" to="/dashboard">CareerBridge</Link><Link to="/employer/jobs/create">Post job</Link><Link to="/interviews">Interviews</Link></nav><section className="hero"><p className="eyebrow">EMPLOYER</p><h1>Review applicants</h1>{jobs.length > 0 && <label>Job posting<select value={jobId} onChange={(event) => setJobId(event.target.value)}>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select></label>}{loading ? <p>Loading…</p> : error ? <p className="form-error">{error}</p> : !jobs.length ? <p>Post a job to begin receiving applications.</p> : applications.length ? <div className="job-list">{applications.map((application) => <article className="job-card" key={application.id}><h2>{application.student_name || application.student_email}</h2><p>{application.student_email}</p><p>Applied {new Date(application.applied_at).toLocaleDateString()}</p><label>Status<select value={application.status} onChange={(event) => updateStatus(application, event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></label><button className="secondary-button" onClick={() => setSelectedApplication(application)}>Schedule interview</button></article>)}</div> : <p>No applications for this job yet.</p>}{selectedApplication && <section className="auth-card"><h2>Schedule interview</h2><p>{selectedApplication.student_name || selectedApplication.student_email}</p><form onSubmit={scheduleInterview}><label>Date and time<input required type="datetime-local" value={interview.scheduled_at} onChange={(event) => setInterview({ ...interview, scheduled_at: event.target.value })} /></label><label>Format<select value={interview.interview_type} onChange={(event) => setInterview({ ...interview, interview_type: event.target.value })}><option value="online">Online</option><option value="in_person">In person</option><option value="phone">Phone</option></select></label><label>Location or meeting link<input required value={interview.location_or_link} onChange={(event) => setInterview({ ...interview, location_or_link: event.target.value })} /></label><label>Notes<textarea value={interview.notes} onChange={(event) => setInterview({ ...interview, notes: event.target.value })} /></label><button>Schedule</button><button type="button" className="secondary-button" onClick={() => setSelectedApplication(null)}>Cancel</button></form></section>}</section></main>;
}
