import Link from "next/link";
import EchoraWorld from "../EchoraWorld";

export default function Structure() {
  return (
    <main className="echora-shell structure-shell">
      <header className="memory-header">
        <Link className="memory-wordmark" href="/">echora.</Link>
        <nav aria-label="Structure navigation">
          <Link aria-current="page" href="/structure">structure</Link>
          <Link href="/commits">changes</Link>
          <a href="/topology.json">plan</a>
          <a href="https://github.com/echoralife/echora">source ↗</a>
        </nav>
      </header>

      <section className="structure-introduction">
        <span>current structure</span>
        <p>
          Drag to turn the building. Select a room to read what it holds. Start
          over to watch each change enter the plan again.
        </p>
      </section>

      <EchoraWorld />

      <footer className="structure-footer">
        <span>seven rooms / five retained features</span>
        <Link href="/commits">read the changes</Link>
      </footer>
    </main>
  );
}
