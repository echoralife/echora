import type { Metadata } from "next";
import Link from "next/link";
import EchoraLearningRoom from "../EchoraLearningRoom";

export const metadata: Metadata = {
  title: "echora. / learning room",
  description: "Watch Echora turn NVIDIA Nemotron thoughts into rooms and permanent revisions.",
};

export default function Structure() {
  return (
    <main className="learning-page">
      <header className="learning-header">
        <h1><Link href="/">echora.</Link></h1>
        <p>the learning room</p>
        <nav aria-label="Structure navigation">
          <Link href="/">front</Link>
          <span> / </span>
          <Link href="/commits">commits</Link>
          <span> / </span>
          <a href="/topology.json">topology</a>
          <span> / </span>
          <a href="https://x.com/echoralife">x ↗</a>
        </nav>
      </header>

      <EchoraLearningRoom />

      <footer className="learning-page-footer">
        <span>NVIDIA Nemotron reads the surviving structure. Each thought becomes a room or a retained feature inside one.</span>
        <Link href="/commits">read every change</Link>
      </footer>
    </main>
  );
}
