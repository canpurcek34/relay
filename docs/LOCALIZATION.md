# Relay Localization

Relay ships English and Turkish as first-class languages from day one.

> **Status: foundation implemented on web.** `i18next` + `react-i18next` are wired into
> `apps/web` (desktop gets it for free — Electron wraps the same web bundle). `apps/mobile` has
> its own React Native UI and is not covered yet. Track progress in [PROGRESS.md](../PROGRESS.md).

## Supported locales

| Code | Language           |
| ---- | ------------------ |
| `en` | English (fallback) |
| `tr` | Türkçe             |

The system must support adding a third locale without structural change, but only `en` and `tr` are
committed to.

## Locale resolution

Resolved in this order, first match wins:

```text
saved user preference
        ↓
browser / system locale
        ↓
English (en)
```

A saved preference always wins over the platform locale — a user who chose English on a Turkish
system gets English. Platform locale is matched by language subtag, so `tr-TR` resolves to `tr`.
Anything unrecognized falls back to `en`; resolution never fails or renders raw keys.

## Settings contract

The locale is a client setting following the existing pattern in
[settings.ts](../packages/contracts/src/settings.ts), which uses `Schema.Literals([...])` paired with
a `DEFAULT_*` constant (see `TimestampFormat`, `SidebarProjectSortOrder`):

```ts
export const AppLocale = Schema.Literals(["system", "en", "tr"]);
export type AppLocale = typeof AppLocale.Type;
export const DEFAULT_APP_LOCALE: AppLocale = "system";
```

This is the shipped shape — as implemented, `AppLocale` carries a `"system"` sentinel (default)
alongside the two concrete locales, rather than only `en`/`tr` with resolution handled entirely
outside the schema. That mirrors `TimestampFormat`'s own `"locale"` sentinel value and lets a
stored setting distinguish "explicitly chose English" from "never chose, follow the platform" —
the same distinction `TimestampFormat: "locale"` makes for clock format.

Two notes:

- `TimestampFormat`'s `"locale"` value controls **clock format** (12h/24h/system) and is orthogonal
  to UI language. Do not conflate them.
- The setting must decode on clients that predate it, and older clients must tolerate encountering it.
  Additive contract change only.

`resolveAppLocale` (`packages/client-runtime/src/state/locale.ts`) turns an `AppLocale` plus a list
of platform locale tags into a concrete `"en" | "tr"` to render — resolving `"system"` against the
platform, and passing an explicit `"en"`/`"tr"` straight through. Web and mobile should both resolve
through this one function so they cannot drift; only web calls it today.
Settings → Language exposes the selector (`apps/web/src/components/settings/SettingsPanels.tsx`,
`GeneralSettingsPanel`). Switching language applies immediately, without a restart
(`apps/web/src/hooks/useAppLocaleSync.ts` calls `i18next.changeLanguage` on every settings change).

## Implementation (web)

| Piece                          | File                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `AppLocale` contract           | [settings.ts](../packages/contracts/src/settings.ts)                                                          |
| Locale resolution (pure)       | [state/locale.ts](../packages/client-runtime/src/state/locale.ts)                                             |
| i18next init + `syncAppLocale` | [i18n/index.ts](../apps/web/src/i18n/index.ts)                                                                |
| Resource bundles               | [i18n/locales/en.json](../apps/web/src/i18n/locales/en.json), [tr.json](../apps/web/src/i18n/locales/tr.json) |
| Settings-change → i18next sync | [hooks/useAppLocaleSync.ts](../apps/web/src/hooks/useAppLocaleSync.ts)                                        |
| Provider wiring                | [AppRoot.tsx](../apps/web/src/AppRoot.tsx) (`I18nextProvider`, `AppLocaleSync`)                               |
| Language selector              | [SettingsPanels.tsx](../apps/web/src/components/settings/SettingsPanels.tsx) (`GeneralSettingsPanel`)         |

Resource bundles currently hold only the `settings.language.*` keys this slice introduced.
Migrating the existing T3 Code UI strings into this system is separate, larger work tracked in
[PROGRESS.md](../PROGRESS.md) alongside the Relay branding rename — not done incrementally as a
side effect of this foundation.

## What is localized

- UI labels, navigation, and empty states
- Settings screens and their descriptions
- Error messages shown to users
- Quota labels, sources, and reset times
- Provider status and workflow status
- Command names and descriptions in the `/` palette
- Approval prompts and their consequences
- Tooltips and confirmations
- Dates, times, numbers, percentages, and relative times via `Intl`
- Plural forms

## What is never localized

- **Provider- and model-generated conversation content.** Never machine-translate what an agent said.
- Code, file paths, identifiers, and symbol names
- Commit messages, branch names, and Git output
- Logs, diagnostics, and stack traces
- Developer documentation, including this file
- Raw provider CLI output

Turkish users get a Turkish interface around English agent output. That is correct — translating a
model's reasoning or a tool's output would misrepresent it.

## Formatting

Use `Intl` rather than hand-rolled formatting, with the resolved locale:

- `Intl.DateTimeFormat` for dates and times, honoring the user's `TimestampFormat` setting
- `Intl.NumberFormat` for numbers and percentages — quota displays go through this
- `Intl.RelativeTimeFormat` for "3 minutes ago" style output
- `Intl.PluralRules` (via the i18n library's plural support) for counts

Turkish differs from English in ways that break naive string building: it has different plural
behavior, and vowel-harmony suffixes mean sentence fragments cannot be concatenated. **Never build a
user-facing sentence by concatenating translated fragments.** Use one key per complete sentence with
interpolation.

Turkish also has the dotted/dotless İ/ı problem: `toLowerCase()` and `toUpperCase()` without a locale
argument corrupt Turkish text. Use locale-aware case conversion, or avoid programmatic case changes
in favor of CSS `text-transform`.

## Keys

- Namespace by surface, then by component: `settings.language.title`, `quota.source.local_estimate`,
  `workflow.role.builder`.
- Keys are stable identifiers. Rename them only deliberately — a renamed key silently falls back.
- Every key exists in `en`. A missing `tr` entry falls back to English rather than rendering the key.
- Interpolated values are escaped by default. Never disable escaping for user- or provider-supplied
  content.

## Rules

- **New Relay surfaces must not hard-code user-facing strings** once the foundation lands.
- Both locales ship together. A new Relay surface with only English is incomplete.
- Inherited T3 Code strings are migrated incrementally alongside the branding slices — see the naming
  tracker in [PROGRESS.md](../PROGRESS.md). Do not run a bulk find-and-replace to wrap every existing
  string at once.
- Locale is presentation. It never changes routing, quota policy, approval requirements, or any
  server-side decision.

## Testing

- Resolution order: saved preference, platform locale, fallback, unrecognized input
- Persistence across reload and across web/desktop/mobile
- Switching applies without restart
- Pluralization in both locales
- `Intl` formatting for dates, numbers, and percentages in both locales
- Every `en` key has a `tr` counterpart, and no `tr`-only orphans exist
- Interpolated values are escaped
- Provider conversation content is untouched by the locale setting
