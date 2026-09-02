import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import JobCard from "../components/JobCard";
import SiteHeader from "../components/SiteHeader";
import api from "../services/api";

const getItems = (data) => data?.results || data || [];
const typeOptions = [
  ["", "All types"],
  ["full_time", "Full time"],
  ["part_time", "Part time"],
  ["contract", "Contract"],
  ["freelance", "Freelance"],
];

export default function JobsPage({ jobType = "", title = "Find your next opportunity", intro = "Explore live roles from companies looking for your skills." }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [jobsResponse, categoryResponse] = await Promise.all([
        api.get("/jobs/", { params: jobType ? { job_type: jobType } : {} }),
        api.get("/jobs/categories/"),
      ]);
      setJobs(getItems(jobsResponse.data));
      setCategories(getItems(categoryResponse.data));
    } catch {
      setError("We couldn’t load opportunities right now. Check that the backend is running, then try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [jobType]);

  const shownJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesQuery = !normalizedQuery || [job.title, job.company_name, job.location, job.skills_required]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      return matchesQuery
        && (!jobType || job.job_type === jobType)
        && (!category || String(job.category) === category)
        && (!workMode || job.work_mode === workMode)
        && (!type || job.job_type === type);
    });
  }, [category, jobType, jobs, query, type, workMode]);

  const handleSearch = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (query.trim()) next.set("search", query.trim());
    else next.delete("search");
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setCategory("");
    setWorkMode("");
    setType("");
    setQuery("");
    setSearchParams({}, { replace: true });
  };

  return <main className="page">
    <SiteHeader />
    <section className="listing-hero">
      <p className="eyebrow">{jobType === "internship" ? "INTERNSHIPS" : "OPEN ROLES"}</p>
      <h1>{title}</h1>
      <p className="intro">{intro}</p>
    </section>
    <section className="jobs-shell">
      <form className="jobs-search" onSubmit={handleSearch}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jobs, companies, locations, or skills" aria-label="Search opportunities" />
        <button type="submit" aria-label="Search opportunities">⌕</button>
      </form>
      <div className="filters" aria-label="Opportunity filters">
        <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Work style<select value={workMode} onChange={(event) => setWorkMode(event.target.value)}><option value="">All work styles</option><option value="onsite">On-site</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option></select></label>
        {!jobType && <label>Employment type<select value={type} onChange={(event) => setType(event.target.value)}>{typeOptions.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>}
        <button className="secondary-button filter-reset" type="button" onClick={clearFilters}>Clear filters</button>
      </div>
      {loading ? <p className="page-feedback">Loading opportunities…</p> : error ? <div className="page-feedback error"><p>{error}</p><button type="button" onClick={load}>Try again</button></div> : shownJobs.length ? <>
        <p className="results-summary">{shownJobs.length} {shownJobs.length === 1 ? "opportunity" : "opportunities"} available</p>
        <div className="job-grid">{shownJobs.map((job) => <JobCard job={job} key={job.id} />)}</div>
      </> : <div className="empty-state"><h2>No matching opportunities</h2><p>Try broadening your search or changing a filter.</p><button type="button" className="secondary-button" onClick={clearFilters}>Reset filters</button>{jobType === "internship" && <Link to="/jobs">Browse all jobs</Link>}</div>}
    </section>
  </main>;
}
