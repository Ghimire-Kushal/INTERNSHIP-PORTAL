import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthShell } from "./LoginPage";
import api from "../services/api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); setMessage(""); try { const { data } = await api.post("/auth/password-reset/", { email }); setMessage(data.detail); } catch (requestError) { setError(Object.values(requestError.response?.data || {}).flat().join(" ") || "Unable to request a reset link."); } finally { setBusy(false); } };
  return <AuthShell title="Reset your password" subtitle="Enter your email and we’ll send a development reset link."><form onSubmit={submit}><label>Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>{error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}<button disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button></form><p><Link to="/login">Back to sign in</Link></p></AuthShell>;
}

export default function PasswordResetPage() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { const { data } = await api.post("/auth/password-reset/confirm/", { uid, token, new_password: password }); setMessage(data.detail); } catch (requestError) { setError(Object.values(requestError.response?.data || {}).flat().join(" ") || "This reset link is invalid or expired."); } finally { setBusy(false); } };
  return <AuthShell title="Choose a new password" subtitle="Use at least 8 characters for your new password."><form onSubmit={submit}><label>New password<input required minLength="8" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message} <Link to="/login">Sign in</Link></p>}<button disabled={busy || Boolean(message)}>{busy ? "Saving…" : "Reset password"}</button></form></AuthShell>;
}
