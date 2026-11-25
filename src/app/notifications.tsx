import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Icon, type IconName } from "@/components/Icon";
import { TopBar } from "@/components/TopBar";
import { Colors, Fonts } from "@/constants/theme";
import { riders } from "@/data";
import { useAppStore } from "@/store";

type Target = "details" | "requests" | "messages" | "trips" | "history" | "payment";

export default function NotificationsScreen() {
  const router = useRouter();
  const { state, markNotificationsRead, markNotificationRead } = useAppStore();

  const navigate = (target: Target) => {
    switch (target) {
      case "details":
        router.push("/ride/1");
        break;
      case "payment":
        router.push("/payment");
        break;
      case "messages":
        router.push("/mensagens");
        break;
      case "requests":
        router.push({ pathname: "/viagens", params: { section: "solicitações" } });
        break;
      case "history":
        router.push({ pathname: "/viagens", params: { section: "histórico" } });
        break;
      case "trips":
      default:
        router.push({ pathname: "/viagens", params: { section: "próximas" } });
        break;
    }
  };

  const targetIcon = (target: Target): IconName => {
    if (target === "payment") return "card";
    if (target === "messages") return "chat";
    return "bell";
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <TopBar
        title="Notificações"
        subtitle="CENTRAL DE ALERTAS"
        onBack={() => router.back()}
        action={
          <Pressable onPress={markNotificationsRead} accessibilityRole="button" style={styles.markRead}>
            <Text style={styles.markReadText}>Ler todas</Text>
          </Pressable>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 10 }}
      >
        <Text style={styles.dateLabel}>HOJE</Text>

        {state.notifications.map((notification) => (
          <NotificationRow
            key={notification.id}
            unread={!notification.read}
            icon={targetIcon(notification.target)}
            title={notification.title}
            text={notification.text}
            time={notification.createdAt}
            actionLabel="Abrir"
            onAction={() => {
              markNotificationRead(notification.id);
              navigate(notification.target);
            }}
          />
        ))}

        <NotificationRow
          unread
          icon="check"
          title="Solicitação aprovada"
          text="Marina aprovou sua participação na carona para o Campus JK."
          time="Há 12 minutos"
          actionLabel="Ver carona"
          onAction={() => navigate("details")}
        />
        <NotificationRow
          unread
          avatar={<Avatar person={riders[2]} />}
          title="Nova solicitação"
          text="Ana Clara quer participar da sua carona de quarta-feira."
          time="Há 35 minutos"
          actionLabel="Responder agora"
          onAction={() => navigate("requests")}
        />
        <NotificationRow
          icon="chat"
          title="Nova mensagem no grupo"
          text="Lucas: “Hoje saio pelo estacionamento da Reitoria...”"
          time="Há 1 hora"
          actionLabel="Abrir conversa"
          onAction={() => navigate("messages")}
        />
        <NotificationRow
          unread
          icon="clock"
          title="Confirme sua presença"
          text="Você tem até 15:30 para manter sua vaga na carona de hoje."
          time="Há 2 horas"
          actionLabel="Confirmar agora"
          onAction={() => navigate("trips")}
        />
        <NotificationRow
          icon="edit"
          title="Horário alterado"
          text="A saída foi alterada de 17:30 para 17:40. Confira o novo percurso."
          time="Há 3 horas"
          actionLabel="Ver alteração"
          onAction={() => navigate("details")}
        />
        <NotificationRow
          unread
          icon="users"
          title="Uma vaga foi liberada"
          text="Você é o próximo da lista de espera para a carona das 07:25."
          time="Há 4 horas"
          actionLabel="Aceitar vaga"
          onAction={() => navigate("details")}
        />

        <Text style={styles.dateLabel}>ONTEM</Text>

        <NotificationRow
          icon="close"
          title="Ocorrência cancelada"
          text="O motorista cancelou apenas a viagem de sexta. As demais continuam ativas."
          time="Ontem, 21:15"
          actionLabel="Ver recorrência"
          onAction={() => navigate("trips")}
        />
        <NotificationRow
          icon="card"
          title="Pagamento recusado"
          text="Escolha outra forma para manter sua participação."
          time="Ontem, 20:10"
          actionLabel="Resolver pagamento"
          onAction={() => navigate("payment")}
        />
        <NotificationRow
          icon="bell"
          iconColor={Colors.amberInk}
          iconBackground={Colors.amberSoft}
          title="Como foi sua viagem?"
          text="Avalie a carona com Marina e ajude a comunidade."
          time="Ontem, 19:42"
          actionLabel="Avaliar viagem"
          onAction={() => navigate("history")}
        />
      </ScrollView>
    </View>
  );
}

function NotificationRow({
  icon,
  avatar,
  title,
  text,
  time,
  actionLabel,
  onAction,
  unread,
  iconColor = Colors.brand,
  iconBackground = Colors.blueSoft,
}: {
  icon?: IconName;
  avatar?: React.ReactNode;
  title: string;
  text: string;
  time: string;
  actionLabel: string;
  onAction: () => void;
  unread?: boolean;
  iconColor?: string;
  iconBackground?: string;
}) {
  return (
    <View style={[styles.notification, unread && styles.notificationUnread]}>
      {avatar ? (
        avatar
      ) : (
        <View style={[styles.notifIcon, { backgroundColor: iconBackground }]}>
          {icon ? <Icon name={icon} size={20} color={iconColor} /> : null}
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.notifTitle}>{title}</Text>
        <Text style={styles.notifText}>{text}</Text>
        <Text style={styles.notifTime}>{time}</Text>
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={6}>
          <Text style={styles.notifAction}>{actionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = {
  markRead: { paddingHorizontal: 8, paddingVertical: 10 },
  markReadText: { color: Colors.brand, fontFamily: Fonts.bodyBold, fontSize: 14 },
  dateLabel: {
    color: Colors.muted,
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  notification: {
    flexDirection: "row" as const,
    gap: 12,
    alignItems: "flex-start" as const,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  notificationUnread: { backgroundColor: Colors.blueSoft2, borderColor: Colors.blueSoft },
  notifIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  notifTitle: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink },
  notifText: { color: Colors.muted, fontSize: 13, lineHeight: 18, marginTop: 2, fontFamily: Fonts.body },
  notifTime: { color: Colors.border, fontSize: 11, marginTop: 4, fontFamily: Fonts.body },
  notifAction: { color: Colors.brand, fontFamily: Fonts.bodyBold, fontSize: 13, marginTop: 6 },
};
