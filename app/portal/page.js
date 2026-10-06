"use client";

import { useCallback, useEffect, useState } from "react";
import Raindrop from "../components/Raindrop";
import { browserDb, portalFetch } from "../../lib/supabase-browser";
import { STUDIO_TIME_ZONE } from "../../lib/availability";
import { findPlan } from "../../lib/plans";

const when = (iso, opts) => new Date(iso).toLocaleString("en-US", { timeZone: STUDIO_TIME_ZONE, ...opts });
const lessonTime = (iso) => when(iso, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
const noteDate = (d) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" });
const shortDate = (iso) => when(iso, { month: "short", day: "numeric" });

async function act(body) {
  return portalFetch("/api/portal", { method: "POST", body: JSON.stringify(body) });
}

export default function PortalPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async (studentId) => {
    try {
      setData(await portalFetch(`/api/portal${studentId ? `?student=${studentId}` : ""}`));
    } catch (err) {
      if (err.status === 401) {
        await browserDb().auth.signOut();
        window.location.replace("/portal/login");
      } else setError(err.message);
    }
  }, []);

  useEffect(() => {
    // An expired or already-used link comes back with an error in the address.
    if (window.location.hash.includes("error=")) {
      setError("That sign-in link has expired or was already used. Please ask for a new one.");
      return;
    }
    browserDb().auth.getSession().then(({ data: s }) => {
      if (!s.session) window.location.replace("/portal/login");
      else load();
    });
  }, [load]);

  async function signOut() {
    await browserDb().auth.signOut();
    window.location.replace("/portal/login");
  }

  if (error) {
    return (
      <div className="portal portal-login">
        <Raindrop size={48} />
        <p className="lead">{error}</p>
        <a className="btn btn-peri" href="/portal/login">Back to sign in</a>
      </div>
    );
  }
  if (!data) return <div className="portal portal-login"><Raindrop size={48} /><p className="hint">Loading...</p></div>;
  if (data.role === "teacher") return <TeacherApp initial={data} signOut={signOut} />;
  return <StudentApp data={data} reload={() => load()} signOut={signOut} />;
}

/* ------------------------------------------------------------------ */
/* Student app                                                         */
/* ------------------------------------------------------------------ */

const TABS = [
  { id: "home", label: "Home" },
  { id: "notes", label: "Notes" },
  { id: "practice", label: "Practice" },
  { id: "questions", label: "Questions" },
];

function StudentApp({ data, reload, signOut }) {
  const [tab, setTab] = useState("home");
  const { student, notes, assignments, questions } = data;
  const firstName = student.name.split(" ")[0];

  return (
    <div className="portal">
      <header className="portal-top">
        <span className="portal-brand"><Raindrop size={20} /> Hi, {firstName}</span>
        <button className="portal-link" onClick={signOut}>Sign out</button>
      </header>
      <div className="portal-body">
        {tab === "home" && <Home student={student} notes={notes} assignments={assignments} go={setTab} />}
        {tab === "notes" && <Notes notes={notes} />}
        {tab === "practice" && <Practice assignments={assignments} reload={reload} />}
        {tab === "questions" && <Questions questions={questions} reload={reload} />}
      </div>
      <nav className="portal-tabs" aria-label="App">
        {TABS.map((t) => (
          <button key={t.id} aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)}>
            {t.label}
            {t.id === "practice" && assignments.some((a) => !a.done_at) && <i className="tab-dot" />}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Home({ student, notes, assignments, go }) {
  const done = assignments.filter((a) => a.done_at).length;
  const latest = notes[0];
  const upcoming = student.next_lesson_at && new Date(student.next_lesson_at) > new Date(Date.now() - 3600000);
  return (
    <>
      <section className="p-card p-blue">
        <span className="p-eyebrow">Next lesson</span>
        {upcoming ? (
          <>
            <h2>{lessonTime(student.next_lesson_at)}</h2>
            {student.zoom_url
              ? <a className="btn btn-forest" href={student.zoom_url} target="_blank" rel="noreferrer">Join on Zoom</a>
              : <p className="p-muted-light">Your Zoom link will show up here.</p>}
          </>
        ) : <p className="p-muted-light">Erin will add your next lesson here.</p>}
      </section>

      <section className="p-card">
        <div className="p-row">
          <span className="p-eyebrow">This week's practice</span>
          <button className="portal-link" onClick={() => go("practice")}>See all</button>
        </div>
        {assignments.length ? (
          <>
            <div className="p-progress" aria-label={`${done} of ${assignments.length} done`}>
              <span style={{ width: `${(done / assignments.length) * 100}%` }} />
            </div>
            <p className="p-muted">{done} of {assignments.length} done</p>
          </>
        ) : <p className="p-muted">Nothing assigned yet.</p>}
      </section>

      <section className="p-card">
        <div className="p-row">
          <span className="p-eyebrow">Latest lesson notes</span>
          {latest && <button className="portal-link" onClick={() => go("notes")}>All notes</button>}
        </div>
        {latest ? <NoteBody note={latest} /> : <p className="p-muted">Notes from your lessons will appear here.</p>}
      </section>

      {student.plan && <p className="hint" style={{ textAlign: "center" }}>Your plan: {findPlan(student.plan)?.name || student.plan}</p>}
    </>
  );
}

function NoteBody({ note }) {
  return (
    <div className="p-note">
      <h3>{noteDate(note.lesson_date)}</h3>
      {note.worked_on && <><h4>What we worked on</h4><p>{note.worked_on}</p></>}
      {note.wins && <><h4 className="lime">Wins</h4><p>{note.wins}</p></>}
      {note.practice && <><h4>Practice this week</h4><p>{note.practice}</p></>}
      {note.link_url && <a href={note.link_url} target="_blank" rel="noreferrer">Recording or sheet music</a>}
    </div>
  );
}

function Notes({ notes }) {
  return (
    <>
      <h1 className="p-title">Lesson notes</h1>
      {notes.length ? notes.map((n) => <section key={n.id} className="p-card"><NoteBody note={n} /></section>)
        : <p className="p-muted">After each lesson, Erin's notes will show up here.</p>}
    </>
  );
}

function Practice({ assignments, reload }) {
  const [busy, setBusy] = useState(null);
  async function toggle(a) {
    setBusy(a.id);
    try { await act({ action: "toggleAssignment", id: a.id, done: !a.done_at }); await reload(); }
    finally { setBusy(null); }
  }
  return (
    <>
      <h1 className="p-title">Practice</h1>
      {assignments.length ? (
        <ul className="p-checklist">
          {assignments.map((a) => (
            <li key={a.id}>
              <label className={a.done_at ? "done" : ""}>
                <input type="checkbox" checked={Boolean(a.done_at)} disabled={busy === a.id} onChange={() => toggle(a)} />
                <span><strong>{a.title}</strong>{a.details && <small>{a.details}</small>}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : <p className="p-muted">Erin will add practice assignments after your lessons.</p>}
    </>
  );
}

function Questions({ questions, reload }) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function add(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try { await act({ action: "addQuestion", body }); setBody(""); await reload(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  const open = questions.filter((q) => !q.answered_at);
  const answered = questions.filter((q) => q.answered_at);
  return (
    <>
      <h1 className="p-title">For next lesson</h1>
      <form onSubmit={add} className="p-card portal-form">
        <div className="field">
          <label htmlFor="q">Jot down a question while you think of it</label>
          <textarea id="q" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Why does my voice crack on the high part of the chorus?" />
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-peri" disabled={busy || !body.trim()}>Save question</button>
      </form>
      {open.map((q) => (
        <section key={q.id} className="p-card p-question">
          <p>{q.body}</p>
          <div className="p-row">
            <span className="hint">Saved {shortDate(q.created_at)}</span>
            <button className="portal-link" onClick={async () => { await act({ action: "deleteQuestion", id: q.id }); reload(); }}>Remove</button>
          </div>
        </section>
      ))}
      {answered.length > 0 && <h2 className="p-sub">Answered</h2>}
      {answered.map((q) => (
        <section key={q.id} className="p-card p-question answered"><p>{q.body}</p><span className="hint">Answered {shortDate(q.answered_at)}</span></section>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Erin's teacher view                                                 */
/* ------------------------------------------------------------------ */

function TeacherApp({ initial, signOut }) {
  const [students, setStudents] = useState(initial.students);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const refreshList = async () => setStudents((await portalFetch("/api/portal")).students);

  if (selected) return <TeacherStudent id={selected} back={() => { setSelected(null); refreshList(); }} signOut={signOut} />;

  return (
    <div className="portal portal-wide">
      <header className="portal-top">
        <span className="portal-brand"><Raindrop size={20} /> Teacher view</span>
        <button className="portal-link" onClick={signOut}>Sign out</button>
      </header>
      <div className="portal-body">
        <div className="p-row">
          <h1 className="p-title">Students</h1>
          <button className="btn btn-peri btn-sm" onClick={() => setShowAdd(!showAdd)}>{showAdd ? "Close" : "Add a student"}</button>
        </div>
        {showAdd && <AddStudent done={async (id) => { setShowAdd(false); await refreshList(); setSelected(id); }} />}
        {students.length === 0 && <p className="p-muted">No students yet. New members are added automatically when they sign up, or add one yourself.</p>}
        {students.map((s) => (
          <button key={s.id} className="p-card p-student" onClick={() => setSelected(s.id)}>
            <span>
              <strong>{s.name}</strong>
              <small>{s.email}{s.status !== "active" ? ` · ${s.status}` : ""}</small>
            </span>
            <span className="p-student-meta">
              {s.open_questions > 0 && <em>{s.open_questions} question{s.open_questions > 1 ? "s" : ""}</em>}
              {s.next_lesson_at && <small>Next: {shortDate(s.next_lesson_at)}</small>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function useForm(initial) {
  const [form, setForm] = useState(initial);
  const bind = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });
  return [form, bind, () => setForm(initial)];
}

function SaveForm({ onSave, children, label, className = "" }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg("");
    try { await onSave(); setMsg("Saved"); setTimeout(() => setMsg(""), 2000); }
    catch (err) { setMsg(err.message); }
    finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className={`p-card portal-form ${className}`}>
      {children}
      <div className="p-row">
        <button className="btn btn-peri btn-sm" disabled={busy}>{busy ? "Saving..." : label}</button>
        {msg && <span className={msg === "Saved" ? "hint" : "error"}>{msg}</span>}
      </div>
    </form>
  );
}

function AddStudent({ done }) {
  const [form, bind] = useForm({ name: "", email: "" });
  return (
    <SaveForm label="Add student" onSave={async () => { const r = await act({ action: "addStudent", ...form }); done(r.id); }}>
      <div className="field"><label>Name</label><input required {...bind("name")} /></div>
      <div className="field"><label>Email they'll sign in with</label><input type="email" required {...bind("email")} /></div>
    </SaveForm>
  );
}

// datetime-local wants "YYYY-MM-DDTHH:mm" in the device's own time zone.
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function TeacherStudent({ id, back, signOut }) {
  const [data, setData] = useState(null);
  const reload = useCallback(async () => setData(await portalFetch(`/api/portal?student=${id}`)), [id]);
  useEffect(() => { reload(); }, [reload]);

  if (!data) return <div className="portal portal-login"><Raindrop size={48} /><p className="hint">Loading...</p></div>;
  const { student, notes, assignments, questions } = data;
  const open = questions.filter((q) => !q.answered_at);

  return (
    <div className="portal portal-wide">
      <header className="portal-top">
        <button className="portal-link" onClick={back}>← All students</button>
        <button className="portal-link" onClick={signOut}>Sign out</button>
      </header>
      <div className="portal-body">
        <div>
          <h1 className="p-title">{student.name}</h1>
          <p className="hint">{student.email}{student.plan ? ` · ${findPlan(student.plan)?.name || student.plan}` : ""}</p>
        </div>

        <div className="p-grid">
          <div className="p-col">
            <h2 className="p-sub">Questions for next lesson {open.length > 0 && `(${open.length})`}</h2>
            {questions.length === 0 && <p className="p-muted">No questions yet.</p>}
            {questions.map((q) => (
              <label key={q.id} className={`p-card p-teacher-q ${q.answered_at ? "answered" : ""}`}>
                <input type="checkbox" checked={Boolean(q.answered_at)}
                  onChange={async () => { await act({ action: "answerQuestion", id: q.id, answered: !q.answered_at }); reload(); }} />
                <span>{q.body}<small>{shortDate(q.created_at)}{q.answered_at ? " · answered" : ""}</small></span>
              </label>
            ))}

            <h2 className="p-sub">Next lesson</h2>
            <NextLessonForm student={student} reload={reload} />

            <h2 className="p-sub">Practice assignments</h2>
            <AssignmentForm studentId={id} reload={reload} />
            {assignments.map((a) => (
              <div key={a.id} className={`p-card p-assign ${a.done_at ? "done" : ""}`}>
                <span><strong>{a.title}</strong>{a.details && <small>{a.details}</small>}<small>{a.done_at ? `Done ${shortDate(a.done_at)}` : "Not done yet"}</small></span>
                <button className="portal-link" onClick={async () => { await act({ action: "archiveAssignment", id: a.id }); reload(); }}>Clear</button>
              </div>
            ))}
          </div>

          <div className="p-col">
            <h2 className="p-sub">Lesson notes</h2>
            <NoteForm studentId={id} reload={reload} />
            {notes.map((n) => (
              <section key={n.id} className="p-card">
                <NoteBody note={n} />
                <button className="portal-link" onClick={async () => { if (confirm("Delete this note?")) { await act({ action: "deleteNote", id: n.id }); reload(); } }}>Delete</button>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NextLessonForm({ student, reload }) {
  const [form, bind] = useForm({ next: toLocalInput(student.next_lesson_at), zoom: student.zoom_url || "" });
  return (
    <SaveForm label="Save" onSave={async () => {
      await act({ action: "updateStudent", studentId: student.id, next_lesson_at: form.next ? new Date(form.next).toISOString() : null, zoom_url: form.zoom });
      await reload();
    }}>
      <div className="field"><label>Date and time</label><input type="datetime-local" {...bind("next")} /></div>
      <div className="field"><label>Zoom link</label><input type="url" placeholder="https://zoom.us/j/..." {...bind("zoom")} /></div>
    </SaveForm>
  );
}

function AssignmentForm({ studentId, reload }) {
  const [form, bind, reset] = useForm({ title: "", details: "" });
  return (
    <SaveForm label="Add assignment" onSave={async () => { await act({ action: "addAssignment", studentId, ...form }); reset(); await reload(); }}>
      <div className="field"><label>Assignment</label><input required placeholder="Lip trills on 5-note scales, 5 min a day" {...bind("title")} /></div>
      <div className="field"><label>Details (optional)</label><input {...bind("details")} /></div>
    </SaveForm>
  );
}

function NoteForm({ studentId, reload }) {
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const [form, bind, reset] = useForm({ lesson_date: today, worked_on: "", wins: "", practice: "", link_url: "" });
  return (
    <SaveForm label="Post note" onSave={async () => { await act({ action: "addNote", studentId, ...form }); reset(); await reload(); }}>
      <div className="field"><label>Lesson date</label><input type="date" {...bind("lesson_date")} /></div>
      <div className="field"><label>What we worked on</label><textarea rows={3} {...bind("worked_on")} /></div>
      <div className="field"><label>Wins</label><textarea rows={2} {...bind("wins")} /></div>
      <div className="field"><label>Practice this week</label><textarea rows={2} {...bind("practice")} /></div>
      <div className="field"><label>Link to recording or sheet music (optional)</label><input type="url" {...bind("link_url")} /></div>
    </SaveForm>
  );
}
