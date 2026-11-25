import { Tabs } from "expo-router";

import { UnicarTabBar } from "@/components/BottomNav";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <UnicarTabBar />}
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="viagens" />
      <Tabs.Screen name="oferecer" options={{ sceneStyle: { backgroundColor: "#ffffff" } }} />
      <Tabs.Screen name="mensagens" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
