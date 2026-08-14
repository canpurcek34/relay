import { getLocales } from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import type { AppLocale } from "@t3tools/contracts/settings";
import { resolveAppLocale, SUPPORTED_LOCALES } from "@t3tools/client-runtime/state/locale";

import en from "./locales/en.json";
import tr from "./locales/tr.json";

/**
 * Resources for every shipped locale. Deliberately its own small bundle,
 * independent of `apps/web`'s — apps do not import across `apps/*`, and
 * mobile's Settings screen is a separate component tree from web's. See
 * docs/LOCALIZATION.md.
 */
const resources = {
  en: { translation: en },
  tr: { translation: tr },
} satisfies Record<(typeof SUPPORTED_LOCALES)[number], { translation: unknown }>;

function readPlatformLocales(): readonly string[] {
  try {
    return getLocales().map((locale) => locale.languageTag);
  } catch {
    // Native module unavailable (e.g. a non-native test/showcase environment).
    return [];
  }
}

/**
 * Resolved once at module load using only the platform locale, since the
 * saved device preference hydrates asynchronously from `MobilePreferencesStore`
 * (see `state/preferences.ts`). `syncAppLocale` below applies the real
 * preference as soon as it is known and on every later change.
 */
const initialLocale = resolveAppLocale({
  savedPreference: "system",
  platformLocales: readPlatformLocales(),
});

void i18next.use(initReactI18next).init({
  resources,
  lng: initialLocale,
  fallbackLng: "en",
  interpolation: {
    // React Native already renders interpolated values as plain text nodes;
    // double escaping here would corrupt entities in translated strings.
    escapeValue: false,
  },
  // Provider/agent conversation content must never flow through this
  // instance — only Relay-authored UI strings belong in `resources`.
  returnEmptyString: false,
});

/**
 * Applies a saved `AppLocale` preference, resolving `"system"` against the
 * current platform locales. Safe to call on every preference change —
 * returns `undefined` without touching i18next when the resolved locale is
 * already active, or the pending `changeLanguage` promise otherwise.
 */
export function syncAppLocale(preference: AppLocale): Promise<unknown> | undefined {
  const resolved = resolveAppLocale({
    savedPreference: preference,
    platformLocales: readPlatformLocales(),
  });
  return i18next.language === resolved ? undefined : i18next.changeLanguage(resolved);
}

export { i18next };
