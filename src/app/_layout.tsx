import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";

import { AuthProvider, useAuth } from "@/auth";
import { Onboarding } from "@/components/Onboarding";
import { StoreProvider, useAppStore } from "@/store";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const ready = fontsLoaded || !!fontError;

  return (
    <AuthProvider>
      <StoreProvider>
        <RootNavigator ready={ready} />
      </StoreProvider>
    </AuthProvider>
  );
}

function RootNavigator({ ready }: { ready: boolean }) {
  const { logged } = useAuth();
  const { state, hydrated } = useAppStore();
  const readyToRender = ready && logged !== null && hydrated;
  // Um perfil sem nome precisa passar pelo onboarding para gerar nome,
  // e-mail, curso e campus a partir do e-mail institucional informado.
  const needsOnboarding = !logged || !state.profile.name;

  useEffect(() => {
    if (readyToRender) {
      void SplashScreen.hideAsync();
    }
  }, [readyToRender]);

  if (!readyToRender) return null;

  if (needsOnboarding) {
    return (
      <>
        <StatusBar style="dark" />
        <Onboarding />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#ffffff" },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="search" />
        <Stack.Screen name="ride/[id]" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="support" />
        <Stack.Screen name="chat" />
      </Stack>
    </>
  );
}
