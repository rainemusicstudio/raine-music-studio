"use client";

import { useState } from "react";
import Link from "next/link";
import Mark from "../components/Mark";
import { PLANS, dollars } from "../../lib/plans";

export default function JoinPage() {
  const [planId, setPlanId] = useState("weekly-45");
  const [form, setForm] = useState({ name: "", email: "", preferredTimes: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const plan = PLANS.find((p) => p.id === planId);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!agreed) return setError("Please read and agree to the studio policies.");
    setBusy(true);
    const res = await fetch("/api/checkout/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, agreed, ...form }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { setError(data.error || "Something went wrong."); setBusy(false); }
  }

  return (
    <form className="page" onSubmit={submit}>
      <h1>Join the studio</h1>
      <Mark align="flex-start" />
      <p className="lead">Choose your plan and reserve your weekly spot. Tuition is the same every month, on autopay.</p>

      <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 className="eyebrow" style={{ margin: 0 }}>1 · Your plan</h2>
        <div className="choice-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
          {PLANS.map((p) => (
            <button type="button" key={p.id} className="choice" aria-pressed={planId === p.id} onClick={() => setPlanId(p.id)} style={{ padding: "18px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
              <span>{p.name}</span>
              <strong style={{ fontSize: 20 }}>{dollars(p.amount)}/mo</strong>
            </button>
          ))}
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 className="eyebrow" style={{ margin: 0 }}>2 · About you</h2>
        <div className="field"><label htmlFor="name">Your name</label><input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="field">
          <label htmlFor="times">When would you like your weekly lesson?</label>
          <textarea id="times" rows={2} value={form.preferredTimes} onChange={(e) => setForm({ ...form, preferredTimes: e.target.value })} placeholder="e.g. Tuesdays after 4 pm, or Saturday mornings" />
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 className="eyebrow" style={{ margin: 0 }}>3 · Studio policies</h2>
        <label className="check">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>I&apos;ve read and agree to the <Link href="/policies" target="_blank">studio policies</Link>, including monthly autopay.</span>
        </label>
      </section>

      <div className="summary">
        <div><span>Plan</span><span>{plan.name}</span></div>
        <div><span>Monthly tuition</span><span>{dollars(plan.amount)}</span></div>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn btn-peri" type="submit" disabled={busy} style={{ alignSelf: "flex-start" }}>
        {busy ? "Opening checkout…" : "Continue to secure checkout"}
      </button>
    </form>
  );
}
