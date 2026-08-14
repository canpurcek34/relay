import { describe, expect, it, vi } from "vite-plus/test";

// react-i18next probes for a React Native environment at module load; without
// this the raw react-native package source (Flow syntax) reaches the test
// bundler's parser and fails before any test code runs. Same pattern as
// ../lib/openExternalUrl.test.ts.
vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));
// expo-localization's native module registration touches `__DEV__`, which
// only exists under Metro/RN's runtime, not this Node-based test environment.
vi.mock("expo-localization", () => ({ getLocales: () => [] }));

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
