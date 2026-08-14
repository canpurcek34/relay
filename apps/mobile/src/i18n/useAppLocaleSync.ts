import { useEffect } from "react";

import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";

import { mobilePreferencesAtom } from "../state/preferences";
import { syncAppLocale } from "./index";

/**
 * Keeps the i18next instance in sync with the saved `appLocale` device
 * preference, including the first render after preferences load and every
 * later change from the Language settings screen. See docs/LOCALIZATION.md.
 */
export function useAppLocaleSync(): void {
  const preferencesResult = useAtomValue(mobilePreferencesAtom);
  const appLocale = AsyncResult.isSuccess(preferencesResult)
    ? (preferencesResult.value.appLocale ?? "system")
    : "system";

  useEffect(() => {
    syncAppLocale(appLocale);
  }, [appLocale]);
}
