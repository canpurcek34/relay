# Relay Architecture File Tree

This is a curated ownership map, not an exhaustive generated file list.

```text
relay/
├── PROJECT.md                    Product vision, principles, naming policy
├── PLAN.md                       Phased implementation roadmap
├── PROGRESS.md                   Audit, decisions, gates, current status
├── SECURITY.md                   Trust boundaries and safety requirements
├── AGENTS.md                     Agent working rules (symlinked as CLAUDE.md)
├── apps/
│   ├── server/
│   │   └── src/
│   │       ├── orchestration/    Commands, pure decider, projectors, reactors, receipts
│   │       ├── persistence/      Event store, projections, additive SQLite migrations
│   │       ├── provider/
│   │       │   ├── Drivers/      Provider instance factories and configuration
│   │       │   ├── Layers/       Provider adapters, probes, registries, sessions
│   │       │   ├── Services/     Provider-neutral service interfaces
│   │       │   └── acp/          Shared ACP runtime support
│   │       ├── vcs/              Git/worktree/checkpoint implementation
│   │       └── usage/            Local transcript-derived usage telemetry
│   ├── web/
│   │   └── src/
│   │       ├── components/       Chat, Agents, providers, settings, diff, approvals
│   │       ├── routes/           Web/desktop navigation surfaces
│   │       └── state/            Web-specific state and presentation
│   ├── desktop/                  Electron shell, IPC, packaging, updates, local host
│   ├── mobile/                   React Native navigation and mobile presentation
│   └── marketing/                Public website
├── packages/
│   ├── contracts/                Effect Schema contracts and RPC definitions
│   ├── client-runtime/           Shared web/mobile connection, state, and presentation
│   ├── shared/                   Small shared runtime utilities
│   ├── effect-acp/               Typed ACP client and protocol
│   └── effect-codex-app-server/  Typed Codex app-server client and protocol
├── docs/
│   ├── ARCHITECTURE.md           Relay target layering, classification, subsystem ownership
│   ├── PROVIDER-MATRIX.md        Per-provider integration status and capabilities
│   ├── LOCALIZATION.md           EN/TR strategy, locale resolution, formatting rules
│   ├── user/                     Shipped-product documentation
│   ├── internals/                Architecture and contributor documentation
│   └── operations/               Release, observability, and operational runbooks
├── scripts/                      Development, release, build, and brand tooling
└── .repos/                       Read-only vendored references; never edit/import
```

## Planned Relay ownership

New subsystems should follow existing boundaries:

- Quota, routing, workflow, handoff, approval, and project-context wire shapes belong in
  `packages/contracts`.
- Source-neutral client state/presentation belongs in `packages/client-runtime`.
- Pure workflow/router decisions belong beside orchestration, with effects in reactors.
- Provider-specific commands, auth probes, quota extraction, and protocol mapping belong in
  provider drivers/adapters.
- Worktree creation, inspection, and removal continue through the VCS services.
- Web, desktop, and mobile render shared contracts; no client invents server truth.

## Naming guidance

- New product modules use `Relay` names.
- Existing `relay.ts`, `relayClient.ts`, and related files currently describe the network transport
  relay/T3 Connect system. Do not repurpose or bulk-rename them for the Relay product.
- Existing T3-prefixed persisted or external identifiers remain until their individual migration
  plans are approved and tested.
