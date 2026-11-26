import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { DateField, TimeField } from "@/components/DateTimeField";
import { Icon } from "@/components/Icon";
import { MapView } from "@/components/MapView";
import { RideCard } from "@/components/RideCard";
import { TopBar } from "@/components/TopBar";
import {
  FormGroup,
  Hint,
  InputShell,
  Label,
  ShellInput,
} from "@/components/Field";
import { WeekdayPicker } from "@/components/WeekdayPicker";
import { ResponsiveRow } from "@/components/ResponsiveRow";
import { Colors, Fonts } from "@/constants/theme";
import { fixtureRides } from "@/data";
import { toLocalDateKey } from "@/lib/format";
import { useAppStore } from "@/store";

export default function SearchScreen() {
  const router = useRouter();
  const { state } = useAppStore();
  const scrollRef = useRef<ScrollView>(null);
  const today = toLocalDateKey(new Date());
  const [activeLeg, setActiveLeg] = useState<"ida" | "volta">("ida");
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState<"desvio" | "preco" | "horario">("desvio");
  const [filterOpen, setFilterOpen] = useState(false);
  const [outbound, setOutbound] = useState({
    campus: "JK",
    recurring: true,
    days: [0, 1, 2, 3, 4],
    address: "Rua da Glória, 187 - Centro",
    arriveBy: "08:00",
    departAt: "07:10",
    date: today,
  });
  const [returnTrip, setReturnTrip] = useState({
    campus: "JK",
    recurring: true,
    days: [0, 1, 2],
    address: "Rua da Glória, 187 - Centro",
    departAt: "17:30",
    arriveBy: "18:10",
    date: today,
  });

  const config = activeLeg === "ida" ? outbound : returnTrip;
  const updateConfig = (patch: Partial<typeof outbound>) => {
    if (activeLeg === "ida") setOutbound((current) => ({ ...current, ...patch }));
    else setReturnTrip((current) => ({ ...current, ...patch }));
  };
  const toggleDay = (index: number) => {
    const days = config.days.includes(index)
      ? config.days.filter((day) => day !== index)
      : [...config.days, index];
    updateConfig({ days });
  };
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const selectedDate = new Date(`${config.date}T12:00:00`);
  const selectedWeekday = (selectedDate.getDay() + 6) % 7;
  const storedRides = state.rides.filter((ride) => {
    const occurrence = ride.occurrences.find((item) => item.date === config.date);
    const runsOnDate = ride.recurring
      ? Boolean(occurrence && occurrence.status !== "cancelada") ||
        (!ride.occurrences.length && ride.recurrenceDays.includes(selectedWeekday))
      : ride.date === config.date;
    const matchesTime =
      activeLeg === "ida"
        ? toMinutes(ride.arrive) <= toMinutes(config.arriveBy)
        : toMinutes(ride.time) >= toMinutes(config.departAt);
    return (
      ride.status === "ativa" &&
      ride.direction === activeLeg &&
      ride.campus === config.campus &&
      ride.seats > 0 &&
      runsOnDate &&
      matchesTime
    );
  });
  const searchFixtureRides = fixtureRides.filter((ride) => {
    const matchesCampus =
      activeLeg === "ida" ? ride.to.includes(`Campus ${config.campus}`) : config.campus === "JK";
    const matchesTime =
      activeLeg === "ida"
        ? toMinutes(ride.arrive) <= toMinutes(config.arriveBy)
        : toMinutes(ride.time) >= toMinutes("07:00");
    return matchesCampus && matchesTime;
  });
  const resultRides =
    activeLeg === "ida"
      ? [...storedRides, ...searchFixtureRides]
      : [
          ...storedRides,
          ...searchFixtureRides.map((ride, index) => ({
            ...ride,
            from: `Campus ${config.campus}`,
            to: config.address,
            time: index === 0 ? "17:25" : index === 1 ? "17:40" : "18:05",
            arrive: index === 0 ? "17:58" : index === 1 ? "18:12" : "18:32",
          })),
        ];
  const displayedRides = [...resultRides].sort((a, b) =>
    filter === "preco"
      ? a.price - b.price
      : filter === "horario"
        ? a.time.localeCompare(b.time)
        : a.extra - b.extra,
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <TopBar
        title={searched ? "Resultados" : "Planejar trajeto"}
        subtitle={
          searched
            ? `${activeLeg.toUpperCase()} · 12 OPÇÕES DISPONÍVEIS`
            : "ENCONTRE SUA CARONA"
        }
        onBack={() => router.back()}
        action={
          searched ? (
            <Pressable
              onPress={() => setFilterOpen(!filterOpen)}
              accessibilityRole="button"
              accessibilityLabel="Ordenar resultados"
              style={styles.iconButton}
            >
              <Icon name="filter" size={22} color={Colors.ink} />
            </Pressable>
          ) : undefined
        }
      />

      {filterOpen && searched ? (
        <View style={styles.filterMenu}>
          {(["desvio", "preco", "horario"] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => {
                setFilter(item);
                setFilterOpen(false);
              }}
              accessibilityRole="button"
              style={[styles.filterItem, filter === item && styles.filterItemActive]}
            >
              <Icon name={filter === item ? "check" : "filter"} size={18} color={Colors.brand} />
              <Text style={styles.filterItemText}>
                {item === "desvio"
                  ? "Menor desvio"
                  : item === "preco"
                    ? "Menor preço"
                    : "Horário mais próximo"}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {!searched && (
          <View style={styles.journeyTabs} accessibilityRole="tablist">
            {(["ida", "volta"] as const).map((leg) => {
              const active = activeLeg === leg;
              return (
                <Pressable
                  key={leg}
                  onPress={() => setActiveLeg(leg)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={[styles.journeyTab, active && styles.journeyTabActive]}
                >
                  <Icon name={leg === "ida" ? "arrow" : "back"} size={21} color={active ? Colors.brand : Colors.muted} />
                  <View>
                    <Text style={[styles.journeyTitle, active && { color: Colors.brand }]}>
                      {leg === "ida" ? "Ida" : "Volta"}
                    </Text>
                    <Text style={styles.journeySub}>
                      {leg === "ida" ? "Casa → Campus" : "Campus → Casa"}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {searched ? (
          <>
            <MapView
              compact
              origin={activeLeg === "ida" ? config.address : `Campus ${config.campus}`}
              destination={activeLeg === "ida" ? `Campus ${config.campus}` : config.address}
            />
            <View style={styles.resultsSection}>
              <View style={styles.routeSummary}>
                <View style={{ flex: 1, gap: 6 }}>
                  <View style={styles.routeSummaryRow}>
                    <View style={[styles.dot, { backgroundColor: Colors.route }]} />
                    <Text style={styles.routeSummaryText} numberOfLines={1}>
                      {activeLeg === "ida" ? config.address : `Campus ${config.campus}`}
                    </Text>
                  </View>
                  <View style={styles.routeSummaryRow}>
                    <View style={[styles.dot, { backgroundColor: Colors.destructivePink }]} />
                    <Text style={styles.routeSummaryText} numberOfLines={1}>
                      {activeLeg === "ida"
                        ? `Campus ${config.campus} · até ${config.arriveBy}`
                        : `${config.address} · até ${config.arriveBy}`}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => setSearched(false)}
                  accessibilityRole="button"
                  style={styles.editButton}
                >
                  <Icon name="edit" size={20} color={Colors.brand} />
                  <Text style={styles.editButtonText}>Editar</Text>
                </Pressable>
              </View>
              <View style={styles.sortNote}>
                <Text style={styles.sortNoteText}>
                  Ordenado por{" "}
                  {filter === "desvio"
                    ? "menor desvio na rota"
                    : filter === "preco"
                      ? "menor preço"
                      : "horário mais próximo"}
                </Text>
                <Icon name="shield" size={20} color={Colors.brand} />
              </View>
              <View style={{ gap: 12 }}>
                {displayedRides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    onPress={() =>
                      router.push({
                        pathname: "/ride/[id]",
                        params: {
                          id: String(ride.id),
                          leg: activeLeg,
                          campus: config.campus,
                          address: config.address,
                        },
                      })
                    }
                  />
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.formContent}>
            <View style={styles.legContext}>
              <View style={styles.legContextIcon}>
                <Icon name={activeLeg === "ida" ? "home" : "car"} size={22} color={Colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.legContextTitle}>
                  {activeLeg === "ida" ? "Planeje sua ida" : "Planeje sua volta"}
                </Text>
                <Text style={styles.legContextText}>
                  {activeLeg === "ida"
                    ? "Da sua residência até o campus."
                    : "Do campus até a sua residência."}
                </Text>
              </View>
            </View>

            <View style={styles.formSection}>
              {activeLeg === "ida" ? (
                <>
                  <FormGroup>
                    <Label>Local de partida</Label>
                    <InputShell
                      icon={<Icon name="search" size={21} color={Colors.muted} />}
                      right={
                        <Pressable
                          onPress={() =>
                            updateConfig({ address: "Minha localização atual · Diamantina" })
                          }
                          accessibilityRole="button"
                          accessibilityLabel="Usar localização"
                        >
                          <Icon name="pin" size={20} color={Colors.brand} />
                        </Pressable>
                      }
                    >
                      <ShellInput
                        value={config.address}
                        onChangeText={(address) => updateConfig({ address })}
                        accessibilityLabel="Local de partida"
                      />
                    </InputShell>
                    <Pressable
                      onPress={() =>
                        updateConfig({ address: "Minha localização atual · Diamantina" })
                      }
                      accessibilityRole="button"
                      style={styles.mapSelect}
                    >
                      <Icon name="pin" size={20} color={Colors.brand} />
                      <Text style={styles.mapSelectText}>Selecionar no mapa</Text>
                    </Pressable>
                  </FormGroup>
                  <FormGroup>
                    <Label>Campus de destino</Label>
                    <View style={styles.segmented}>
                      {(["I", "JK"] as const).map((campus) => (
                        <Pressable
                          key={campus}
                          onPress={() => updateConfig({ campus })}
                          accessibilityRole="button"
                          accessibilityState={{ selected: config.campus === campus }}
                          style={[styles.segmentedItem, config.campus === campus && styles.segmentedItemActive]}
                        >
                          <Text
                            style={[
                              styles.segmentedText,
                              config.campus === campus && styles.segmentedTextActive,
                            ]}
                          >
                            Campus {campus}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </FormGroup>
                  <ResponsiveRow>
                                          <FormGroup>
                        <Label>Chegar até</Label>
                        <TimeField value={config.arriveBy} onChange={(arriveBy) => updateConfig({ arriveBy })} />
                        <Hint>Horário limite no campus</Hint>
                      </FormGroup>
                                          <FormGroup>
                        <Label>Saída habitual</Label>
                        <TimeField value={config.departAt} onChange={(departAt) => updateConfig({ departAt })} />
                        <Hint>Quando costuma sair de casa</Hint>
                      </FormGroup>
                  </ResponsiveRow>
                </>
              ) : (
                <>
                  <FormGroup>
                    <Label>Campus de partida</Label>
                    <View style={styles.segmented}>
                      {(["I", "JK"] as const).map((campus) => (
                        <Pressable
                          key={campus}
                          onPress={() => updateConfig({ campus })}
                          accessibilityRole="button"
                          accessibilityState={{ selected: config.campus === campus }}
                          style={[styles.segmentedItem, config.campus === campus && styles.segmentedItemActive]}
                        >
                          <Text
                            style={[
                              styles.segmentedText,
                              config.campus === campus && styles.segmentedTextActive,
                            ]}
                          >
                            Campus {campus}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </FormGroup>
                  <FormGroup>
                    <Label>Local de destino</Label>
                    <InputShell
                      icon={<Icon name="search" size={21} color={Colors.muted} />}
                      right={
                        <Pressable
                          onPress={() =>
                            updateConfig({ address: "Minha localização atual · Diamantina" })
                          }
                          accessibilityRole="button"
                          accessibilityLabel="Usar localização"
                        >
                          <Icon name="pin" size={20} color={Colors.brand} />
                        </Pressable>
                      }
                    >
                      <ShellInput
                        value={config.address}
                        onChangeText={(address) => updateConfig({ address })}
                        accessibilityLabel="Local de destino"
                      />
                    </InputShell>
                    <Pressable
                      onPress={() =>
                        updateConfig({ address: "Minha localização atual · Diamantina" })
                      }
                      accessibilityRole="button"
                      style={styles.mapSelect}
                    >
                      <Icon name="pin" size={20} color={Colors.brand} />
                      <Text style={styles.mapSelectText}>Selecionar no mapa</Text>
                    </Pressable>
                  </FormGroup>
                  <ResponsiveRow>
                                          <FormGroup>
                        <Label>Horário de saída</Label>
                        <TimeField value={config.departAt} onChange={(departAt) => updateConfig({ departAt })} />
                        <Hint>Quando pretende sair do campus</Hint>
                      </FormGroup>
                                          <FormGroup>
                        <Label>Chegar em casa até</Label>
                        <TimeField value={config.arriveBy} onChange={(arriveBy) => updateConfig({ arriveBy })} />
                        <Hint>Horário limite de chegada</Hint>
                      </FormGroup>
                  </ResponsiveRow>
                </>
              )}
            </View>

            <View style={styles.formSection}>
              <FormGroup>
                <Label>Frequência</Label>
                <View style={styles.segmented}>
                  {([
                    { value: false, label: "Uma vez" },
                    { value: true, label: "Recorrente" },
                  ] as const).map((option) => (
                    <Pressable
                      key={option.label}
                      onPress={() => updateConfig({ recurring: option.value })}
                      accessibilityRole="button"
                      accessibilityState={{ selected: config.recurring === option.value }}
                      style={[
                        styles.segmentedItem,
                        config.recurring === option.value && styles.segmentedItemActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentedText,
                          config.recurring === option.value && styles.segmentedTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </FormGroup>
              {!config.recurring ? (
                <FormGroup style={{ marginBottom: 0 }}>
                  <Label>Data da viagem</Label>
                  <DateField
                    value={config.date}
                    minimumDate={today}
                    onChange={(date) => updateConfig({ date })}
                  />
                </FormGroup>
              ) : (
                <FormGroup style={{ marginBottom: 0 }}>
                  <Label>
                    {activeLeg === "ida"
                      ? "Dias em que vou à universidade"
                      : "Dias em que volto da universidade"}
                  </Label>
                  <WeekdayPicker selected={config.days} onToggle={toggleDay} />
                </FormGroup>
              )}
            </View>

            <View style={styles.infoBox}>
              <Icon name="clock" size={22} color={Colors.brand} />
              <Text style={styles.infoBoxText}>
                Mostraremos caronas com até{" "}
                <Text style={{ fontFamily: Fonts.bodyBold }}>1 hora de diferença</Text> do horário
                informado.
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setSearched(true);
                scrollRef.current?.scrollTo({ y: 0, animated: false });
              }}
              accessibilityRole="button"
              style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.92 }]}
            >
              <Icon name="search" size={22} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Buscar caronas de {activeLeg}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = {
  iconButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.surface,
  },
  filterMenu: {
    position: "absolute" as const,
    top: 100,
    right: 16,
    zIndex: 20,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.canvas,
    padding: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    minWidth: 220,
  },
  filterItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  filterItemActive: { backgroundColor: Colors.blueSoft },
  filterItemText: { fontSize: 15, color: Colors.ink, fontFamily: Fonts.bodySemiBold },
  journeyTabs: {
    flexDirection: "row" as const,
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  journeyTab: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 16,
    padding: 14,
    backgroundColor: Colors.surface,
  },
  journeyTabActive: { borderColor: Colors.brand, backgroundColor: Colors.blueSoft2 },
  journeyTitle: { fontFamily: Fonts.displayBold, fontSize: 17, color: Colors.ink },
  journeySub: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  resultsSection: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  routeSummary: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: Colors.graySoft,
    borderRadius: 14,
    padding: 12,
  },
  routeSummaryRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  routeSummaryText: { color: Colors.ink, fontSize: 13, flexShrink: 1, fontFamily: Fonts.body },
  editButton: { flexDirection: "row" as const, alignItems: "center" as const, gap: 4 },
  editButtonText: { color: Colors.brand, fontFamily: Fonts.bodyBold, fontSize: 14 },
  sortNote: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  sortNoteText: { color: Colors.muted, fontSize: 13, fontFamily: Fonts.body },
  formContent: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  legContext: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: Colors.blueSoft2,
    borderRadius: 16,
    padding: 14,
  },
  legContextIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: Colors.blueSoft,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  legContextTitle: { fontFamily: Fonts.displayBold, fontSize: 17, color: Colors.ink },
  legContextText: { color: Colors.muted, fontSize: 13, fontFamily: Fonts.body },
  formSection: {
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 16,
    padding: 14,
    backgroundColor: Colors.surface,
  },
  segmented: {
    flexDirection: "row" as const,
    backgroundColor: Colors.graySoft2,
    borderRadius: 13,
    padding: 5,
    gap: 4,
  },
  segmentedItem: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  segmentedItemActive: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  segmentedText: { color: Colors.muted, fontFamily: Fonts.bodyBold, fontSize: 15 },
  segmentedTextActive: { color: Colors.brand },
  mapSelect: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginTop: 10,
    paddingVertical: 4,
  },
  mapSelectText: { color: Colors.brand, fontFamily: Fonts.bodySemiBold, fontSize: 15 },
  infoBox: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: Colors.blueSoft,
    borderRadius: 14,
    padding: 14,
  },
  infoBoxText: { flex: 1, color: Colors.ink, fontSize: 14, lineHeight: 19, fontFamily: Fonts.body },
  primaryButton: {
    minHeight: 58,
    borderRadius: 15,
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
  primaryButtonText: { color: "#ffffff", fontFamily: Fonts.bodyBold, fontSize: 16 },
};
