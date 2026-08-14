import { RouterProvider } from "@tanstack/react-router";
import { I18nextProvider } from "react-i18next";

import { ElectronBrowserHost } from "./browser/ElectronBrowserHost";
import { PreviewAutomationHosts } from "./components/preview/PreviewAutomationHosts";
import { useAppLocaleSync } from "./hooks/useAppLocaleSync";
import { i18next } from "./i18n";
import { AppAtomRegistryProvider } from "./rpc/atomRegistry";
import type { AppRouter } from "./router";

/** Applies the saved locale preference; renders nothing itself. */
export function AppLocaleSync() {
  useAppLocaleSync();
  return null;
}

/**
 * Owns renderer-wide providers. The Electron browser host intentionally sits
 * outside the router so its webviews survive route transitions, but it must
 * share the same atom registry as routed UI.
 */
export function AppRoot({ router }: { readonly router: AppRouter }) {
  return (
    <I18nextProvider i18n={i18next}>
      <AppAtomRegistryProvider>
        <AppLocaleSync />
        <RouterProvider router={router} />
        <PreviewAutomationHosts />
        <ElectronBrowserHost />
      </AppAtomRegistryProvider>
    </I18nextProvider>
  );
}
