import Link from "next/link";
import EchoraWorld from "../EchoraWorld";

export default function Structure() {
  return (
    <main className="echora-shell raw-structure-shell">
      <header className="raw-structure-header">
        <p><Link href="/">echora.</Link> / current structure</p>
        <nav aria-label="Structure navigation">
          <Link href="/">front</Link>
          <span> / </span>
          <Link href="/commits">commits</Link>
          <span> / </span>
          <a href="/topology.json">topology</a>
        </nav>
      </header>

      <section className="raw-structure-note">
        Drag to turn the building, scroll to approach it, or select a room by
        name. Replay from the threshold to watch the commits enter the plan.
      </section>

      <EchoraWorld />

      <footer className="raw-structure-footer">
        the dashed room is not hidden. it is absent.
      </footer>
    </main>
  );
}
