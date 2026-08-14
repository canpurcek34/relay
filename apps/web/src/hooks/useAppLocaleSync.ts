import { useEffect } from "react";

import { syncAppLocale } from "../i18n";
import { useClientSettings } from "./useSettings";

/**
 * Keeps the i18next instance in sync with the saved `appLocale` client
 * setting, including the first render after client settings hydrate and
 * every later change from Settings → Language. See docs/LOCALIZATION.md.
 */
export function useAppLocaleSync(): void {
  const appLocale = useClientSettings((settings) => settings.appLocale);

  useEffect(() => {
    syncAppLocale(appLocale);
  }, [appLocale]);
}
