import Link from "next/link";
import Raindrop from "./Raindrop";

export default function Footer() {
  return (
    <footer className="site-footer">
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Raindrop size={16} />
        <span style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "#a9a294" }}>
          Raine Music Studio
        </span>
      </span>
      <nav aria-label="Footer">
        <Link href="/policies">Studio policies</Link>
        <Link href="/trial">Book a trial</Link>
        <Link href="/portal">Student login</Link>
        <a href="mailto:rainemusicstudio@gmail.com">Contact</a>
      </nav>
    </footer>
  );
}
