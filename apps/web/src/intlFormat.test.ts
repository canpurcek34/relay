import { afterEach, describe, expect, it } from "vite-plus/test";

import { i18next } from "./i18n";
import { formatLocalizedNumber, formatLocalizedPercent, resolveIntlLocale } from "./intlFormat";

afterEach(async () => {
  await i18next.changeLanguage("en");
});

describe("resolveIntlLocale", () => {
  it("returns the active i18next language", async () => {
    await i18next.changeLanguage("tr");
    expect(resolveIntlLocale()).toBe("tr");

    await i18next.changeLanguage("en");
    expect(resolveIntlLocale()).toBe("en");
  });
});

describe("formatLocalizedPercent", () => {
  it("formats a 0-100 value as a percentage in the active locale", async () => {
    await i18next.changeLanguage("en");
    expect(formatLocalizedPercent(42)).toBe("42%");
    expect(formatLocalizedPercent(0)).toBe("0%");
    expect(formatLocalizedPercent(100)).toBe("100%");
  });

  it("supports fractional precision", async () => {
    await i18next.changeLanguage("en");
    expect(formatLocalizedPercent(42.5, 1)).toBe("42.5%");
  });

  it("follows the active locale's formatting conventions", async () => {
    await i18next.changeLanguage("tr");
    // Turkish places the percent sign before the number.
    expect(formatLocalizedPercent(42)).toBe("%42");
  });
});

describe("formatLocalizedNumber", () => {
  it("formats with the active locale's digit grouping", async () => {
    await i18next.changeLanguage("en");
    expect(formatLocalizedNumber(1234567)).toBe("1,234,567");

    await i18next.changeLanguage("tr");
    // Turkish uses "." as the thousands separator.
    expect(formatLocalizedNumber(1234567)).toBe("1.234.567");
  });
});
