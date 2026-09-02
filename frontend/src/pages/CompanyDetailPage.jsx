import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import JobCard from "../components/JobCard";
import SiteHeader from "../components/SiteHeader";
import api from "../services/api";

const getItems = (data) => data?.results || data || [];

export default function CompanyDetailPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [companyResponse, jobsResponse] = await Promise.all([
        api.get(`/companies/${id}/`),
        api.get("/jobs/"),
      ]);
      setCompany(companyResponse.data);
      setJobs(getItems(jobsResponse.data).filter((job) => String(job.company) === String(id)));
    } catch (requestError) {
      setError(requestError.response?.status === 404 ? "This company could not be found." : "We couldn’t load this company right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <main className="page"><SiteHeader /><p className="page-feedback">Loading company…</p></main>;
  if (error) return <main className="page"><SiteHeader /><section className="page-feedback error"><p>{error}</p><button type="button" onClick={load}>Try again</button><Link to="/companies">Browse companies</Link></section></main>;

  const location = [company.city, company.country].filter(Boolean).join(", ");
  return <main className="page">
    <SiteHeader />
    <section className="company-hero">
      {company.company_logo ? <img className="company-logo large" src={company.company_logo} alt={`${company.company_name} logo`} /> : <div className="company-mark large" aria-hidden="true">{company.company_name?.[0] || "C"}</div>}
      <div><p className="eyebrow">{company.industry || "COMPANY"}</p><h1>{company.company_name}</h1><p className="intro">{company.description || "This employer has not added a company description yet."}</p><div className="company-meta">{location && <span>{location}</span>}{company.company_size && <span>{company.company_size} team</span>}{company.founded_year && <span>Founded {company.founded_year}</span>}</div>{company.website && <a className="external-link" href={company.website} target="_blank" rel="noreferrer">Visit website ↗</a>}</div>
    </section>
    <section className="content-section">
      <div className="section-heading"><div><p className="eyebrow">OPEN ROLES</p><h2>Opportunities at {company.company_name}</h2></div><Link to="/companies">All companies →</Link></div>
      {jobs.length ? <div className="job-grid">{jobs.map((job) => <JobCard key={job.id} job={job} />)}</div> : <div className="empty-state compact"><h3>No open roles right now</h3><p>Save this company and check back later for new opportunities.</p></div>}
    </section>
  </main>;
}
