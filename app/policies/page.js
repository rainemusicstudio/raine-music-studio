import Mark from "../components/Mark";
import { POLICIES } from "../../lib/policies";

export const metadata = { title: "Studio policies — Raine Music Studio" };

export default function PoliciesPage() {
  return (
    <div className="page">
      <h1>Studio policies</h1>
      <Mark align="flex-start" />
      <p className="lead">Clear, simple, and the same for everyone, so we can spend lesson time on music.</p>
      {POLICIES.map((p) => (
        <section key={p.title} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 26, color: "#d8d1c4" }}>{p.title}</h2>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "#b3adc2" }}>{p.body}</p>
        </section>
      ))}
    </div>
  );
}
