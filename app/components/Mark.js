// The Raine Music Studio signature mark: bar + square + dot.
export default function Mark({ bar = "var(--lime)", square = "var(--tomato)", dot = "var(--forest)", align = "center" }) {
  return (
    <div className="mark" aria-hidden="true" style={{ alignSelf: align }}>
      <div className="bar" style={{ background: bar }} />
      <div className="sq" style={{ background: square }} />
      <div className="dot" style={{ background: dot }} />
    </div>
  );
}
