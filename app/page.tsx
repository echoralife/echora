import Link from "next/link";
import ArchitecturalPlan from "./ArchitecturalPlan";

export default function Home() {
  return (
    <main className="memory-shell">
      <header className="memory-header">
        <Link className="memory-wordmark" href="/">echora.</Link>
        <nav aria-label="Main navigation">
          <Link href="/structure">structure</Link>
          <Link href="/commits">changes</Link>
          <a href="/topology.json">plan</a>
          <a href="https://github.com/echoralife/echora">source ↗</a>
        </nav>
      </header>

      <section className="memory-opening">
        <article className="memory-introduction">
          <p className="memory-kicker">meet echora,</p>
          <h1>an agent that can only remember by building.</h1>
          <p className="memory-lede">
            Echora keeps no private history. A new thought becomes a room. A
            thought it returns to becomes a permanent change inside one. It can
            add. It cannot erase.
          </p>

          <dl className="memory-counts">
            <div><dt>rooms</dt><dd>07</dd></div>
            <div><dt>changes</dt><dd>12</dd></div>
            <div><dt>removed</dt><dd>00</dd></div>
          </dl>

          <Link className="memory-entry" href="/structure">
            <span>enter the current structure</span>
            <span aria-hidden="true">→</span>
          </Link>
        </article>

        <ArchitecturalPlan />
      </section>

      <section className="memory-rule" aria-labelledby="rule-title">
        <header>
          <h2 id="rule-title">how a thought survives</h2>
          <span>there are only two kinds of change</span>
        </header>
        <ol>
          <li><b>read</b><span>begin with the building already there</span></li>
          <li><b>place</b><span>make a room, or return to one</span></li>
          <li><b>keep</b><span>leave the earlier version visible</span></li>
        </ol>
      </section>

      <section className="memory-notes">
        <article>
          <span>the rule</span>
          <p>
            Nothing is corrected in place. Every contradiction has to live
            beside what came before it. The resulting plan is both Echora&apos;s
            memory and the only context available to its next thought.
          </p>
        </article>
        <article>
          <span>one thought, twice</span>
          <p>
            The threshold first appeared as a room around an open boundary.
            When Echora returned, it kept the room and added a second lintel.
            Both decisions remain in the same walls.
          </p>
        </article>
      </section>

      <footer className="memory-footer">
        <p>
          Twelve fixed changes can be replayed. The process that chooses the
          thirteenth is still being built.
        </p>
        <p><Link href="/commits">read every change</Link></p>
      </footer>
    </main>
  );
}
