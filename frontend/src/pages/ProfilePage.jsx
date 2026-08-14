import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const blank = { headline: "", bio: "", city: "", country: "", university: "", degree: "" };
export default function ProfilePage() {
  const [profile, setProfile] = useState(blank); const [loading, setLoading] = useState(true); const [message, setMessage] = useState("");
  useEffect(() => { api.get("/students/me/").then(({ data }) => setProfile(data)).catch(() => setMessage("Student profiles are only available to student accounts.")).finally(() => setLoading(false)); }, []);
  const submit = async (event) => {
    event.preventDefault(); setMessage("");
    const { headline, bio, city, country, university, degree } = profile;
    try {
      const { data } = await api.patch("/students/me/", { headline, bio, city, country, university, degree });
      setProfile(data); setMessage("Profile saved.");
    } catch (error) {
      const detail = error.response?.data;
      setMessage(detail ? Object.values(detail).flat().join(" ") : "Unable to save the profile.");
    }
  };
  if (loading) return <p className="auth-loading">Loading profile…</p>;
  return <main className="auth-page"><Link className="brand" to="/dashboard">CareerBridge</Link><section className="auth-card"><h1>Your profile</h1>{profile.profile_completion !== undefined && <p>Profile completion: {profile.profile_completion}%</p>}<form onSubmit={submit}><label>Professional headline<input value={profile.headline || ""} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} placeholder="e.g. BCSIT Student" /></label><label>Bio<textarea value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></label><div className="name-row"><label>City<input value={profile.city || ""} onChange={(e) => setProfile({ ...profile, city: e.target.value })} /></label><label>Country<input value={profile.country || ""} onChange={(e) => setProfile({ ...profile, country: e.target.value })} /></label></div><label>University<input value={profile.university || ""} onChange={(e) => setProfile({ ...profile, university: e.target.value })} /></label><label>Degree<input value={profile.degree || ""} onChange={(e) => setProfile({ ...profile, degree: e.target.value })} /></label>{message && <p>{message}</p>}<button>Save profile</button></form></section></main>;
}
