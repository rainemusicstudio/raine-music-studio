"use client";

import { useState } from "react";
import Raindrop from "../../components/Raindrop";

export default function PortalLogin() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setState("sending");
    const res = await fetch("/api/portal/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setState("sent");
    else { setError(data.error || "Something went wrong."); setState("idle"); }
  }

  return (
    <div className="portal portal-login">
      <Raindrop size={56} />
      <h1>Student app</h1>
      {state === "sent" ? (
        <>
          <p className="lead">Check your email. If <strong>{email}</strong> belongs to a current student, a sign-in link is on its way.</p>
          <p className="hint">Open the link on this device. It can take a minute to arrive, so check spam too.</p>
          <button className="btn btn-ghost" onClick={() => setState("idle")}>Use a different email</button>
        </>
      ) : (
        <form onSubmit={submit} className="portal-form">
          <p className="lead">Enter the email you signed up with. We'll send you a link, so there's no password to remember.</p>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-peri" disabled={state === "sending"}>
            {state === "sending" ? "Sending..." : "Email me a sign-in link"}
          </button>
        </form>
      )}
    </div>
  );
}
