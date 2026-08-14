import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const blank = { company_name: "", industry: "", company_size: "", description: "", website: "", email: "", phone: "", city: "", country: "" };
export default function CompanyProfilePage() {
  const [company, setCompany] = useState(blank); const [message, setMessage] = useState("");
  useEffect(() => { api.get("/companies/me/").then(({ data }) => setCompany(data)).catch(() => setMessage("Company profiles are only available to employer accounts.")); }, []);
  const submit = async (event) => { event.preventDefault(); try { const { data } = await api.patch("/companies/me/", company); setCompany(data); setMessage("Company profile saved."); } catch (error) { const data = error.response?.data; setMessage(data ? Object.values(data).flat().join(" ") : "Unable to save company profile."); } };
  return <main className="auth-page"><Link className="brand" to="/dashboard">CareerBridge</Link><section className="auth-card"><h1>Company profile</h1><form onSubmit={submit}><label>Company name<input required value={company.company_name || ""} onChange={(e) => setCompany({ ...company, company_name: e.target.value })} /></label><label>Industry<input value={company.industry || ""} onChange={(e) => setCompany({ ...company, industry: e.target.value })} /></label><label>Description<textarea value={company.description || ""} onChange={(e) => setCompany({ ...company, description: e.target.value })} /></label><div className="name-row"><label>City<input value={company.city || ""} onChange={(e) => setCompany({ ...company, city: e.target.value })} /></label><label>Country<input value={company.country || ""} onChange={(e) => setCompany({ ...company, country: e.target.value })} /></label></div>{message && <p>{message}</p>}<button>Save company</button></form></section></main>;
}
