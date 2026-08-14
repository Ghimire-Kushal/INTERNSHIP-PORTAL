import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function HomePage() {
  const [connection, setConnection] = useState({ loading: true, success: false, message: "Connecting to backend…" });

  useEffect(() => {
    api.get("/health/")
      .then(({ data }) => setConnection({ loading: false, success: true, message: data.message }))
      .catch(() => setConnection({ loading: false, success: false, message: "Backend unavailable. Start Django at http://127.0.0.1:8000." }));
  }, []);

  return <main className="page">
    <nav><Link className="brand" to="/">CareerBridge</Link><div><Link to="/jobs">Jobs</Link><Link to="/internships">Internships</Link><Link to="/companies">Companies</Link><Link to="/login">Login</Link><Link to="/register">Register</Link></div></nav>
    <section className="hero">
      <p className="eyebrow">JOB & INTERNSHIP PORTAL</p>
      <h1>Find the opportunity that moves you forward.</h1>
      <p className="intro">A single place for students to discover careers and for employers to meet their next great hire.</p>
      <div className={`connection ${connection.success ? "success" : "pending"}`}>
        <span>{connection.loading ? "●" : connection.success ? "✓" : "!"}</span>{connection.message}
      </div>
    </section>
  </main>;
}
