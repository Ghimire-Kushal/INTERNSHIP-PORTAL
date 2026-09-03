import { useState } from "react";
import SiteHeader from "../components/SiteHeader";
import api from "../services/api";

export default function AccountSecurityPage() {
  const [form, setForm] = useState({ current_password: "", new_password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); setMessage(""); try { const { data } = await api.post("/auth/change-password/", form); setMessage(data.detail); setForm({ current_password: "", new_password: "" }); } catch (requestError) { setError(Object.values(requestError.response?.data || {}).flat().join(" ") || "Unable to change your password."); } finally { setBusy(false); } };
  return <main className="page"><SiteHeader /><section className="profile-shell"><div className="page-heading"><div><p className="eyebrow">ACCOUNT SECURITY</p><h1>Keep your account secure.</h1><p className="intro">Update your password whenever you need to.</p></div></div><form className="profile-form" onSubmit={submit}><section className="profile-card"><h2>Change password</h2><label>Current password<input required type="password" value={form.current_password} onChange={(event) => setForm({ ...form, current_password: event.target.value })} /></label><label>New password<input required minLength="8" type="password" value={form.new_password} onChange={(event) => setForm({ ...form, new_password: event.target.value })} /></label>{error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}<button className="action-button profile-save" disabled={busy}>{busy ? "Updating…" : "Update password"}</button></section></form></section></main>;
}
