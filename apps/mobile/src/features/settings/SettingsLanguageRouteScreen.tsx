import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { useNavigation } from "@react-navigation/native";
import type { AppLocale } from "@t3tools/contracts/settings";
import { AsyncResult } from "effect/unstable/reactivity";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AndroidScreenHeader } from "../../components/AndroidScreenHeader";
import { AppText as Text } from "../../components/AppText";
import { SymbolView } from "../../components/AppSymbol";
import { useThemeColor } from "../../lib/useThemeColor";
import { NativeStackScreenOptions } from "../../native/StackHeader";
import { mobilePreferencesAtom, updateMobilePreferencesAtom } from "../../state/preferences";
import { SettingsSection } from "./components/SettingsSection";

const LANGUAGE_OPTIONS: ReadonlyArray<AppLocale> = ["system", "en", "tr"];

export function SettingsLanguageRouteScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const checkmarkColor = useThemeColor("--color-icon");
  const preferencesResult = useAtomValue(mobilePreferencesAtom);
  const savePreferences = useAtomSet(updateMobilePreferencesAtom);
  const preferencesReady = AsyncResult.isSuccess(preferencesResult) && !preferencesResult.waiting;
  const selectedLocale = AsyncResult.isSuccess(preferencesResult)
    ? (preferencesResult.value.appLocale ?? "system")
    : "system";

  return (
    <View collapsable={false} className="flex-1 bg-sheet">
      {Platform.OS === "android" ? (
        <>
          <NativeStackScreenOptions options={{ headerShown: false }} />
          <AndroidScreenHeader
            title={t("settings.language.title")}
            onBack={() => navigation.goBack()}
          />
        </>
      ) : null}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerClassName="gap-3 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 18) + 18 }}
      >
        <SettingsSection title={t("settings.language.title")}>
          {LANGUAGE_OPTIONS.map((locale, index) => (
            <Pressable
              key={locale}
              accessibilityRole="radio"
              accessibilityState={{
                checked: selectedLocale === locale,
                disabled: !preferencesReady,
              }}
              disabled={!preferencesReady}
              onPress={() => savePreferences({ appLocale: locale })}
              className={
                index === 0
                  ? "flex-row items-center gap-4 p-4"
                  : "flex-row items-center gap-4 border-t border-border-subtle p-4"
              }
            >
              <View className="min-w-0 flex-1 gap-1">
                <Text className="text-lg text-foreground">
                  {t(`settings.language.options.${locale}`)}
                </Text>
              </View>
              {selectedLocale === locale ? (
                <SymbolView
                  name="checkmark"
                  size={18}
                  tintColor={checkmarkColor}
                  type="monochrome"
                  weight="semibold"
                />
              ) : null}
            </Pressable>
          ))}
        </SettingsSection>
        <Text className="px-2 text-sm leading-normal text-foreground-muted">
          {t("settings.language.description")}
        </Text>
      </ScrollView>
    </View>
  );
}
