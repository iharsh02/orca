# Project context

Before working in this repo, read `docs/CONTEXT.md` first. It is the product context for this project — an AI SaaS factory — covering the stack, hosting, milestones, competitor research, and MVP plan. Every agent should read it before making changes.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": true` in the root `turbo.json` or `turbo.jsonc` to opt in; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# Working rules

1. **Ask, don't assume.** If something is unclear, ask before writing a single line. Never make silent assumptions about intent, architecture, or requirements.

2. **Simplest solution first.** Always implement the simplest thing that could work. Do not add abstractions or flexibility that weren't explicitly requested.

3. **Don't touch unrelated code.** If a file or function is not directly part of the current task, do not modify it, even if you think it could be improved.

4. **Flag uncertainty explicitly.** If you are not confident about an approach or technical detail, say so before proceeding.

# Git rules

1. **Pull with rebase.** Run `git pull --rebase`, so local commits replay on top of the remote and history stays linear.

2. **Let the user decide on rebase conflicts.** If the rebase stops on a conflict, list the conflicted files and ask the user which path to take:
   - **User resolves:** wait for them to finish.
   - **Agent resolves:** keep the intent of both sides, run `pnpm check-types` and `pnpm lint`, summarise how each file was resolved, then run `git rebase --continue`.
   - **Abort:** run `git rebase --abort`.

   The pull is done only when `git status` shows no rebase in progress.
