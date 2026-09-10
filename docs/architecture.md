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

## Reasoning loop

NVIDIA Nemotron is Echora's reasoning model. Echora reads the surviving
topology before each cycle, then records the next thought using the same public
commit shape. Because the structure is append-only, every return remains
inspectable.
