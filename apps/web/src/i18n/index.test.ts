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
