import { describe, expect, it } from "vite-plus/test";

import { i18next, syncAppLocale } from "./index";

describe("i18n resources", () => {
  it("ships settings.language strings for every supported locale", () => {
    expect(i18next.getResource("en", "translation", "settings.language.title")).toBe("Language");
    expect(i18next.getResource("tr", "translation", "settings.language.title")).toBe("Dil");
    expect(i18next.getResource("en", "translation", "settings.language.options.tr")).toBe("Türkçe");
    expect(i18next.getResource("tr", "translation", "settings.language.options.tr")).toBe("Türkçe");
  });
});

describe("syncAppLocale", () => {
  it("switches the active language to an explicit preference", async () => {
    await i18next.changeLanguage("en");
    await syncAppLocale("tr");
    expect(i18next.language).toBe("tr");
    expect(i18next.t("settings.language.title")).toBe("Dil");
  });

  it("is a no-op when the resolved locale is already active", async () => {
    await i18next.changeLanguage("en");
    expect(syncAppLocale("en")).toBeUndefined();
    expect(i18next.language).toBe("en");
  });
});

describe("pluralization", () => {
  // English has a distinct "one" plural category; Turkish's CLDR plural
  // rule set has only "other" — the noun doesn't inflect for count. Both
  // must resolve through the same `common.daysRemaining` key without the
  // caller branching on locale, per docs/LOCALIZATION.md.
  //
  // Turkish still needs an explicit `_one` entry (even though CLDR only
  // requires `_other`): without it, i18next's plural resolver falls
  // through to `fallbackLng` ("en") for count===1 and silently renders
  // English text under an active Turkish UI. This test caught that
  // regression once — keep it.
  it("selects English's singular vs plural form by count", async () => {
    await i18next.changeLanguage("en");
    expect(i18next.t("common.daysRemaining", { count: 1 })).toBe("1 day left");
    expect(i18next.t("common.daysRemaining", { count: 5 })).toBe("5 days left");
  });

  it("uses Turkish's single invariant form regardless of count", async () => {
    await i18next.changeLanguage("tr");
    expect(i18next.t("common.daysRemaining", { count: 1 })).toBe("1 gün kaldı");
    expect(i18next.t("common.daysRemaining", { count: 5 })).toBe("5 gün kaldı");
  });
});
