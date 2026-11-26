import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";

import { Icon } from "@/components/Icon";
import { MapView } from "@/components/MapView";
import { RideCard } from "@/components/RideCard";
import { TopBar } from "@/components/TopBar";
import { Colors, Fonts } from "@/constants/theme";
import { fixtureRides } from "@/data";
import { formatFullDateUpperBR } from "@/lib/format";
import { useAppStore } from "@/store";

export default function HomeScreen() {
  const router = useRouter();
  const { state } = useAppStore();
  const [all, setAll] = useState(false);
  const firstName = state.profile.name.split(" ")[0] || "Estudante";
  const homeRides = [
    ...state.rides.filter((ride) => ride.status === "ativa"),
    ...fixtureRides,
  ];
  const visibleRides = all ? homeRides : homeRides.slice(0, 2);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <TopBar
          title={`Bom dia, ${firstName}`}
          subtitle={formatFullDateUpperBR(new Date())}
          onBell={() => router.push("/notifications")}
        />

        <View>
          <MapView height={250} />
          <View style={styles.searchCard}>
            <Pressable
              onPress={() => router.push("/search")}
              accessibilityRole="button"
              style={styles.searchRow}
            >
              <View style={[styles.fieldIcon, styles.originDot]}>
                <View style={styles.originDotInner} />
              </View>
              <View style={styles.searchRowText}>
                <Text style={styles.searchSmall}>Saindo de</Text>
                <Text numberOfLines={1} style={styles.searchBig}>
                  Rua da Glória, Centro
                </Text>
              </View>
              <Icon name="arrow" size={20} color={Colors.muted} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              onPress={() => router.push("/search")}
              accessibilityRole="button"
              style={styles.searchRow}
            >
              <View style={[styles.fieldIcon, styles.destIcon]}>
                <Icon name="pin" size={17} color="#ffffff" />
              </View>
              <View style={styles.searchRowText}>
                <Text style={styles.searchSmall}>Indo para</Text>
                <Text numberOfLines={1} style={styles.searchBig}>
                  Campus JK
                </Text>
              </View>
              <Icon name="arrow" size={20} color={Colors.muted} />
            </Pressable>
            <View style={styles.quickRow}>
              <Pressable
                onPress={() => router.push("/search")}
                accessibilityRole="button"
                style={styles.quickButton}
              >
                <Icon name="clock" size={16} color={Colors.ink} />
                <Text style={styles.quickLabel}>Chegar 08:00</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/search")}
                accessibilityRole="button"
                style={styles.quickButton}
              >
                <Icon name="calendar" size={16} color={Colors.ink} />
                <Text style={styles.quickLabel}>Hoje</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => router.push("/search")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.searchAction, pressed && { opacity: 0.92 }]}
            >
              <Icon name="search" size={19} color="#ffffff" />
              <Text style={styles.searchActionText}>Buscar caronas</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.eyebrow}>PERTO DO SEU HORÁRIO</Text>
              <Text style={styles.sectionTitle}>
                {all ? "Todas as caronas" : "Melhores rotas para você"}
              </Text>
            </View>
            <Pressable onPress={() => setAll(!all)} accessibilityRole="button">
              <Text style={styles.sectionAction}>{all ? "Recomendadas" : "Ver todas"}</Text>
            </Pressable>
          </View>
          <View style={styles.tolerance}>
            <Icon name="clock" size={16} color={Colors.muted} />
            <Text style={styles.toleranceText}>Saídas entre 07:00 e 09:00 </Text>
            <Pressable onPress={() => router.push("/search")} accessibilityRole="button">
              <Text style={styles.toleranceAction}>Alterar</Text>
            </Pressable>
          </View>
          <View style={{ gap: 12 }}>
            {visibleRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onPress={() => router.push(`/ride/${ride.id}`)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = {
  searchCard: {
    marginHorizontal: 16,
    marginTop: -110,
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.surface,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
    gap: 4,
  },
  searchRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    minHeight: 56,
    gap: 11,
  },
  fieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  originDot: { backgroundColor: Colors.blueSoft },
  originDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.brand,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  destIcon: { backgroundColor: Colors.brand },
  searchRowText: { flex: 1 },
  searchSmall: { color: Colors.muted, fontSize: 13, fontFamily: Fonts.body },
  searchBig: { color: Colors.ink, fontSize: 17, fontFamily: Fonts.bodyBold },
  divider: { height: 1, backgroundColor: Colors.canvas, marginVertical: 2 },
  quickRow: { flexDirection: "row" as const, gap: 8, marginTop: 8 },
  quickButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: Colors.graySoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickLabel: { color: Colors.ink, fontSize: 13, fontFamily: Fonts.bodySemiBold },
  searchAction: {
    marginTop: 10,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: Colors.brand,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },
  searchActionText: { color: "#ffffff", fontFamily: Fonts.bodyBold, fontSize: 16 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHead: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    justifyContent: "space-between" as const,
    gap: 10,
    marginBottom: 8,
  },
  eyebrow: {
    color: Colors.muted,
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  sectionTitle: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 21,
    color: Colors.ink,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  sectionAction: { color: Colors.brand, fontFamily: Fonts.bodyBold, fontSize: 14 },
  tolerance: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: Colors.graySoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  toleranceText: { color: Colors.muted, fontSize: 13, fontFamily: Fonts.body },
  toleranceAction: { color: Colors.brand, fontFamily: Fonts.bodyBold, fontSize: 13 },
};
