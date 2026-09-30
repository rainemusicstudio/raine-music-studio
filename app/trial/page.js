"use client";

import { useEffect, useMemo, useState } from "react";
import Mark from "../components/Mark";
import { TRIAL, dollars } from "../../lib/plans";
import { STUDIO_TIME_ZONE } from "../../lib/availability";

function dayKey(iso) {
  return new Date(iso).toLocaleDateString("en-US", { timeZone: STUDIO_TIME_ZONE, weekday: "long", month: "long", day: "numeric" });
}
const LESSON_TYPES = ["Voice", "Piano", "Music theory", "Songwriting", "Logic Pro & home recording", "Not sure yet"];
const EXPERIENCE = ["Brand new", "Some experience", "Experienced", "Advanced / professional"];
const HEARD_FROM = ["Google search", "Instagram", "Facebook", "TikTok", "A friend or family member", "Thumbtack", "Another teacher or school", "Other"];

function timeLabel(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { timeZone: STUDIO_TIME_ZONE, hour: "numeric", minute: "2-digit" });
}

export default function TrialPage() {
  const [slots, setSlots] = useState(null);
  const [picked, setPicked] = useState(null);
  const [form, setForm] = useState({
    name: "", email: "", focus: "",
    lessonType: "", forWhom: "me", studentName: "", studentAge: "", experience: "", heardFrom: "",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const child = form.forWhom === "child";
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
        <h2 className="eyebrow" style={{ margin: 0 }}>2 · About the lessons</h2>
        <div className="field">
          <label htmlFor="lessonType">What kind of lesson?</label>
          <select id="lessonType" required value={form.lessonType} onChange={set("lessonType")}>
            <option value="" disabled>Choose one</option>
            {LESSON_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Who are the lessons for?</label>
          <div className="choice-grid">
            <button type="button" className="choice" aria-pressed={!child} onClick={() => setForm({ ...form, forWhom: "me" })}>Me (18+)</button>
            <button type="button" className="choice" aria-pressed={child} onClick={() => setForm({ ...form, forWhom: "child" })}>My child</button>
          </div>
        </div>
        {child && (
          <div className="field-row">
            <div className="field"><label htmlFor="studentName">Student&apos;s name</label><input id="studentName" required value={form.studentName} onChange={set("studentName")} /></div>
            <div className="field"><label htmlFor="studentAge">Student&apos;s age</label><input id="studentAge" type="number" min="4" max="17" required value={form.studentAge} onChange={set("studentAge")} /></div>
          </div>
        )}
        <div className="field">
          <label htmlFor="experience">{child ? "Their experience level" : "Your experience level"}</label>
          <select id="experience" required value={form.experience} onChange={set("experience")}>
            <option value="" disabled>Choose one</option>
            {EXPERIENCE.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="focus">What would you like to work on? (optional)</label>
          <textarea id="focus" rows={3} value={form.focus} onChange={set("focus")} placeholder="An audition, a song you love, singing with more confidence…" />
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 className="eyebrow" style={{ margin: 0 }}>3 · {child ? "Parent or guardian" : "About you"}</h2>
        <div className="field"><label htmlFor="name">{child ? "Your name (parent or guardian)" : "Your name"}</label><input id="name" required value={form.name} onChange={set("name")} /></div>
        <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" required value={form.email} onChange={set("email")} /></div>
        <div className="field">
          <label htmlFor="heardFrom">How did you hear about the studio? (optional)</label>
          <select id="heardFrom" value={form.heardFrom} onChange={set("heardFrom")}>
            <option value="">Choose one</option>
            {HEARD_FROM.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </section>

      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn btn-tomato" type="submit" disabled={busy} style={{ alignSelf: "flex-start" }}>
        {busy ? "Opening checkout…" : `Continue to payment · ${dollars(TRIAL.amount)}`}
      </button>
    </form>
  );
}
