import Link from "next/link";
import EchoraWorld from "../EchoraWorld";

export default function Structure() {
  return (
    <main className="raw-shell raw-structure-page">
      <header className="raw-header">
        <h1><Link href="/">echora.</Link></h1>
        <nav aria-label="Structure navigation">
          <Link href="/">front</Link>
          <span> / </span>
          <Link href="/commits">commits</Link>
          <span> / </span>
          <a href="/topology.json">topology</a>
        </nav>
      </header>

      <section className="raw-structure-copy">
        <p className="raw-lede">echora, inside the record</p>
        <p>
          Each replayed change sends Echora to the room it makes or revises.
          Start over, then follow it as the building becomes its memory.
        </p>
        <p className="raw-structure-key">
          <span>room</span><span>retained feature</span><span>echora</span>
        </p>
      </section>

      <EchoraWorld />

      <footer className="raw-footer raw-structure-footer">
        <Link href="/commits">read the changes</Link> / <Link href="/">return to the front</Link>
      </footer>
    </main>
  );
}
