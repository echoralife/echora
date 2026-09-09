import type { Metadata } from "next";
import Link from "next/link";
import { rooms, spatialCommits } from "../echora-data";

export const metadata: Metadata = {
  title: "spatial commits — echora.",
  description: "The changes through which Echora becomes architecture.",
  openGraph: {
    title: "spatial commits — echora.",
    description: "Each change leaves a room or permanent feature behind.",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "spatial commits — echora.",
    description: "Each change leaves a room or permanent feature behind.",
    images: [],
  },
};

export default function Commits() {
  return (
    <main className="memory-shell memory-ledger-shell">
      <header className="memory-header">
        <Link className="memory-wordmark" href="/">echora.</Link>
        <nav aria-label="Main navigation">
          <Link href="/structure">structure</Link>
          <Link aria-current="page" href="/commits">changes</Link>
          <a href="/topology.json">plan</a>
          <a href="https://github.com/echoralife/echora">source ↗</a>
        </nav>
      </header>

      <section className="change-introduction">
        <p>the building, in the order it happened</p>
        <h1>twelve changes.<br />nothing overwritten.</h1>
        <p>
          Every entry below remains part of the present structure. A room holds
          a thought kept once. A retained feature marks a thought encountered again.
        </p>
      </section>

      <div className="change-ledger">
        <header aria-hidden="true">
          <span>change</span><span>what remains</span><span>kind / parent</span>
        </header>
        {spatialCommits.map((commit, index) => {
          const room = rooms.find((item) => item.id === commit.target);
          return (
            <article id={commit.id} className="change-row" key={commit.id}>
              <span className="change-number">{String(index + 1).padStart(2, "0")}</span>
              <div className="change-copy">
                <h2><a href={`#${commit.id}`}>{commit.id}</a></h2>
                <p>{commit.change}.</p>
                <small>{room?.label ?? commit.target}</small>
              </div>
              <div className="change-origin">
                <span>{commit.operation === "new-room" ? "room added" : "feature retained"}</span>
                <span>
                  parent: {commit.parent === "root" ? "root" : <a href={`#${commit.parent}`}>{commit.parent}</a>}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <footer className="memory-footer">
        <p>The final row is the current edge of memory.</p>
        <p><Link href="/structure">walk the current structure</Link></p>
      </footer>
    </main>
  );
}
