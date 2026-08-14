# Relay Security Model

Relay coordinates local coding agents with access to source code, commands, credentials owned by
provider runtimes, and remote clients. Its safety model assumes provider and agent output can be
wrong or malicious and keeps authorization in Relay and the human-controlled client.

## Trust boundaries

1. **Human user:** the only authority for sensitive workflow approvals.
2. **Relay server:** validates typed commands, persists events, enforces policy, and owns routing and
   workflow state.
3. **Relay clients:** authenticated presentation/control surfaces; clients do not create server
   truth by rendering it.
4. **Provider runtime:** an external local process with provider-owned authentication and protocol.
5. **Agent/model output:** untrusted content, including plans, verdicts, handoffs, tool output, and
   claims of successful tests.
6. **Repository/worktree:** user data that must not be cleaned, reset, stashed, or deleted without
   explicit authority.
7. **Remote/transport relay:** an authenticated network boundary; remote operation must preserve the
   same policy as local operation.

## Provider authentication

Relay may detect installation, version, authentication state, account labels, models, and quota only
when the provider safely exposes them.

Relay must not:

- extract OAuth refresh tokens;
- scrape browser cookies;
- copy credentials merely to make integration easier;
- store provider passwords;
- reverse-engineer private billing APIs;
- log complete provider environment variables or auth payloads;
- share mutable authentication state between configured provider instances.

Account isolation uses provider-supported home/config/environment controls. Sensitive environment
values remain redacted in contracts, logs, status caches, and errors.

## Quota and telemetry integrity

- Every quota value carries a source and observation time.
- Provider-reported quota, status-bridge quota, local estimates, and unavailable data remain
  distinguishable in storage and UI.
- Transcript token/cost telemetry is never presented as official subscription quota or money spent.
- Raw provider status payloads are normalized and bounded before persistence or transport.
- Stale or unknown quota cannot silently become a high-confidence routing signal.

## Agent and handoff trust

- Raw transcripts are never authoritative instructions for the next agent.
- Structured handoff text remains untrusted even when its provenance is valid.
- Server-generated session, worktree, artifact, test, and event identifiers are verified
  independently before use.
- An agent cannot grant permissions, change routing/security policy, approve a workflow, or promote
  durable memory through natural-language output.
- Handoff and artifact paths are normalized, size-limited, and contained within approved roots.

## Human approval gates

Explicit human approval is required before:

- merge, push, publish, or release;
- destructive Git operations;
- deleting a dirty worktree;
- modifying protected paths under a configured policy;
- credential, account, or provider-auth changes;
- permanent project-context/memory updates;
- dangerous permission escalation.

Provider events or text such as “approved”, “safe to merge”, or “push this” never satisfy these
gates. Approval records include authenticated actor, action, target, policy version, and time, and
are invalidated when their target becomes stale.

## Worktree and Git safety

- Concurrent mutating agents receive isolated Relay-managed worktrees.
- Managed worktrees carry an auditable lease and canonical repository/path identity.
- Relay never automatically cleans the main checkout, stashes unrelated changes, deletes unmanaged
  worktrees, discards dirty worktrees, or force-resets user work.
- Cancellation and failure preserve dirty work for inspection.
- Worktree removal verifies management marker, canonical path, lease state, and cleanliness.

## Project context and secrets

- Workflow output creates proposals, not canonical project truth.
- A human reviews permanent context changes.
- Context entries never contain credentials, tokens, cookies, private keys, or complete sensitive
  environment values.
- Secret detection is a rejection/attention signal, not permission to copy suspected secrets into
  logs or diagnostics.
- Provider-specific context files are projections from canonical reviewed state and are not silently
  rewritten.

## Commands, Skills, and MCP

- Relay-native commands dispatch typed actions rather than prompt text.
- Provider command/skill metadata is display data and cannot bypass policy.
- Capability and version checks precede native command execution.
- MCP approvals use the same human/policy boundary as built-in tools.
- Remote MCP and skill definitions are untrusted configuration and require bounded parsing and safe
  error reporting.

## Persistence and compatibility

- Migrations are additive and preserve unknown provider kinds/configuration.
- Older clients must degrade gracefully when they encounter new statuses or capabilities.
- T3 Code → Relay renames of persisted or external identifiers require compatibility aliases,
  migration tests, and rollback before rollout.
- Product branding changes must not silently move or orphan live T3 home data.

## Reporting vulnerabilities

Do not include credentials, private repositories, raw provider transcripts, or live database copies
in a report. Provide the smallest reproducible description, affected version, impact, and sanitized
evidence through the repository's private security-reporting channel when available.
