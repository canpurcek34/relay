# Relay Provider Matrix

Which providers Relay supports, how each one is integrated, and what remains planned.

**Status as of 2026-08-14.** Five providers ship today, inherited from T3 Code. Qwen Code and Google
Antigravity are **planned** for Phase 1 and are not implemented — no driver exists for either. Nothing
in this document marked _planned_ should be described to a user as supported.

## Integration status

| Provider    | Status                | Transport                                    | Driver                      |
| ----------- | --------------------- | -------------------------------------------- | --------------------------- |
| Codex       | Shipping              | Codex App Server (`effect-codex-app-server`) | `Drivers/CodexDriver.ts`    |
| Claude Code | Shipping              | `@anthropic-ai/claude-agent-sdk`             | `Drivers/ClaudeDriver.ts`   |
| Cursor      | Shipping              | ACP (`effect-acp`)                           | `Drivers/CursorDriver.ts`   |
| Grok        | Shipping              | ACP (`effect-acp`)                           | `Drivers/GrokDriver.ts`     |
| OpenCode    | Shipping              | `@opencode-ai/sdk`                           | `Drivers/OpenCodeDriver.ts` |
| Qwen Code   | **Planned** — Phase 1 | ACP (`qwen --acp`), intended                 | —                           |
| Antigravity | **Planned** — Phase 1 | Structured interface, to be confirmed        | —                           |

Antigravity currently exists in the codebase only as an _external editor_ target
(`packages/contracts/src/editor.ts`, command `agy`) and an icon. That is a "open this project in
another app" affordance, not a provider integration.

## Capability surface

These columns come from the actual SPI, not from an aspirational feature list —
`ProviderDriverMetadata`, `ProviderAdapterShape`, `ProviderAdapterCapabilities`, and
`ProviderMaintenanceCapabilities`.

| Capability                  | Source                                             | Codex      | Claude     | Cursor     | Grok       | OpenCode   |
| --------------------------- | -------------------------------------------------- | ---------- | ---------- | ---------- | ---------- | ---------- |
| Multiple instances          | `ProviderDriverMetadata.supportsMultipleInstances` | Yes        | Yes        | Yes        | Yes        | Yes        |
| Typed config schema         | `ProviderDriver.configSchema`                      | Yes        | Yes        | Yes        | Yes        | Yes        |
| Start / send / stop session | `ProviderAdapterShape`                             | Yes        | Yes        | Yes        | Yes        | Yes        |
| Interrupt turn              | `interruptTurn`                                    | Yes        | Yes        | Yes        | Yes        | Yes        |
| Read thread                 | `readThread`                                       | Yes        | Yes        | Yes        | Yes        | Yes        |
| Rollback thread             | `rollbackThread`                                   | Yes        | Yes        | Yes        | Yes        | Yes        |
| Permission requests         | `respondToRequest`                                 | Yes        | Yes        | Yes        | Yes        | Yes        |
| User-input requests         | `respondToUserInput`                               | Yes        | Yes        | Yes        | Yes        | Yes        |
| Runtime event stream        | `streamEvents`                                     | Yes        | Yes        | Yes        | Yes        | Yes        |
| Mid-session model switch    | `ProviderAdapterCapabilities.sessionModelSwitch`   | Per driver | Per driver | Per driver | Per driver | Per driver |
| Update / maintenance action | `ProviderMaintenanceCapabilities.update`           | Per driver | Per driver | Per driver | Per driver | Per driver |

The uniform "Yes" columns reflect that `ProviderAdapterShape` is a **required** interface — every
driver implements all of it. Real capability variation lives in the "per driver" rows and in runtime
state (installed version, auth status, available models), which is exactly why Phase 1 introduces a
normalized capability registry instead of a static table like this one.

**This table is a snapshot for humans. It is not a runtime source of truth and no code should encode
it.** Once the Phase 1 capability registry exists, UI and routing read capabilities from the registry.

## Shared infrastructure

Regardless of provider, the following is provider-neutral and reused:

- **Driver registry** — `ProviderInstanceRegistry` owns live instances keyed by `ProviderInstanceId`.
  Driver kinds are open: an instance whose driver is not in the catalog degrades to an
  `"unavailable"` shadow snapshot (`unavailableProviderSnapshot.ts`) rather than failing startup.
- **ACP runtime** — `apps/server/src/provider/acp/` is provider-neutral (`AcpSessionRuntime`,
  `AcpAdapterSupport`, `AcpRuntimeModel`, `AcpCoreRuntimeEvents`) with thin per-provider extensions
  (`CursorAcpSupport`, `CursorAcpExtension`, `GrokAcpSupport`, `XAiAcpExtension`).
- **Status and maintenance** — install detection, version, auth state, model listing, and update
  actions run through the shared snapshot/maintenance services.
- **Instance isolation** — `ProviderDriver.create` owns all per-instance state and must share no
  mutable state with another instance of the same driver. This is what makes "Codex Work" and
  "Codex Personal" safe as separate accounts.

## Adding a provider

The recipe is documented in
[builtInDrivers.ts](../apps/server/src/provider/builtInDrivers.ts) and is not duplicated here:

1. Implement `ProviderDriver` in `Drivers/<Name>Driver.ts`.
2. Add it to `BUILT_IN_DRIVERS`.
3. Ensure the runtime layer satisfies the driver's declared `R`.

Do not build a bespoke subprocess path for a new provider. Removing the driver from the catalog is the
rollback — existing configuration survives as an unavailable shadow snapshot.

## Phase 1 decisions

### Qwen Code — reuse ACP

Qwen exposes a stable ACP mode (`qwen --acp`). Relay will drive it through the existing `effect-acp`
package and the provider-neutral ACP runtime, following the `CursorAcpSupport` / `GrokAcpSupport`
pattern. This is the lowest-risk integration available: two shipping providers already run on this
path, so session lifecycle, permissions, cancellation, and event mapping are proven.

Authentication stays provider-owned — Relay reads the user's existing Qwen Coding Plan session through
Qwen's own mechanisms and never extracts or stores credentials.

Qwen's local `/stats` and `/usage` output is **session telemetry, not official plan quota**. If it is
surfaced at all it must carry the `local_estimate` source and never be presented as subscription
quota.

### Antigravity — structured interface or nothing

Relay will integrate Antigravity only through an official structured SDK or a structured JSON event
mode that exposes correlated sessions, cancellation, and resume, while reusing provider-owned auth.

**Relay will never scrape a TUI.** If an installed Antigravity version offers no safe session
contract, the provider stays visible with accurate install/version/auth status but turn execution is
disabled behind a version-aware reason. A visibly disabled provider with an honest explanation is the
correct outcome; a fragile screen-scraper is not.

Antigravity's IDE-only features must not be confused with its CLI features. Only what the installed
CLI actually exposes may be advertised as a capability.

## Rules

- Provider-specific logic belongs in drivers and adapters. Never branch on provider name in
  orchestration, routing, workflow, or UI code.
- Never extract OAuth refresh tokens, scrape browser cookies, store provider passwords, or
  reverse-engineer private billing APIs. See [SECURITY.md](../SECURITY.md).
- Never share mutable authentication state between provider instances.
- Capability claims must be discovered from the runtime, not hard-coded per provider name.
- A provider integration is not complete until it has been verified against the real CLI. Passing
  mock-peer tests keeps a task at `[~]` in [PROGRESS.md](../PROGRESS.md), not `[x]`.
