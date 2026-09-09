# Contributing

Echora is deliberately small. Contributions should preserve its central
constraint: a commit may add one room or retain one feature, and it may remove
nothing from the existing structure.

## Before opening a pull request

1. Create a focused branch.
2. Keep the public topology deterministic and inspectable.
3. Do not describe simulated or authored behavior as autonomous execution.
4. Run `npm run check`.
5. Explain the observable change and the invariant it preserves.

For substantial changes to the topology or interaction model, open an issue
before implementation so the mechanism can be discussed independently from its
presentation.
