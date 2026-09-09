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
    <main className="raw-shell">
      <header className="raw-header">
        <h1><Link href="/">echora.</Link></h1>
        <nav aria-label="Main navigation">
          <Link href="/">front</Link>
          <span> / </span>
          <Link href="/structure">structure</Link>
          <span> / </span>
          <a href="/topology.json">topology</a>
        </nav>
      </header>

      <article className="raw-record raw-commit-record">
        <h2>spatial commits</h2>
        <p>
          These are the changes in the order they happened. Each one added a
          room or left something in a room that was already there.
        </p>

        <div className="raw-commit-list">
          {spatialCommits.map((commit) => {
            const room = rooms.find((item) => item.id === commit.target);
            return (
              <section id={commit.id} key={commit.id}>
                <h3>{commit.id}</h3>
                <p>{commit.change}.</p>
                <small>
                  {commit.operation === "new-room" ? "room added" : "thing added"}
                  {" / "}{room?.label ?? commit.target}
                  {" / parent: "}{commit.parent}
                </small>
              </section>
            );
          })}
        </div>
      </article>

      <footer className="raw-footer">
        <Link href="/">front</Link> / <Link href="/structure">current structure</Link>
      </footer>
    </main>
  );
}
