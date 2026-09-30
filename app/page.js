import Link from "next/link";
import Mark from "./components/Mark";
import Raindrop from "./components/Raindrop";
import { PLANS, TRIAL, dollars } from "../lib/plans";

// Hero dot sizes/positions, carried over from Erin's canvas tweaks.
const DOTS = {
  lime: { size: 176, right: 32, bottom: 216, color: "var(--lime)" },
  cobalt: { size: 112, right: 124, bottom: 162, color: "var(--cobalt)" },
  green: { size: 46, right: 94, bottom: 124, color: "#13492F" },
};

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <Raindrop size={560} style={{ position: "absolute", left: "50%", top: "8%", transform: "translateX(-50%)", opacity: 0.06, width: "min(560px, 80vw)", height: "auto" }} />
        <div className="shape cranberry" aria-hidden="true" style={{ left: -180, bottom: -180, width: 420, height: 420, background: "var(--cranberry)" }} />
        <div className="dot-cluster" aria-hidden="true">
          {Object.entries(DOTS).map(([k, d]) => (
            <div key={k} className="shape" style={{ right: d.right, bottom: d.bottom, width: d.size, height: d.size, background: d.color }} />
          ))}
        </div>

        <h1 className="hero-title">
          <span className="name">Raine Music</span>
          <span className="studio">STUDIO</span>
        </h1>
        <div className="hero-buttons">
          <Link href="/trial" className="btn btn-tomato">Book a trial lesson</Link>
          <Link href="/#membership" className="btn btn-forest">Explore lessons &amp; pricing</Link>
        </div>
        <p className="tagline">Sing, play, and create <u>with confidence.</u></p>
        <p className="offerings">Private online lessons · Voice · Piano · Songwriting · Recording</p>
      </section>

      {/* VALUE STRIP */}
      <section className="values">
        <div>
          <span aria-hidden="true" style={{ width: 12, height: 12, background: "var(--lime)" }} />
          <h3>Studio-quality sound on Zoom</h3>
          <p>Set up so I hear your real voice, not a compressed version of it.</p>
        </div>
        <div>
          <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 6, background: "var(--tomato)" }} />
          <h3>Notes after every lesson</h3>
          <p>What we worked on and what to practice, all in one place.</p>
        </div>
        <div>
          <span aria-hidden="true" style={{ width: 28, height: 8, background: "var(--forest)" }} />
          <h3>Simple monthly membership</h3>
          <p>One weekly spot, autopay, clear policies up front.</p>
        </div>
      </section>

      {/* LESSONS */}
      <section className="section" id="lessons">
        <div className="section-head">
          <span className="eyebrow">What we can work on</span>
          <h2 className="h2">Lessons</h2>
          <Mark />
        </div>
        <div className="grid-4">
          <div className="card"><div className="img" /><h3>Voice</h3><p>Technique, range, and healthy habits. Musical theatre, contemporary, pop, and audition prep.</p><Link href="/trial">Book a trial →</Link></div>
          <div className="card"><div className="img" /><h3>Piano, theory &amp; songwriting</h3><p>Play, understand what you&apos;re playing, and turn ideas into finished songs.</p><Link href="/trial">Book a trial →</Link></div>
          <div className="card"><div className="img" /><h3>Logic Pro &amp; home recording</h3><p>Build a setup that works, record at home, and produce music you&apos;re proud of.</p><Link href="/trial">Book a trial →</Link></div>
          <div className="card cream"><div className="img" /><span className="label-forest">For professionals</span><h3>Look &amp; sound your best on Zoom</h3><p>One session to fix your audio, camera, and lighting.</p><a href="mailto:rainemusicstudio@gmail.com?subject=Zoom%20session">Ask about a session →</a></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ position: "relative", overflow: "hidden", paddingBottom: 130 }}>
        <div aria-hidden="true" style={{ position: "absolute", right: 0, top: 0, width: 180, height: 180, borderBottomLeftRadius: 180, background: "var(--tomato)" }} />
        <div className="section-head">
          <span className="eyebrow">Getting started</span>
          <h2 className="h2">From first note to weekly lessons</h2>
          <Mark />
        </div>
        <div className="steps">
          <div><div className="n">1</div><h3>Book a trial</h3><p>Pick a time and pay online. No back-and-forth.</p></div>
          <div><div className="n">2</div><h3>Choose your membership</h3><p>Reserve your weekly spot on autopay.</p></div>
          <div><div className="n">3</div><h3>Build your welcome kit</h3><p>The tools I recommend, shipped to your door.</p></div>
          <div><div className="n">4</div><h3>Learn and grow</h3><p>Notes and assignments in your portal after each lesson.</p></div>
        </div>
      </section>

      {/* WELCOME KIT */}
      <section className="panel-cream">
        <div className="photo-slot">Photo: open navy box with journal, staff paper, and massage balls</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span className="label-forest" style={{ letterSpacing: 4, fontSize: 13 }}>The welcome kit</span>
          <h2 className="h2" style={{ color: "var(--midnight)", fontSize: "clamp(36px, 4vw, 54px)" }}>Your first lesson deserves a proper welcome.</h2>
          <Mark bar="var(--forest)" dot="#6495ED" align="flex-start" />
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65, color: "#3e4256" }}>Build a kit of the tools I recommend to my students. It arrives in a box worth opening.</p>
          <span style={{ fontSize: 14, color: "#5b5e6e" }}>Coming soon · Added during signup</span>
        </div>
      </section>

      {/* MEMBERSHIP */}
      <section className="section" id="membership">
        <div className="section-head">
          <span className="eyebrow">Membership</span>
          <h2 className="h2">Weekly lessons, one simple monthly price</h2>
          <Mark />
        </div>
        <div className="pricing">
          {PLANS.map((p) => (
            <div key={p.id} className={`plan ${p.featured ? "featured" : ""} ${p.intensive ? "cream" : ""}`}>
              {p.featured && <span className="tag">Most popular</span>}
              {p.intensive && <span className="tag">Intensive</span>}
              <span className="title">{p.intensive ? "2 hours weekly" : p.name}</span>
              <span className="sub">{p.blurb}</span>
              <span className="price">{dollars(p.amount)}<small> / month</small></span>
              <Link href="/trial" className={`btn ${p.featured ? "btn-ghost" : p.intensive ? "btn-peri" : "btn-ghost"}`} style={p.featured ? { background: "var(--cream)", color: "var(--midnight)", border: "none" } : undefined}>
                Start with a trial
              </Link>
            </div>
          ))}
        </div>
        <p className="center-note">Not sure yet? Start with a {TRIAL.minutes}-minute trial lesson for {dollars(TRIAL.amount)}.</p>
        <p className="center-note">
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 22, color: "var(--link)" }}>Thank you for staying. </span>
          Milestone gifts at six months and one year.
        </p>
      </section>

      {/* SHOP TEASER */}
      <section className="panel-forest" id="shop">
        <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <span className="eyebrow" style={{ color: "#a9c8b6" }}>The Studio Shop · Coming soon</span>
          <h2 className="h2" style={{ fontSize: "clamp(34px, 4vw, 48px)" }}>Beautiful, useful things for musicians.</h2>
          <Mark dot="var(--cream)" align="flex-start" />
        </div>
        <p style={{ margin: 0, maxWidth: 420, fontSize: 16, lineHeight: 1.6, color: "#d2ded6" }}>
          Staff paper and journals worth writing in, the gear I recommend, and guides you can learn from at your own pace.
        </p>
      </section>

      {/* ABOUT */}
      <section className="section" id="about" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 72 }}>
        <div style={{ position: "relative", width: "min(420px, 100%)", aspectRatio: "42 / 50" }}>
          <div aria-hidden="true" style={{ position: "absolute", left: -28, bottom: -28, width: "55%", height: "48%", background: "var(--forest)" }} />
          <div style={{ position: "relative", height: "100%", borderRadius: "210px 210px 28px 28px", background: "#1e0e40", border: "1.5px dashed rgba(169,174,242,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7e7a90" }}>
            Portrait of Erin
          </div>
        </div>
        <div style={{ flex: "1 1 360px", display: "flex", flexDirection: "column", gap: 22 }}>
          <span className="eyebrow">Meet your teacher</span>
          <h2 className="h2">Hi, I&apos;m Erin.</h2>
          <Mark align="flex-start" />
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.7, color: "#9c97ac" }}>
            I&apos;m a voice teacher and vocal coach, and I teach musical theatre, contemporary, and pop singers of every level online.
            {/* TODO(Erin): add a few sentences about your training and what you love about teaching. */}
          </p>
          <Link href="/trial" className="btn btn-peri" style={{ alignSelf: "flex-start" }}>Book a trial lesson</Link>
        </div>
      </section>
    </>
  );
}
