import type { AppLocale } from "@t3tools/contracts/settings";

/**
 * Locales Relay ships UI translations for. Kept separate from `AppLocale`
 * (which also carries the `"system"` sentinel) because callers resolving a
 * concrete locale to render never want to branch on `"system"` themselves.
 */
export const SUPPORTED_LOCALES = ["en", "tr"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const FALLBACK_LOCALE: SupportedLocale = "en";

function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Matches a BCP 47 tag (e.g. `tr-TR`, `en-US`) to a supported locale by
 * primary language subtag. Returns `null` when nothing matches, so callers
 * can keep trying further candidates before falling back to English.
 */
export function matchSupportedLocale(tag: string | null | undefined): SupportedLocale | null {
  if (!tag) {
    return null;
  }
  const primarySubtag = tag.trim().toLowerCase().split(/[-_]/)[0];
  return primarySubtag && isSupportedLocale(primarySubtag) ? primarySubtag : null;
}

/**
 * Resolves the locale Relay should render in, in priority order: an
 * explicit saved preference, then the first matching platform-reported
 * locale, then English. Pure and side-effect-free so web and mobile share
 * one tested implementation instead of duplicating `Intl`/`navigator`
 * probing logic — see docs/LOCALIZATION.md.
 */
export function resolveAppLocale(input: {
  readonly savedPreference: AppLocale;
  readonly platformLocales: ReadonlyArray<string>;
}): SupportedLocale {
  if (input.savedPreference !== "system") {
    return input.savedPreference;
  }
  for (const candidate of input.platformLocales) {
    const matched = matchSupportedLocale(candidate);
    if (matched) {
      return matched;
    }
  }
  return FALLBACK_LOCALE;
}
