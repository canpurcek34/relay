import { describe, expect, it } from "vite-plus/test";

import { matchSupportedLocale, resolveAppLocale } from "./locale.ts";

describe("matchSupportedLocale", () => {
  it("matches by primary language subtag", () => {
    expect(matchSupportedLocale("tr-TR")).toBe("tr");
    expect(matchSupportedLocale("en-US")).toBe("en");
    expect(matchSupportedLocale("en")).toBe("en");
  });

  it("is case-insensitive and accepts underscore separators", () => {
    expect(matchSupportedLocale("TR-tr")).toBe("tr");
    expect(matchSupportedLocale("en_US")).toBe("en");
  });

  it("returns null for unsupported or empty input", () => {
    expect(matchSupportedLocale("de-DE")).toBeNull();
    expect(matchSupportedLocale("")).toBeNull();
    expect(matchSupportedLocale(null)).toBeNull();
    expect(matchSupportedLocale(undefined)).toBeNull();
  });
});

describe("resolveAppLocale", () => {
  it("prefers an explicit saved preference over the platform locale", () => {
    expect(resolveAppLocale({ savedPreference: "en", platformLocales: ["tr-TR"] })).toBe("en");
    expect(resolveAppLocale({ savedPreference: "tr", platformLocales: ["en-US"] })).toBe("tr");
  });

  it("falls back to the platform locale when the preference is system", () => {
    expect(
      resolveAppLocale({ savedPreference: "system", platformLocales: ["tr-TR", "en-US"] }),
    ).toBe("tr");
  });

  it("tries each platform locale candidate in order until one matches", () => {
    expect(
      resolveAppLocale({
        savedPreference: "system",
        platformLocales: ["de-DE", "fr-FR", "tr-TR"],
      }),
    ).toBe("tr");
  });

  it("falls back to English when no platform locale matches", () => {
    expect(
      resolveAppLocale({ savedPreference: "system", platformLocales: ["de-DE", "fr-FR"] }),
    ).toBe("en");
    expect(resolveAppLocale({ savedPreference: "system", platformLocales: [] })).toBe("en");
  });
});
