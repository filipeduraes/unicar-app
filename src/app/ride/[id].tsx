import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { BottomSheet } from "@/components/BottomSheet";
import { Icon } from "@/components/Icon";
import { MapView } from "@/components/MapView";
import { Stars } from "@/components/Stars";
import { PendingButton, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Colors, Fonts } from "@/constants/theme";
import { coordinatesForPickup, coordinatesForPlace, costSplitFor, fixtureRides } from "@/data";
import { formatCurrencyBR } from "@/lib/format";
import { useAppStore } from "@/store";

export default function RideDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; leg?: string; campus?: string; address?: string }>();
  const id = Number(params.id ?? 1);
  const context =
    params.leg === "volta" && params.campus && params.address
      ? { leg: "volta" as const, campus: params.campus, address: params.address }
      : null;

  const { state, requestRide, updateRequest, addReport, toggleBlock } = useAppStore();
  const baseRide =
    state.rides.find((ride) => ride.id === id) ||
    fixtureRides.find((ride) => ride.id === id) ||
    fixtureRides[0];
  const ride =
    context?.leg === "volta"
      ? {
          ...baseRide,
          from: `Campus ${context.campus}`,
          to: context.address,
          originCoordinates:
            baseRide.destinationCoordinates || coordinatesForPlace(`Campus ${context.campus}`),
          destinationCoordinates:
            baseRide.originCoordinates || coordinatesForPlace(context.address),
          time: id === 1 ? "17:25" : id === 2 ? "17:40" : "18:05",
          arrive: id === 1 ? "17:58" : id === 2 ? "18:12" : "18:32",
        }
      : baseRide;

  const [showConfirm, setShowConfirm] = useState(false);
  const storedRequest = state.requests.find(
    (request) => request.rideId === id && request.passenger.id === state.profile.id,
  );
  const pending = storedRequest?.status === "pendente";
  const approved = storedRequest?.status === "aprovada";
  const requested = pending || approved;
  const paymentStatus = state.payments[`ride-${ride.id}`] ?? "aguardando";
  const driverFirstName = ride.driver.name.split(" ")[0];
  const [safetyMessage, setSafetyMessage] = useState("");
  const [waitlisted, setWaitlisted] = useState(false);
  const [showDriverProfile, setShowDriverProfile] = useState(false);
  const isFull = ride.id === 2;
  const split = costSplitFor(ride, state.profile.id);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ position: "relative" }}>
          <MapView
            compact
            detailed
            height={225}
            origin={ride.from}
            destination={ride.to}
            originCoordinates={ride.originCoordinates}
            destinationCoordinates={ride.destinationCoordinates}
            pickups={ride.passengers.map((person, index) => ({
              label: person.name,
              initials: person.initials,
              coordinates: coordinatesForPickup(person.id, index),
            }))}
          />
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={[styles.floatingBack, { top: insets.top + 8 }]}
          >
            <Icon name="back" size={22} color={Colors.ink} />
          </Pressable>
          <View style={styles.distancePill}>
            <Text style={styles.distancePillText}>{ride.distance} · 32 min</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.handle} />
          <View style={styles.detailTitle}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>{String(ride.days).toUpperCase()}</Text>
              <Text style={styles.title}>
                {ride.from} <Icon name="arrow" size={18} color={Colors.ink} /> {ride.to}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.priceBig}>
                R$ {ride.price}
                {"\n"}
                <Text style={styles.priceSmall}>por pessoa</Text>
              </Text>
            </View>
          </View>

          <View style={styles.timeline}>
            <View style={styles.timelineRow}>
              <Text style={styles.timelineTime}>{ride.time}</Text>
              <View style={[styles.timelineDot, { backgroundColor: Colors.brand }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.timelineStrong}>{ride.from}</Text>
                <Text style={styles.timelineSub}>
                  {context?.leg === "volta"
                    ? "Ponto de encontro no estacionamento"
                    : "Próximo à Praça Redelvim Andrade"}
                </Text>
              </View>
            </View>
            <View style={styles.timelineTrack}>
              <View style={styles.timelineLine} />
              <Text style={styles.timelineDistance}>{ride.distance}</Text>
            </View>
            <View style={styles.timelineRow}>
              <Text style={styles.timelineTime}>{ride.arrive}</Text>
              <View style={styles.timelineEnd}>
                <Icon name="pin" size={13} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.timelineStrong}>{ride.to}</Text>
                <Text style={styles.timelineSub}>
                  {context?.leg === "volta"
                    ? "Destino residencial informado"
                    : "Prédio da Reitoria"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detourCallout}>
            <Icon name="shield" size={20} color={Colors.brand} />
            <View style={{ flex: 1 }}>
              <Text style={styles.detourTitle}>Ótima opção para sua rota</Text>
              <Text style={styles.detourText}>
                Sua inclusão adiciona apenas {ride.extra} minutos ao trajeto.
              </Text>
            </View>
          </View>

          <View style={styles.routeImpact}>
            <View style={{ flex: 1 }}>
              <Text style={styles.impactLabel}>Rota original</Text>
              <Text style={styles.impactValue}>7,8 km · 26 min</Text>
            </View>
            <Icon name="arrow" size={18} color={Colors.muted} />
            <View style={{ flex: 1 }}>
              <Text style={styles.impactLabel}>Com embarques</Text>
              <Text style={styles.impactValue}>
                {ride.distance} · 32 min
              </Text>
            </View>
            <View style={styles.impactPill}>
              <Text style={styles.impactPillText}>+{ride.extra} min</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Motorista</Text>
              <Pressable onPress={() => setShowDriverProfile(true)} accessibilityRole="button">
                <Text style={styles.sectionAction}>Ver perfil</Text>
              </Pressable>
            </View>
            <View style={styles.driverCard}>
              <Avatar person={ride.driver} size="lg" />
              <View style={{ flex: 1 }}>
                <Text style={styles.driverName}>{ride.driver.name}</Text>
                <Text style={styles.driverCourse}>{ride.driver.course}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
                  <Stars value={ride.driver.rating} />
                  <Text style={styles.driverTrips}>42 viagens</Text>
                </View>
              </View>
              <View style={styles.verifiedPill}>
                <Icon name="shield" size={14} color={Colors.route} />
                <Text style={styles.verifiedText}>Verificado</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Quem já vai</Text>
              <Text style={styles.sectionMeta}>
                {isFull ? "Carona lotada" : `${ride.seats} vagas restantes`}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              {ride.passengers.map((passenger) => (
                <Avatar key={passenger.id} person={passenger} />
              ))}
              {ride.passengers.length === 0 && (
                <Text style={styles.muted}>Seja a primeira pessoa nesta carona.</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Pagamento</Text>
              {approved ? (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/payment",
                      params: { id: String(ride.id), from: "ride" },
                    })
                  }
                  accessibilityRole="button"
                >
                  <Text style={styles.sectionAction}>
                    {paymentStatus === "aguardando" || paymentStatus === "recusado"
                      ? "Ver divisão e pagar"
                      : "Ver pagamento"}
                  </Text>
                </Pressable>
              ) : pending ? (
                <View style={styles.waitingPill}>
                  <Icon name="clock" size={13} color={Colors.amberInk} />
                  <Text style={styles.waitingPillText}>Aguardando aprovação</Text>
                </View>
              ) : null}
            </View>
            {approved ? (
              <Text style={styles.noteText}>
                {formatCurrencyBR(split.total)} de combustível dividido entre {split.people}{" "}
                pessoas: {formatCurrencyBR(split.perPerson)} por pessoa.
              </Text>
            ) : (
              <View style={styles.paymentLocked}>
                <Text numberOfLines={1}>
                  <Text style={styles.paymentLockedValue}>{formatCurrencyBR(split.perPerson)}</Text>
                  <Text style={styles.priceSmall}> por pessoa</Text>
                </Text>
                <Text style={styles.paymentLockedText}>
                  {pending
                    ? `Solicitação enviada. O pagamento é liberado quando ${driverFirstName} aprovar sua solicitação.`
                    : `O pagamento é liberado quando ${driverFirstName} aprovar sua solicitação.`}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.noteText}>“{ride.note}”</Text>
          </View>

          <View style={styles.safetyActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                addReport({
                  type: "usuario",
                  targetId: String(ride.driver.id),
                  category: "Conduta na carona",
                  description: "Registro feito pela tela de detalhes.",
                });
                setSafetyMessage("Denúncia registrada. Nossa equipe fará a análise.");
              }}
              style={styles.safetyLink}
            >
              <Text style={styles.safetyLinkText}>Denunciar usuário</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                toggleBlock(ride.driver.id);
                setSafetyMessage(
                  state.blockedUserIds.includes(ride.driver.id)
                    ? "Usuário desbloqueado."
                    : "Usuário bloqueado. Vocês não verão novas caronas um do outro.",
                );
              }}
              style={styles.safetyLink}
            >
              <Text style={styles.safetyLinkText}>Bloquear</Text>
            </Pressable>
          </View>
          {safetyMessage ? (
            <View style={styles.toast}>
              <Icon name="shield" size={17} color="#ffffff" />
              <Text style={styles.toastText}>{safetyMessage}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.bottomCta, { paddingBottom: Math.max(16, insets.bottom + 10) }]}>
        {waitlisted ? (
          <PendingButton
            title="Sair da lista de espera"
            icon="users"
            onPress={() => {
              if (storedRequest) updateRequest(storedRequest.id, "cancelada");
              setWaitlisted(false);
            }}
          />
        ) : requested ? (
          <PendingButton
            title="Cancelar solicitação"
            icon="clock"
            onPress={() => storedRequest && updateRequest(storedRequest.id, "cancelada")}
          />
        ) : (
          <Pressable
            onPress={() => {
              if (isFull) {
                requestRide(ride.id, true);
                setWaitlisted(true);
              } else setShowConfirm(true);
            }}
            accessibilityRole="button"
            style={({ pressed }) => [
              isFull ? styles.waitlistCta : styles.primaryCta,
              pressed && { opacity: 0.92 },
            ]}
          >
            <Icon name={isFull ? "users" : "car"} size={20} color={isFull ? Colors.brand : "#ffffff"} />
            <Text style={[styles.ctaText, isFull && { color: Colors.brand }]}>
              {isFull ? "Entrar na lista de espera" : `Solicitar vaga · R$ ${ride.price}`}
            </Text>
          </Pressable>
        )}
      </View>

      <BottomSheet visible={showDriverProfile} onClose={() => setShowDriverProfile(false)}>
        <View style={{ alignItems: "center" }}>
          <Avatar person={ride.driver} size="xl" />
          <Text style={styles.sheetName}>{ride.driver.name}</Text>
          <Text style={styles.sheetCourse}>{ride.driver.course}</Text>
          <View style={styles.publicStats}>
            <View style={styles.publicStat}>
              <Text style={styles.publicStatValue}>{ride.driver.rating.toFixed(1)}</Text>
              <Text style={styles.publicStatLabel}>avaliação</Text>
            </View>
            <View style={styles.publicStatDivider} />
            <View style={styles.publicStat}>
              <Text style={styles.publicStatValue}>42</Text>
              <Text style={styles.publicStatLabel}>viagens</Text>
            </View>
            <View style={styles.publicStatDivider} />
            <View style={styles.publicStat}>
              <Text style={styles.publicStatValue}>98%</Text>
              <Text style={styles.publicStatLabel}>presença</Text>
            </View>
          </View>
          <SecondaryButton title="Fechar" onPress={() => setShowDriverProfile(false)} />
        </View>
      </BottomSheet>

      <BottomSheet visible={showConfirm} onClose={() => setShowConfirm(false)}>
        <View style={{ alignItems: "center" }}>
          <View style={styles.sheetIcon}>
            <Icon name="car" size={27} color={Colors.brand} />
          </View>
          <Text style={styles.sheetTitle}>Solicitar esta carona?</Text>
          <Text style={styles.sheetText}>
            {driverFirstName} receberá sua solicitação e poderá aprovar sua
            participação.
          </Text>
          <View style={styles.requestSummary}>
            <View style={styles.requestSummaryRow}>
              <Icon name="calendar" size={18} color={Colors.muted} />
              <Text style={styles.requestSummaryText}>Hoje, {ride.time}</Text>
            </View>
            <View style={styles.requestSummaryRow}>
              <Icon name="pin" size={18} color={Colors.muted} />
              <Text style={styles.requestSummaryText}>{ride.to}</Text>
            </View>
            <View style={styles.requestSummaryRow}>
              <Icon name="card" size={18} color={Colors.muted} />
              <Text style={styles.requestSummaryText}>
                R$ {ride.price},00 · pago após a aprovação
              </Text>
            </View>
          </View>
          <PrimaryButton
            title="Enviar solicitação"
            onPress={() => {
              requestRide(ride.id);
              setShowConfirm(false);
            }}
          />
          <Pressable
            onPress={() => setShowConfirm(false)}
            accessibilityRole="button"
            style={{ paddingVertical: 12 }}
          >
            <Text style={{ color: Colors.muted, fontFamily: Fonts.bodySemiBold, fontSize: 15 }}>
              Agora não
            </Text>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = {
  floatingBack: {
    position: "absolute" as const,
    top: 14,
    left: 14,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: Colors.canvas,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  distancePill: {
    position: "absolute" as const,
    left: 14,
    bottom: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#d7e5e0",
  },
  distancePillText: { color: "#335248", fontFamily: Fonts.bodyBold, fontSize: 12 },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 18 },
  handle: {
    height: 4,
    width: 42,
    backgroundColor: Colors.canvas,
    borderRadius: 5,
    alignSelf: "center" as const,
    marginBottom: 2,
  },
  detailTitle: { flexDirection: "row" as const, gap: 12, alignItems: "flex-start" as const },
  eyebrow: {
    color: Colors.muted,
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 21,
    lineHeight: 26,
    color: Colors.ink,
    letterSpacing: -0.6,
  },
  priceBig: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 22,
    color: Colors.ink,
    textAlign: "right" as const,
    lineHeight: 26,
  },
  priceSmall: { fontSize: 12, color: Colors.muted, fontFamily: Fonts.body },
  timeline: {
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 16,
    padding: 14,
    backgroundColor: Colors.surface,
    gap: 0,
  },
  timelineRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12 },
  timelineTime: { width: 44, fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineEnd: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.error,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  timelineStrong: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink },
  timelineSub: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  timelineTrack: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginLeft: 56,
    paddingVertical: 6,
    gap: 10,
  },
  timelineLine: {
    width: 2,
    height: 22,
    backgroundColor: Colors.border,
    marginLeft: 5,
  },
  timelineDistance: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  detourCallout: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: Colors.blueSoft,
    borderRadius: 14,
    padding: 14,
  },
  detourTitle: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink },
  detourText: { color: Colors.muted, fontSize: 13, fontFamily: Fonts.body },
  routeImpact: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 14,
    padding: 12,
  },
  impactLabel: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  impactValue: { color: Colors.ink, fontSize: 14, fontFamily: Fonts.bodyBold },
  impactPill: {
    backgroundColor: Colors.amberSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  impactPillText: { color: Colors.amberInk, fontFamily: Fonts.bodyBold, fontSize: 12 },
  section: { gap: 10 },
  sectionHead: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  sectionTitle: { fontFamily: Fonts.displayBold, fontSize: 16, color: Colors.ink },
  sectionAction: { color: Colors.brand, fontFamily: Fonts.bodyBold, fontSize: 14 },
  sectionMeta: { color: Colors.muted, fontSize: 13, fontFamily: Fonts.body },
  driverCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 16,
    padding: 12,
  },
  driverName: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.ink },
  driverCourse: { color: Colors.muted, fontSize: 13, fontFamily: Fonts.body },
  driverTrips: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  verifiedPill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: Colors.mintSoft,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  verifiedText: { color: Colors.route, fontFamily: Fonts.bodyBold, fontSize: 11 },
  muted: { color: Colors.muted, fontSize: 14, fontFamily: Fonts.body },
  noteText: {
    color: Colors.ink,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: Fonts.body,
    backgroundColor: Colors.graySoft,
    borderRadius: 12,
    padding: 12,
  },
  waitingPill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: Colors.amberSoft,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  waitingPillText: { color: Colors.amberInk, fontFamily: Fonts.bodyBold, fontSize: 12 },
  paymentLocked: {
    backgroundColor: Colors.graySoft,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  paymentLockedValue: { fontFamily: Fonts.displayExtraBold, fontSize: 20, color: Colors.ink },
  paymentLockedText: { color: Colors.muted, fontSize: 14, lineHeight: 20, fontFamily: Fonts.body },
  safetyActions: { flexDirection: "row" as const, gap: 18 },
  safetyLink: { paddingVertical: 4 },
  safetyLinkText: { color: Colors.error, fontFamily: Fonts.bodySemiBold, fontSize: 14 },
  toast: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: Colors.ink,
    borderRadius: 12,
    padding: 12,
  },
  toastText: { color: "#ffffff", fontSize: 13, flex: 1, fontFamily: Fonts.body },
  bottomCta: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.canvas,
  },
  primaryCta: {
    minHeight: 58,
    borderRadius: 15,
    backgroundColor: Colors.brand,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 4,
  },
  waitlistCta: {
    minHeight: 58,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.brand,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
  },
  ctaText: { color: "#ffffff", fontFamily: Fonts.bodyBold, fontSize: 16 },
  sheetIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: Colors.blueSoft,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 12,
  },
  sheetName: { fontFamily: Fonts.displayExtraBold, fontSize: 22, color: Colors.ink, marginTop: 12 },
  sheetCourse: { color: Colors.muted, fontSize: 15, marginTop: 2, fontFamily: Fonts.body },
  sheetTitle: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 22,
    color: Colors.ink,
    marginTop: 12,
    textAlign: "center" as const,
  },
  sheetText: {
    color: Colors.muted,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center" as const,
    marginTop: 6,
    fontFamily: Fonts.body,
  },
  publicStats: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginVertical: 18,
    backgroundColor: Colors.graySoft,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    width: "100%" as const,
  },
  publicStat: { flex: 1, alignItems: "center" as const },
  publicStatDivider: { width: 1, height: 34, backgroundColor: Colors.canvas },
  publicStatValue: { fontFamily: Fonts.displayExtraBold, fontSize: 19, color: Colors.ink },
  publicStatLabel: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  requestSummary: { gap: 10, alignSelf: "stretch" as const, marginVertical: 16 },
  requestSummaryRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10 },
  requestSummaryText: { color: Colors.ink, fontSize: 14, fontFamily: Fonts.body },
};
