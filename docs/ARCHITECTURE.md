# Relay Architecture

Relay is built on T3 Code's architecture rather than replacing it. This document describes the
**target layering** and where new Relay subsystems belong. It deliberately does not restate the
inherited architecture — the existing internals docs remain authoritative for that:

| Topic                        | Document                                                             |
| ---------------------------- | -------------------------------------------------------------------- |
| System overview              | [internals/overview.md](./internals/overview.md)                     |
| Provider system              | [internals/providers.md](./internals/providers.md)                   |
| Client connection runtime    | [internals/connection-runtime.md](./internals/connection-runtime.md) |
| Remote operation             | [internals/remote.md](./internals/remote.md)                         |
| Transport relay (T3 Connect) | [internals/t3-connect.md](./internals/t3-connect.md)                 |
| Workspace layout             | [internals/workspace-layout.md](./internals/workspace-layout.md)     |
| Terminology                  | [internals/glossary.md](./internals/glossary.md)                     |

## Target layering

Relay extends one path. It does not introduce a parallel one.

```text
Relay clients (web, desktop, mobile)
  -> typed contracts and WebSocket RPC
  -> event-sourced orchestration
  -> provider-neutral router / workflow scheduler
  -> provider instance adapter
  -> provider-owned runtime and authentication
```

Every layer boundary is a place where provider-specific detail is removed, never added. By the time a
request reaches orchestration it must be expressed in provider-neutral terms; by the time it reaches
an adapter it may be provider-specific again.

## Non-goals

Relay must **not** add a second:

- event store or persistence layer
- subprocess or process-supervision framework
- WebSocket protocol or RPC mechanism
- Git or worktree implementation
- permission or approval system
- client state runtime

If a Relay feature seems to require one of these, that is a signal to extend the existing subsystem —
or to raise the question with a human before designing around it.

## Classification

Every Relay capability was classified against the existing codebase.

### Reuse as-is

The event-sourced orchestration core (commands, receipts, pure decider, projectors, reactors), typed
contracts and RPC, the provider driver/adapter and status registries, the ACP client package and the
provider-neutral ACP runtime, provider-owned install/version/auth/model/command/skill discovery, Git
worktrees, checkpoints, diffs and restore, source-control integrations, permission modes and inline
provider approvals, and the shared client runtime across web, desktop, mobile, remote, and tunnel.

The five existing providers — Codex, Claude, Cursor, Grok, OpenCode — are reused unchanged. Preserving
their behavior is an acceptance criterion for every Relay phase.

### Extend

- Provider snapshots and adapter capabilities → a normalized, version-aware capability registry.
- Provider settings/status UI → a provider and account dashboard.
- Provider rate-limit events and safe probes → provenance-bearing quota observations.
- Orchestration aggregates → routing decisions and Relay-owned workflows.
- Existing Agents and slash-command surfaces → provider-neutral Relay views and typed actions.
- Client settings → a saved locale preference.

### New

Qwen and Antigravity drivers/adapters; the provider-neutral quota model and source-confidence policy;
the explainable quota-aware router; sequential workflows and the later DAG scheduler; structured
handoffs and workflow-level human approvals; worktree leases; canonical reviewed project context; and
the EN/TR localization runtime.

## Where new subsystems live

Following the ownership map in [FILETREE.md](../FILETREE.md):

| Subsystem                                                          | Home                                            |
| ------------------------------------------------------------------ | ----------------------------------------------- |
| Quota, routing, workflow, handoff, approval, context wire shapes   | `packages/contracts`                            |
| Source-neutral client state and presentation                       | `packages/client-runtime`                       |
| Pure router and workflow decisions                                 | beside `apps/server/src/orchestration`          |
| Side effects of those decisions                                    | orchestration reactors                          |
| Provider commands, auth probes, quota extraction, protocol mapping | `apps/server/src/provider/Drivers` and `Layers` |
| Worktree creation, inspection, removal                             | existing VCS services                           |

Pure decision logic stays separable from effects: a router or scheduler decision must be a function of
its inputs, testable without a running provider.

## Provider extension

Adding a provider is a bounded, documented operation — see the recipe in
[builtInDrivers.ts](../apps/server/src/provider/builtInDrivers.ts):

1. Implement `ProviderDriver` in `apps/server/src/provider/Drivers/<Name>Driver.ts`.
2. Add it to `BUILT_IN_DRIVERS`.
3. Ensure the runtime layer satisfies the driver's declared `R`.

Two properties make this safe. Driver kinds are **open**: a configured instance whose driver is not in
the catalog degrades to an `"unavailable"` shadow snapshot rather than breaking startup, which is also
the rollback path for a new driver. And instances are **isolated**: `create` owns all per-instance
state and must share no mutable state with another instance of the same driver.

ACP-based providers reuse `apps/server/src/provider/acp/`, which is provider-neutral
(`AcpSessionRuntime`, `AcpAdapterSupport`, `AcpRuntimeModel`, `AcpCoreRuntimeEvents`) with thin
per-provider extensions. Cursor and Grok already ship on this path.

See [PROVIDER-MATRIX.md](./PROVIDER-MATRIX.md) for per-provider capabilities.

## Naming hazard

`packages/client-runtime/src/relay/`, `managedRelay.ts`, `relayClient.ts`, and related modules are the
**transport relay** — the T3 Connect networking subsystem that lets remote clients reach a server.
They predate and are unrelated to the Relay product. New documentation says "transport relay" when
referring to them. Do not repurpose or bulk-rename these modules.

## Phase sequencing

The architecture is delivered in phases, each an independently releasable vertical slice. See
[PLAN.md](../PLAN.md) for phase definitions and [PROGRESS.md](../PROGRESS.md) for current status. A
phase does not begin until the previous phase's exit gate is met and a human approves the transition.
