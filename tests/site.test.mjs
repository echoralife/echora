import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function renderedPage(name = "index") {
  return readFile(new URL(`../out/${name}.html`, import.meta.url), "utf8");
}

test("renders the living architectural sheet", async () => {
  const html = await renderedPage();

  assert.match(html, /<title>echora\.<\/title>/i);
  assert.match(html, /meet echora/i);
  assert.match(html, /an agent that can only remember by building/i);
  assert.match(html, /keeps no private history/i);
  assert.match(html, /a new thought becomes a room/i);
  assert.match(html, /it cannot erase/i);
  assert.match(html, /current memory/i);
  assert.match(html, /seven rooms \/ twelve changes/i);
  assert.match(html, /the latest return is blue/i);
  assert.match(html, /there are only two kinds of change/i);
  assert.match(html, /the process that chooses the/i);
  assert.match(html, /thirteenth is still being built/i);
  assert.match(html, /href="\/structure"/i);
  assert.match(html, /href="\/commits"/i);
  assert.match(html, /href="\/topology\.json"/i);
  assert.match(html, /property="og:image" content="https:\/\/echoraa\.life\/og\.png"/i);
  assert.match(html, /name="twitter:card" content="summary_large_image"/i);
  assert.doesNotMatch(html, /field note|surviving plan|recoverable origins|record access|no room|<aside/i);
  assert.doesNotMatch(html, /field note|unknown origin|open branches/i);
});

test("renders the accumulated structure and growth controls", async () => {
  const html = await renderedPage("structure");

  assert.match(html, /current structure/i);
  assert.match(html, /drag to turn the building/i);
  assert.match(html, /things added here/i);
  assert.match(html, /last change/i);
  assert.match(html, /start over/i);
  assert.match(html, /all changes shown/i);
  assert.match(html, /href="\/commits"/i);
});

test("uses Three.js as the spatial mechanism and keeps the route local", async () => {
  const source = await readFile(new URL("../app/EchoraWorld.tsx", import.meta.url), "utf8");

  assert.match(source, /from "three"/);
  assert.match(source, /THREE\.WebGLRenderer/);
  assert.match(source, /THREE\.LineDashedMaterial/);
  assert.match(source, /setPointerCapture/);
  assert.match(source, /wheel/);
  assert.match(source, /setVisited/);
  assert.match(source, /commitStep/);
  assert.match(source, /featureObjectsRef/);
  assert.match(source, /second-lintel/);
  assert.match(source, /returning-frame/);
  assert.doesNotMatch(source, /Math\.random|localStorage|wallet|token|agent/i);
});

test("publishes a fixed append-only topology with an explicitly absent center", async () => {
  const topology = JSON.parse(await readFile(new URL("../public/topology.json", import.meta.url), "utf8"));

  assert.equal(topology.name, "echora");
  assert.equal(topology.center, null);
  assert.equal(topology.rooms.length, 7);
  assert.equal(topology.commits.length, 12);
  assert.deepEqual(new Set(topology.commits.map((commit) => commit.operation)), new Set(["new-room", "add-feature"]));
  assert.match(topology.rule, /may remove nothing/i);

  const roomIds = new Set(topology.rooms.map((room) => room.id));
  topology.commits.forEach((commit, index) => {
    assert.ok(roomIds.has(commit.target), commit.id);
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
