import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { TopBar } from "@/components/TopBar";
import { Colors, Fonts } from "@/constants/theme";
import { useAppStore, type PaymentState } from "@/store";

const STATUS_INFO: Record<PaymentState, { title: string; text: string; tone: Tone }> = {
  aguardando: {
    title: "Aguardando pagamento",
    text: "Escolha uma forma de pagamento para continuar.",
    tone: "waiting",
  },
  processando: {
    title: "Pagamento em processamento",
    text: "Estamos validando a simulação do pagamento.",
    tone: "processing",
  },
  aprovado: {
    title: "Pagamento aprovado",
    text: "Seu pagamento de R$ 6,00 foi confirmado.",
    tone: "paid",
  },
  recusado: {
    title: "Pagamento recusado",
    text: "Não foi possível aprovar. Escolha outra forma de pagamento.",
    tone: "refused",
  },
  reembolso: {
    title: "Reembolso solicitado",
    text: "A solicitação está em análise para esta ocorrência.",
    tone: "refund",
  },
  reembolsado: {
    title: "Pagamento reembolsado",
    text: "R$ 6,00 foi devolvido pelo método de pagamento.",
    tone: "paid",
  },
};

type Tone = "waiting" | "processing" | "paid" | "refused" | "refund";

export default function PaymentScreen() {
  const router = useRouter();
  const { state, setPayment } = useAppStore();
  const [method, setMethod] = useState<"pix" | "card">(state.paymentMethods?.["ride-1"] || "pix");
  const status = (state.payments["ride-1"] || "aguardando") as PaymentState;
  const setStatus = (next: PaymentState) => setPayment(1, next, method);
  const info = STATUS_INFO[status];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <TopBar title="Pagamento" subtitle="CARONA COM MARINA" onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 14 }}
      >
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
            <View style={[styles.statusPill, toneStyle(info.tone)]}>
              <Text style={[styles.statusPillText, { color: toneIcon(info.tone) }]}>
                {info.title}
              </Text>
            </View>
            <Text style={styles.stateTitle}>{info.title}</Text>
            <Text style={styles.stateText}>{info.text}</Text>
            <View style={styles.receipt}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Destinatária</Text>
                <Text style={styles.receiptValue}>Marina Lopes</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Forma</Text>
                <Text style={styles.receiptValue}>
                  {method === "pix" ? "PIX" : "Cartão final 4821"}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Data</Text>
                <Text style={styles.receiptValue}>21 mai, 10:38</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Status</Text>
                <Text style={styles.receiptValue}>{info.title}</Text>
              </View>
            </View>
            {status === "processando" && (
              <Pressable
                onPress={() => setStatus("aprovado")}
                accessibilityRole="button"
                style={styles.primaryCta}
              >
                <Text style={styles.ctaTextWhite}>Concluir processamento</Text>
              </Pressable>
            )}
            {status === "recusado" && (
              <Pressable
                onPress={() => setStatus("aguardando")}
                accessibilityRole="button"
                style={styles.primaryCta}
              >
                <Text style={styles.ctaTextWhite}>Tentar outra forma</Text>
              </Pressable>
            )}
            {status === "aprovado" && (
              <Pressable
                onPress={() => setStatus("reembolso")}
                accessibilityRole="button"
                style={styles.secondaryCta}
              >
                <Text style={styles.secondaryCtaText}>Solicitar reembolso</Text>
              </Pressable>
            )}
            {status === "reembolso" && (
              <Pressable
                onPress={() => setStatus("reembolsado")}
                accessibilityRole="button"
                style={styles.primaryCta}
              >
                <Text style={styles.ctaTextWhite}>Simular aprovação do reembolso</Text>
              </Pressable>
            )}
            {status === "reembolsado" && (
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                style={styles.primaryCta}
              >
                <Text style={styles.ctaTextWhite}>Concluir</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total da carona</Text>
              <Text style={styles.totalValue}>R$ 6,00</Text>
              <Text style={styles.totalSub}>Campus JK · quarta, 07:10</Text>
            </View>
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
                  <Icon name="check" size={14} color="#ffffff" />
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
                  <Icon name="check" size={14} color="#ffffff" />
                </View>
              )}
            </Pressable>
            <View style={styles.safeNote}>
              <Icon name="shield" size={18} color={Colors.brand} />
              <Text style={styles.safeNoteText}>
                Pagamento simulado e protegido. Nenhuma cobrança real será feita.
              </Text>
            </View>
            <Pressable
              onPress={() => setStatus("processando")}
              accessibilityRole="button"
              style={styles.primaryCta}
            >
              <Text style={styles.ctaTextWhite}>Pagar R$ 6,00</Text>
            </Pressable>
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
  stateContainer: { alignItems: "center" as const, gap: 10, paddingTop: 16 },
  stateIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 4,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statusPillText: { fontFamily: Fonts.bodyBold, fontSize: 13 },
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
  primaryCta: {
    alignSelf: "stretch" as const,
    minHeight: 56,
    borderRadius: 15,
    backgroundColor: Colors.brand,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  ctaTextWhite: { color: "#ffffff", fontFamily: Fonts.bodyBold, fontSize: 16 },
  secondaryCta: {
    alignSelf: "stretch" as const,
    minHeight: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.canvas,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  secondaryCtaText: { color: Colors.ink, fontFamily: Fonts.bodyBold, fontSize: 16 },
  totalCard: {
    backgroundColor: Colors.graySoft,
    borderRadius: 18,
    padding: 18,
    alignItems: "center" as const,
    gap: 2,
  },
  totalLabel: { color: Colors.muted, fontSize: 13, fontFamily: Fonts.body },
  totalValue: { fontFamily: Fonts.displayExtraBold, fontSize: 34, color: Colors.ink },
  totalSub: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
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
  safeNote: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: Colors.blueSoft,
    borderRadius: 12,
    padding: 12,
  },
  safeNoteText: { flex: 1, color: Colors.ink, fontSize: 13, lineHeight: 18, fontFamily: Fonts.body },
  simulateRefusal: { color: Colors.error, fontFamily: Fonts.bodySemiBold, fontSize: 14 },
};
