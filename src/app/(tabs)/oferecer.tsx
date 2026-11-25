import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { DateField, TimeField } from "@/components/DateTimeField";
import { Icon } from "@/components/Icon";
import { MapView } from "@/components/MapView";
import { TopBar } from "@/components/TopBar";
import { FormGroup, InputShell, Label, ShellInput } from "@/components/Field";
import { Toggle } from "@/components/ui";
import { WeekdayPicker, WEEKDAYS } from "@/components/WeekdayPicker";
import { ResponsiveRow } from "@/components/ResponsiveRow";
import { Colors, Fonts } from "@/constants/theme";
import { CAMPUS_COORDINATES, coordinatesForPlace, type Coordinates } from "@/data";
import { useAppStore } from "@/store";
import { formatDateBR, formatShortDateBR, formatWeekdayShortDateBR } from "@/lib/format";

const STEPS = ["Trajeto", "Agenda", "Detalhes", "Revisão"] as const;

export default function OfferScreen() {
  const router = useRouter();
  const { state, addRide } = useAppStore();
  const insets = useSafeAreaInsets();
  const today = new Date().toISOString().slice(0, 10);
  const defaultRecurrenceEnd = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const [step, setStep] = useState(1);
  const [recurring, setRecurring] = useState(false);
  const [returnRecurring, setReturnRecurring] = useState(false);
  const [direction, setDirection] = useState<"ida" | "volta" | "ambas">("ida");
  const [campus, setCampus] = useState<"I" | "JK">("JK");
  const [origin, setOrigin] = useState("Rua das Acácias, Bairro da Palha");
  const [originCoordinates, setOriginCoordinates] = useState<Coordinates>(
    coordinatesForPlace("Bairro da Palha"),
  );
  const [returnDestination, setReturnDestination] = useState("Bairro da Palha");
  const [tripDate, setTripDate] = useState(today);
  const [recurrenceEnd, setRecurrenceEnd] = useState(defaultRecurrenceEnd);
  const [departureTime, setDepartureTime] = useState("07:10");
  const [returnTime, setReturnTime] = useState("17:40");
  const [days, setDays] = useState([0, 2, 4]);
  const [returnDays, setReturnDays] = useState([1, 3]);
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState(6);
  const [note, setNote] = useState("Paro próximo à praça. Tenho espaço para mochilas.");
  const [error, setError] = useState("");

  const toggleDay = (index: number, isReturn = false) => {
    const selected = isReturn ? returnDays : days;
    const update = isReturn ? setReturnDays : setDays;
    update(
      selected.includes(index) ? selected.filter((day) => day !== index) : [...selected, index],
    );
  };

  const continueFlow = () => {
    if (step === 1 && !origin.trim()) {
      setError("Informe o endereço de origem para continuar.");
      return;
    }
    if (step === 2 && !departureTime.trim()) {
      setError("Informe o horário de saída.");
      return;
    }
    if (step === 2 && recurring && days.length === 0) {
      setError("Selecione pelo menos um dia para a recorrência.");
      return;
    }
    setError("");
    setStep((current) => current + 1);
  };

  const publishRide = () => {
    const createRide = (rideDirection: "ida" | "volta", time: string, selectedDays: number[]) => {
      const isRecurring = rideDirection === "ida" ? recurring : returnRecurring;
      const occurrences = [];
      const cursor = new Date(`${tripDate}T12:00:00`);
      const end = new Date(`${isRecurring ? recurrenceEnd : tripDate}T12:00:00`);
      while (cursor <= end && occurrences.length < 20) {
        const weekdayIndex = (cursor.getDay() + 6) % 7;
        if (!isRecurring || selectedDays.includes(weekdayIndex)) {
          occurrences.push({
            id: Date.now() + occurrences.length,
            date: cursor.toISOString().slice(0, 10),
            driverConfirmed: false,
            passengerConfirmed: false,
            status: "agendada" as const,
            seats,
          });
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      return addRide({
        driver: state.profile,
        ownerId: state.profile.id,
        from: rideDirection === "ida" ? origin : `Campus ${campus}`,
        to: rideDirection === "ida" ? `Campus ${campus}` : returnDestination,
        originCoordinates: rideDirection === "ida" ? originCoordinates : CAMPUS_COORDINATES[campus],
        destinationCoordinates:
          rideDirection === "ida" ? CAMPUS_COORDINATES[campus] : originCoordinates,
        campus,
        date: tripDate,
        time,
        arrive: rideDirection === "ida" ? "07:45" : "18:15",
        price,
        seats,
        totalSeats: seats,
        extra: 0,
        days: isRecurring ? selectedDays.map((day) => WEEKDAYS[day].label).join(", ") : "Pontual",
        distance: "8,2 km",
        note,
        passengers: [],
        recurring: isRecurring,
        recurrenceDays: selectedDays,
        recurrenceEnd,
        direction: rideDirection,
        status: "ativa",
        occurrences,
      });
    };
    if (direction === "ida" || direction === "ambas") createRide("ida", departureTime, days);
    if (direction === "volta" || direction === "ambas") createRide("volta", returnTime, returnDays);
    setStep(5);
  };

  if (step === 5) {
    return (
      <View style={[styles.successScreen, { paddingBottom: Math.max(24, insets.bottom + 16) }]}>
        <View style={styles.successRing}>
          <Icon name="check" size={38} color={Colors.brand} />
        </View>
        <Text style={styles.eyebrow}>CARONA PUBLICADA</Text>
        <Text style={styles.successTitle}>Tudo pronto para ir!</Text>
        <Text style={styles.successText}>
          Sua carona já está visível para estudantes com trajetos próximos.
        </Text>
        <View style={styles.publishedCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.publishedDate}>
              {formatWeekdayShortDateBR(new Date(`${tripDate}T12:00:00`))}
            </Text>
            <Text style={styles.publishedTime}>{departureTime}</Text>
            <Text style={styles.publishedRoute}>
              Bairro da Palha → Campus {campus}
            </Text>
          </View>
          <View style={styles.publishedSeats}>
            <Text style={styles.publishedSeatsValue}>{seats}</Text>
            <Text style={styles.publishedSeatsLabel}>vagas</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push("/viagens")}
          accessibilityRole="button"
          style={styles.primaryCta}
        >
          <Text style={styles.ctaTextWhite}>Ver em Minhas caronas</Text>
        </Pressable>
        <Pressable
          onPress={() => setStep(1)}
          accessibilityRole="button"
          style={{ paddingVertical: 12 }}
        >
          <Text style={styles.textButtonLabel}>Publicar outra</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <TopBar title="Oferecer carona" subtitle={`ETAPA ${step} DE 4`} />

      <View style={styles.progress} accessibilityLabel={`Etapa ${step} de 4`}>
        {[1, 2, 3, 4].map((item) => {
          const active = item <= step;
          const isLast = item === 4;
          return (
            <View key={item} style={styles.progressItem}>
              {!isLast && (
                <View style={[styles.progressLine, active && styles.progressLineActive]} />
              )}
              <View style={[styles.progressDot, active && styles.progressDotActive]}>
                <Text
                  style={[styles.progressDotText, active && styles.progressDotTextActive]}
                >
                  {item}
                </Text>
              </View>
              <Text
                style={[styles.progressLabel, active && styles.progressLabelActive]}
                numberOfLines={1}
              >
                {STEPS[item - 1]}
              </Text>
            </View>
          );
        })}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 130, gap: 16 }}
        >
          {step > 1 && (
            <Pressable
              onPress={() => {
                setError("");
                setStep(step - 1);
              }}
              accessibilityRole="button"
              style={styles.inlineBack}
            >
              <Icon name="back" size={18} color={Colors.muted} />
              <Text style={styles.inlineBackText}>Voltar</Text>
            </Pressable>
          )}

          {step === 1 && (
            <>
              <View style={styles.stepHeading}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>1</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>Trajeto da viagem</Text>
                  <Text style={styles.stepSub}>Defina o percurso principal e o campus de destino.</Text>
                </View>
              </View>
              <View style={styles.eligibilityLine}>
                <Icon name="shield" size={18} color={Colors.brand} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eligibilityTitle}>Perfil apto para oferecer</Text>
                  <Text style={styles.eligibilitySub}>Avaliação 4,9 · vínculo verificado</Text>
                </View>
              </View>
              <View style={styles.formSection}>
                <FormGroup>
                  <Label>
                    Trecho oferecido <Text style={styles.required}>obrigatório</Text>
                  </Label>
                  <View style={styles.segmented}>
                    {(["ida", "volta", "ambas"] as const).map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => setDirection(item)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: direction === item }}
                        style={[
                          styles.segmentedItem,
                          direction === item && styles.segmentedItemActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.segmentedText,
                            direction === item && styles.segmentedTextActive,
                          ]}
                        >
                          {item === "ambas" ? "Ida e volta" : item[0].toUpperCase() + item.slice(1)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </FormGroup>
                <FormGroup>
                  <Label>
                    Origem <Text style={styles.required}>obrigatório</Text>
                  </Label>
                  <InputShell
                    invalid={!!error && !origin}
                    icon={
                      <View style={styles.originDot}>
                        <View style={styles.originDotInner} />
                      </View>
                    }
                  >
                    <ShellInput
                      value={origin}
                      onChangeText={setOrigin}
                      placeholder="Informe o endereço de saída"
                      invalid={!!error && !origin}
                      accessibilityLabel="Origem"
                    />
                  </InputShell>
                </FormGroup>
                <FormGroup>
                  <Label>
                    Campus de destino <Text style={styles.required}>obrigatório</Text>
                  </Label>
                  <View style={styles.segmented}>
                    {(["I", "JK"] as const).map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => setCampus(item)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: campus === item }}
                        style={[
                          styles.segmentedItem,
                          campus === item && styles.segmentedItemActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.segmentedText,
                            campus === item && styles.segmentedTextActive,
                          ]}
                        >
                          Campus {item}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </FormGroup>
                <View style={styles.routePreviewRow}>
                  <View style={styles.destIcon}>
                    <Icon name="pin" size={18} color="#ffffff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.routePreviewSmall}>Destino</Text>
                    <Text style={styles.routePreviewBig}>Campus {campus} — UFVJM</Text>
                  </View>
                </View>
              </View>
              <View style={styles.miniMapWrap}>
                <MapView
                  compact
                  origin={origin}
                  destination={`Campus ${campus}`}
                  originCoordinates={originCoordinates}
                  destinationCoordinates={CAMPUS_COORDINATES[campus]}
                  editableOrigin
                  onOriginChange={setOriginCoordinates}
                />
                <Text style={styles.selectedMapPoint}>
                  Origem no mapa: {originCoordinates[1].toFixed(5)}, {originCoordinates[0].toFixed(5)}
                </Text>
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <View style={styles.stepHeading}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>2</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>Data e recorrência</Text>
                  <Text style={styles.stepSub}>Escolha quando a viagem acontece.</Text>
                </View>
              </View>
              <View style={styles.formSection}>
                <ResponsiveRow>
                                      <FormGroup>
                      <Label>
                        Data de início <Text style={styles.required}>obrigatório</Text>
                      </Label>
                      <DateField
                        value={tripDate}
                        minimumDate={today}
                        onChange={(value) => {
                          setTripDate(value);
                          if (recurrenceEnd < value) setRecurrenceEnd(value);
                        }}
                      />
                    </FormGroup>
                                      <FormGroup>
                      <Label>
                        Horário de saída <Text style={styles.required}>obrigatório</Text>
                      </Label>
                      <TimeField value={departureTime} onChange={setDepartureTime} />
                    </FormGroup>
                </ResponsiveRow>
                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleTitle}>Repetir esta viagem</Text>
                    <Text style={styles.toggleSub}>Cria ocorrências independentes</Text>
                  </View>
                  <Toggle value={recurring} onValueChange={setRecurring} />
                </View>
                {recurring && (
                  <View style={styles.conditionalSection}>
                    <FormGroup>
                      <Label>
                        Dias da semana <Text style={styles.required}>obrigatório</Text>
                      </Label>
                      <WeekdayPicker selected={days} onToggle={(index) => toggleDay(index, false)} />
                    </FormGroup>
                    <ResponsiveRow>
                                              <FormGroup>
                          <Label>Repetir até</Label>
                          <DateField
                            value={recurrenceEnd}
                            minimumDate={tripDate}
                            onChange={setRecurrenceEnd}
                          />
                        </FormGroup>
                                              <FormGroup>
                          <Label>Frequência</Label>
                          <InputShell icon={<Icon name="clock" size={20} color={Colors.muted} />}>
                            <ShellInput value="Toda semana" editable={false} />
                          </InputShell>
                        </FormGroup>
                    </ResponsiveRow>
                    <View style={styles.fieldHelp}>
                      <Icon name="shield" size={17} color={Colors.brand} />
                      <Text style={styles.fieldHelpText}>
                        Cada ocorrência poderá ser confirmada, alterada ou cancelada separadamente.
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {(direction === "volta" || direction === "ambas") && (
                <View style={styles.formSection}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.sectionTitleIcon}>
                      <Icon name="back" size={19} color={Colors.brand} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sectionTitle}>Viagem de volta</Text>
                      <Text style={styles.sectionSub}>Configuração independente da ida</Text>
                    </View>
                  </View>
                  <ResponsiveRow>
                                          <FormGroup>
                        <Label>
                          Horário da volta <Text style={styles.required}>obrigatório</Text>
                        </Label>
                        <TimeField value={returnTime} onChange={setReturnTime} />
                      </FormGroup>
                                          <FormGroup>
                        <Label>Destino da volta</Label>
                        <InputShell icon={<Icon name="pin" size={20} color={Colors.muted} />}>
                          <ShellInput
                            value={returnDestination}
                            onChangeText={setReturnDestination}
                            accessibilityLabel="Destino da volta"
                          />
                        </InputShell>
                      </FormGroup>
                  </ResponsiveRow>
                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleTitle}>Volta recorrente</Text>
                      <Text style={styles.toggleSub}>Pode ter dias diferentes da ida</Text>
                    </View>
                    <Toggle value={returnRecurring} onValueChange={setReturnRecurring} />
                  </View>
                  {returnRecurring && (
                    <FormGroup style={{ marginBottom: 0 }}>
                      <Label>Dias da volta</Label>
                      <WeekdayPicker
                        selected={returnDays}
                        onToggle={(index) => toggleDay(index, true)}
                        accessibilityLabel="Dias da volta"
                      />
                    </FormGroup>
                  )}
                </View>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <View style={styles.stepHeading}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>3</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>Vagas e contribuição</Text>
                  <Text style={styles.stepSub}>Defina a capacidade e o valor individual.</Text>
                </View>
              </View>
              <View style={styles.formSection}>
                <View style={styles.counterRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.counterTitle}>Quantidade de vagas</Text>
                    <Text style={styles.counterSub}>Além de você</Text>
                  </View>
                  <View style={styles.counterControls}>
                    <Pressable
                      onPress={() => setSeats(Math.max(1, seats - 1))}
                      accessibilityRole="button"
                      accessibilityLabel="Diminuir vagas"
                      style={styles.counterButton}
                    >
                      <Text style={styles.counterButtonText}>−</Text>
                    </Pressable>
                    <Text style={styles.counterValue}>{seats}</Text>
                    <Pressable
                      onPress={() => setSeats(Math.min(4, seats + 1))}
                      accessibilityRole="button"
                      accessibilityLabel="Aumentar vagas"
                      style={styles.counterButton}
                    >
                      <Text style={styles.counterButtonText}>+</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.pricePicker}>
                  <Label>Valor por pessoa</Label>
                  <View style={styles.priceValueRow}>
                    <Text style={styles.priceCurrency}>R$</Text>
                    <Text style={styles.priceValue}>{price},00</Text>
                  </View>
                  <Slider
                    minimumValue={0}
                    maximumValue={15}
                    step={1}
                    value={price}
                    onValueChange={(value) => setPrice(Math.round(value))}
                    minimumTrackTintColor={Colors.brand}
                    maximumTrackTintColor={Colors.canvas}
                    thumbTintColor={Platform.OS === "android" ? Colors.brand : undefined}
                    accessibilityLabel="Valor por pessoa"
                  />
                  <View style={styles.rangeLabels}>
                    <Text style={styles.rangeLabelText}>Grátis</Text>
                    <Text style={styles.rangeLabelText}>R$ 15</Text>
                  </View>
                  <View style={styles.priceHint}>
                    <Icon name="shield" size={18} color={Colors.brand} />
                    <Text style={styles.priceHintText}>
                      Faixa sugerida para dividir combustível: R$ 5 a R$ 8.
                    </Text>
                  </View>
                </View>
                <FormGroup style={{ marginBottom: 0 }}>
                  <Label>
                    Observações <Text style={styles.optional}>opcional</Text>
                  </Label>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    maxLength={140}
                    multiline
                    style={styles.noteInput}
                    accessibilityLabel="Observações"
                  />
                  <Text style={styles.charCount}>{note.length}/140</Text>
                </FormGroup>
              </View>
            </>
          )}

          {step === 4 && (
            <>
              <View style={styles.stepHeading}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>4</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>Revise antes de publicar</Text>
                  <Text style={styles.stepSub}>Confira os dados que serão exibidos aos passageiros.</Text>
                </View>
              </View>

              <View style={styles.reviewSection}>
                <View style={styles.reviewSectionHead}>
                  <Text style={styles.reviewSectionTitle}>Trajeto</Text>
                  <Pressable onPress={() => setStep(1)} accessibilityRole="button">
                    <Text style={styles.reviewEdit}>Editar</Text>
                  </Pressable>
                </View>
                <View style={styles.reviewRoute}>
                  <View style={styles.reviewOriginDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewRouteText} numberOfLines={1}>{origin}</Text>
                    <Text style={styles.reviewRouteSub}>Origem</Text>
                  </View>
                </View>
                <View style={styles.reviewRoute}>
                  <Icon name="pin" size={18} color={Colors.destructivePink} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewRouteText} numberOfLines={1}>
                      Campus {campus} — UFVJM
                    </Text>
                    <Text style={styles.reviewRouteSub}>Destino</Text>
                  </View>
                </View>
              </View>

              <View style={styles.reviewSection}>
                <View style={styles.reviewSectionHead}>
                  <Text style={styles.reviewSectionTitle}>Agenda</Text>
                  <Pressable onPress={() => setStep(2)} accessibilityRole="button">
                    <Text style={styles.reviewEdit}>Editar</Text>
                  </Pressable>
                </View>
                <View style={styles.reviewGrid}>
                  <View style={styles.reviewGridItem}>
                    <Icon name="calendar" size={19} color={Colors.muted} />
                    <View>
                      <Text style={styles.reviewGridLabel}>Data</Text>
                      <Text style={styles.reviewGridValue}>
                        {formatDateBR(new Date(`${tripDate}T12:00:00`))}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.reviewGridItem}>
                    <Icon name="clock" size={19} color={Colors.muted} />
                    <View>
                      <Text style={styles.reviewGridLabel}>Saída</Text>
                      <Text style={styles.reviewGridValue}>{departureTime}</Text>
                    </View>
                  </View>
                </View>
                {recurring && (
                  <Text style={styles.reviewRecurrence}>
                    Recorrente · {days.map((day) => WEEKDAYS[day].label).join(", ")} · até{" "}
                    {formatShortDateBR(new Date(`${recurrenceEnd}T12:00:00`))}
                  </Text>
                )}
                {(direction === "volta" || direction === "ambas") && (
                  <View style={styles.reviewReturn}>
                    <Icon name="back" size={17} color={Colors.muted} />
                    <Text style={styles.reviewRecurrence}>
                      Volta independente às {returnTime}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.reviewSection}>
                <View style={styles.reviewSectionHead}>
                  <Text style={styles.reviewSectionTitle}>Vagas e valor</Text>
                  <Pressable onPress={() => setStep(3)} accessibilityRole="button">
                    <Text style={styles.reviewEdit}>Editar</Text>
                  </Pressable>
                </View>
                <View style={styles.reviewGrid}>
                  <View style={styles.reviewGridItem}>
                    <Icon name="users" size={19} color={Colors.muted} />
                    <View>
                      <Text style={styles.reviewGridLabel}>Disponibilidade</Text>
                      <Text style={styles.reviewGridValue}>{seats} vagas</Text>
                    </View>
                  </View>
                  <View style={styles.reviewGridItem}>
                    <Icon name="card" size={19} color={Colors.muted} />
                    <View>
                      <Text style={styles.reviewGridLabel}>Por pessoa</Text>
                      <Text style={styles.reviewGridValue}>R$ {price},00</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.publishNotice}>
                <Icon name="shield" size={19} color={Colors.brand} />
                <Text style={styles.publishNoticeText}>
                  Ao publicar, estudantes com rotas próximas poderão solicitar participação. Você
                  aprova cada passageiro.
                </Text>
              </View>
            </>
          )}

          {error ? (
            <View style={styles.formError} accessibilityLiveRegion="polite">
              <Icon name="close" size={18} color={Colors.error} />
              <Text style={styles.formErrorText}>{error}</Text>
            </View>
          ) : null}

          <View style={{ gap: 8 }}>
            {step < 4 ? (
              <Pressable onPress={continueFlow} accessibilityRole="button" style={styles.primaryCta}>
                <Text style={styles.ctaTextWhite}>Continuar</Text>
                <Icon name="arrow" size={22} color="#ffffff" />
              </Pressable>
            ) : (
              <Pressable onPress={publishRide} accessibilityRole="button" style={styles.primaryCta}>
                <Text style={styles.ctaTextWhite}>Publicar carona</Text>
              </Pressable>
            )}
            <Text style={styles.offerFootnote}>
              {step < 4
                ? "Você poderá revisar tudo antes de publicar."
                : "Nenhuma cobrança real será realizada."}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = {
  eyebrow: {
    color: Colors.muted,
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  successScreen: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 24,
    backgroundColor: Colors.surface,
    gap: 8,
  },
  successRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.blueSoft,
    marginBottom: 6,
  },
  successTitle: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 26,
    color: Colors.ink,
    letterSpacing: -0.8,
  },
  successText: {
    color: Colors.muted,
    fontSize: 15,
    textAlign: "center" as const,
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 8,
    fontFamily: Fonts.body,
  },
  publishedCard: {
    flexDirection: "row" as const,
    alignSelf: "stretch" as const,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    marginBottom: 10,
  },
  publishedDate: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.bodyBold, letterSpacing: 1 },
  publishedTime: { fontFamily: Fonts.displayExtraBold, fontSize: 26, color: Colors.ink, marginTop: 2 },
  publishedRoute: { color: Colors.muted, fontSize: 13, marginTop: 2, fontFamily: Fonts.body },
  publishedSeats: { alignItems: "center" as const, justifyContent: "center" as const },
  publishedSeatsValue: { fontFamily: Fonts.displayExtraBold, fontSize: 30, color: Colors.brand },
  publishedSeatsLabel: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  primaryCta: {
    alignSelf: "stretch" as const,
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
  ctaTextWhite: { color: "#ffffff", fontFamily: Fonts.bodyBold, fontSize: 16 },
  textButtonLabel: { color: Colors.muted, fontFamily: Fonts.bodySemiBold, fontSize: 15 },
  progress: {
    flexDirection: "row" as const,
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 0,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.canvas,
  },
  progressItem: { flex: 1, alignItems: "center" as const, gap: 5 },
  progressLine: {
    position: "absolute" as const,
    top: 14,
    left: "50%" as const,
    width: "100%" as const,
    borderTopWidth: 2,
    borderTopColor: Colors.canvas,
  },
  progressLineActive: { borderTopColor: Colors.brandLight },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.canvas,
    backgroundColor: Colors.surface,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 1,
  },
  progressDotActive: { borderColor: Colors.brand, backgroundColor: Colors.brand },
  progressDotText: { color: Colors.muted, fontFamily: Fonts.displayExtraBold, fontSize: 14 },
  progressDotTextActive: { color: "#ffffff" },
  progressLabel: { color: Colors.muted, fontSize: 11, fontFamily: Fonts.bodyBold },
  progressLabelActive: { color: Colors.brand },
  inlineBack: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    alignSelf: "flex-start" as const,
    paddingVertical: 4,
  },
  inlineBackText: { color: Colors.muted, fontFamily: Fonts.bodySemiBold, fontSize: 14 },
  stepHeading: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12 },
  stepBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blueSoft,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  stepBadgeText: { fontFamily: Fonts.displayExtraBold, color: Colors.brand, fontSize: 17 },
  stepTitle: { fontFamily: Fonts.displayExtraBold, fontSize: 20, color: Colors.ink, letterSpacing: -0.5 },
  stepSub: { color: Colors.muted, fontSize: 13, marginTop: 1, fontFamily: Fonts.body },
  eligibilityLine: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: Colors.blueSoft,
    borderRadius: 12,
    padding: 12,
  },
  eligibilityTitle: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.brand },
  eligibilitySub: { color: Colors.brand, fontSize: 12, fontFamily: Fonts.body, opacity: 0.85 },
  formSection: {
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 16,
    padding: 14,
    backgroundColor: Colors.surface,
    gap: 0,
  },
  routePreviewRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    marginTop: 4,
  },
  destIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: Colors.brand,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  originDot: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: Colors.blueSoft,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  originDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.brand,
  },
  routePreviewSmall: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  routePreviewBig: { color: Colors.ink, fontFamily: Fonts.bodyBold, fontSize: 16 },
  miniMapWrap: {
    borderRadius: 16,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: Colors.canvas,
  },
  selectedMapPoint: {
    backgroundColor: Colors.graySoft,
    color: Colors.muted,
    fontSize: 12,
    padding: 10,
    textAlign: "center" as const,
    fontFamily: Fonts.body,
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
  segmentedText: { color: Colors.muted, fontFamily: Fonts.bodyBold, fontSize: 14 },
  segmentedTextActive: { color: Colors.brand },
  required: { color: Colors.error, fontSize: 12, fontFamily: Fonts.body },
  optional: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  toggleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 8,
  },
  toggleTitle: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink },
  toggleSub: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  conditionalSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.graySoft2,
    paddingTop: 12,
    marginTop: 4,
  },
  sectionTitleRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, marginBottom: 12 },
  sectionTitleIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.blueSoft,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sectionTitle: { fontFamily: Fonts.displayBold, fontSize: 16, color: Colors.ink },
  sectionSub: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  fieldHelp: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  fieldHelpText: { flex: 1, color: Colors.muted, fontSize: 12, lineHeight: 17, fontFamily: Fonts.body },
  counterRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 10,
  },
  counterTitle: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.ink },
  counterSub: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  counterControls: { flexDirection: "row" as const, alignItems: "center" as const, gap: 14 },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.canvas,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.surface,
  },
  counterButtonText: { fontSize: 22, color: Colors.ink, lineHeight: 26 },
  counterValue: { fontFamily: Fonts.displayExtraBold, fontSize: 22, color: Colors.ink, minWidth: 24, textAlign: "center" as const },
  pricePicker: {
    borderTopWidth: 1,
    borderTopColor: Colors.graySoft2,
    paddingTop: 14,
    marginBottom: 14,
  },
  priceValueRow: { flexDirection: "row" as const, alignItems: "baseline" as const, gap: 6, marginVertical: 4 },
  priceCurrency: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.muted },
  priceValue: { fontFamily: Fonts.displayExtraBold, fontSize: 30, color: Colors.ink },
  rangeLabels: { flexDirection: "row" as const, justifyContent: "space-between" as const },
  rangeLabelText: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  priceHint: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8, marginTop: 10 },
  priceHintText: { flex: 1, color: Colors.muted, fontSize: 12, lineHeight: 17, fontFamily: Fonts.body },
  noteInput: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 13,
    padding: 12,
    fontSize: 15,
    color: Colors.ink,
    textAlignVertical: "top" as const,
    fontFamily: Fonts.body,
  },
  charCount: { alignSelf: "flex-end" as const, color: Colors.muted, fontSize: 11, marginTop: 4 },
  reviewSection: {
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  reviewSectionHead: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  reviewSectionTitle: { fontFamily: Fonts.displayBold, fontSize: 15, color: Colors.ink },
  reviewEdit: { color: Colors.brand, fontFamily: Fonts.bodyBold, fontSize: 14 },
  reviewRoute: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10 },
  reviewOriginDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.brand,
    marginHorizontal: 3,
  },
  reviewRouteText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink },
  reviewRouteSub: { color: Colors.muted, fontSize: 11, fontFamily: Fonts.body },
  reviewGrid: { flexDirection: "row" as const, gap: 16 },
  reviewGridItem: { flex: 1, flexDirection: "row" as const, alignItems: "center" as const, gap: 10 },
  reviewGridLabel: { color: Colors.muted, fontSize: 11, fontFamily: Fonts.body },
  reviewGridValue: { color: Colors.ink, fontFamily: Fonts.bodyBold, fontSize: 14 },
  reviewRecurrence: { color: Colors.muted, fontSize: 13, fontFamily: Fonts.body },
  reviewReturn: { flexDirection: "row" as const, alignItems: "center" as const, gap: 6 },
  publishNotice: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: Colors.blueSoft,
    borderRadius: 12,
    padding: 12,
  },
  publishNoticeText: { flex: 1, color: Colors.ink, fontSize: 13, lineHeight: 18, fontFamily: Fonts.body },
  formError: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: Colors.redSoft,
    borderRadius: 12,
    padding: 12,
  },
  formErrorText: { flex: 1, color: Colors.error, fontSize: 13, fontFamily: Fonts.bodySemiBold },
  offerFootnote: {
    textAlign: "center" as const,
    color: Colors.muted,
    fontSize: 12,
    fontFamily: Fonts.body,
  },
};
