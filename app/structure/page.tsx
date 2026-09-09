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
        <p className="raw-lede">current structure</p>
        <p>
          Seven rooms and five later additions are shown below. Drag to turn the
          building, select a room to read it, or start over to replay the changes.
        </p>
        <p className="raw-structure-key">
          <span>room</span><span>retained feature</span><span>unbuilt</span>
        </p>
      </section>

      <EchoraWorld />

      <footer className="raw-footer raw-structure-footer">
        <Link href="/commits">read the changes</Link> / <Link href="/">return to the front</Link>
      </footer>
    </main>
  );
}
