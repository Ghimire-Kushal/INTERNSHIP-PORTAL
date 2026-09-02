import { useEffect, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import api from "../services/api";

const editableFields = ["company_name", "industry", "company_size", "description", "website", "email", "phone", "address", "city", "country", "founded_year"];
const blank = editableFields.reduce((result, key) => ({ ...result, [key]: "" }), {});

export default function CompanyProfilePage() {
  const [company, setCompany] = useState(blank);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/companies/me/");
      setCompany({ ...blank, ...data });
    } catch {
      setError("We couldn’t load your company profile right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const payload = editableFields.reduce((result, key) => ({ ...result, [key]: company[key] === "" && key === "founded_year" ? null : company[key] }), {});
    try {
      let response;
      if (logoFile) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => { if (value !== null) formData.append(key, value); });
        formData.append("company_logo", logoFile);
        response = await api.patch("/companies/me/", formData);
      } else {
        response = await api.patch("/companies/me/", payload);
      }
      setCompany({ ...blank, ...response.data });
      setLogoFile(null);
      setMessage("Company profile saved.");
    } catch (requestError) {
      const data = requestError.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Unable to save your company profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="page"><SiteHeader /><p className="page-feedback">Loading company profile…</p></main>;

  return <main className="page">
    <SiteHeader />
    <section className="profile-shell">
      <div className="page-heading"><div><p className="eyebrow">EMPLOYER PROFILE</p><h1>Make a strong first impression.</h1><p className="intro">Your company profile appears alongside every role you publish.</p></div>{company.is_verified && <span className="verified-pill">Verified employer</span>}</div>
      {error && <div className="page-feedback error"><p>{error}</p><button type="button" onClick={load}>Try again</button></div>}
      <form className="profile-form" onSubmit={submit}>
        <section className="profile-card"><div className="section-heading"><div><h2>Company details</h2><p>Tell candidates who you are and what you do.</p></div></div><div className="form-grid"><Input label="Company name" required value={company.company_name} onChange={(value) => setCompany({ ...company, company_name: value })} /><Input label="Industry" value={company.industry} onChange={(value) => setCompany({ ...company, industry: value })} /><label>Company size<select value={company.company_size || ""} onChange={(event) => setCompany({ ...company, company_size: event.target.value })}><option value="">Select company size</option><option value="1–10">1–10 employees</option><option value="11–50">11–50 employees</option><option value="51–200">51–200 employees</option><option value="201–500">201–500 employees</option><option value="501+">501+ employees</option></select></label><Input label="Founded year" type="number" value={company.founded_year ?? ""} onChange={(value) => setCompany({ ...company, founded_year: value })} /></div><label>Company description<textarea value={company.description || ""} rows="6" onChange={(event) => setCompany({ ...company, description: event.target.value })} placeholder="Describe your mission, culture, and the work your team does." /></label></section>
        <section className="profile-card"><div className="section-heading"><div><h2>Contact and location</h2><p>Give candidates a reliable way to learn more.</p></div></div><div className="form-grid"><Input label="Website" type="url" value={company.website} onChange={(value) => setCompany({ ...company, website: value })} /><Input label="Company email" type="email" value={company.email} onChange={(value) => setCompany({ ...company, email: value })} /><Input label="Phone" value={company.phone} onChange={(value) => setCompany({ ...company, phone: value })} /><Input label="Address" value={company.address} onChange={(value) => setCompany({ ...company, address: value })} /><Input label="City" value={company.city} onChange={(value) => setCompany({ ...company, city: value })} /><Input label="Country" value={company.country} onChange={(value) => setCompany({ ...company, country: value })} /></div><label>Company logo <span className="optional">PNG, JPG, or WEBP</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLogoFile(event.target.files?.[0] || null)} />{company.company_logo && <img className="company-logo preview" src={company.company_logo} alt="Current company logo" />}</label></section>
        {message && <p className="form-success">{message}</p>}<button className="action-button profile-save" disabled={saving}>{saving ? "Saving company…" : "Save company profile"}</button>
      </form>
    </section>
  </main>;
}

function Input({ label, type = "text", value, onChange, required = false }) {
  return <label>{label}<input required={required} type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></label>;
}
