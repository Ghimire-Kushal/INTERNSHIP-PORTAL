import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import api from "../services/api";

const getItems = (data) => data?.results || data || [];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/companies/");
      setCompanies(getItems(data));
    } catch {
      setError("We couldn’t load companies right now. Check that the backend is running, then try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visibleCompanies = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return companies;
    return companies.filter((company) => [company.company_name, company.industry, company.city, company.country]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalized));
  }, [companies, query]);

  return <main className="page">
    <SiteHeader />
    <section className="listing-hero">
      <p className="eyebrow">EMPLOYERS</p>
      <h1>Meet companies that are hiring.</h1>
      <p className="intro">Explore company profiles, learn what they do, and find their open opportunities.</p>
    </section>
    <section className="jobs-shell">
      <div className="jobs-search"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search companies, industries, or locations" aria-label="Search companies" /><button type="button" onClick={() => setQuery("")} aria-label="Clear company search">{query ? "×" : "⌕"}</button></div>
      {loading ? <p className="page-feedback">Loading companies…</p> : error ? <div className="page-feedback error"><p>{error}</p><button type="button" onClick={load}>Try again</button></div> : visibleCompanies.length ? <>
        <p className="results-summary">{visibleCompanies.length} {visibleCompanies.length === 1 ? "company" : "companies"}</p>
        <div className="company-grid">{visibleCompanies.map((company) => <Link className="company-card" key={company.id} to={`/companies/${company.id}`}>
          {company.company_logo ? <img className="company-logo" src={company.company_logo} alt={`${company.company_name} logo`} /> : <div className="company-mark" aria-hidden="true">{company.company_name?.[0] || "C"}</div>}
          <h2>{company.company_name}</h2><p>{company.industry || "Employer"}</p><span>{[company.city, company.country].filter(Boolean).join(", ") || "Location not listed"}</span>
        </Link>)}</div>
      </> : <div className="empty-state"><h2>No matching companies</h2><p>Try a different company name, industry, or location.</p><button type="button" className="secondary-button" onClick={() => setQuery("")}>Clear search</button></div>}
    </section>
  </main>;
}
