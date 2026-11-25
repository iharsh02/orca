# 1. Ban code comments

Date: 2026-11-25

## Status

Accepted

## Context

A review of every comment in the codebase found that each fell into one of four buckets:

- **Tautology** — repeats what the code already says.
- **Excuse** — justifies a hacky implementation, which then gets copied elsewhere because "there was a reason."
- **Stale** — describes code that no longer exists.
- **Decision Record** — captures a real, non-obvious decision.

Only the last is worth keeping, and it does not belong next to the code: it belongs where decisions are recorded (here). The first three are noise at best and actively misleading at worst. Comments are not type-checked, not executed, and not covered by tests, so they rot silently.

This pass deleted every Tautology and Stale comment, deleted each Excuse and filed a tracking issue for the underlying shortcut (e.g. #1), and found zero genuine in-code Decision Records to migrate.

## Decision

We do not write code comments. Knowledge that would have gone in a comment goes in one of:

- **Names** — rename the symbol so the code explains itself.
- **Types** — encode the constraint so the compiler enforces it.
- **Tests** — a test documents behaviour and fails when it drifts.
- **An ADR** — for a non-obvious decision, add a numbered file in `docs/adr/`.
- **An issue** — for a known shortcut, file it and link the issue, not a comment.

This is enforced by a ratcheting check (`pnpm lint:comments`) that allows the current count per file and fails if any file gains comments. The baseline only ever ratchets down.

### Exceptions (not "comments")

These are machine-read directives, not prose, and are allowed:

- Type directives such as `/** @type {...} */` and `// @ts-expect-error`.
- Tooling pragmas such as `// biome-ignore ...`.
- License / shebang headers.

## Consequences

- Reading a file means reading only code — no prose to verify against reality.
- Recording a decision costs an ADR, which is deliberate friction that keeps decisions explicit and discoverable.
- Contributors must express intent through names, types, and tests. The lint rule makes the policy self-enforcing rather than a matter of reviewer discipline.
