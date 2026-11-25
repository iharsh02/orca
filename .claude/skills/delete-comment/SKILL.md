---
name: delete-comment
description: Audit and purge code comments in this repo. Use when asked to "delete comments", "clean up comments", run "/delete-comment", review comments, or enforce the no-comment policy (ADR-0001). Categorises every comment, deletes noise, files issues for excuses, migrates real decisions to ADRs, and ratchets the comment baseline down.
---

# delete-comment

Enforces [ADR-0001: Ban code comments](../../../docs/adr/0001-ban-code-comments.md). Run it over the whole repo or a named section (a directory/glob). Comments are not type-checked, run, or tested — they rot. This skill removes them and relocates the rare bit of real knowledge they carried.

## 1. Find every comment

Scope to the target (default: whole repo). Only real source files — never `node_modules`, `dist`, `.next`, `.turbo`, lockfiles, or generated `*-env.d.ts`.

```
git ls-files --cached --others --exclude-standard -- <scope> \
  | grep -E '\.(ts|tsx|js|jsx|mjs|cjs|css|scss)$'
```

Read each file and locate every `//` and `/* */`. Ignore matches inside string/template literals (URLs like `https://…`, regexes). The checker in `scripts/lint-comments.mjs` already does this string-aware scan — use its count as ground truth.

## 2. Categorise each comment

| Category            | Test                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------- |
| **Tautology**       | Repeats what the code already says.                                                       |
| **Excuse**          | Justifies a hacky/temporary implementation ("for now", "swap later", "hack", "TODO fix"). |
| **Stale**           | Describes code that no longer exists or behaves differently.                              |
| **Decision Record** | Captures a real, non-obvious _why_ that the code/types/tests cannot.                      |

**Not comments — keep these:** machine-read directives (`@type`, `@ts-expect-error`, `@ts-ignore`), tooling pragmas (`biome-ignore`, `eslint-…`), `/// <reference>`, and `@license`/`@preserve` headers. The checker's `ALLOWED` regex is the source of truth; keep it in sync.

## 3. Act per category

- **Tautology / Stale** → delete the comment.
- **Excuse** → delete the comment **and** `gh issue create` describing the real shortcut and the fix, so the hack is tracked instead of excused. Link the issue in the PR.
- **Decision Record** → delete the comment and add it as a numbered file in `docs/adr/` (copy the shape of ADR-0001, next number, status `Accepted`). Reference the ADR from the PR, not from the code.

## 4. Ratchet the baseline

This is a **ratchet**, not a one-shot — not every comment must die in one PR.

```
pnpm lint:comments          # fail if any file exceeds its baseline (CI gate)
pnpm lint:comments:update   # rewrite .comment-baseline.json; counts only ever drop
```

After deleting, run `pnpm lint:comments:update` and commit `.comment-baseline.json`. A file's allowance can only decrease, so comments can never creep back up and new files start at zero.

## 5. Verify

```
pnpm exec biome check .     # formatting/lint still clean (deletions can shift layout)
pnpm check-types            # types still pass
pnpm lint:comments          # baseline respected
```

## 6. Report

State counts per category, issues filed (with URLs), ADRs created, and lines shed (sum of physical comment lines removed, from the checker's before/after counts).
