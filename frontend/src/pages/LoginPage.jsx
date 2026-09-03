import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function LoginPage() {
  const { login } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" }); const [error, setError] = useState(""); const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => { event.preventDefault(); setError(""); setSubmitting(true); try { await login(form); navigate(location.state?.from?.pathname || "/dashboard", { replace: true }); } catch (err) { setError(err.response?.data?.detail || "Unable to sign in. Check your credentials."); } finally { setSubmitting(false); } };
  return <AuthShell title="Welcome back" subtitle="Sign in to manage your career journey."><form onSubmit={submit}><label>Username<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label><label>Password<input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>{error && <p className="form-error">{error}</p>}<button disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button></form><p className="auth-links"><Link to="/forgot-password">Forgot password?</Link><span>New here? <Link to="/register">Create an account</Link></span></p></AuthShell>;
}
export function AuthShell({ title, subtitle, children }) { const { theme, toggleTheme } = useTheme(); return <main className="auth-page"><div className="auth-topbar"><Link className="brand" to="/">CareerBridge</Link><button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "day" : "night"} mode`}><span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span><span>{theme === "dark" ? "Day mode" : "Night mode"}</span></button></div><section className="auth-card"><h1>{title}</h1><p>{subtitle}</p>{children}</section></main>; }
