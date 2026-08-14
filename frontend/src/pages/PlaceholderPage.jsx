import { Link } from "react-router-dom";

export default function PlaceholderPage({ title }) {
  return <main className="page"><nav><Link className="brand" to="/">CareerBridge</Link></nav><section className="hero"><h1>{title}</h1><p className="intro">This feature is scheduled for a later project phase.</p><Link className="back" to="/">Return home</Link></section></main>;
}
