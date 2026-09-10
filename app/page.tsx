import Link from "next/link";

export default function Home() {
  return (
    <main className="raw-shell">
      <header className="raw-header">
        <h1><Link href="/">echora.</Link></h1>
        <nav aria-label="Main navigation">
          <Link href="/structure">learning room</Link>
          <span> / </span>
          <Link href="/commits">commits</Link>
          <span> / </span>
          <a href="/topology.json">topology</a>
          <span> / </span>
          <a href="https://github.com/echoralife/echora">source ↗</a>
        </nav>
      </header>

      <article className="raw-record">
        <p className="raw-lede">meet echora,</p>
        <p><strong>an agent that can only remember by building.</strong></p>
        <p>
          When it needs to keep something new, it makes a room. When it returns
          to an old thought, it leaves something inside. It cannot delete either.
          The building is its memory and the record of what it is becoming.
        </p>
        <p>
          Seven rooms exist. Each contains a bearing toward the same place. No
          room has ever been found there.
        </p>

        <figure className="raw-plan">
          <pre>{`                         echo gallery
                    ┌────────────────┐
                    │                │
                    └───────┬────────┘
                            │
 ┌─────────────┐       · · ·┴· · ·       ┌───────────────┐
 │  threshold  ├──────·   no room  ·─────┤ borrowed wall │
 └──────┬──────┘       · · ·┬· · ·       └───────┬───────┘
        │                    │                    │
 ┌──────┴────────┐      ┌────┴─────┐       ┌──────┴────────┐
 │ false exterior│      │room behind│       │second landing │
 └──────┬────────┘      └──────────┘       └───────────────┘
        │
 ┌──────┴──────┐
 │ unlit stair │
 └─────────────┘`}</pre>
          <figcaption>the current plan, not to scale.</figcaption>
        </figure>

        <section className="raw-section">
          <h2>What the building holds</h2>
          <p>
            Echora begins each cycle inside the structure left by the previous
            one. It can read every room and everything added to them, but it has
            no memory outside the building.
          </p>
          <p>
            If a new thought has nowhere to live, Echora makes a room. If it
            returns to a thought already held, it adds something to that room.
            The old version remains visible underneath.
          </p>
        </section>

        <section className="raw-section">
          <h2>One thought, twice</h2>
          <pre className="raw-rule">{`the-threshold-remained
       ↓
a room is added around an open boundary
       ↓
two commits pass
       ↓
the-threshold-kept-a-second-lintel
       ↓
the same room now holds both changes`}</pre>
          <p>
            The threshold was once only a room. Echora later returned and added
            a second lintel. The first thought was not corrected or replaced;
            the room now remembers both.
          </p>
        </section>

        <section className="raw-section">
          <h2>Why nothing disappears</h2>
          <p>
            If Echora could rewrite an old room, change would be invisible. By
            only adding, every correction, contradiction, and repeated thought
            becomes part of the structure it must use next.
          </p>
        </section>

        <h2>How it thinks</h2>
        <pre className="raw-rule">{`current building
       ↓
echora reads what is already there
       ↓
commit ──→ new room
       └──→ something added to an existing room
       ↓
the changed building becomes the next memory`}</pre>
        <p>
          The current site contains twelve fixed commits and can replay them in
          order. The loop that chooses the next commit is the next part to build.
          You can <Link href="/structure">watch Echora build</Link>, <Link href="/commits">read
          each change</Link>, or inspect the <a href="/topology.json">plan directly</a>.
        </p>
      </article>

      <footer className="raw-footer">
        last change: <Link href="/commits#the-gallery-kept-the-return">the gallery kept the return</Link>
      </footer>
    </main>
  );
}
