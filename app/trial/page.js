"use client";

import { useEffect, useMemo, useState } from "react";
import Mark from "../components/Mark";
import { TRIAL, dollars } from "../../lib/plans";
import { STUDIO_TIME_ZONE } from "../../lib/availability";

function dayKey(iso) {
  return new Date(iso).toLocaleDateString("en-US", { timeZone: STUDIO_TIME_ZONE, weekday: "long", month: "long", day: "numeric" });
}
function timeLabel(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { timeZone: STUDIO_TIME_ZONE, hour: "numeric", minute: "2-digit" });
}

export default function TrialPage() {
  const [slots, setSlots] = useState(null);
  const [picked, setPicked] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", focus: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/slots").then((r) => r.json()).then((d) => setSlots(d.slots || [])).catch(() => setSlots([]));
  }, []);

  const byDay = useMemo(() => {
    const g = {};
    for (const s of slots || []) (g[dayKey(s)] ||= []).push(s);
    return g;
  }, [slots]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!picked) return setError("Please pick a time.");
    setBusy(true);
    const res = await fetch("/api/checkout/trial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start: picked, ...form }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { setError(data.error || "Something went wrong."); setBusy(false); }
  }

  return (
    <form className="page" onSubmit={submit}>
      <h1>Book a trial lesson</h1>
      <Mark align="flex-start" />
      <p className="lead">
        {TRIAL.minutes} minutes on Zoom for {dollars(TRIAL.amount)}. We&apos;ll meet, hear where your voice is today, and talk about your goals.
        Times are shown in Central Time.
      </p>

      <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 className="eyebrow" style={{ margin: 0 }}>1 · Pick a time</h2>
        {slots === null && <p className="lead">Loading open times…</p>}
        {slots?.length === 0 && <p className="lead">No open times right now. Email <a href="mailto:rainemusicstudio@gmail.com">rainemusicstudio@gmail.com</a> and we&apos;ll find one.</p>}
        {Object.entries(byDay).map(([day, list]) => (
          <div key={day} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="day-label">{day}</span>
            <div className="choice-grid">
              {list.map((s) => (
                <button type="button" key={s} className="choice" aria-pressed={picked === s} onClick={() => setPicked(s)}>
                  {timeLabel(s)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 className="eyebrow" style={{ margin: 0 }}>2 · About you</h2>
        <div className="field"><label htmlFor="name">Your name</label><input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="field">
          <label htmlFor="focus">What would you like to work on? (optional)</label>
          <textarea id="focus" rows={3} value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })} placeholder="An audition, a song you love, singing with more confidence…" />
        </div>
      </section>

      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn btn-tomato" type="submit" disabled={busy} style={{ alignSelf: "flex-start" }}>
        {busy ? "Opening checkout…" : `Continue to payment · ${dollars(TRIAL.amount)}`}
      </button>
    </form>
  );
}
