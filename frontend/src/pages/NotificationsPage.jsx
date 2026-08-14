import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
export default function NotificationsPage(){const[items,setItems]=useState([]);const load=()=>api.get("/notifications/").then(({data})=>setItems(data.results||data));useEffect(load,[]);const readAll=async()=>{await api.patch("/notifications/read-all/");load();};return <main className="page"><nav><Link className="brand" to="/dashboard">CareerBridge</Link></nav><section className="hero"><h1>Notifications</h1><button onClick={readAll}>Mark all read</button>{items.length?items.map(n=><article key={n.id}><h2>{n.title}</h2><p>{n.message}</p></article>):<p>No notifications yet.</p>}</section></main>}
