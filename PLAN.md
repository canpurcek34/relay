# Relay Implementation Plan

This roadmap starts from upstream T3 Code commit `1add47b32`. Each phase is an independently
releasable vertical slice. A later phase does not begin until the current phase meets its acceptance
criteria.

## Baseline architecture decision

Relay will extend the existing path:

```text
Relay clients
  -> typed contracts and WebSocket RPC
  -> event-sourced orchestration
  -> provider-neutral router/workflow scheduler
  -> provider instance adapter
  -> provider-owned runtime and authentication
```

It will not add a second subprocess framework, event store, WebSocket protocol, Git implementation,
approval system, or client state runtime.

## Phase 0 — Documentation, Relay identity, and EN/TR foundation

**Scope**

- Establish the planning, security, and architecture baseline.
- Introduce product-facing Relay identity without breaking stored T3 Code state.
- Add shared `en` and `tr` localization infrastructure and Settings → Language.
- Begin the incremental T3 Code → Relay rename in user-facing project files and new modules.

**Affected areas**

- Root documentation and brand assets.
- `apps/web`, `apps/desktop`, and `apps/mobile` presentation.
- Client settings in `packages/contracts` and shared locale state in `packages/client-runtime`.

**Architecture decision**

- Use `i18next` and `react-i18next` with shared typed resource keys.
- Resolve locale as saved preference, then platform locale, then English.
- Keep package scopes, storage paths, RPC identifiers, project schema URLs, app identifiers, and
  transport-relay terminology stable until separately migrated.
- Track intentional legacy identifiers in `PROGRESS.md`; do not perform global search-and-replace.

**Tests and acceptance**

- Locale resolution, persistence, fallback, pluralization, and `Intl` formatting tests.
- Web/mobile render tests and desktop packaging smoke coverage for renamed surfaces.
- Language switching requires no restart, new Relay surfaces have both locales, and existing thread
  and provider flows are unchanged.

**Security and rollback**

- Escape interpolated values and never translate provider-generated conversation content.
- Roll back by hiding the locale selector and product-brand flag while retaining compatible saved
  settings and legacy identifiers.

## Phase 1 — Capability registry, Qwen, and Antigravity

**Scope**

- Normalize runtime-version-aware provider capabilities.
- Add Qwen and Antigravity through the current `ProviderDriver` and adapter registries.

**Affected areas**

- Provider contracts, driver SPI, built-in driver catalog, adapters/probes, settings UI, and provider
  documentation.

**Architecture decision**

- Add a provider capability snapshot for normalized actions, commands, models, permissions,
  session operations, usage/quota support, availability, and unavailable reasons.
- Use Qwen's stable `qwen --acp` mode through `packages/effect-acp`.
- Use only an official structured Antigravity SDK or structured JSON event mode. Prefer a transport
  that exposes correlated sessions, cancellation, and resume while reusing provider-owned auth.
- If an installed Antigravity version lacks a safe session contract, expose its status but disable
  turn execution with a version-aware reason. Never scrape its TUI.

**Tests and acceptance**

- Mock-peer tests for session start, turn, resume, interrupt, permissions, malformed events, auth
  changes, multiple instances, and unsupported versions.
- Existing providers are unchanged; Qwen works through ACP; supported Antigravity versions work
  through a structured interface; unsupported capabilities are truthfully disabled.

**Security and rollback**

- No cookie/token extraction or shared mutable auth state between provider instances.
- Remove a driver from the built-in catalog to roll back; open driver slugs and unavailable shadow
  snapshots preserve configuration.

## Phase 2 — Quota normalization and provider/account dashboard

**Scope**

- Add provider-instance/account status, quota windows, provenance, reset times, and routing state.
- Keep transcript-derived usage separate from subscription quota.

**Affected areas**

- New quota contracts/service, provider probes, shared client state, web/desktop dashboard, and an
  essential mobile status view.

**Architecture decision**

- Use `provider`, `status_bridge`, `local_estimate`, and `unavailable` quota sources.
- Key snapshots by `ProviderInstanceId` and centralize thresholds/source-confidence policy.
- Default states: below 70% READY, 70–89% USE SPARINGLY, 90%+ AUTO ROUTING BLOCKED, and
  missing/unavailable MANUAL/FALLBACK.
- Never label local session/token telemetry as official plan quota.

**Tests and acceptance**

- Provenance, staleness, reset parsing, threshold boundaries, multiple accounts/windows, locale
  formatting, cache hydration, and old-client decoding.
- Every displayed quota value shows its source; provider instances remain distinct.

**Security and rollback**

- Store normalized, bounded snapshots only; redact raw probes and credential-bearing errors.
- Disable quota collection/UI without changing current usage reporting.

## Phase 3 — Explainable quota-aware router

**Scope**

- Route requested roles to provider instances/models using capability, quota, concurrency, failures,
  preferences, priority, and manual overrides.

**Affected areas**

- Routing contracts/settings, pure router service, orchestration events/projectors, and explanation
  UI.

**Architecture decision**

- Implement a deterministic pure candidate evaluator without provider-name branching.
- Persist the decision, bounded candidate reasons, chosen instance/model, and policy version.
- Manual valid overrides win; blocked candidates remain visible in explanations.

**Tests and acceptance**

- Table-driven boundary, confidence, concurrency, failure, override, tie-breaking, and explanation
  tests.
- Identical inputs produce identical decisions and every exclusion has a stable reason code.

**Security and rollback**

- Explanations contain normalized metadata, not environment variables or raw provider errors.
- Disable automatic routing and require manual provider/model selection.

## Phase 4 — Sequential Relay workflow

**Scope**

- Implement Planner → Builder → Tester → Reviewer → Verifier → Human Approval.
- Support `approved`, `changes_requested`, and `blocked` reviewer verdicts.

**Affected areas**

- Workflow contracts, event-sourced aggregate, scheduler reactor/projector, shared client state, and
  workflow panel.

**Architecture decision**

- Route each role independently; never bind roles permanently to providers.
- Use one managed candidate worktree for the sequential mutating path.
- Default to at most two Builder retries after `changes_requested`.
- Cancellation interrupts the active provider session and preserves dirty work.
- Completion stops at `awaiting_human_approval`; it never merges or pushes.

**Tests and acceptance**

- Happy path, every verdict, retry exhaustion, reroute/failure, cancellation, restart recovery,
  receipt ordering, and dirty-worktree preservation.
- UI always shows role, provider/model, route reason, quota, worktree, status, and required input.

**Security and rollback**

- Agent text cannot modify workflow policy or satisfy the final approval.
- Disable workflow creation while retaining readable projections and normal individual threads.

## Phase 5 — Structured handoffs and human approvals

**Scope**

- Persist bounded, structured role handoffs and auditable sensitive-action gates.

**Affected areas**

- Handoff/approval contracts, workflow aggregate/projectors, artifact validation, and approval UI.

**Architecture decision**

- Handoffs contain objective, summary, changed files, artifacts, test evidence, unresolved issues,
  recommended action, and provider/role/session provenance.
- Treat all agent-authored fields as untrusted context.
- Require human approval for merge, push/publish, destructive Git, dirty worktree deletion,
  protected paths, credential/account changes, permanent memory updates, and dangerous escalation.

**Tests and acceptance**

- Spoofed approval text, malformed/oversized handoffs, path containment, missing artifacts, stale
  approvals, reconnects, and provenance tests.
- No provider event or agent message can satisfy a human approval gate.

**Security and rollback**

- Allowlist artifact roots and scan memory/handoff proposals for likely secrets.
- Disable structured transitions and sensitive actions; never fall back to raw transcripts as
  authority.

## Phase 6 — DAG scheduling and worktree leases

**Scope**

- Add parallel dependencies, concurrency limits, cancellation, failure propagation, and quota-aware
  scheduling.

**Affected areas**

- DAG/scheduler/lease contracts and aggregates, VCS integration, settings, and workflow UI.

**Architecture decision**

- Validate acyclic graphs and enforce global, per-provider-instance, and per-account limits.
- Give every concurrently mutating node a Relay-managed isolated worktree lease.
- Never clean, stash, reset, remove, or reuse unmanaged/dirty worktrees automatically.

**Tests and acceptance**

- Cycle rejection, fan-out/fan-in, limits, fairness, quota changes while queued, cancellation races,
  crash recovery, dirty lease release, and dependency failures.
- Limits are never exceeded and every mutating node has one auditable lease.

**Security and rollback**

- Canonical-path containment and managed-worktree markers are mandatory.
- Stop admitting DAG runs, drain active nodes, and retain worktrees for manual recovery.

## Phase 7 — Canonical project context

**Scope**

- Add provider-neutral durable project knowledge and reviewed memory proposals.

**Affected areas**

- Context contracts/store, proposal aggregate, provider projections, context UI, and documentation.

**Architecture decision**

- Store structured decisions, conventions, repository map, constraints, outcomes, known issues,
  rationale, and terminology.
- Project canonical entries into provider-specific formats only at adapter boundaries.
- Require human review/edit/accept/reject; never silently rewrite provider memory files.

**Tests and acceptance**

- Proposal lifecycle, concurrent edits, projections, secret rejection, containment, history, and
  remote synchronization.
- Only accepted entries affect provider context and each has provenance.

**Security and rollback**

- Apply size limits and secret checks; never store credentials or full raw transcripts.
- Disable context injection while retaining versioned entries and proposals.

## Phase 8 — Structured commands, Skills, and MCP

**Scope**

- Complete Relay-native structured commands and provider/version-aware discovery.

**Affected areas**

- Command contracts/registry, composer menu, command palette, router/workflow/quota actions, Skills,
  MCP, and provider adapters.

**Architecture decision**

- Group commands as Relay, Provider, Skills, and MCP.
- Dispatch typed actions for `/plan`, `/build`, `/test`, `/review`, `/verify`, `/agents`, `/route`,
  `/quota`, `/model`, `/permissions`, `/worktree`, `/diff`, `/checkpoint`, `/memory`, `/compact`,
  `/resume`, and `/language`.
- Native commands are capability-discovered and never blindly injected into prompts.

**Tests and acceptance**

- Search/ranking, keyboard navigation, localization, version changes, disabled reasons, action
  dispatch, provider switching, and stale-command tests.
- Availability matches the selected provider instance/runtime and disabled commands explain why.

**Security and rollback**

- Treat discovered command metadata as display data and preserve all approval rules.
- Hide advanced groups while preserving the existing provider command menu.

## Cross-phase delivery rules

- Make contract changes additive until all clients are updated.
- Use focused tests and typed receipts/worker drains; do not use timing sleeps.
- Bound and paginate new payloads and histories.
- Test web, desktop, mobile, local, remote, and tunnel implications for applicable slices.
- Use mock peers and disposable provider homes, never live writable credentials/state.
- Require explicit approval before browser/simulator verification.
- Keep changes small enough to review and cherry-pick from upstream independently.
- Maintain a T3 Code → Relay rename inventory. Each rename slice documents compatibility aliases,
  migration, tests, and rollback before changing a persisted or externally consumed identifier.
