import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function renderedPage(name = "index") {
  return readFile(new URL(`../out/${name}.html`, import.meta.url), "utf8");
}

test("renders the restrained front record", async () => {
  const html = await renderedPage();

  assert.match(html, /<title>echora\.<\/title>/i);
  assert.match(html, /meet echora/i);
  assert.match(html, /an agent that can only remember by building/i);
  assert.match(html, /when it needs to keep something new, it makes a room/i);
  assert.match(html, /the building is its memory and the record of what it is becoming/i);
  assert.match(html, /it has no memory outside the building/i);
  assert.match(html, /the same room now holds both changes/i);
  assert.match(html, /the room now remembers both/i);
  assert.match(html, /if echora could rewrite an old room, change would be invisible/i);
  assert.match(html, /twelve fixed commits/i);
  assert.match(html, /loop that chooses the next commit is the next part to build/i);
  assert.match(html, /seven rooms exist/i);
  assert.match(html, /the current plan, not to scale/i);
  assert.match(html, /href="\/structure"/i);
  assert.match(html, /href="\/commits"/i);
  assert.match(html, /href="\/topology\.json"/i);
  assert.match(html, /https:\/\/github\.com\/echoralife\/echora/i);
  assert.match(html, /property="og:image" content="https:\/\/echoraa\.life\/og\.png"/i);
  assert.match(html, /name="twitter:card" content="summary_large_image"/i);
  assert.doesNotMatch(html, /field note|surviving plan|recoverable origins|record access|<aside/i);
  assert.doesNotMatch(html, /field note|unknown origin|open branches/i);
});

test("renders Echora's learning room and recorded learning controls", async () => {
  const html = await renderedPage("structure");

  assert.match(html, /echora\. \/ learning room/i);
  assert.match(html, /the learning room/i);
  assert.match(html, /Echora learning room/i);
  assert.match(html, /what echora has learned/i);
  assert.match(html, /each return changes the scale of what returned/i);
  assert.match(html, /from the first room/i);
  assert.match(html, /next room/i);
  assert.match(html, /replay of the fixed public record/i);
  assert.match(html, /href="\/commits"/i);
  assert.doesNotMatch(html, /current structure|unbuilt|room-reading|Interactive Echora survey/i);
});

test("uses Three.js for Echora, room construction, and local replay", async () => {
  const source = await readFile(new URL("../app/EchoraLearningRoom.tsx", import.meta.url), "utf8");

  assert.match(source, /from "three"/);
  assert.match(source, /THREE\.WebGLRenderer/);
  assert.match(source, /bodyOutline/);
  assert.match(source, /faceShape/);
  assert.match(source, /THREE\.SphereGeometry/);
  assert.match(source, /THREE\.ShapeGeometry/);
  assert.match(source, /makeLeg/);
  assert.match(source, /curiousTilt/);
  assert.match(source, /THREE\.GridHelper/);
  assert.match(source, /roomObjectsRef/);
  assert.match(source, /cargoRef/);
  assert.match(source, /setPointerCapture/);
  assert.match(source, /wheel/);
  assert.match(source, /learningIndex/);
  assert.match(source, /featureObjectsRef/);
  assert.match(source, /second-lintel/);
  assert.match(source, /returning-frame/);
  assert.doesNotMatch(source, /Math\.random|localStorage|wallet|token/i);
});

test("publishes a fixed append-only topology for the Echora agent", async () => {
  const topology = JSON.parse(await readFile(new URL("../public/topology.json", import.meta.url), "utf8"));

  assert.equal(topology.name, "echora");
  assert.equal(topology.statement, "echora remembers by building");
  assert.deepEqual(topology.agent, {
    id: "echora",
    memory: "the structure",
    movement: "follows the current commit",
  });
  assert.equal("center" in topology, false);
  assert.equal(topology.rooms.length, 7);
  assert.equal(topology.commits.length, 12);
  assert.deepEqual(new Set(topology.commits.map((commit) => commit.operation)), new Set(["new-room", "add-feature"]));
  assert.match(topology.rule, /may remove nothing/i);

  const roomIds = new Set(topology.rooms.map((room) => room.id));
  topology.commits.forEach((commit, index) => {
    assert.ok(roomIds.has(commit.target), commit.id);
    assert.ok(commit.learning.length > 10, commit.id);
    if (index > 0) assert.equal(commit.parent, topology.commits[index - 1].id, commit.id);
    if (commit.operation === "add-feature") assert.ok(commit.feature, commit.id);
  });
});

test("renders the spatial commit ledger as rooms or retained features", async () => {
  const html = await renderedPage("commits");

  assert.match(html, /the building, in the order it happened/i);
  assert.match(html, /nothing overwritten/i);
  assert.match(html, /room added/i);
  assert.match(html, /feature retained/i);
  assert.match(html, /the-gallery-kept-the-return/i);
  assert.doesNotMatch(html, /surviving order|record access|<aside/i);
});
