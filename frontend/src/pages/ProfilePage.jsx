import { useEffect, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import api from "../services/api";

const profileDefaults = {
  headline: "", bio: "", address: "", city: "", country: "", date_of_birth: "", gender: "", university: "", degree: "", graduation_year: "", current_semester: "", portfolio_url: "", linkedin_url: "", github_url: "", cv: null,
};
const getItems = (data) => data?.results || data || [];
const label = (value) => value.replaceAll("_", " ");

const educationFields = [
  { name: "institution_name", label: "Institution", required: true }, { name: "degree", label: "Degree", required: true }, { name: "field_of_study", label: "Field of study" },
  { name: "start_year", label: "Start year", type: "number", required: true }, { name: "end_year", label: "End year", type: "number" }, { name: "grade", label: "Grade / score" }, { name: "description", label: "Description", type: "textarea" },
];
const experienceFields = [
  { name: "company_name", label: "Company", required: true }, { name: "position", label: "Position", required: true }, { name: "employment_type", label: "Employment type" },
  { name: "start_date", label: "Start date", type: "date", required: true }, { name: "end_date", label: "End date", type: "date" }, { name: "currently_working", label: "I currently work here", type: "checkbox" }, { name: "description", label: "What did you do?", type: "textarea" },
];
const projectFields = [
  { name: "title", label: "Project title", required: true }, { name: "description", label: "Description", type: "textarea", required: true }, { name: "technology_used", label: "Technology used" },
  { name: "project_url", label: "Project URL", type: "url" }, { name: "github_url", label: "GitHub URL", type: "url" }, { name: "start_date", label: "Start date", type: "date" }, { name: "end_date", label: "End date", type: "date" },
];
const certificateFields = [
  { name: "certificate_name", label: "Certificate", required: true }, { name: "organization", label: "Issuing organization", required: true }, { name: "issue_date", label: "Issue date", type: "date", required: true },
  { name: "expiry_date", label: "Expiry date", type: "date" }, { name: "credential_id", label: "Credential ID" }, { name: "credential_url", label: "Credential URL", type: "url" },
];

function emptyForm(fields) {
  return fields.reduce((result, field) => ({ ...result, [field.name]: field.type === "checkbox" ? false : "" }), {});
}

function ResourceSection({ title, description, endpoint, items, fields, renderItem, onChanged, canCreate = true, emptyMessage }) {
  const [form, setForm] = useState(() => emptyForm(fields));
  const [editingId, setEditingId] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setForm(emptyForm(fields));
    setEditingId(null);
    setExpanded(false);
    setError("");
  };

  const edit = (item) => {
    const next = emptyForm(fields);
    fields.forEach((field) => {
      const value = item[field.name];
      next[field.name] = field.type === "checkbox" ? Boolean(value) : value ?? "";
    });
    setForm(next);
    setEditingId(item.id);
    setExpanded(true);
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const payload = {};
    fields.forEach((field) => {
      const value = form[field.name];
      payload[field.name] = (field.type === "number" || field.type === "date") && value === "" ? null : value;
    });
    try {
      if (editingId) await api.patch(`${endpoint}${editingId}/`, payload);
      else await api.post(endpoint, payload);
      await onChanged();
      reset();
    } catch (requestError) {
      const data = requestError.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Unable to save this item.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm(`Remove this ${title.slice(0, -1).toLowerCase()}?`)) return;
    setBusy(true);
    setError("");
    try {
      await api.delete(`${endpoint}${id}/`);
      await onChanged();
      if (editingId === id) reset();
    } catch {
      setError("Unable to remove this item.");
    } finally {
      setBusy(false);
    }
  };

  return <section className="profile-collection">
    <div className="collection-heading"><div><h2>{title}</h2><p>{description}</p></div>{canCreate && <button type="button" className="secondary-button small-button" onClick={() => { setExpanded((value) => !value); setEditingId(null); setForm(emptyForm(fields)); }}>Add {title.slice(0, -1)}</button>}</div>
    {error && <p className="form-error">{error}</p>}
    {expanded && <form className="resource-form" onSubmit={submit}>{fields.map((field) => <Field key={field.name} field={field} form={form} setForm={setForm} />)}<div className="form-actions"><button disabled={busy}>{busy ? "Saving…" : editingId ? `Save ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}</button><button type="button" className="secondary-button" onClick={reset}>Cancel</button></div></form>}
    <div className="resource-list">{items.length ? items.map((item) => <article key={item.id} className="resource-item"><div>{renderItem(item)}</div><div className="item-actions"><button type="button" className="link-button" disabled={busy} onClick={() => edit(item)}>Edit</button><button type="button" className="danger-link" disabled={busy} onClick={() => remove(item.id)}>Remove</button></div></article>) : <p className="muted">{emptyMessage || `No ${title.toLowerCase()} added yet.`}</p>}</div>
  </section>;
}

function Field({ field, form, setForm }) {
  if (field.type === "checkbox") return <label className="checkbox-label"><input type="checkbox" checked={Boolean(form[field.name])} onChange={(event) => setForm({ ...form, [field.name]: event.target.checked })} />{field.label}</label>;
  const control = field.type === "textarea"
    ? <textarea required={field.required} value={form[field.name]} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} rows="4" />
    : field.options
      ? <select required={field.required} value={form[field.name]} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}><option value="">Select {field.label.toLowerCase()}</option>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
      : <input required={field.required} type={field.type || "text"} value={form[field.name]} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} />;
  return <label>{field.label}{control}</label>;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(profileDefaults);
  const [education, setEducation] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    const requests = await Promise.allSettled([
      api.get("/students/me/"), api.get("/students/education/"), api.get("/students/student-skills/"), api.get("/students/skills/"), api.get("/students/experiences/"), api.get("/students/projects/"), api.get("/students/certificates/"),
    ]);
    if (requests[0].status === "fulfilled") setProfile({ ...profileDefaults, ...requests[0].value.data });
    else setError("We couldn’t load your profile right now.");
    if (requests[1].status === "fulfilled") setEducation(getItems(requests[1].value.data));
    if (requests[2].status === "fulfilled") setStudentSkills(getItems(requests[2].value.data));
    if (requests[3].status === "fulfilled") setSkills(getItems(requests[3].value.data));
    if (requests[4].status === "fulfilled") setExperiences(getItems(requests[4].value.data));
    if (requests[5].status === "fulfilled") setProjects(getItems(requests[5].value.data));
    if (requests[6].status === "fulfilled") setCertificates(getItems(requests[6].value.data));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const payload = { ...profile };
    delete payload.cv;
    payload.date_of_birth ||= null;
    payload.graduation_year = payload.graduation_year === "" ? null : payload.graduation_year;
    try {
      let response;
      if (cvFile) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) formData.append(key, value);
        });
        formData.append("cv", cvFile);
        response = await api.patch("/students/me/", formData);
      } else {
        response = await api.patch("/students/me/", payload);
      }
      setProfile({ ...profileDefaults, ...response.data });
      setCvFile(null);
      setMessage("Profile saved.");
    } catch (requestError) {
      const data = requestError.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="page"><SiteHeader /><p className="page-feedback">Loading your profile…</p></main>;

  const skillFields = [{ name: "skill", label: "Skill", required: true, options: skills.map((skill) => ({ value: skill.id, label: skill.name })) }, { name: "proficiency", label: "Proficiency", required: true, options: ["beginner", "intermediate", "advanced", "expert"].map((value) => ({ value, label: label(value) })) }];

  return <main className="page">
    <SiteHeader />
    <section className="profile-shell">
      <div className="page-heading"><div><p className="eyebrow">STUDENT PROFILE</p><h1>Show employers what you can do.</h1><p className="intro">A complete profile improves the opportunities we can recommend to you.</p></div><div className="completion-card"><span>Profile completion</span><strong>{profile.profile_completion || 0}%</strong></div></div>
      {error && <div className="page-feedback error"><p>{error}</p><button type="button" onClick={load}>Try again</button></div>}
      <form className="profile-form" onSubmit={saveProfile}>
        <section className="profile-card"><div className="section-heading"><div><h2>About you</h2><p>Share the essentials employers see first.</p></div></div><div className="form-grid"><Field field={{ name: "headline", label: "Professional headline" }} form={profile} setForm={setProfile} /><Field field={{ name: "city", label: "City" }} form={profile} setForm={setProfile} /><Field field={{ name: "country", label: "Country" }} form={profile} setForm={setProfile} /><Field field={{ name: "address", label: "Address" }} form={profile} setForm={setProfile} /><Field field={{ name: "date_of_birth", label: "Date of birth", type: "date" }} form={profile} setForm={setProfile} /><Field field={{ name: "gender", label: "Gender" }} form={profile} setForm={setProfile} /></div><Field field={{ name: "bio", label: "Professional summary", type: "textarea" }} form={profile} setForm={setProfile} /></section>
        <section className="profile-card"><div className="section-heading"><div><h2>Education and links</h2><p>Give your academic and professional context.</p></div></div><div className="form-grid"><Field field={{ name: "university", label: "University" }} form={profile} setForm={setProfile} /><Field field={{ name: "degree", label: "Degree" }} form={profile} setForm={setProfile} /><Field field={{ name: "graduation_year", label: "Graduation year", type: "number" }} form={profile} setForm={setProfile} /><Field field={{ name: "current_semester", label: "Current semester" }} form={profile} setForm={setProfile} /><Field field={{ name: "portfolio_url", label: "Portfolio URL", type: "url" }} form={profile} setForm={setProfile} /><Field field={{ name: "linkedin_url", label: "LinkedIn URL", type: "url" }} form={profile} setForm={setProfile} /><Field field={{ name: "github_url", label: "GitHub URL", type: "url" }} form={profile} setForm={setProfile} /></div><label>CV / résumé <span className="optional">PDF, DOC, or DOCX (max 5 MB)</span><input type="file" accept=".pdf,.doc,.docx" onChange={(event) => setCvFile(event.target.files?.[0] || null)} />{profile.cv && <a className="external-link" href={profile.cv} target="_blank" rel="noreferrer">View current CV ↗</a>}</label></section>
        {message && <p className="form-success">{message}</p>}<button className="action-button profile-save" disabled={saving}>{saving ? "Saving profile…" : "Save profile"}</button>
      </form>
      <div className="profile-collections">
        <ResourceSection title="Education" description="Add academic programs and qualifications." endpoint="/students/education/" items={education} fields={educationFields} onChanged={load} renderItem={(item) => <><h3>{item.degree}{item.field_of_study && `, ${item.field_of_study}`}</h3><p>{item.institution_name} · {item.start_year}–{item.end_year || "present"}</p>{item.description && <span>{item.description}</span>}</>} />
        <ResourceSection title="Skills" description="Select skills that best represent your strengths." endpoint="/students/student-skills/" items={studentSkills} fields={skillFields} canCreate={skills.length > 0} emptyMessage={skills.length ? "No skills added yet." : "An administrator has not added selectable skills yet."} onChanged={load} renderItem={(item) => <><h3>{item.skill_name}</h3><p>{label(item.proficiency)}</p></>} />
        <ResourceSection title="Experiences" description="Show work, volunteer, or internship experience." endpoint="/students/experiences/" items={experiences} fields={experienceFields} onChanged={load} renderItem={(item) => <><h3>{item.position} · {item.company_name}</h3><p>{item.start_date}–{item.currently_working ? "present" : item.end_date || "present"}</p>{item.description && <span>{item.description}</span>}</>} />
        <ResourceSection title="Projects" description="Highlight practical work that proves your skills." endpoint="/students/projects/" items={projects} fields={projectFields} onChanged={load} renderItem={(item) => <><h3>{item.title}</h3><p>{item.technology_used || "Project"}</p><span>{item.description}</span></>} />
        <ResourceSection title="Certificates" description="Add certifications and credentials you have earned." endpoint="/students/certificates/" items={certificates} fields={certificateFields} onChanged={load} renderItem={(item) => <><h3>{item.certificate_name}</h3><p>{item.organization} · {item.issue_date}</p>{item.credential_url && <a className="external-link" href={item.credential_url} target="_blank" rel="noreferrer">View credential ↗</a>}</>} />
      </div>
    </section>
  </main>;
}
