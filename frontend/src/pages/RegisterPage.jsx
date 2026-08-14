import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "./LoginPage";
import { useAuth } from "../context/AuthContext";

const initial = { first_name: "", last_name: "", username: "", email: "", password: "", role: "student" };
export default function RegisterPage() {
  const { register } = useAuth(); const navigate = useNavigate(); const [form, setForm] = useState(initial); const [error, setError] = useState(""); const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => { event.preventDefault(); setError(""); setSubmitting(true); try { await register(form); navigate("/login"); } catch (err) { const data = err.response?.data; setError(data ? Object.values(data).flat().join(" ") : "Unable to create your account."); } finally { setSubmitting(false); } };
  return <AuthShell title="Create your account" subtitle="Choose how you will use CareerBridge."><form onSubmit={submit}><div className="name-row"><label>First name<input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></label><label>Last name<input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></label></div><label>Username<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label><label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Password<input required minLength="8" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label><label>I am a<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="student">Student / job seeker</option><option value="employer">Employer</option></select></label>{error && <p className="form-error">{error}</p>}<button disabled={submitting}>{submitting ? "Creating account…" : "Create account"}</button></form><p>Already registered? <Link to="/login">Sign in</Link></p></AuthShell>;
}
