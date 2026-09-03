import { Link } from "react-router-dom";

const humanize = (value = "") => value.replaceAll("_", " ");

export default function JobCard({ job, showMatch = false }) {
  const deadline = job.application_deadline ? new Date(`${job.application_deadline}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : null;

  return <Link className="job-card" to={`/jobs/${job.id}`}>
    <div className="job-card-topline">
      <div className="company-mark" aria-hidden="true">{job.company_name?.[0] || "C"}</div>
      {showMatch && typeof job.match_percentage === "number" && <span className="match-pill">{job.match_percentage}% match</span>}
    </div>
    <p>{job.company_name || "Company"}</p>
    <h2>{job.title}</h2>
    <span>{job.location || "Location flexible"} · {humanize(job.work_mode) || "Work mode flexible"}</span>
    {(job.salary_min || job.salary_max || job.skills_required) && <div className="job-card-meta">{job.salary_min || job.salary_max ? <span>{job.salary_min && job.salary_max ? `${job.salary_min} – ${job.salary_max}` : `Salary disclosed`}</span> : null}{job.skills_required && <span>{job.skills_required.split(",").slice(0, 2).map((skill) => skill.trim()).join(" · ")}</span>}</div>}
    <footer>
      <b>{humanize(job.job_type)}</b>
      <em>{deadline ? `Closes ${deadline}` : "View role →"}</em>
    </footer>
  </Link>;
}
