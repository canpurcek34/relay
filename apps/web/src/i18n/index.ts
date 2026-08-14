import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import type { AppLocale } from "@t3tools/contracts/settings";
import { resolveAppLocale, SUPPORTED_LOCALES } from "@t3tools/client-runtime/state/locale";

import en from "./locales/en.json";
import tr from "./locales/tr.json";

/**
 * Resources for every shipped locale. New keys land here first; UI code
 * consumes them through `useTranslation` (react-i18next), never by importing
 * these files directly. See docs/LOCALIZATION.md.
 */
const resources = {
  en: { translation: en },
  tr: { translation: tr },
} satisfies Record<(typeof SUPPORTED_LOCALES)[number], { translation: unknown }>;

function readPlatformLocales(): readonly string[] {
  if (typeof navigator === "undefined") {
    return [];
  }
  return navigator.languages && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language];
}

/**
 * Resolved once at module load using only the platform locale, since the
 * saved client-settings preference hydrates asynchronously (see
 * `useSettings.ts`). `syncAppLocale` below applies the real preference as
 * soon as it is known and on every later change — this initial value only
 * controls what renders before that first sync.
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
    // React already escapes interpolated values when rendering JSX; double
    // escaping here would corrupt entities in translated strings.
    escapeValue: false,
  },
  // Provider/agent conversation content must never flow through this
  // instance — only Relay-authored UI strings belong in `resources`.
  returnEmptyString: false,
});

/**
 * Applies a saved `AppLocale` preference, resolving `"system"` against the
 * current platform locales. Safe to call on every settings change — returns
 * `undefined` without touching i18next when the resolved locale is already
 * active, or the pending `changeLanguage` promise otherwise (callers that
 * only fire-and-forget can ignore it; tests can await it).
 */
export function syncAppLocale(preference: AppLocale): Promise<unknown> | undefined {
  const resolved = resolveAppLocale({
    savedPreference: preference,
    platformLocales: readPlatformLocales(),
  });
  return i18next.language === resolved ? undefined : i18next.changeLanguage(resolved);
}

export { i18next };
