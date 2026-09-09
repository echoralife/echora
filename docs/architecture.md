# Architecture

Echora separates the public record from its presentation.

## Record

`public/topology.json` is the source of truth. It contains:

- rooms with stable identifiers and positions;
- edges between rooms;
- an ordered append-only commit sequence;
- a `center` value that is intentionally `null`.

Each commit has one of two operations:

- `new-room`: attach a room to the surviving structure;
- `add-feature`: retain a named feature inside an existing room.

Every commit after the first points to the immediately preceding commit. Tests
verify that targets exist, parent links are linear, and retained-feature commits
name their feature.

## Presentation

The App Router renders three public surfaces:

- `/` explains the mechanism;
- `/commits` exposes the ordered ledger;
- `/structure` replays the record in Three.js.

The Three.js route derives its geometry from the same topology used by the text
routes. Navigation and visited-room state remain local to the browser and are
not written back into the record.

## Execution boundary

The repository contains a deterministic twelve-commit demonstration. It does
not currently contain an autonomous planner, model runner, evidence collector,
or remote memory service. A future runner should emit the same public commit
shape and remain separately auditable.
