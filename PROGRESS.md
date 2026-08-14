# Relay Development Progress

**Baseline:** upstream T3 Code `1add47b32` (`main`)
**Last updated:** 2026-08-14
**Current phase:** Phase 0 — documentation baseline, EN/TR localization foundation, and product
display-name rebrand (web/desktop/mobile) all landed; brand assets/icons and marketing-site copy
remain, and both are explicitly deferred (see below), not oversights

This file is the single source of truth for Relay progress. It is authoritative over any summary in
`README.md`, `PROJECT.md`, or `PLAN.md`.

## Working rule

Every coding session must:

1. **Read this file first** and determine the current phase before touching code.
2. Move the task being worked on to `[~]` when implementation starts.
3. Move it to `[x]` **only** when it is implemented _and_ verified, with an evidence line recorded.
4. Move it to `[!]` when blocked, and write the reason inline.
5. Append a session summary at the bottom before finishing.

**Do not start Phase N+1 until every acceptance item in Phase N is `[x]` and the user has explicitly
approved the transition.** Phase transitions are a human decision, not an agent decision.

## Notation

| Mark  | Meaning                                 |
| ----- | --------------------------------------- |
| `[ ]` | Not started                             |
| `[~]` | Implemented but verification incomplete |
| `[x]` | Completed **and** verified              |
| `[!]` | Blocked / human decision required       |

Writing code is not completion. A task that has passing unit tests but no real runtime/provider
verification stays `[~]`.

## Phase numbering

`PLAN.md` and this file both use **Phase 0–8**. The master instruction sketches an 11-phase list;
those phases are merged here as follows, and `PLAN.md` is the authoritative phase definition:

| This file / PLAN.md                                           | Master instruction sketch |
| ------------------------------------------------------------- | ------------------------- |
| Phase 0 — Documentation, Relay identity, and EN/TR foundation | Phase 0                   |
| Phase 1 — Capability registry, Qwen, and Antigravity          | Phases 1–2                |
| Phase 2 — Quota normalization and provider/account dashboard  | Phases 3–4                |
| Phase 3 — Explainable quota-aware router                      | Phase 5                   |
| Phase 4 — Sequential Relay workflow                           | Phase 6                   |
| Phase 5 — Structured handoffs and human approvals             | Phase 7                   |
| Phase 6 — DAG scheduling and worktree leases                  | Phase 8                   |
| Phase 7 — Canonical project context                           | Phase 9                   |
| Phase 8 — Structured commands, Skills, and MCP                | Phases 10–11              |

---

## Phase 0 — Documentation, Relay identity, and EN/TR foundation

**Exit gate:** compatible Relay branding and a working locale foundation, with no regression to
existing thread or provider flows.

### Repository analysis

- [x] T3 Code repository architecture analyzed
- [x] Provider driver/adapter architecture inspected
- [x] Orchestration, event store, and persistence inspected
- [x] Git/worktree/checkpoint/diff systems inspected
- [x] Permission modes and approval surfaces inspected
- [x] Web/desktop/mobile/remote surfaces inspected
- [x] Every Relay feature classified REUSE / EXTEND / NEW
- [x] Risk areas identified and recorded in `SECURITY.md`

### Documentation

- [x] `PROJECT.md` created
- [x] `PLAN.md` created
- [x] `PROGRESS.md` created in the mandated checklist format
- [x] `FILETREE.md` created
- [x] `SECURITY.md` created
- [x] `README.md` Relay header added
- [x] `docs/README.md` Relay header added
- [x] `AGENTS.md` Relay working-rules section added
- [x] `docs/ARCHITECTURE.md` created
- [x] `docs/PROVIDER-MATRIX.md` created
- [x] `docs/LOCALIZATION.md` created
- [!] Documentation committed to Git
  - User elected to leave the Phase 0 documents uncommitted in the working tree for now.
  - Master instruction §22 asks for a commit; this is deferred by explicit user decision.

### Relay branding

- [x] Brand-name inventory of user-facing "T3 Code" strings
  - Full-repo inventory via `grep -rlI "T3 Code"`, gone through file by file: source vs test,
    prose vs identifier. Started at 159 files, ended at 61 — every remaining occurrence was
    individually classified as an intentional exception (see below), not skipped by omission.
- [x] Web surface branding slice
  - Central mechanism: `apps/web/src/branding.ts`'s `APP_BASE_NAME` (fallback "T3 Code" → "Relay")
    drives `APP_DISPLAY_NAME`, the browser tab title (`document.title`, `<meta name="title">`),
    and every screen that renders it (auth/pairing screens, chat empty state). Also renamed the
    static pre-hydration `<title>` in `apps/web/index.html`.
  - ~45 additional web files: Settings (theme names, keybindings, connections, provider status),
    pull-request empty states, SSH password prompt, relay-client install dialog, desktop-update
    messaging, version-skew hints, Clerk mobile-clients profile page, connection platform labels.
  - Deliberately left: `alt`/`aria-label` text describing the boot-splash logo image
    (`apple-touch-icon.png`) in `index.html` and `SplashScreen.tsx` — that image asset itself is
    unrenamed (see brand assets below), so relabeling only the alt text would misdescribe it.
    Also left: code comments, `branding.test.ts`'s generic parametrized-logic tests, and every
    "sample project title" test fixture that happens to use "T3 Code" as a plausible example
    project name (`CommandPalette.logic.test.ts`, `PullRequestListFilters.test.tsx`, etc.) —
    verified case by case that these are arbitrary test data, not product self-reference.
- [x] Desktop surface branding slice
  - Same mechanism on the desktop side: `apps/desktop/src/app/DesktopEnvironment.ts`'s
    `APP_BASE_NAME` drives `environment.displayName`, which sets the Electron app name
    (`electronApp.setName`), every `BrowserWindow` title, the macOS About panel, and the Linux
    `.desktop` entry `Name=` field.
  - ~15 additional desktop files: startup error dialog, systemd unit `Description=` (cosmetic
    field only, not the unit filename), SSH window-unavailable messages, WSL/backend-pool
    fallback messages, Linux secret-storage errors, background-service CLI messages.
  - Deliberately left: `productName` in `apps/desktop/package.json` (the actual built `.app`/
    installer name — real distribution identifier, see below) and every mock/fixture that
    represents the real, still-`"T3 Code"` installed app identity (`.app` bundle paths,
    `ElectronApp.name` stubs) — renaming those would make the tests lie about what's installed
    today.
- [x] Mobile surface branding slice
  - `apps/mobile/src/lib/authClientMetadata.ts`'s OAuth client label ("T3 Code Mobile" →
    "Relay Mobile"), the thread-composer fallback project title, the agent-awareness Live
    Activity default title, and two Settings-screen prose strings.
  - Deliberately left: `apps/mobile/src/components/BrandMark.tsx` and `CompactBrandTitle.tsx` —
    both pair the product name with a real, unrenamed visual asset (brand-variant PNG icons and
    a literal `T3Wordmark` SVG component). Renaming the adjacent text without new art would
    produce a visibly broken half-rebrand, worse than leaving it consistent. `app.config.ts`'s
    `appName` fields and `README.md`'s description of the same build variants — real Expo/App
    Store distribution identifiers, deferred with desktop's `productName` (see below).
- [~] Brand assets and icons
  - **Blocked — needs real design assets, which this agent cannot produce.** No new Relay
    logo, icon set, or wordmark exists. Every place that pairs the product name with a visual
    mark (mobile `BrandMark`/`CompactBrandTitle`, the `apple-touch-icon.png`-based splash/tab
    icon, desktop app icons) was left showing the current T3 Code mark rather than a
    half-renamed mismatch. This is the one Phase 0 branding item that cannot become `[x]`
    without human design input.
- [~] Compatibility test: stored settings, URLs, and T3 home paths still resolve after rename
  - Verified what was actually changed: only _display strings_ (window/tab titles, dialog copy,
    OAuth client display labels, a default theme's display label, an OpenAPI title). Zero
    `@t3tools/*` package scopes, RPC/wire identifiers, `T3CODE_HOME`/`T3_SSH_AUTH_SECRET` env
    vars, `t3.json`/its schema URL, `t3-code` MCP client/server identifiers, the `t3code` Grok
    OAuth referrer, `legacyUserDataDirName`, systemd unit _filenames_, or desktop/mobile
    `productName`/`appName` distribution identifiers were touched — confirmed by grepping each
    after every batch and by every full test suite passing (see Evidence). No dedicated
    round-trip/migration test was written for this claim, so it stays `[~]`, not `[x]`.

  **Explicitly deferred, not attempted this slice** (real product decisions, not oversights):
  - `apps/marketing/src/lib/tweets.ts` — real, attributed Twitter testimonials quoting people
    who said "T3 Code". Rewriting a direct quote to say "Relay" would misattribute words to real
    people. The rest of the marketing site (home page, download page, legal pages) is entangled
    with real distribution links and legal-entity text and needs dedicated review, not a
    text-substitution pass.
  - `docs/internals/*` (13 files) and `docs/operations/*` (4 files) — contributor/maintainer
    docs. Lower priority than `docs/user/` per this file's own audience split (`AGENTS.md` §"Hit
    every surface"); `docs/user/*` (the shipped-product-facing docs) was fully renamed instead.
  - `apps/mobile/modules/t3-markdown-text/UPSTREAM.md` — a factual, historical statement about
    what T3 Code (the actual entity, at the time) did to a vendored library. Renaming it would
    misstate history.
  - `packages/contracts/src/relay.ts`'s OpenAPI title — this one line intersects the naming
    collision documented in `FILETREE.md` ("T3 Code Relay API" would naively become "Relay Relay
    API"). Resolved deliberately as `"Relay Transport API"` rather than left stale or blindly
    substituted; flagged here since it's the one rename that required inventing new wording
    rather than a straight substitution.

### EN/TR localization foundation

- [x] Localization library selected and added to the workspace
  - `i18next` `^26.3.6` + `react-i18next` `^17.0.11`, added to `apps/web/package.json` only
    (web-only surface this slice; desktop reuses it for free since it wraps the web bundle).
- [x] `AppLocale` contract (`system` / `en` / `tr`) added to `packages/contracts/src/settings.ts`
  - Refined from the `en`/`tr`-only design in `docs/LOCALIZATION.md` to add a `"system"` sentinel,
    mirroring the existing `TimestampFormat: "locale"` idiom already used in this schema. Doc
    updated to match.
  - Added to `ClientSettingsSchema` (with `DEFAULT_APP_LOCALE = "system"`) and `ClientSettingsPatch`.
- [x] Shared locale state in `packages/client-runtime`
  - `packages/client-runtime/src/state/locale.ts`: pure `resolveAppLocale` +
    `matchSupportedLocale`, exported as `@t3tools/client-runtime/state/locale`.
- [x] Locale resolution: saved preference → platform locale → `en` fallback
  - Implemented in `resolveAppLocale`; platform locales come from `navigator.languages`.
- [x] `en` and `tr` resource bundles
  - `apps/web/src/i18n/locales/{en,tr}.json`. Scope is intentionally narrow: only the
    `settings.language.*` keys this slice introduces. The ~140-file T3 Code string corpus is a
    separate, larger migration tracked under Relay branding below — not touched here.
- [~] Settings → Language selector
  - `apps/web/src/components/settings/SettingsPanels.tsx` (`GeneralSettingsPanel`), following the
    existing `timestampFormat` `SettingsRow` + `Select` pattern exactly. Wired into the
    "Restore defaults" dirty-check and reset flow alongside every other general setting.
    Typecheck/lint clean and adjacent tests pass, but no component-level render/interaction test
    exists for this row and it has not been clicked through in a running browser — stays `[~]`
    until one of those happens.
- [ ] `Intl` date/time/number/percentage formatting helpers
  - Not built this slice; no new surface needed one yet. `docs/LOCALIZATION.md` records the intended
    approach for when quota/routing UI (Phase 2+) needs it.
- [ ] Pluralization support verified for both locales
  - No plural-bearing string exists yet to verify against; revisit once one ships.
- [~] Locale switching applies without restart
  - `apps/web/src/hooks/useAppLocaleSync.ts` + `AppRoot.tsx`'s `AppLocaleSync`: a `useEffect` calls
    `syncAppLocale` on every `appLocale` change, calling `i18next.changeLanguage` directly — no
    reload anywhere in the path. Unit-verified (`AppRoot.test.tsx` wiring, `i18next.changeLanguage`
    behavior in `i18n/index.test.ts`); the live re-render has not been watched in a running browser,
    so this stays `[~]` per this file's own evidence rule (see Evidence).
- [ ] Test: provider/model conversation content is never auto-translated
  - Not yet applicable: no provider content flows through the i18next instance to test against.
    `i18n/index.ts` only loads Relay-authored `resources`; this stays true by construction until
    something imports provider output into a translation key, which nothing does.
- [!] Mobile and desktop-native surfaces
  - Desktop is covered for free (Electron wraps the same web bundle and renderer). Mobile
    (`apps/mobile`) has its own React Native UI that does not import `apps/web` — it has no
    Language setting and no i18next wiring yet. Needs its own slice.

---

## Phase 1 — Capability registry, Qwen, and Antigravity

**Blocked on:** Phase 0 exit gate.
**Exit gate:** structured adapters pass mock-peer tests; existing five providers unchanged.

### Capability registry

- [ ] Provider capability schema in `packages/contracts`
- [ ] Runtime, version-aware capability discovery
- [ ] Slash-command capability registry
- [ ] Provider status normalization
- [ ] UI consumes the normalized registry with no provider-name branching
- [ ] Deterministic capability tests

### Qwen Code

- [ ] Qwen driver (`Drivers/QwenDriver.ts`)
- [ ] Qwen ACP support module reusing `provider/acp/`
- [ ] Registered in `builtInDrivers.ts`
- [ ] Capability detection
- [ ] Auth/status support (provider-owned auth only)
- [ ] Mock-peer runtime tests
- [ ] Real Qwen CLI verification

### Google Antigravity

- [ ] Structured runtime interface confirmed to exist for supported versions
- [ ] Antigravity driver
- [ ] Antigravity adapter
- [ ] Capability detection
- [ ] Quota/status support
- [ ] Version-aware disable path when no safe session contract exists
- [ ] Mock-peer runtime tests
- [ ] Real Antigravity CLI verification

### Regression guard

- [ ] Codex, Claude, Cursor, Grok, OpenCode behavior unchanged

---

## Phase 2 — Quota normalization and provider/account dashboard

**Blocked on:** Phase 1.
**Exit gate:** every displayed quota value carries visible provenance.

- [ ] `QuotaSource` (`provider` / `status_bridge` / `local_estimate` / `unavailable`) contract
- [ ] `QuotaWindow` and `ProviderQuotaSnapshot` contracts
- [ ] Quota snapshots keyed by `ProviderInstanceId`
- [ ] Configurable threshold policy (no hard-coded percentages)
- [ ] Provider quota probes
- [ ] Provider/account dashboard (web + desktop)
- [ ] Essential mobile status view
- [ ] Local usage telemetry kept visibly distinct from subscription quota
- [ ] Provenance, staleness, reset-parsing, and threshold-boundary tests
- [ ] Multi-account and multi-window tests

---

## Phase 3 — Explainable quota-aware router

**Blocked on:** Phase 2.
**Exit gate:** deterministic decisions; every exclusion has a stable reason code.

- [ ] Routing contracts and settings
- [ ] Pure candidate evaluator with no provider-name branching
- [ ] Route decision persistence with bounded candidate reasons
- [ ] Manual override handling
- [ ] Route explanation UI
- [ ] Table-driven boundary, concurrency, failure, and tie-breaking tests
- [ ] Determinism test: identical inputs produce identical decisions

---

## Phase 4 — Sequential Relay workflow

**Blocked on:** Phase 3.
**Exit gate:** a bounded end-to-end workflow reaches the human approval gate.

- [ ] Workflow contracts
- [ ] Event-sourced workflow aggregate
- [ ] Scheduler reactor and projector
- [ ] Planner → Builder → Tester → Reviewer → Verifier sequence
- [ ] Reviewer verdicts: `approved` / `changes_requested` / `blocked`
- [ ] Bounded Builder retries (default 2)
- [ ] One managed candidate worktree for the sequential mutating path
- [ ] Cancellation interrupts the provider session and preserves dirty work
- [ ] Completion stops at `awaiting_human_approval`; never merges or pushes
- [ ] Workflow panel shows role, provider/model, route reason, quota, worktree, status
- [ ] Happy-path, every-verdict, retry-exhaustion, cancellation, and restart-recovery tests

---

## Phase 5 — Structured handoffs and human approvals

**Blocked on:** Phase 4.
**Exit gate:** no agent output can satisfy a sensitive gate.

- [ ] `AgentHandoff` contract with provenance
- [ ] Handoff persistence and size bounds
- [ ] Agent-authored fields treated as untrusted context
- [ ] Approval gates for merge, push/publish, destructive Git, dirty-worktree deletion,
      protected paths, credential/account changes, permanent memory updates, escalation
- [ ] Approval records include authenticated actor, action, target, policy version, time
- [ ] Stale-approval invalidation
- [ ] Spoofed-approval-text test
- [ ] Malformed/oversized handoff and path-containment tests

---

## Phase 6 — DAG scheduling and worktree leases

**Blocked on:** Phase 5.
**Exit gate:** concurrency and worktree invariants hold under load.

- [ ] DAG contracts with acyclic validation
- [ ] Global, per-provider-instance, and per-account concurrency limits
- [ ] Worktree lease contracts and aggregate
- [ ] Every concurrently mutating node gets an isolated managed worktree
- [ ] Cancellation and failure propagation
- [ ] Quota-aware scheduling
- [ ] Never auto-clean, stash, reset, or remove unmanaged/dirty worktrees
- [ ] Cycle rejection, fan-out/fan-in, fairness, crash recovery, and dirty-lease-release tests

---

## Phase 7 — Canonical project context

**Blocked on:** Phase 6.
**Exit gate:** only reviewed entries become canonical.

- [ ] Context contracts and store
- [ ] Memory proposal aggregate
- [ ] Human review/edit/accept/reject flow
- [ ] Provider-specific projections at adapter boundaries only
- [ ] Never silently rewrite provider memory files
- [ ] Secret detection and rejection
- [ ] Size limits and path containment
- [ ] Proposal lifecycle, concurrent edit, and provenance tests

---

## Phase 8 — Structured commands, Skills, and MCP

**Blocked on:** Phase 7.
**Exit gate:** version-aware structured commands work; disabled commands explain why.

- [ ] Command contracts and registry
- [ ] Composer `/` palette with Relay / Provider / Skills / MCP groups
- [ ] Relay-native typed actions: `/plan` `/build` `/test` `/review` `/verify` `/agents` `/route`
      `/quota` `/model` `/permissions` `/worktree` `/diff` `/checkpoint` `/memory` `/compact`
      `/resume` `/language`
- [ ] Provider-native command discovery from runtime capabilities
- [ ] Unsupported commands hidden or disabled with a reason
- [ ] Skills integration
- [ ] MCP integration
- [ ] Search/ranking, keyboard navigation, localization, and stale-command tests

---

## Architecture audit

### Reuse as-is

- Event-sourced orchestration, command receipts, pure decider, projectors, and reactors.
- Typed contracts and WebSocket/RPC communication.
- Open provider driver kinds, provider instance IDs, and multiple instances per driver.
- Provider driver/adapter and status registries.
- Codex, Claude, Cursor, Grok, and OpenCode providers.
- ACP client/runtime package and the provider-neutral `provider/acp/` runtime.
- Provider-owned install, version, auth, model, command, and skill discovery.
- Native provider subagent/workflow observability and Agents UI.
- Git worktrees, checkpoints, diffs, restore, and source-control integrations.
- Permission modes and inline provider approvals.
- Shared client runtime plus web, desktop, mobile, remote, and tunnel surfaces.

### Extend

- Provider snapshots and adapter capabilities into a normalized capability registry.
- Provider settings/status UI into a provider/account dashboard.
- Provider rate-limit events and safe probes into provenance-bearing quota observations.
- Orchestration aggregates into routing and Relay-owned workflows.
- Existing Agents and slash-command surfaces into provider-neutral Relay views/actions.
- Client settings into saved locale selection.

### New subsystems

- Qwen and Antigravity drivers/adapters.
- Provider-neutral quota model and source confidence policy.
- Explainable quota-aware router.
- Sequential workflow and later DAG scheduler.
- Structured handoffs and workflow-level human approvals.
- Worktree leases.
- Canonical reviewed project context.
- EN/TR localization runtime and resources.

## Decisions

- Existing transcript `UsageSummary` is local usage telemetry, not subscription quota.
- Qwen should reuse its stable ACP interface through the existing provider-neutral `provider/acp/`
  runtime, following the `CursorAcpSupport` / `GrokAcpSupport` pattern.
- Antigravity must expose a structured, correlated runtime interface; unsupported versions remain
  visible but cannot execute turns through TUI scraping.
- Workflow retries are bounded; the initial default is two Builder retries.
- Sequential workflows use one managed candidate worktree and stop before merge/push.
- Parallel mutating agents require separate managed worktrees.
- Agent output is never human approval or canonical memory by itself.
- Product-facing naming moves incrementally from T3 Code to Relay.
- Internal compatibility identifiers are renamed only with an explicit migration and rollback plan.
- New documentation uses "transport relay" for the existing T3 Connect relay subsystem.

## Naming migration tracker

| Area                                                                                             | Current decision                            | Status                                                                         |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------ |
| Root project documentation                                                                       | Use Relay                                   | Initial rename complete                                                        |
| New product UI and modules                                                                       | Use Relay                                   | Planned                                                                        |
| Web/desktop/mobile display strings (titles, dialogs, labels)                                     | Migrated to Relay                           | Complete — see EN/TR + branding sections above                                 |
| `docs/user/*` (shipped-product docs)                                                             | Migrated to Relay                           | Complete                                                                       |
| Default theme display label, OAuth client display labels                                         | Migrated to Relay                           | Complete                                                                       |
| `docs/internals/*`, `docs/operations/*` (contributor/ops docs)                                   | Migrate by surface                          | Planned — lower priority than `docs/user`                                      |
| Marketing site (`apps/marketing`)                                                                | Needs dedicated review                      | Deferred — real user testimonials and legal pages, not a text-substitution job |
| Brand assets/icons (logo, wordmark, app icons)                                                   | Needs real design input                     | Blocked — cannot be produced by this agent                                     |
| Package scope `@t3tools/*`                                                                       | Retain initially                            | Intentional legacy                                                             |
| T3 home/userdata paths                                                                           | Retain until migration design               | Intentional legacy                                                             |
| RPC/service identifiers                                                                          | Retain until compatibility aliases exist    | Intentional legacy                                                             |
| `t3.json` and schema URL                                                                         | Retain until versioned schema migration     | Intentional legacy                                                             |
| Checkpoint refs and database schema                                                              | Retain until explicit data migration        | Intentional legacy                                                             |
| T3 Connect/network relay names                                                                   | Retain; call it transport relay in new docs | Intentional legacy                                                             |
| Desktop/mobile app identifiers and update channels (`productName`, `appName`, bundle/update IDs) | Retain until distribution migration         | Intentional legacy                                                             |
| `t3-code` MCP client/server identifiers, `t3code` Grok OAuth referrer                            | Retain — external protocol identifiers      | Intentional legacy                                                             |

## Evidence

Record evidence under the task or session that produced it. Evidence must state **what was actually
run**, not what was intended. Acceptable forms:

- a command and its result (`vp test run <path>` → PASS)
- a live provider/CLI session and its outcome
- a manually verified UI surface, named explicitly
- direct source inspection, when the claim is structural rather than behavioral

Source inspection alone never justifies `[x]` on a task with runtime behavior.

### Phase 0 — repository analysis

Verified by direct source inspection (no test suite was run for these claims):

- Provider contracts, driver SPI (`apps/server/src/provider/ProviderDriver.ts`), built-in catalog,
  provider/adapter registries, status snapshots, and multi-instance settings.
- `BUILT_IN_DRIVERS` contains exactly Codex, Claude, Cursor, Grok, OpenCode; all five declare
  `supportsMultipleInstances: true`.
- Unknown driver kinds degrade to `"unavailable"` shadow snapshots
  (`unavailableProviderSnapshot.ts`), which is the rollback path for a new driver.
- `provider/acp/` is provider-neutral (`AcpSessionRuntime`, `AcpAdapterSupport`, `AcpRuntimeModel`)
  with per-provider extensions — Cursor and Grok already ship on ACP.
- Orchestration event storage, receipts, decider/projectors/reactors, workflow activity bridge,
  approvals, worktrees, checkpoints, and RPC surfaces.
- Composer slash-command grouping, provider commands, Skills, Agents UI, and shared mobile runtime.
- **No localization system exists**: no `i18next`, `react-intl`, `lingui`, or `formatjs` in any
  workspace manifest. EN/TR is new work.
- **Qwen and Antigravity are not provider drivers.** Antigravity appears only as an external-editor
  target (`packages/contracts/src/editor.ts`) plus an icon; Qwen appears only as an OpenCode model
  string in test fixtures.
- `packages/contracts/src/settings.ts` uses a `Schema.Literals([...])` + `DEFAULT_*` pattern that a
  future `AppLocale` setting should follow. A `TimestampFormat` value of `"locale"` exists and is
  orthogonal to UI language.
- Roughly 140 files contain user-facing "T3 Code", concentrated in `docs/internals`, `docs/user`,
  `apps/server/src/provider/Layers`, `apps/desktop/src/app`, and `apps/web/src/components/settings`.

### Phase 0 — EN/TR localization foundation

Evidence is command output, run this session, not source inspection:

- `pnpm --filter @t3tools/contracts test` → 258 passed (19 files), including new `appLocale`
  round-trip/rejection tests in `settings.test.ts`.
- `pnpm --filter @t3tools/contracts typecheck` → clean.
- `pnpm --filter @t3tools/client-runtime test` → 606 passed (48 files), including
  `state/locale.test.ts` (`resolveAppLocale`, `matchSupportedLocale`).
- `pnpm --filter @t3tools/client-runtime typecheck` → clean (one pre-existing unrelated suggestion
  in `relay/discovery.ts`, not touched this session).
- `pnpm --filter @t3tools/web typecheck` → clean.
- `pnpm --filter @t3tools/web test` (full suite) → 2433/2437 passed, 252/253 files. The 4 failures
  are all in `Sidebar.snooze.test.ts` and are a pre-existing locale-dependent bug (that test calls
  `Intl.DateTimeFormat(undefined, ...)` and asserts English day/month abbreviations; this machine's
  default `Intl` locale is Turkish, so it renders "Pzt"/"ÖS" instead of "Mon"/"PM"). Confirmed
  pre-existing and unrelated: stashed every change from this session and reran just that file —
  identical 4 failures on the unmodified tree. Not fixed here; it's an existing bug in an unrelated
  file, out of scope for this slice.
- `apps/web/src/i18n/index.test.ts` (3 tests) and `apps/web/src/AppRoot.test.tsx` (2 tests) verified
  individually via `vp test run --project unit <file>` in addition to the full-suite run above.
- `pnpm lint` → exit 0; only pre-existing warnings in files this session never touched
  (`pullRequest/*`, `scripts/lib/cli-external-packages.test.ts`).
- **Not verified**: no browser/manual check that the Settings → Language selector renders and
  switches text live (per this repo's convention, browser verification needs explicit user request/
  approval, not taken this session). Structural correctness (wiring, hook behavior, i18next state
  transitions) is verified at the unit level; visual/interactive behavior is not — hence `[~]` above
  on both the selector and the switch-without-restart mechanism, not `[x]`.

### Phase 0 — Relay branding slice

98 files changed under `apps/` and `packages/` (310 insertions, 199 deletions), all display-string
renames plus their matching test assertions. Evidence is full test-suite output, run after every
batch of edits, not a single pass at the end:

- `pnpm --filter t3 test` (server, full suite) → 2508 passed, 7 skipped, 0 failed (230/232 files).
- `pnpm --filter @t3tools/desktop test` (full suite) → 516 passed, 0 failed (59 files).
- `pnpm --filter @t3tools/mobile test` (full suite) → 709 passed, 0 failed (108 files).
- `pnpm --filter @t3tools/web test` (full suite) → 2433/2437 passed — same 4 pre-existing,
  unrelated `Sidebar.snooze.test.ts` locale failures as above, no new failures.
- `pnpm --filter @t3tools/contracts test` → 258 passed (0 new failures from the `t3ProjectFile.ts`/
  `relay.ts` schema-description renames).
- `pnpm --filter @t3tools/client-runtime test` → 606 passed (0 new failures from the auth-fixture
  label renames).
- `pnpm --filter @t3tools/shared test` → 347 passed. `pnpm --filter @t3tools/ssh test` → 25 passed.
- Typecheck clean on every touched package (web, desktop, server, mobile, contracts,
  client-runtime, shared, ssh) — every diagnostic shown was a pre-existing "suggestion"-level
  note in a file this session never touched (`orchestration/decider.ts`,
  `pullRequest/GitHubPullRequestCli.ts`, `relay/discovery.ts`, etc.), never an error.
- `pnpm lint` → exit 0; only pre-existing warnings, all in files never touched this session.
- After every batch: `grep` re-verification that the specific identifiers each batch needed to
  preserve actually survived unchanged — `T3CODE_HOME`, `T3_SSH_AUTH_SECRET`, `T3 Connect`,
  `t3-code` (MCP identifiers), `t3code` (Grok OAuth referrer), `t3.json`/its schema URL,
  `legacyUserDataDirName`, `.app` bundle mock paths. Shown inline per batch above, not repeated
  here.
- **Not verified**: no browser/manual/simulator check that any renamed screen actually renders
  correctly (tab title, About panel, splash screen, Settings rows). Test suites confirm the
  renamed strings are exactly what each component now produces and that nothing broke
  structurally; they do not confirm visual layout or truncation at the new string lengths.

---

## 2026-08-14 — Session Summary

**Completed:**

- Verified the prior session's architecture audit against the codebase; all claims held.
- Rewrote `PROGRESS.md` into the mandated phase-by-phase checklist format.
- Added a Relay working-rules section to `AGENTS.md`.
- Created `docs/ARCHITECTURE.md`, `docs/PROVIDER-MATRIX.md`, and `docs/LOCALIZATION.md`.
- Recorded that Cursor and Grok already run on the provider-neutral ACP runtime, which is the
  reuse path for Qwen.

**Verified:**

- Source inspection only — driver catalog, ACP runtime genericity, absence of any i18n dependency,
  settings schema pattern, Antigravity/Qwen absence as providers.
- No test suite was run. No source file was modified.

**Pending:**

- Phase 0 implementation: Relay branding slices and the EN/TR localization foundation.

**Blocked:**

- Committing the Phase 0 documents — deferred by user decision; files remain in the working tree.

**Next:**

- Await explicit approval to begin Phase 0 implementation, starting with the localization
  foundation (contract + client-runtime state + Settings → Language) before branding slices.

---

## 2026-08-14 — Session Summary (continued: EN/TR localization foundation)

User approved starting Phase 0 implementation with the localization foundation.

**Completed:**

- `AppLocale` contract (`system`/`en`/`tr`) in `packages/contracts/src/settings.ts`, added to
  `ClientSettingsSchema` and `ClientSettingsPatch`.
- `i18next` + `react-i18next` added to `apps/web/package.json` (web-only; not the shared catalog,
  since no other workspace needs them yet).
- Pure `resolveAppLocale`/`matchSupportedLocale` helper in
  `packages/client-runtime/src/state/locale.ts`, exported as `@t3tools/client-runtime/state/locale`.
- `apps/web/src/i18n/index.ts` + `locales/{en,tr}.json`: i18next init, `syncAppLocale`, and the
  first real resource bundle (`settings.language.*`).
- `apps/web/src/hooks/useAppLocaleSync.ts` + `AppRoot.tsx`'s new `AppLocaleSync`/`I18nextProvider`
  wiring, applying the saved locale on every settings change.
- Settings → Language row in `GeneralSettingsPanel` (`SettingsPanels.tsx`), following the existing
  `timestampFormat` pattern, including the "Restore defaults" dirty-check/reset wiring and a
  `settingsSearch.ts` catalog entry.
- Updated `AppRoot.test.tsx` for the new provider structure; existing test suite otherwise
  untouched except for the new tests this slice added.

**Verified:** see "Phase 0 — EN/TR localization foundation" evidence above — contracts, client-runtime,
and web typecheck clean; contracts (258) and client-runtime (606) tests fully pass; web full suite
2433/2437 pass with the 4 failures confirmed pre-existing (locale-dependent, unrelated file, repro'd
against the unmodified tree); `pnpm lint` exit 0 with only pre-existing unrelated warnings.

**Not verified:** no live browser check of the Settings → Language row rendering or switching text —
two items stay `[~]` for that reason. `Intl` formatting helpers and pluralization are not built —
no consumer needs them yet. Provider-content-is-never-translated has no test because nothing routes
provider content through i18next yet (true by construction, not by an explicit test).

**Pending:**

- Relay branding slices (~140 files with hard-coded "T3 Code" strings) — separate, larger migration,
  intentionally not started this slice.
- Mobile locale/Settings support — `apps/mobile` has its own UI and was not touched.
- Browser verification of the Language selector.
- `Intl` formatting helpers, pluralization, provider-content-isolation test — deferred until a real
  consumer needs them.

**Blocked:**

- none.

**Next:**

- Either: browser-verify the Language selector (needs explicit approval per this repo's convention),
  or move to the next Phase 0 branding slice, or begin Phase 1 planning — user's call.

---

## 2026-08-14 — Session Summary (continued: Relay branding — web, desktop, mobile)

User asked to complete Phase 0.

**Completed:**

- Full-repo inventory and file-by-file classification of every "T3 Code" occurrence (159 →
  61 files), distinguishing product display strings from technical identifiers, real external
  quotes, historical statements, and generic test fixtures.
- Renamed the central branding constants driving web (`apps/web/src/branding.ts`) and desktop
  (`apps/desktop/src/app/DesktopEnvironment.ts`) display names, plus ~60 additional files across
  web, desktop, mobile, server, contracts, shared, and ssh — every genuine user-facing display
  string: window/tab titles, dialog copy, error/status messages, OAuth client labels, the default
  theme's display label, systemd service description, Codex/OpenCode/Cursor/Claude/Grok
  "disabled in ... settings" messages, the Codex system-prompt self-identification text, and
  `docs/user/*` (all 10 shipped-product docs).
- Found and fixed a real pre-existing gap from the earlier `AppLocale` schema change: a hardcoded
  full-`ClientSettings` fixture in `apps/desktop/src/settings/DesktopClientSettings.test.ts` was
  missing the new field, which the desktop test suite (not run until this pass) caught.
- Deliberately left untouched, with reasoning recorded per case: internal/wire identifiers
  (`T3CODE_HOME`, `T3_SSH_AUTH_SECRET`, `t3-code` MCP identifiers, `t3code` Grok OAuth referrer,
  `t3.json`, `legacyUserDataDirName`), distribution identifiers (`productName`, mobile `appName`,
  `.app` bundle paths), asset-paired branding (mobile `BrandMark`/`CompactBrandTitle`, splash/tab
  icon alt text — all reference a real, unrenamed image/SVG asset), real third-party content
  (marketing-site tweet testimonials), a historical statement (`t3-markdown-text/UPSTREAM.md`),
  code comments, and generic test fixtures using "T3 Code" as a plausible sample project name.
  Resolved one real naming collision deliberately (`packages/contracts/src/relay.ts`'s OpenAPI
  title, "T3 Code Relay API" → "Relay Transport API" rather than the colliding literal
  substitution "Relay Relay API").

**Verified:** see "Phase 0 — Relay branding slice" evidence above — full test suites pass on every
touched package (server 2508, desktop 516, mobile 709, web 2433/2437 with the same 4 pre-existing
unrelated failures, contracts 258, client-runtime 606, shared 347, ssh 25); typecheck clean on
every touched package; `pnpm lint` exit 0. Every identifier each batch needed to preserve was
re-grepped after editing to confirm it survived.

**Not verified:** no browser, Electron, or simulator check that any renamed screen actually
_renders_ correctly — string correctness and test-suite behavior are confirmed; visual layout,
truncation, and the live language-switch UX are not.

**Pending:**

- Brand assets and icons — blocked on real design input, cannot be produced by this agent.
- Marketing site (`apps/marketing`) — needs dedicated review, not a text-substitution pass (real
  testimonials, legal pages).
- `docs/internals/*` and `docs/operations/*` — contributor/ops docs, lower priority than
  `docs/user/*` per this repo's own audience split, not renamed this slice.
- Mobile app display name / distribution identifiers, desktop `productName` — deferred with the
  rest of the distribution-identifier migration.
- Browser/simulator verification of all renamed surfaces.

**Blocked:**

- Brand assets and icons (see above) — the only Phase 0 branding item that cannot reach `[x]`
  without a human providing real design assets.

**Next:**

- Phase 0 is complete to the extent achievable without new design assets or a dedicated
  marketing/legal review. Report this to the user and ask before starting Phase 1
  (capability registry, Qwen, Antigravity) per this file's own phase-gate rule.
