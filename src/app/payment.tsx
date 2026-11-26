import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { TopBar } from "@/components/TopBar";
import { PrimaryButton, SafeNote, SecondaryButton } from "@/components/ui";
import { Colors, Fonts } from "@/constants/theme";
import { costSplitFor, fixtureRides } from "@/data";
import { formatCurrencyBR } from "@/lib/format";
import { useAppStore, type PaymentState } from "@/store";

type Tone = "waiting" | "processing" | "paid" | "refused" | "refund";

const PROCESSING_DELAY_MS = 1800;

function statusInfo(
  status: PaymentState,
  amount: string,
): { title: string; text: string; tone: Tone } {
  switch (status) {
    case "processando":
      return {
        title: "Processando pagamento",
        text: "Estamos validando a simulação do pagamento. Isso leva só alguns segundos.",
        tone: "processing",
      };
    case "aprovado":
      return {
        title: "Pagamento aprovado",
        text: `Seu pagamento de ${amount} foi confirmado.`,
        tone: "paid",
      };
    case "recusado":
      return {
        title: "Pagamento recusado",
        text: "Não foi possível aprovar. Escolha outra forma de pagamento.",
        tone: "refused",
      };
    case "reembolso":
      return {
        title: "Reembolso solicitado",
        text: "A solicitação está em análise para esta ocorrência.",
        tone: "refund",
      };
    case "reembolsado":
      return {
        title: "Pagamento reembolsado",
        text: `${amount} foi devolvido pelo método de pagamento.`,
        tone: "paid",
      };
    default:
      return {
        title: "Aguardando pagamento",
        text: "Escolha uma forma de pagamento para continuar.",
        tone: "waiting",
      };
  }
}

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; from?: string }>();
  const rideId = Number(params.id ?? 1);
  const { state, setPayment } = useAppStore();

  const ride =
    state.rides.find((item) => item.id === rideId) ||
    fixtureRides.find((item) => item.id === rideId) ||
    fixtureRides[0];
  const key = `ride-${ride.id}`;
  const split = costSplitFor(ride, state.profile.id);
  const amount = formatCurrencyBR(split.perPerson);
  const driverFirstName = ride.driver.name.split(" ")[0];

  const [method, setMethod] = useState<"pix" | "card">(state.paymentMethods?.[key] || "pix");
  const status = (state.payments[key] || "aguardando") as PaymentState;
  const setStatus = (next: PaymentState) => setPayment(ride.id, next, method);
  const info = statusInfo(status, amount);

  // Simulação: o "processamento" conclui sozinho depois de alguns segundos.
  useEffect(() => {
    if (status !== "processando") return;
    const timer = setTimeout(() => setPayment(ride.id, "aprovado", method), PROCESSING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, ride.id, method, setPayment]);

  const goBackToRide = () => {
    if (params.from === "ride" && router.canGoBack()) router.back();
    else router.replace({ pathname: "/ride/[id]", params: { id: String(ride.id) } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <TopBar
        title="Pagamento"
        subtitle={`CARONA COM ${driverFirstName.toUpperCase()}`}
        onBack={goBackToRide}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 14 }}
      >
        <View style={styles.rideCard}>
          <View style={styles.rideDriver}>
            <Avatar person={ride.driver} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rideEyebrow}>MOTORISTA</Text>
              <Text style={styles.rideDriverName} numberOfLines={1}>
                {ride.driver.name}
              </Text>
            </View>
          </View>
          <View style={styles.rideRow}>
            <Icon name="pin" size={18} color={Colors.muted} />
            <Text style={styles.rideRowText} numberOfLines={2}>
              {ride.from} → {ride.to}
            </Text>
          </View>
          <View style={styles.rideRow}>
            <Icon name="calendar" size={18} color={Colors.muted} />
            <Text style={styles.rideRowText} numberOfLines={1}>
              {ride.days}
            </Text>
          </View>
          <View style={styles.rideRow}>
            <Icon name="clock" size={18} color={Colors.muted} />
            <Text style={styles.rideRowText} numberOfLines={1}>
              Saída {ride.time} · chegada {ride.arrive}
            </Text>
          </View>
        </View>

        <View style={styles.splitCard}>
          <Text style={styles.sectionLabel}>Divisão de custos</Text>
          <View style={styles.splitRow}>
            <Text style={styles.splitLabel}>Custo total estimado (combustível)</Text>
            <Text style={styles.splitValue} numberOfLines={1}>
              {formatCurrencyBR(split.total)}
            </Text>
          </View>
          <View style={styles.splitRow}>
            <Text style={styles.splitLabel}>Pessoas no carro</Text>
            <Text style={styles.splitValue} numberOfLines={1}>
              {split.people}
            </Text>
          </View>
          <Text style={styles.splitHint}>
            Motorista + {split.people - 1} passageiro{split.people - 1 === 1 ? "" : "s"}, incluindo
            você. O valor é dividido igualmente.
          </Text>
          <View style={styles.splitDivider} />
          <View style={[styles.splitRow, { alignItems: "flex-end" }]}>
            <Text style={styles.splitLabelStrong}>Sua parte</Text>
            <Text numberOfLines={1}>
              <Text style={styles.perPersonValue}>{amount}</Text>
              <Text style={styles.perPersonSuffix}> por pessoa</Text>
            </Text>
          </View>
        </View>

        {status !== "aguardando" ? (
          <View style={styles.stateContainer}>
            <View style={[styles.stateIcon, toneStyle(info.tone)]}>
              <Icon
                name={
                  status === "recusado"
                    ? "close"
                    : status === "processando" || status === "reembolso"
                      ? "clock"
                      : "check"
                }
                size={35}
                color={toneIcon(info.tone)}
              />
            </View>
            <Text style={styles.stateTitle}>{info.title}</Text>
            <Text style={styles.stateText}>{info.text}</Text>
            <View style={styles.receipt}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Para</Text>
                <Text style={styles.receiptValue}>{ride.driver.name}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Valor</Text>
                <Text style={styles.receiptValue}>{amount} por pessoa</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Forma</Text>
                <Text style={styles.receiptValue}>
                  {method === "pix" ? "PIX" : "Cartão final 4821"}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Status</Text>
                <Text style={styles.receiptValue}>{info.title}</Text>
              </View>
            </View>
            {status === "processando" && (
              <PrimaryButton
                title="Processando"
                loading
                onPress={() => {}}
                style={{ alignSelf: "stretch" }}
              />
            )}
            {status === "recusado" && (
              <PrimaryButton
                title="Tentar outra forma"
                onPress={() => setStatus("aguardando")}
                style={{ alignSelf: "stretch" }}
              />
            )}
            {status === "aprovado" && (
              <>
                <PrimaryButton
                  title="Voltar para a carona"
                  onPress={goBackToRide}
                  style={{ alignSelf: "stretch" }}
                />
                <SecondaryButton
                  title="Solicitar reembolso"
                  onPress={() => setStatus("reembolso")}
                  style={{ alignSelf: "stretch" }}
                />
              </>
            )}
            {status === "reembolso" && (
              <PrimaryButton
                title="Simular aprovação do reembolso"
                onPress={() => setStatus("reembolsado")}
                style={{ alignSelf: "stretch" }}
              />
            )}
            {status === "reembolsado" && (
              <PrimaryButton
                title="Concluir"
                onPress={goBackToRide}
                style={{ alignSelf: "stretch" }}
              />
            )}
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Como você quer pagar?</Text>
            <Pressable
              onPress={() => setMethod("pix")}
              accessibilityRole="button"
              accessibilityState={{ selected: method === "pix" }}
              style={[styles.methodCard, method === "pix" && styles.methodCardActive]}
            >
              <View style={[styles.methodIcon, method === "pix" && styles.methodIconActive]}>
                <Text style={[styles.pixSymbol, method === "pix" && { color: Colors.brand }]}>◇</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodTitle}>PIX</Text>
                <Text style={styles.methodSub}>Aprovação imediata</Text>
              </View>
              {method === "pix" && (
                <View style={styles.methodCheck}>
                  <Icon name="check" size={14} color={Colors.surface} />
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => setMethod("card")}
              accessibilityRole="button"
              accessibilityState={{ selected: method === "card" }}
              style={[styles.methodCard, method === "card" && styles.methodCardActive]}
            >
              <View style={[styles.methodIcon, method === "card" && styles.methodIconActive]}>
                <Icon name="card" size={22} color={method === "card" ? Colors.brand : Colors.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodTitle}>Cartão final 4821</Text>
                <Text style={styles.methodSub}>Crédito · Mastercard</Text>
              </View>
              {method === "card" && (
                <View style={styles.methodCheck}>
                  <Icon name="check" size={14} color={Colors.surface} />
                </View>
              )}
            </Pressable>
            <SafeNote text="Pagamento simulado e protegido. Nenhuma cobrança real será feita." />
            <PrimaryButton
              title={`Confirmar pagamento · ${amount}`}
              onPress={() => setStatus("processando")}
            />
            <Pressable
              onPress={() => setStatus("recusado")}
              accessibilityRole="button"
              style={{ alignItems: "center", paddingVertical: 8 }}
            >
              <Text style={styles.simulateRefusal}>Simular pagamento recusado</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function toneStyle(tone: Tone) {
  switch (tone) {
    case "paid":
      return { backgroundColor: Colors.mintSoft };
    case "refused":
      return { backgroundColor: Colors.redSoft };
    case "processing":
      return { backgroundColor: Colors.amberSoft };
    case "refund":
      return { backgroundColor: Colors.blueSoft2 };
    default:
      return { backgroundColor: Colors.graySoft };
  }
}

function toneIcon(tone: Tone) {
  switch (tone) {
    case "paid":
      return Colors.route;
    case "refused":
      return Colors.error;
    case "processing":
      return Colors.amberInk;
    case "refund":
      return Colors.brand;
    default:
      return Colors.muted;
  }
}

const styles = {
  rideCard: {
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  rideDriver: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12 },
  rideEyebrow: {
    color: Colors.muted,
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  rideDriverName: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.ink },
  rideRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10 },
  rideRowText: { flex: 1, color: Colors.ink, fontSize: 14, fontFamily: Fonts.body },
  splitCard: {
    backgroundColor: Colors.graySoft,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  splitRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  splitLabel: { flex: 1, color: Colors.muted, fontSize: 14, fontFamily: Fonts.body },
  splitLabelStrong: { flex: 1, color: Colors.ink, fontSize: 15, fontFamily: Fonts.bodyBold },
  splitValue: { color: Colors.ink, fontSize: 15, fontFamily: Fonts.bodyBold },
  splitHint: { color: Colors.muted, fontSize: 12, lineHeight: 17, fontFamily: Fonts.body },
  splitDivider: { height: 1, backgroundColor: Colors.canvas, marginVertical: 2 },
  perPersonValue: { fontFamily: Fonts.displayExtraBold, fontSize: 26, color: Colors.ink },
  perPersonSuffix: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.muted },
  stateContainer: { alignItems: "center" as const, gap: 10, paddingTop: 8 },
  stateIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 4,
  },
  stateTitle: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 22,
    color: Colors.ink,
    textAlign: "center" as const,
  },
  stateText: {
    color: Colors.muted,
    fontSize: 15,
    textAlign: "center" as const,
    lineHeight: 21,
    maxWidth: 320,
    fontFamily: Fonts.body,
  },
  receipt: {
    alignSelf: "stretch" as const,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginVertical: 8,
  },
  receiptRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, gap: 12 },
  receiptLabel: { color: Colors.muted, fontSize: 14, fontFamily: Fonts.body },
  receiptValue: { color: Colors.ink, fontSize: 14, fontFamily: Fonts.bodyBold },
  sectionLabel: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.ink },
  methodCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.canvas,
    borderRadius: 16,
    padding: 14,
    backgroundColor: Colors.surface,
  },
  methodCardActive: { borderColor: Colors.brand, backgroundColor: Colors.blueSoft2 },
  methodIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.graySoft2,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  methodIconActive: { backgroundColor: Colors.blueSoft },
  pixSymbol: { fontSize: 24, color: Colors.muted },
  methodTitle: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.ink },
  methodSub: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  methodCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.brand,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  simulateRefusal: { color: Colors.error, fontFamily: Fonts.bodySemiBold, fontSize: 14 },
};
