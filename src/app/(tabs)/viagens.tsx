import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { BottomSheet } from "@/components/BottomSheet";
import { Icon } from "@/components/Icon";
import { MapView } from "@/components/MapView";
import { Stars } from "@/components/Stars";
import { TopBar } from "@/components/TopBar";
import { Colors, Fonts } from "@/constants/theme";
import { CAMPUS_COORDINATES, coordinatesForPlace, fixtureRides, riders } from "@/data";
import { useAppStore } from "@/store";
import { formatFullDateUpperBR, formatShortDateBR } from "@/lib/format";

const PRIMARY_TABS = ["próximas", "solicitações", "histórico"] as const;
const SECONDARY_TABS = ["recorrências", "pagamentos"] as const;

export default function TripsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ section?: string }>();
  const { state, updateRequest, updateOccurrence, cancelRide, addReview } = useAppStore();
  const [section, setSection] = useState(params.section ?? "próximas");
  const [moreMenu, setMoreMenu] = useState(false);

  useEffect(() => {
    if (params.section) setSection(params.section);
  }, [params.section]);

  const [approved, setApproved] = useState(false);
  const [secondDecision, setSecondDecision] = useState<"aprovada" | "recusada" | null>(null);
  const [anaDecision, setAnaDecision] = useState<"aprovada" | "recusada" | null>(null);
  const [review, setReview] = useState(0);
  const [reviewDone, setReviewDone] = useState(false);
  const [presenceConfirmed, setPresenceConfirmed] = useState(false);
  const [occurrenceCancelled, setOccurrenceCancelled] = useState(false);
  const [requestView, setRequestView] = useState<"pendentes" | "aprovados" | "espera">(
    "pendentes",
  );
  const [issueMenu, setIssueMenu] = useState(false);
  const [issueResult, setIssueResult] = useState("");
  const [releasedSeat, setReleasedSeat] = useState(false);
  const [profilePreview, setProfilePreview] = useState<(typeof riders)[number] | null>(null);
  const [showRoute, setShowRoute] = useState(false);

  const pendingOwnRequest = state.requests.find(
    (request) => request.status === "pendente" && request.passenger.id === state.profile.id,
  );

  const isSecondary = SECONDARY_TABS.includes(section as (typeof SECONDARY_TABS)[number]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <TopBar
        title="Minhas caronas"
        subtitle="ORGANIZE SUAS VIAGENS"
        onBell={() => router.push("/notifications")}
      />

      <View style={styles.tripsNav}>
        {PRIMARY_TABS.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setSection(tab)}
            accessibilityRole="button"
            accessibilityState={{ selected: section === tab }}
            style={[styles.tripsNavItem, section === tab && styles.tripsNavItemActive]}
          >
            <Text
              style={[styles.tripsNavLabel, section === tab && styles.tripsNavLabelActive]}
              numberOfLines={1}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </Text>
            {tab === "solicitações" && (
              <View style={styles.navBadge}>
                <Text style={styles.navBadgeText}>2</Text>
              </View>
            )}
          </Pressable>
        ))}
        <Pressable
          onPress={() => setMoreMenu(!moreMenu)}
          accessibilityRole="button"
          accessibilityState={{ expanded: moreMenu }}
          style={[styles.tripsNavItem, isSecondary && styles.tripsNavItemActive]}
        >
          <Text
            style={[styles.tripsNavLabel, isSecondary && styles.tripsNavLabelActive]}
            numberOfLines={1}
          >
            Mais
          </Text>
          {isSecondary ? <View style={styles.activeSectionDot} /> : null}
          <Icon name="arrow" size={16} color={isSecondary ? Colors.brand : Colors.muted} />
        </Pressable>
      </View>

      {moreMenu ? (
        <View style={styles.moreMenu}>
          {SECONDARY_TABS.map((item) => (
            <Pressable
              key={item}
              onPress={() => {
                setSection(item);
                setMoreMenu(false);
              }}
              accessibilityRole="button"
              style={styles.moreMenuItem}
            >
              <View style={styles.moreMenuItemLeft}>
                <View style={styles.moreMenuIcon}>
                  <Icon
                    name={item === "recorrências" ? "calendar" : "card"}
                    size={20}
                    color={Colors.brand}
                  />
                </View>
                <View>
                  <Text style={styles.moreMenuTitle}>{item[0].toUpperCase() + item.slice(1)}</Text>
                  <Text style={styles.moreMenuSub}>
                    {item === "recorrências" ? "Séries e ocorrências" : "Cobranças e recebimentos"}
                  </Text>
                </View>
              </View>
              <Icon name="arrow" size={18} color={Colors.muted} />
            </Pressable>
          ))}
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110, gap: 14, paddingTop: 12 }}
      >
        {section === "próximas" && (
          <>
            <Text style={styles.dateLabel}>HOJE · {formatFullDateUpperBR(new Date())}</Text>

            {state.rides
              .filter((ride) => ride.ownerId === state.profile.id)
              .map((ride) => (
                <View style={styles.nextTrip} key={ride.id}>
                  <View style={styles.tripStatus}>
                    <View
                      style={[
                        styles.statusPill,
                        ride.status === "cancelada" ? styles.statusCancelled : styles.statusApproved,
                      ]}
                    >
                      <Icon
                        name={ride.status === "cancelada" ? "close" : "check"}
                        size={16}
                        color={ride.status === "cancelada" ? Colors.error : Colors.route}
                      />
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: ride.status === "cancelada" ? Colors.error : Colors.route },
                        ]}
                      >
                        {ride.status === "cancelada" ? "Cancelada" : "Oferecida"}
                      </Text>
                    </View>
                    {ride.status !== "cancelada" && (
                      <Pressable
                        onPress={() => cancelRide(ride.id)}
                        accessibilityRole="button"
                        accessibilityLabel="Cancelar carona"
                        style={styles.smallIconButton}
                      >
                        <Icon name="close" size={20} color={Colors.muted} />
                      </Pressable>
                    )}
                  </View>
                  <View style={styles.nextTime}>
                    <Text style={styles.nextTimeHour}>{ride.time}</Text>
                    <Text style={styles.nextTimeSub}>{ride.date}</Text>
                  </View>
                  <View style={styles.storedRoute}>
                    <Text style={styles.storedRouteText}>{ride.from}</Text>
                    <Icon name="arrow" size={18} color={Colors.muted} />
                    <Text style={styles.storedRouteText}>{ride.to}</Text>
                  </View>
                  <Text style={styles.mutedLine}>
                    {ride.seats} de {ride.totalSeats} vagas disponíveis · R$ {ride.price},00
                  </Text>
                </View>
              ))}

            <View style={styles.nextTrip}>
              <View style={styles.tripStatus}>
                <View
                  style={[
                    styles.statusPill,
                    occurrenceCancelled ? styles.statusCancelled : styles.statusApproved,
                  ]}
                >
                  <Icon
                    name={occurrenceCancelled ? "close" : "check"}
                    size={14}
                    color={occurrenceCancelled ? Colors.error : Colors.route}
                  />
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: occurrenceCancelled ? Colors.error : Colors.route },
                    ]}
                  >
                    {occurrenceCancelled ? "Ocorrência cancelada" : "Confirmada"}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setIssueMenu(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Mais opções"
                  style={styles.smallIconButton}
                >
                  <Icon name="dots" size={20} color={Colors.ink} />
                </Pressable>
              </View>
              <View style={styles.nextTime}>
                <Text style={styles.nextTimeHour}>17:30</Text>
                <Text style={styles.nextTimeSub}>Saída em 4h 20min</Text>
              </View>
              <View style={styles.miniRoute}>
                <View style={styles.miniRouteTrack}>
                  <View style={styles.miniDot} />
                  <View style={styles.miniLine} />
                  <View style={[styles.miniDot, { backgroundColor: Colors.error }]} />
                </View>
                <View style={{ flex: 1, gap: 10 }}>
                  <Text style={styles.miniRouteText}>Campus JK</Text>
                  <Text style={styles.miniRouteText}>Centro Histórico</Text>
                </View>
              </View>
              <View style={styles.tripPerson}>
                <Avatar person={riders[1]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.tripPersonRole}>Motorista</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={styles.tripPersonName}>Lucas Vieira</Text>
                    <Stars value={4.8} compact />
                  </View>
                </View>
                <Pressable
                  onPress={() => router.push("/chat")}
                  accessibilityRole="button"
                  accessibilityLabel="Abrir conversa"
                  style={styles.smallIconButton}
                >
                  <Icon name="chat" size={19} color={Colors.brand} />
                </Pressable>
              </View>
              <View style={styles.tripActions}>
                <Pressable
                  onPress={() => router.push("/chat")}
                  accessibilityRole="button"
                  style={styles.tripActionPrimary}
                >
                  <Text style={styles.tripActionPrimaryText}>Abrir conversa</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowRoute(!showRoute)}
                  accessibilityRole="button"
                  style={styles.tripActionSecondary}
                >
                  <Icon name="pin" size={17} color={Colors.brand} />
                  <Text style={styles.tripActionSecondaryText}>Ver rota</Text>
                </Pressable>
              </View>
            </View>

            {showRoute && (
              <View style={styles.inlineMap}>
                <MapView
                  compact
                  detailed
                  origin="Campus JK"
                  destination="Centro Histórico"
                  originCoordinates={CAMPUS_COORDINATES.JK}
                  destinationCoordinates={coordinatesForPlace("Centro Histórico")}
                  pickups={[
                    {
                      label: `Ponto de embarque de ${state.profile.name}`,
                      initials: state.profile.initials,
                      coordinates: [-43.5848, -18.2169],
                    },
                  ]}
                />
              </View>
            )}

            {!occurrenceCancelled && (
              <View style={[styles.confirmationCard, presenceConfirmed && styles.confirmedCard]}>
                <View style={styles.confirmIcon}>
                  <Icon
                    name={presenceConfirmed ? "check" : "clock"}
                    size={22}
                    color={presenceConfirmed ? Colors.route : Colors.brand}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.confirmTitle}>
                    {presenceConfirmed ? "Presença confirmada" : "Confirme até 15:30"}
                  </Text>
                  <Text style={styles.confirmText}>
                    {presenceConfirmed
                      ? "Sua vaga está garantida nesta ocorrência."
                      : "Sem confirmação até 2h antes, a vaga será liberada automaticamente."}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setPresenceConfirmed(!presenceConfirmed)}
                  accessibilityRole="button"
                  style={styles.confirmButton}
                >
                  <Text style={styles.confirmButtonText}>
                    {presenceConfirmed ? "Desfazer" : "Confirmar"}
                  </Text>
                </Pressable>
              </View>
            )}

            <View style={styles.driverConfirmation}>
              <View style={styles.driverConfirmationLeft}>
                <Icon name="shield" size={18} color={Colors.brand} />
                <View>
                  <Text style={styles.driverConfirmationTitle}>Motorista confirmado</Text>
                  <Text style={styles.driverConfirmationSub}>Lucas confirmou às 13:02</Text>
                </View>
              </View>
              <View style={styles.driverConfirmationCheck}>
                <Icon name="check" size={14} color="#ffffff" />
              </View>
            </View>

            <Pressable
              onPress={() => setIssueMenu(true)}
              accessibilityRole="button"
              style={styles.scheduleAlert}
            >
              <Icon name="clock" size={19} color={Colors.amberInk} />
              <View style={{ flex: 1 }}>
                <Text style={styles.scheduleAlertTitle}>Conflito de horários detectado</Text>
                <Text style={styles.scheduleAlertText}>
                  Sua carona de volta começa 15 min antes de outra viagem.
                </Text>
              </View>
              <Text style={styles.scheduleAlertAction}>Resolver</Text>
            </Pressable>

            {pendingOwnRequest && (
              <>
                <Text style={styles.dateLabel}>AGUARDANDO RESPOSTA</Text>
                <View style={styles.pendingTrip}>
                  <View style={styles.pendingTripLeft}>
                    <Avatar person={riders[0]} />
                    <View>
                      <Text style={styles.pendingTripTitle}>Campus JK · 07:10</Text>
                      <Text style={styles.pendingTripSub}>Solicitação enviada</Text>
                    </View>
                  </View>
                  <View style={styles.pendingPill}>
                    <Text style={styles.pendingPillText}>Pendente</Text>
                  </View>
                  <Pressable
                    onPress={() => updateRequest(pendingOwnRequest.id, "cancelada")}
                    accessibilityRole="button"
                    style={styles.pendingCancel}
                  >
                    <Text style={styles.pendingCancelText}>Cancelar solicitação</Text>
                  </Pressable>
                </View>
              </>
            )}
          </>
        )}

        {section === "solicitações" && (
          <>
            <View style={styles.manageHeading}>
              <Text style={styles.manageTitle}>Gerenciar passageiros</Text>
              <Text style={styles.manageSub}>Quarta, 07:10 · 2 de 3 vagas ocupadas</Text>
            </View>
            <View style={styles.capacityBar}>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <View style={styles.capacityDot} />
                <View style={styles.capacityDot} />
                <View style={[styles.capacityDot, styles.capacityDotEmpty]} />
              </View>
              <Text style={styles.capacityText}>1 vaga restante</Text>
            </View>
            <View style={styles.requestSwitch}>
              {(["pendentes", "aprovados", "espera"] as const).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setRequestView(item)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: requestView === item }}
                  style={[styles.requestSwitchItem, requestView === item && styles.requestSwitchItemActive]}
                >
                  <Text
                    style={[
                      styles.requestSwitchText,
                      requestView === item && styles.requestSwitchTextActive,
                    ]}
                  >
                    {item === "espera" ? "Lista de espera" : item[0].toUpperCase() + item.slice(1)}
                  </Text>
                  {item === "pendentes" && (
                    <View style={styles.navBadge}>
                      <Text style={styles.navBadgeText}>2</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            {requestView === "pendentes" &&
              state.requests
                .filter((request) => request.status === "pendente")
                .map((request) => (
                  <View style={styles.approvalCard} key={request.id}>
                    <View style={styles.approvalPerson}>
                      <Avatar person={request.passenger} size="lg" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.approvalName}>{request.passenger.name}</Text>
                        <Text style={styles.approvalCourse}>{request.passenger.course}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                          <Stars value={request.passenger.rating} />
                          <Text style={styles.approvalMeta}>Solicitação persistida</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.approveActions}>
                      <Pressable
                        onPress={() => updateRequest(request.id, "recusada")}
                        accessibilityRole="button"
                        style={[styles.decisionButton, styles.rejectButton]}
                      >
                        <Icon name="close" size={18} color={Colors.error} />
                        <Text style={[styles.decisionText, { color: Colors.error }]}>Recusar</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => updateRequest(request.id, "aprovada")}
                        accessibilityRole="button"
                        style={[styles.decisionButton, styles.approveButton]}
                      >
                        <Icon name="check" size={18} color="#ffffff" />
                        <Text style={[styles.decisionText, { color: "#ffffff" }]}>Aprovar</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}

            {requestView === "pendentes" && (
              <>
                <View style={styles.approvalCard}>
                  <View style={styles.approvalPerson}>
                    <Avatar person={riders[2]} size="lg" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.approvalName}>Ana Clara Souza</Text>
                      <Text style={styles.approvalCourse}>Odontologia · 28 viagens</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <Stars value={5} />
                        <Text style={styles.approvalMeta}>Sem ocorrências</Text>
                      </View>
                      <Pressable
                        onPress={() => setProfilePreview(riders[2])}
                        accessibilityRole="button"
                      >
                        <Text style={styles.profileLink}>Ver perfil e avaliações</Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.detourMini}>
                    <Icon name="pin" size={18} color={Colors.brand} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detourMiniTitle}>+3 min na sua rota</Text>
                      <Text style={styles.detourMiniSub}>Embarque na Rua da Glória</Text>
                    </View>
                  </View>
                  {anaDecision === "recusada" ? (
                    <View style={styles.cancelledMessage}>
                      <Icon name="close" size={18} color={Colors.error} />
                      <Text style={[styles.approvedMessageText, { color: Colors.error }]}>
                        Solicitação recusada
                      </Text>
                      <Pressable onPress={() => setAnaDecision(null)} accessibilityRole="button">
                        <Text style={styles.approvedMessageAction}>Desfazer</Text>
                      </Pressable>
                    </View>
                  ) : approved ? (
                    <View style={styles.approvedMessage}>
                      <Icon name="check" size={18} color={Colors.route} />
                      <Text style={styles.approvedMessageText}>Passageira aprovada</Text>
                      <Pressable onPress={() => setApproved(false)} accessibilityRole="button">
                        <Text style={styles.approvedMessageAction}>Desfazer</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.approveActions}>
                      <Pressable
                        onPress={() => setAnaDecision("recusada")}
                        accessibilityRole="button"
                        style={[styles.decisionButton, styles.rejectButton]}
                      >
                        <Icon name="close" size={18} color={Colors.error} />
                        <Text style={[styles.decisionText, { color: Colors.error }]}>Recusar</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setApproved(true)}
                        accessibilityRole="button"
                        style={[styles.decisionButton, styles.approveButton]}
                      >
                        <Icon name="check" size={18} color="#ffffff" />
                        <Text style={[styles.decisionText, { color: "#ffffff" }]}>Aprovar</Text>
                      </Pressable>
                    </View>
                  )}
                </View>

                <View style={styles.approvalCard}>
                  <View style={styles.approvalPerson}>
                    <Avatar person={riders[1]} size="lg" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.approvalName}>Lucas Vieira</Text>
                      <Text style={styles.approvalCourse}>Sistemas de Informação</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <Stars value={4.8} />
                        <Text style={styles.approvalMeta}>19 viagens</Text>
                      </View>
                      <Pressable
                        onPress={() => setProfilePreview(riders[1])}
                        accessibilityRole="button"
                      >
                        <Text style={styles.profileLink}>Ver perfil e avaliações</Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.detourMini}>
                    <Icon name="pin" size={18} color={Colors.brand} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detourMiniTitle}>+8 min na sua rota</Text>
                      <Text style={styles.detourMiniSub}>Embarque no Bairro da Palha</Text>
                    </View>
                  </View>
                  {secondDecision ? (
                    <View
                      style={[
                        secondDecision === "aprovada"
                          ? styles.approvedMessage
                          : styles.cancelledMessage,
                      ]}
                    >
                      <Icon
                        name={secondDecision === "aprovada" ? "check" : "close"}
                        size={18}
                        color={secondDecision === "aprovada" ? Colors.route : Colors.error}
                      />
                      <Text
                        style={[
                          styles.approvedMessageText,
                          secondDecision !== "aprovada" && { color: Colors.error },
                        ]}
                      >
                        Solicitação {secondDecision}
                      </Text>
                      <Pressable onPress={() => setSecondDecision(null)} accessibilityRole="button">
                        <Text style={styles.approvedMessageAction}>Desfazer</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.approveActions}>
                      <Pressable
                        onPress={() => setSecondDecision("recusada")}
                        accessibilityRole="button"
                        style={[styles.decisionButton, styles.rejectButton]}
                      >
                        <Icon name="close" size={18} color={Colors.error} />
                        <Text style={[styles.decisionText, { color: Colors.error }]}>Recusar</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setSecondDecision("aprovada")}
                        accessibilityRole="button"
                        style={[styles.decisionButton, styles.approveButton]}
                      >
                        <Icon name="check" size={18} color="#ffffff" />
                        <Text style={[styles.decisionText, { color: "#ffffff" }]}>Aprovar</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </>
            )}

            {requestView === "aprovados" && (
              <>
                {[riders[0], riders[2]].map((person, index) => (
                  <View key={person.id} style={styles.approvedPassenger}>
                    <Avatar person={person} size="lg" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.approvalName}>{person.name}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <Stars value={person.rating} />
                        <Text style={styles.approvalMeta}>
                          · {index ? "Pagamento aprovado" : "Aguardando pagamento"}
                        </Text>
                      </View>
                      <Text style={styles.approvalMeta}>
                        {index ? "Presença confirmada" : "Confirmar até 05:10"}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        setReleasedSeat(true);
                        setRequestView("espera");
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Liberar vaga"
                      style={styles.smallIconButton}
                    >
                      <Icon name="dots" size={20} color={Colors.ink} />
                    </Pressable>
                  </View>
                ))}
              </>
            )}

            {requestView === "espera" && (
              <View style={styles.waitlistCard}>
                <View style={styles.waitPosition}>
                  <Text style={styles.waitPositionText}>1</Text>
                </View>
                <Avatar person={riders[1]} size="lg" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.approvalName}>Lucas Vieira</Text>
                  <Text style={styles.approvalMeta}>Entrou hoje às 09:42</Text>
                  <Text style={styles.approvalMeta}>Desvio estimado: +5 min</Text>
                </View>
                {releasedSeat ? (
                  <Pressable
                    onPress={() => setReleasedSeat(false)}
                    accessibilityRole="button"
                    style={styles.inviteButton}
                  >
                    <Text style={styles.inviteButtonText}>Convidar</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.waitingLabel}>Aguardando vaga</Text>
                )}
              </View>
            )}
          </>
        )}

        {section === "recorrências" && (
          <>
            {state.rides
              .filter((ride) => ride.recurring)
              .map((ride) => (
                <View key={ride.id} style={styles.recurrenceCard}>
                  <View>
                    <Text style={styles.recurrenceTag}>
                      {ride.direction.toUpperCase()} · SUA CARONA
                    </Text>
                    <Text style={styles.recurrenceTitle}>
                      {ride.from} → {ride.to}
                    </Text>
                  </View>
                  <View style={styles.recurrenceMetaRow}>
                    <Icon name="calendar" size={18} color={Colors.muted} />
                    <Text style={styles.mutedLine}>
                      {ride.days} · {ride.time}
                    </Text>
                  </View>
                  <View style={{ gap: 10 }}>
                    {ride.occurrences.slice(0, 4).map((occurrence) => (
                      <View
                        key={occurrence.id}
                        style={[
                          styles.occurrenceRow,
                          occurrence.status === "cancelada" && styles.occurrenceCancelled,
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.occurrenceDate}>
                            {formatShortDateBR(new Date(`${occurrence.date}T12:00:00`))}
                          </Text>
                          <Text style={styles.occurrenceSub}>
                            Motorista: {occurrence.driverConfirmed ? "confirmado" : "pendente"} ·{" "}
                            Passageiro: {occurrence.passengerConfirmed ? "confirmado" : "pendente"}
                          </Text>
                          <Text style={styles.occurrenceSub}>Prazo: 30 min antes da saída</Text>
                        </View>
                        {occurrence.status === "cancelada" ? (
                          <Text style={styles.occurrenceCancelledText}>Cancelada</Text>
                        ) : occurrence.driverConfirmed && occurrence.passengerConfirmed ? (
                          <Text style={styles.occurrenceOk}>Confirmada</Text>
                        ) : (
                          <View style={{ gap: 6, alignItems: "flex-end" }}>
                            <Pressable
                              onPress={() =>
                                updateOccurrence(
                                  ride.id,
                                  occurrence.id,
                                  occurrence.driverConfirmed
                                    ? { passengerConfirmed: true, status: "confirmada" }
                                    : { driverConfirmed: true },
                                )
                              }
                              accessibilityRole="button"
                              style={styles.occurrenceAction}
                            >
                              <Text style={styles.occurrenceActionText}>
                                {occurrence.driverConfirmed
                                  ? "Confirmar passageiro"
                                  : "Confirmar motorista"}
                              </Text>
                            </Pressable>
                            <Pressable
                              onPress={() =>
                                updateOccurrence(ride.id, occurrence.id, { status: "cancelada" })
                              }
                              accessibilityRole="button"
                              style={styles.occurrenceAction}
                            >
                              <Text style={styles.occurrenceActionText}>Cancelar</Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              ))}

            <View style={styles.recurrenceCard}>
              <View>
                <Text style={styles.recurrenceTag}>IDA · MOTORISTA</Text>
                <Text style={styles.recurrenceTitle}>Bairro da Palha → Campus JK</Text>
              </View>
              <View style={styles.recurrenceMetaRow}>
                <Icon name="calendar" size={16} color={Colors.muted} />
                <Text style={styles.mutedLine}>Seg, qua e sex · 07:10</Text>
              </View>
              <View style={{ gap: 10 }}>
                <View style={styles.occurrenceRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.occurrenceDate}>Qua, 22 mai</Text>
                    <Text style={styles.occurrenceSub}>3 passageiros · confirmada</Text>
                  </View>
                  <Text style={styles.occurrenceOk}>Confirmada</Text>
                </View>
                <View style={styles.occurrenceRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.occurrenceDate}>Sex, 24 mai</Text>
                    <Text style={styles.occurrenceSub}>Confirmação abre em 1 dia</Text>
                  </View>
                  <Text style={styles.occurrenceSubStrong}>Agendada</Text>
                </View>
                <View style={[styles.occurrenceRow, styles.occurrenceCancelled]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.occurrenceDate}>Seg, 27 mai</Text>
                    <Text style={styles.occurrenceSub}>Cancelada só nesta data</Text>
                  </View>
                  <Text style={styles.occurrenceCancelledText}>Cancelada</Text>
                </View>
              </View>
            </View>

            <View style={styles.recurrenceCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recurrenceTag}>VOLTA · PASSAGEIRO</Text>
                  <Text style={styles.recurrenceTitle}>Campus JK → Centro</Text>
                </View>
                <View style={styles.driverChip}>
                  <Text style={styles.driverChipText}>Lucas</Text>
                </View>
              </View>
              <View style={styles.recurrenceMetaRow}>
                <Icon name="calendar" size={16} color={Colors.muted} />
                <Text style={styles.mutedLine}>Ter e qui · 17:40 · independente da ida</Text>
              </View>
            </View>
          </>
        )}

        {section === "pagamentos" && (
          <>
            <View style={styles.paymentOverview}>
              <View style={styles.paymentOverviewItem}>
                <Text style={styles.paymentOverviewLabel}>A receber</Text>
                <Text style={styles.paymentOverviewValue}>R$ 18,00</Text>
              </View>
              <View style={styles.paymentOverviewDivider} />
              <View style={styles.paymentOverviewItem}>
                <Text style={styles.paymentOverviewLabel}>Recebido</Text>
                <Text style={styles.paymentOverviewValue}>R$ 12,00</Text>
              </View>
            </View>
            <Text style={styles.dateLabel}>PASSAGEIROS · QUARTA, 07:10</Text>
            {[
              { person: riders[2], status: "Aprovado", tone: "paid" as const, value: "R$ 6,00" },
              {
                person: riders[1],
                status: "Em processamento",
                tone: "processing" as const,
                value: "R$ 6,00",
              },
              { person: riders[0], status: "Recusado", tone: "refused" as const, value: "R$ 6,00" },
            ].map((item) => (
              <View key={item.person.id} style={styles.passengerPayment}>
                <Avatar person={item.person} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.approvalName}>{item.person.name}</Text>
                  <Text style={styles.approvalMeta}>PIX · {item.value}</Text>
                </View>
                <View
                  style={[
                    styles.paymentStatusPill,
                    item.tone === "paid" && styles.paymentStatusPaid,
                    item.tone === "processing" && styles.paymentStatusProcessing,
                    item.tone === "refused" && styles.paymentStatusRefused,
                  ]}
                >
                  <Text
                    style={[
                      styles.paymentStatusText,
                      item.tone === "paid" && { color: Colors.route },
                      item.tone === "processing" && { color: Colors.amberInk },
                      item.tone === "refused" && { color: Colors.error },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            ))}
            <View style={styles.safeNoteRow}>
              <Icon name="shield" size={18} color={Colors.brand} />
              <Text style={styles.safeNoteText}>
                Transações simuladas. O preço individual desta carona é R$ 6,00.
              </Text>
            </View>
          </>
        )}

        {section === "histórico" && (
          <>
            <View style={styles.historyStat}>
              <View style={styles.historyStatItem}>
                <Text style={styles.historyStatValue}>24</Text>
                <Text style={styles.historyStatLabel}>viagens</Text>
              </View>
              <View style={styles.historyStatDivider} />
              <View style={styles.historyStatItem}>
                <Text style={styles.historyStatValue}>186 km</Text>
                <Text style={styles.historyStatLabel}>compartilhados</Text>
              </View>
              <View style={styles.historyStatDivider} />
              <View style={styles.historyStatItem}>
                <Text style={styles.historyStatValue}>R$ 92</Text>
                <Text style={styles.historyStatLabel}>economizados</Text>
              </View>
            </View>
            {fixtureRides.slice(0, 2).map((ride, index) => (
              <View key={ride.id} style={styles.historyRow}>
                <View style={styles.historyIcon}>
                  <Icon name="check" size={18} color={Colors.route} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.approvalName}>{ride.to}</Text>
                  <Text style={styles.approvalMeta}>
                    16 mai · {ride.time} · com {ride.driver.name}
                  </Text>
                </View>
                {index === 0 && reviewDone ? (
                  <Text style={styles.reviewed}>Avaliada ★</Text>
                ) : (
                  <Pressable
                    onPress={() => setReview(5)}
                    accessibilityRole="button"
                    style={styles.evaluateButton}
                  >
                    <Text style={styles.evaluateButtonText}>Avaliar</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Avaliação */}
      <BottomSheet visible={review > 0 && !reviewDone} onClose={() => setReview(0)}>
        <View style={{ alignItems: "center" }}>
          <Avatar person={riders[0]} size="lg" />
          <Text style={styles.sheetTitle}>Como foi viajar com Marina?</Text>
          <Text style={styles.sheetText}>Sua avaliação ajuda a manter a comunidade segura.</Text>
          <View style={styles.ratingPicker}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setReview(star)}
                accessibilityRole="button"
                accessibilityLabel={`${star} estrela${star > 1 ? "s" : ""}`}
                hitSlop={6}
              >
                <Text
                  style={[
                    styles.ratingStar,
                    star <= review ? styles.ratingStarActive : styles.ratingStarInactive,
                  ]}
                >
                  ★
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            placeholder="Conte como foi a experiência (opcional)"
            placeholderTextColor={Colors.border}
            multiline
            style={styles.reviewInput}
            accessibilityLabel="Comentário da avaliação"
          />
          <Pressable
            onPress={() => {
              addReview({
                rideId: 1,
                authorId: state.profile.id,
                targetId: riders[0].id,
                rating: review,
                comment: "Viagem tranquila e pontual.",
              });
              setReviewDone(true);
              setReview(0);
            }}
            accessibilityRole="button"
            style={styles.primaryCta}
          >
            <Text style={styles.ctaTextWhite}>Enviar avaliação</Text>
          </Pressable>
        </View>
      </BottomSheet>

      {/* Menu de gerenciamento da ocorrência */}
      <BottomSheet visible={issueMenu} onClose={() => setIssueMenu(false)}>
        <Text style={styles.sheetTitleLeft}>Gerenciar esta ocorrência</Text>
        <Text style={styles.sheetTextLeft}>
          Alterações valem apenas para a viagem de hoje.
        </Text>
        <View style={{ marginTop: 8 }}>
          {[
            "Alterar horário ou percurso",
            "Registrar ausência do motorista",
            "Registrar ausência de passageiro",
            "Cancelar somente esta ocorrência",
          ].map((action, index) => (
            <Pressable
              key={action}
              onPress={() => {
                if (index === 3) setOccurrenceCancelled(true);
                setIssueResult(
                  index === 3
                    ? "Ocorrência cancelada. As próximas datas continuam ativas."
                    : `${action} registrado. Os participantes serão notificados.`,
                );
                setIssueMenu(false);
              }}
              accessibilityRole="button"
              style={styles.issueItem}
            >
              <Icon
                name={index === 3 ? "close" : index === 0 ? "edit" : "shield"}
                size={18}
                color={index === 3 ? Colors.error : Colors.brand}
              />
              <Text
                style={[
                  styles.issueItemText,
                  index === 3 && { color: Colors.error },
                ]}
              >
                {action}
              </Text>
              <Icon name="arrow" size={16} color={Colors.muted} />
            </Pressable>
          ))}
        </View>
      </BottomSheet>

      {issueResult ? (
        <View style={styles.toast}>
          <Icon name="check" size={17} color="#ffffff" />
          <Text style={styles.toastText}>{issueResult}</Text>
          <Pressable
            onPress={() => setIssueResult("")}
            accessibilityRole="button"
            accessibilityLabel="Fechar aviso"
            hitSlop={8}
          >
            <Icon name="close" size={14} color="#ffffff" />
          </Pressable>
        </View>
      ) : null}

      {/* Perfil público */}
      <BottomSheet visible={!!profilePreview} onClose={() => setProfilePreview(null)}>
        {profilePreview && (
          <View style={{ alignItems: "center" }}>
            <Avatar person={profilePreview} size="xl" />
            <Text style={styles.sheetTitle}>{profilePreview.name}</Text>
            <Text style={styles.sheetText}>{profilePreview.course} · Campus JK</Text>
            <View style={styles.publicStats}>
              <View style={styles.publicStat}>
                <Text style={styles.publicStatValue}>{profilePreview.rating.toFixed(1)}</Text>
                <Text style={styles.publicStatLabel}>avaliação</Text>
              </View>
              <View style={styles.publicStatDivider} />
              <View style={styles.publicStat}>
                <Text style={styles.publicStatValue}>28</Text>
                <Text style={styles.publicStatLabel}>viagens</Text>
              </View>
              <View style={styles.publicStatDivider} />
              <View style={styles.publicStat}>
                <Text style={styles.publicStatValue}>100%</Text>
                <Text style={styles.publicStatLabel}>presença</Text>
              </View>
            </View>
            <View style={styles.reviewQuote}>
              <Stars value={5} />
              <Text style={styles.reviewQuoteText}>
                “Pontual, respeitosa e muito tranquila durante a viagem.”
              </Text>
              <Text style={styles.reviewQuoteMeta}>Avaliação verificada · há 6 dias</Text>
            </View>
            <View style={styles.safeNoteRow}>
              <Icon name="shield" size={18} color={Colors.brand} />
              <Text style={styles.safeNoteText}>
                Perfil institucional verificado e sem ocorrências.
              </Text>
            </View>
            <Pressable
              onPress={() => setProfilePreview(null)}
              accessibilityRole="button"
              style={styles.secondaryCta}
            >
              <Text style={styles.secondaryCtaText}>Fechar perfil</Text>
            </Pressable>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = {
  tripsNav: {
    flexDirection: "row" as const,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.canvas,
    backgroundColor: Colors.surface,
    gap: 2,
  },
  tripsNavItem: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tripsNavItemActive: { borderBottomColor: Colors.brand },
  tripsNavLabel: { color: Colors.muted, fontFamily: Fonts.bodyBold, fontSize: 13 },
  tripsNavLabelActive: { color: Colors.brand },
  navBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.error,
    paddingHorizontal: 5,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  navBadgeText: { color: "#ffffff", fontSize: 11, fontFamily: Fonts.bodyBold },
  activeSectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brand,
  },
  moreMenu: {
    position: "absolute" as const,
    top: 132,
    left: 12,
    right: 12,
    zIndex: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.canvas,
    padding: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  moreMenuItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  moreMenuItemLeft: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12 },
  moreMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.blueSoft,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  moreMenuTitle: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink },
  moreMenuSub: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  dateLabel: {
    color: Colors.muted,
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.2,
  },
  nextTrip: {
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    backgroundColor: Colors.surface,
  },
  tripStatus: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  statusPill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusApproved: { backgroundColor: Colors.mintSoft },
  statusCancelled: { backgroundColor: Colors.redSoft },
  statusPillText: { fontFamily: Fonts.bodyBold, fontSize: 12 },
  smallIconButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.canvas,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.surface,
  },
  nextTime: { flexDirection: "row" as const, alignItems: "baseline" as const, gap: 12 },
  nextTimeHour: { fontFamily: Fonts.displayExtraBold, fontSize: 30, color: Colors.ink },
  nextTimeSub: { color: Colors.muted, fontSize: 13, fontFamily: Fonts.body },
  storedRoute: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  storedRouteText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink, flexShrink: 1 },
  mutedLine: { color: Colors.muted, fontSize: 13, fontFamily: Fonts.body },
  miniRoute: { flexDirection: "row" as const, gap: 12 },
  miniRouteTrack: { alignItems: "center" as const, paddingTop: 5 },
  miniDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.brand },
  miniLine: { width: 2, height: 16, backgroundColor: Colors.border, marginVertical: 2 },
  miniRouteText: { color: Colors.ink, fontSize: 14, fontFamily: Fonts.bodySemiBold },
  tripPerson: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.graySoft2,
    paddingTop: 10,
  },
  tripPersonRole: { color: Colors.muted, fontSize: 11, fontFamily: Fonts.body },
  tripPersonName: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink },
  tripActions: { flexDirection: "row" as const, gap: 10 },
  tripActionPrimary: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: Colors.brand,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  tripActionPrimaryText: { color: "#ffffff", fontFamily: Fonts.bodyBold, fontSize: 14 },
  tripActionSecondary: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.canvas,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
  },
  tripActionSecondaryText: { color: Colors.brand, fontFamily: Fonts.bodyBold, fontSize: 14 },
  inlineMap: { borderRadius: 16, overflow: "hidden" as const, borderWidth: 1, borderColor: Colors.canvas },
  confirmationCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.amberSoft,
    backgroundColor: Colors.amberSoft,
    borderRadius: 14,
    padding: 12,
  },
  confirmedCard: { backgroundColor: Colors.mintSoft, borderColor: Colors.mintSoft },
  confirmIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  confirmTitle: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink },
  confirmText: { color: Colors.muted, fontSize: 12, lineHeight: 17, fontFamily: Fonts.body },
  confirmButton: {
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.canvas,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  confirmButtonText: { color: Colors.brand, fontFamily: Fonts.bodyBold, fontSize: 13 },
  driverConfirmation: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: Colors.graySoft,
    borderRadius: 12,
    padding: 12,
  },
  driverConfirmationLeft: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10 },
  driverConfirmationTitle: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.ink },
  driverConfirmationSub: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  driverConfirmationCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  scheduleAlert: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: Colors.amberSoft,
    borderRadius: 12,
    padding: 12,
  },
  scheduleAlertTitle: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.amberInk },
  scheduleAlertText: { color: Colors.amberInk, fontSize: 12, lineHeight: 17, fontFamily: Fonts.body },
  scheduleAlertAction: { color: Colors.amberInk, fontFamily: Fonts.bodyBold, fontSize: 13 },
  pendingTrip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flexWrap: "wrap" as const,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 14,
    padding: 12,
  },
  pendingTripLeft: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, flex: 1 },
  pendingTripTitle: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink },
  pendingTripSub: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  pendingPill: {
    borderRadius: 999,
    backgroundColor: Colors.amberSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingPillText: { color: Colors.amberInk, fontFamily: Fonts.bodyBold, fontSize: 12 },
  pendingCancel: { paddingVertical: 4 },
  pendingCancelText: { color: Colors.error, fontFamily: Fonts.bodySemiBold, fontSize: 13 },
  manageHeading: {},
  manageTitle: { fontFamily: Fonts.displayBold, fontSize: 19, color: Colors.ink },
  manageSub: { color: Colors.muted, fontSize: 13, marginTop: 2, fontFamily: Fonts.body },
  capacityBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  capacityDot: { width: 26, height: 10, borderRadius: 5, backgroundColor: Colors.success },
  capacityDotEmpty: { backgroundColor: Colors.canvas },
  capacityText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.ink },
  requestSwitch: {
    flexDirection: "row" as const,
    backgroundColor: Colors.graySoft2,
    borderRadius: 13,
    padding: 5,
    gap: 4,
  },
  requestSwitchItem: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 5,
  },
  requestSwitchItemActive: { backgroundColor: Colors.surface },
  requestSwitchText: { color: Colors.muted, fontFamily: Fonts.bodyBold, fontSize: 13 },
  requestSwitchTextActive: { color: Colors.brand },
  approvalCard: {
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    backgroundColor: Colors.surface,
  },
  approvalPerson: { flexDirection: "row" as const, gap: 12, alignItems: "center" as const },
  approvalName: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink },
  approvalCourse: { color: Colors.muted, fontSize: 13, fontFamily: Fonts.body },
  approvalMeta: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  profileLink: { color: Colors.brand, fontFamily: Fonts.bodySemiBold, fontSize: 13, marginTop: 4 },
  detourMini: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: Colors.blueSoft2,
    borderRadius: 12,
    padding: 10,
  },
  detourMiniTitle: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.ink },
  detourMiniSub: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  approveActions: { flexDirection: "row" as const, gap: 10 },
  decisionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
  },
  rejectButton: { backgroundColor: Colors.redSoft },
  approveButton: { backgroundColor: Colors.brand },
  decisionText: { fontFamily: Fonts.bodyBold, fontSize: 14 },
  approvedMessage: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: Colors.mintSoft,
    borderRadius: 12,
    padding: 12,
  },
  cancelledMessage: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: Colors.redSoft,
    borderRadius: 12,
    padding: 12,
  },
  approvedMessageText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.route, flex: 1 },
  approvedMessageAction: { color: Colors.muted, fontFamily: Fonts.bodySemiBold, fontSize: 13 },
  approvedPassenger: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 14,
    padding: 12,
  },
  waitlistCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 14,
    padding: 12,
  },
  waitPosition: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.brand,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  waitPositionText: { color: "#ffffff", fontFamily: Fonts.displayExtraBold, fontSize: 15 },
  waitingLabel: { color: Colors.muted, fontFamily: Fonts.bodySemiBold, fontSize: 12 },
  inviteButton: {
    borderRadius: 10,
    backgroundColor: Colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  inviteButtonText: { color: "#ffffff", fontFamily: Fonts.bodyBold, fontSize: 13 },
  recurrenceCard: {
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    backgroundColor: Colors.surface,
  },
  recurrenceTag: {
    color: Colors.muted,
    fontSize: 11,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.2,
  },
  recurrenceTitle: { fontFamily: Fonts.displayBold, fontSize: 17, color: Colors.ink, marginTop: 2 },
  recurrenceMetaRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  occurrenceRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: Colors.graySoft,
    borderRadius: 12,
    padding: 10,
  },
  occurrenceCancelled: { opacity: 0.65 },
  occurrenceDate: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.ink },
  occurrenceSub: { color: Colors.muted, fontSize: 11, fontFamily: Fonts.body },
  occurrenceSubStrong: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.bodyBold },
  occurrenceOk: { color: Colors.route, fontFamily: Fonts.bodyBold, fontSize: 12 },
  occurrenceCancelledText: { color: Colors.error, fontFamily: Fonts.bodyBold, fontSize: 12 },
  occurrenceAction: {
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
  },
  occurrenceActionText: { color: Colors.brand, fontFamily: Fonts.bodySemiBold, fontSize: 12 },
  driverChip: {
    borderRadius: 999,
    backgroundColor: Colors.blueSoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  driverChipText: { color: Colors.brand, fontFamily: Fonts.bodyBold, fontSize: 12 },
  paymentOverview: {
    flexDirection: "row" as const,
    backgroundColor: Colors.graySoft,
    borderRadius: 16,
    padding: 16,
  },
  paymentOverviewItem: { flex: 1, alignItems: "center" as const },
  paymentOverviewDivider: { width: 1, backgroundColor: Colors.canvas },
  paymentOverviewLabel: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  paymentOverviewValue: { fontFamily: Fonts.displayExtraBold, fontSize: 22, color: Colors.ink, marginTop: 2 },
  passengerPayment: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 14,
    padding: 12,
  },
  paymentStatusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  paymentStatusPaid: { backgroundColor: Colors.mintSoft },
  paymentStatusProcessing: { backgroundColor: Colors.amberSoft },
  paymentStatusRefused: { backgroundColor: Colors.redSoft },
  paymentStatusText: { fontFamily: Fonts.bodyBold, fontSize: 11 },
  safeNoteRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: Colors.blueSoft,
    borderRadius: 12,
    padding: 12,
  },
  safeNoteText: { flex: 1, color: Colors.ink, fontSize: 13, lineHeight: 18, fontFamily: Fonts.body },
  historyStat: {
    flexDirection: "row" as const,
    backgroundColor: Colors.graySoft,
    borderRadius: 16,
    padding: 16,
  },
  historyStatItem: { flex: 1, alignItems: "center" as const },
  historyStatDivider: { width: 1, backgroundColor: Colors.canvas },
  historyStatValue: { fontFamily: Fonts.displayExtraBold, fontSize: 20, color: Colors.ink },
  historyStatLabel: { color: Colors.muted, fontSize: 11, fontFamily: Fonts.body, textAlign: "center" as const },
  historyRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.graySoft2,
    paddingBottom: 12,
  },
  historyIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.mintSoft,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  reviewed: { color: Colors.amberInk, fontFamily: Fonts.bodyBold, fontSize: 13 },
  evaluateButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.canvas,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  evaluateButtonText: { color: Colors.brand, fontFamily: Fonts.bodyBold, fontSize: 13 },
  sheetTitle: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 20,
    color: Colors.ink,
    marginTop: 12,
    textAlign: "center" as const,
  },
  sheetText: {
    color: Colors.muted,
    fontSize: 14,
    textAlign: "center" as const,
    marginTop: 4,
    fontFamily: Fonts.body,
  },
  sheetTitleLeft: { fontFamily: Fonts.displayExtraBold, fontSize: 20, color: Colors.ink },
  sheetTextLeft: { color: Colors.muted, fontSize: 14, marginTop: 2, fontFamily: Fonts.body },
  ratingPicker: { flexDirection: "row" as const, gap: 14, marginVertical: 16 },
  ratingStar: { fontSize: 36 },
  ratingStarActive: { color: Colors.warning },
  ratingStarInactive: { color: Colors.canvas },
  reviewInput: {
    alignSelf: "stretch" as const,
    minHeight: 84,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 13,
    padding: 12,
    textAlignVertical: "top" as const,
    fontSize: 15,
    color: Colors.ink,
    marginBottom: 14,
  },
  primaryCta: {
    alignSelf: "stretch" as const,
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: Colors.brand,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  ctaTextWhite: { color: "#ffffff", fontFamily: Fonts.bodyBold, fontSize: 16 },
  secondaryCta: {
    alignSelf: "stretch" as const,
    minHeight: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.canvas,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: 4,
  },
  secondaryCtaText: { color: Colors.ink, fontFamily: Fonts.bodyBold, fontSize: 15 },
  issueItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.graySoft2,
  },
  issueItemText: { flex: 1, fontSize: 14, color: Colors.ink, fontFamily: Fonts.bodySemiBold },
  toast: {
    position: "absolute" as const,
    left: 16,
    right: 16,
    bottom: 92,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: Colors.ink,
    borderRadius: 12,
    padding: 12,
  },
  toastText: { flex: 1, color: "#ffffff", fontSize: 13, fontFamily: Fonts.body },
  publicStats: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginVertical: 16,
    backgroundColor: Colors.graySoft,
    borderRadius: 16,
    paddingVertical: 14,
    width: "100%" as const,
  },
  publicStat: { flex: 1, alignItems: "center" as const },
  publicStatDivider: { width: 1, height: 34, backgroundColor: Colors.canvas },
  publicStatValue: { fontFamily: Fonts.displayExtraBold, fontSize: 19, color: Colors.ink },
  publicStatLabel: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  reviewQuote: {
    alignSelf: "stretch" as const,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 14,
    padding: 14,
    gap: 6,
    marginBottom: 12,
  },
  reviewQuoteText: { color: Colors.ink, fontSize: 14, lineHeight: 20, fontFamily: Fonts.body },
  reviewQuoteMeta: { color: Colors.muted, fontSize: 11, fontFamily: Fonts.body },
};
