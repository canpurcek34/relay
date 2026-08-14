import { i18next } from "./i18n";

/**
 * The BCP 47 tag `Intl` constructors should use for the active UI language,
 * or `undefined` to fall back to the platform default. Single source of
 * truth so every `Intl.*Format` call in the app resolves the same locale —
 * see docs/LOCALIZATION.md.
 */
export function resolveIntlLocale(): string | undefined {
  const language = i18next.language;
  return language && language !== "cimode" ? language : undefined;
}

const percentFormatterCache = new Map<string, Intl.NumberFormat>();

/**
 * Formats a 0-100 percentage value using the active locale's digit and
 * separator conventions. `fractionDigits` controls decimal precision
 * (default 0 — quota displays are typically whole percentages).
 */
export function formatLocalizedPercent(value: number, fractionDigits = 0): string {
  const locale = resolveIntlLocale();
  const cacheKey = `${locale ?? "default"}:${fractionDigits}`;
  let formatter = percentFormatterCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "percent",
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    percentFormatterCache.set(cacheKey, formatter);
  }
  // Intl's "percent" style expects a 0-1 fraction; callers pass 0-100.
  return formatter.format(value / 100);
}

const numberFormatterCache = new Map<string, Intl.NumberFormat>();

/** Formats a plain count/number using the active locale's digit grouping. */
export function formatLocalizedNumber(value: number): string {
  const locale = resolveIntlLocale();
  let formatter = numberFormatterCache.get(locale ?? "default");
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale);
    numberFormatterCache.set(locale ?? "default", formatter);
  }
  return formatter.format(value);
}
