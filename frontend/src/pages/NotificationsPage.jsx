import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import api from "../services/api";

const getItems = (data) => data?.results || data || [];

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/notifications/");
      setItems(getItems(data));
    } catch {
      setError("We couldn’t load your notifications right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (notification) => {
    if (notification.is_read) return;
    setBusy(true);
    setError("");
    try {
      await api.patch(`/notifications/${notification.id}/read/`);
      setItems((current) => current.map((item) => item.id === notification.id ? { ...item, is_read: true } : item));
    } catch {
      setError("Unable to mark this notification as read.");
    } finally {
      setBusy(false);
    }
  };

  const readAll = async () => {
    setBusy(true);
    setError("");
    try {
      await api.patch("/notifications/read-all/");
      setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    } catch {
      setError("Unable to mark notifications as read.");
    } finally {
      setBusy(false);
    }
  };

  const unread = items.filter((item) => !item.is_read).length;

  return <main className="page"><SiteHeader /><section className="profile-shell notifications-shell"><div className="page-heading"><div><p className="eyebrow">NOTIFICATIONS</p><h1>Stay in the loop.</h1><p className="intro">Get updates as applications move and interviews are scheduled.</p></div>{unread > 0 && <button className="secondary-button inline-button" disabled={busy} onClick={readAll}>Mark {unread} as read</button>}</div>{error && <div className="page-feedback error"><p>{error}</p><button type="button" onClick={load}>Try again</button></div>}{loading ? <p className="page-feedback">Loading notifications…</p> : items.length ? <div className="notification-list">{items.map((notification) => <button type="button" className={`notification-card ${notification.is_read ? "read" : "unread"}`} key={notification.id} disabled={busy} onClick={() => markRead(notification)}><span className="notification-dot" aria-hidden="true" /><span><strong>{notification.title}</strong><p>{notification.message}</p><small>{new Date(notification.created_at).toLocaleString()}</small></span>{!notification.is_read && <em>Mark read</em>}</button>)}</div> : <div className="empty-state"><h2>No notifications yet</h2><p>Updates about applications and interviews will appear here.</p><Link className="action-button" to="/dashboard">Back to dashboard</Link></div>}</section></main>;
}
