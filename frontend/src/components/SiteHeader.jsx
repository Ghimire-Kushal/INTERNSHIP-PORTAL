import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SiteHeader() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return <header className="site-header">
    <nav className="site-nav" aria-label="Primary navigation">
      <Link className="brand" to="/">CareerBridge</Link>
      <div className="nav-links">
        <Link to="/jobs">Jobs</Link>
        <Link to="/internships">Internships</Link>
        <Link to="/companies">Companies</Link>
        {isAuthenticated ? <>
          <Link to="/dashboard">Dashboard</Link>
          {user?.role === "student" && <Link to="/my-applications">Applications</Link>}
          {user?.role === "employer" && <Link to="/employer/applications">Applicants</Link>}
          <Link to="/notifications">Notifications</Link>
          <Link to="/account/security">Security</Link>
          <button className="link-button" type="button" onClick={handleLogout}>Log out</button>
        </> : <>
          <Link to="/login">Log in</Link>
          <Link className="nav-cta" to="/register">Get started</Link>
        </>}
      </div>
    </nav>
  </header>;
}
