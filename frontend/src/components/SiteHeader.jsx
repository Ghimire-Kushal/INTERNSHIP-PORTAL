import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SiteHeader() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const closeMenu = () => setOpen(false);
  return <header className="site-header">
    <nav className="site-nav" aria-label="Primary navigation">
      <Link className="brand" to="/" onClick={closeMenu}><span className="brand-mark" aria-hidden="true">C</span>CareerBridge</Link>
      <button className="mobile-toggle" type="button" aria-expanded={open} aria-controls="primary-links" onClick={() => setOpen((value) => !value)}>{open ? "Close" : "Menu"}</button>
      <div id="primary-links" className={`nav-links ${open ? "open" : ""}`}>
        <Link className={isActive("/jobs") ? "active" : ""} to="/jobs" onClick={closeMenu}>Browse jobs</Link>
        <Link className={isActive("/internships") ? "active" : ""} to="/internships" onClick={closeMenu}>Internships</Link>
        <Link className={isActive("/companies") ? "active" : ""} to="/companies" onClick={closeMenu}>Companies</Link>
        {isAuthenticated ? <>
          <Link className={isActive("/dashboard") ? "active" : ""} to="/dashboard" onClick={closeMenu}>Dashboard</Link>
          {user?.role === "student" && <><Link className={isActive("/saved-jobs") ? "active" : ""} to="/saved-jobs" onClick={closeMenu}>Saved jobs</Link><Link className={isActive("/my-applications") ? "active" : ""} to="/my-applications" onClick={closeMenu}>Applications</Link></>}
          {user?.role === "employer" && <Link className={isActive("/employer/jobs") ? "active" : ""} to="/employer/jobs" onClick={closeMenu}>Manage jobs</Link>}
          <Link className={isActive("/notifications") ? "active" : ""} to="/notifications" onClick={closeMenu}>Notifications</Link>
          <Link className={isActive("/account/security") ? "active" : ""} to="/account/security" onClick={closeMenu}>Account</Link>
          <button className="link-button" type="button" onClick={() => { closeMenu(); handleLogout(); }}>Log out</button>
        </> : <>
          <Link to="/login" onClick={closeMenu}>Log in</Link>
          <Link className="nav-cta" to="/register" onClick={closeMenu}>Get started</Link>
        </>}
      </div>
    </nav>
  </header>;
}
