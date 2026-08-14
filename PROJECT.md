# Relay

> **One workspace. Every coding agent.**

Relay is a provider-neutral coding-agent workspace built from T3 Code's proven architecture. It
coordinates coding agents that use the user's existing provider installations and subscriptions,
while keeping provider authentication provider-owned.

## Product direction

Relay will support Codex, Claude Code, Cursor, Grok, OpenCode, Qwen Code, and Google Antigravity.
Providers remain interchangeable execution backends rather than permanent owners of workflow
roles. Relay coordinates Planner, Researcher, Builder, Tester, Reviewer, and Verifier roles and
shows which provider, model, account, quota observation, and worktree each role is using.

Relay is not a cosmetic reskin. The target is a subscription-aware control center that can route,
coordinate, explain, isolate, review, and hand work between agents safely.

## Principles

1. Reuse before rewrite. Preserve event sourcing, typed contracts, provider adapters, RPC,
   worktrees, checkpoints, diffs, revert, permissions, source control, and remote operation.
2. Provider-owned authentication. Never extract refresh tokens, scrape cookies, store passwords,
   or reverse-engineer private billing APIs.
3. Truthful telemetry. Subscription quota, provider status, and local usage estimates are distinct,
   and every quota value carries provenance.
4. Provider-neutral core. Provider-specific behavior belongs at driver and adapter boundaries.
5. Human authority. Agent output cannot approve merges, pushes, destructive Git, credential
   changes, dangerous escalation, or permanent project-memory updates.
6. Safe concurrency. Every concurrently mutating agent receives an isolated, managed worktree.
7. Multi-surface compatibility. Contract changes account for web, desktop, mobile, local, remote,
   and tunnel connections.
8. English and Turkish first. New Relay UI ships with `en` and `tr`; generated conversation content
   is never translated automatically.
9. Performance without compromise. Payloads stay bounded, updates coalesced, and long surfaces
   virtualized. Avoid continuously repainting status animation.
10. Upstream-friendly evolution. Prefer additive modules and small vertical slices over broad
    rewrites that make upstream changes difficult to integrate.

## Naming and compatibility

The product name will move gradually from **T3 Code** to **Relay** throughout project files.

- New user-facing features, documentation, labels, and assets use Relay from the start.
- Existing product-facing T3 Code strings are migrated in bounded, reviewable slices.
- New internal modules and types use Relay terminology unless they represent an upstream protocol
  or an existing network-relay concept.
- Internal package scopes (`@t3tools/*`), RPC method names, database paths, hidden Git refs,
  environment variables, project schemas, update channels, and application identifiers are not
  renamed until a compatibility and migration plan exists for each one.
- Existing stored settings and URLs must continue to decode and route during any rename.
- The existing T3 Connect/network “relay” subsystem is called **transport relay** in new
  documentation to distinguish it from the Relay product.

The rename is complete only when a repository inventory finds no unintended T3 Code product name,
while intentionally retained compatibility identifiers are documented and tested.

## Initial success criteria

- Existing five providers continue to work without behavior regressions.
- Qwen and Antigravity are implemented through proper provider drivers and adapters.
- Provider/account state and quota provenance are visible and honest.
- Routing decisions are deterministic and explainable.
- Sequential workflows finish at a human approval gate with bounded retries.
- Parallel workflows enforce provider/account limits and worktree isolation.
- Durable project context is reviewed before promotion and never stores secrets.
- New Relay UI is available in English and Turkish across applicable clients.

## Documents

| Document                                             | Purpose                                             |
| ---------------------------------------------------- | --------------------------------------------------- |
| [PLAN.md](./PLAN.md)                                 | Phased implementation roadmap                       |
| [PROGRESS.md](./PROGRESS.md)                         | Current status — authoritative progress tracker     |
| [FILETREE.md](./FILETREE.md)                         | Ownership map for existing and planned subsystems   |
| [SECURITY.md](./SECURITY.md)                         | Trust boundaries and safety requirements            |
| [AGENTS.md](./AGENTS.md)                             | Working rules for agents contributing to this repo  |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)       | Target layering and REUSE/EXTEND/NEW classification |
| [docs/PROVIDER-MATRIX.md](./docs/PROVIDER-MATRIX.md) | Per-provider integration status and capabilities    |
| [docs/LOCALIZATION.md](./docs/LOCALIZATION.md)       | EN/TR strategy and formatting rules                 |
