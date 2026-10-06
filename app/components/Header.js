import Link from "next/link";
import Raindrop from "./Raindrop";

export default function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <Raindrop size={22} />
        <span>Raine Music Studio</span>
      </Link>
      <nav className="site-nav" aria-label="Main">
        <Link href="/#lessons">Lessons</Link>
        <Link href="/#membership">Membership</Link>
        <Link href="/#shop">Studio Shop</Link>
        <Link href="/#about">About</Link>
        <Link href="/portal">Student login</Link>
        <Link href="/trial">Book a trial</Link>
      </nav>
    </header>
  );
}
