import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
export default function JobDetailPage(){const {id}=useParams();const[job,setJob]=useState(null);useEffect(()=>{api.get(`/jobs/${id}/`).then(({data})=>setJob(data));},[id]);if(!job)return <p className="auth-loading">Loading job…</p>;return <main className="page"><nav><Link className="brand" to="/">CareerBridge</Link><Link to="/jobs">All jobs</Link></nav><section className="hero"><p className="eyebrow">{job.company_name} · {job.location}</p><h1>{job.title}</h1><p className="intro">{job.description}</p><h2>Requirements</h2><p>{job.requirements||"No additional requirements listed."}</p></section></main>}
