import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { TopBar } from "@/components/TopBar";
import { Colors, Fonts } from "@/constants/theme";
import { riders } from "@/data";

type Conversation = {
  id: string;
  name: string;
  preview: string;
  previewBold?: string;
  time: string;
  meta?: string;
  unread?: number;
  section: "ativa" | "encerrada";
};

const CONVERSATIONS: Conversation[] = [
  {
    id: "ride-main",
    name: "Carona Campus JK",
    preview: "Combinado, até mais tarde!",
    previewBold: "Ana:",
    time: "14:06",
    meta: "Hoje · 17:30",
    unread: 2,
    section: "ativa",
  },
  {
    id: "marina",
    name: "Marina Lopes",
    preview: "Obrigada pela companhia!",
    time: "Ontem",
    meta: "Carona de 16 mai",
    section: "ativa",
  },
  {
    id: "campus-i-ended",
    name: "Centro → Campus I",
    preview: "Esta conversa foi encerrada.",
    time: "10 mai",
    section: "encerrada",
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return CONVERSATIONS;
    return CONVERSATIONS.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(normalized) ||
        conversation.preview.toLowerCase().includes(normalized),
    );
  }, [query]);

  const active = filtered.filter((item) => item.section === "ativa");
  const ended = filtered.filter((item) => item.section === "encerrada");

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <TopBar
        title="Mensagens"
        subtitle="CONVERSAS DAS SUAS CARONAS"
        onBell={() => router.push("/notifications")}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 10 }}
      >
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={Colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar conversa"
            placeholderTextColor={Colors.border}
            style={styles.searchInput}
            accessibilityLabel="Buscar conversa"
            autoCorrect={false}
          />
        </View>

        {active.length > 0 && <Text style={styles.dateLabel}>ATIVAS</Text>}
        {active.map((conversation) => (
          <ConversationRow
            key={conversation.id}
            conversation={conversation}
            onPress={() => router.push("/chat")}
          />
        ))}

        {ended.length > 0 && <Text style={styles.dateLabel}>ENCERRADAS</Text>}
        {ended.map((conversation) => (
          <View key={conversation.id} style={[styles.conversation, styles.conversationFaded]}>
            <Avatar person={riders[1]} size="lg" />
            <View style={{ flex: 1 }}>
              <View style={styles.conversationHead}>
                <Text style={styles.conversationName} numberOfLines={1}>
                  {conversation.name}
                </Text>
                <Text style={styles.conversationTime}>{conversation.time}</Text>
              </View>
              <Text style={styles.conversationPreview} numberOfLines={1}>
                {conversation.preview}
              </Text>
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="search" size={28} color={Colors.border} />
            <Text style={styles.emptyTitle}>Nenhuma conversa encontrada</Text>
            <Text style={styles.emptyText}>Tente outro termo de busca.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  const isGroup = conversation.id === "ride-main";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.conversation, pressed && { opacity: 0.9 }]}
    >
      {isGroup ? (
        <View style={styles.groupAvatar}>
          <Avatar person={riders[1]} size="md" />
          <View style={styles.groupAvatarSmall}>
            <Avatar person={riders[2]} size="md" />
          </View>
        </View>
      ) : (
        <Avatar person={riders[0]} size="lg" />
      )}
      <View style={{ flex: 1 }}>
        <View style={styles.conversationHead}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {conversation.name}
          </Text>
          <Text style={styles.conversationTime}>{conversation.time}</Text>
        </View>
        <Text style={styles.conversationPreview} numberOfLines={1}>
          {conversation.previewBold ? (
            <Text style={{ fontFamily: Fonts.bodySemiBold }}>{conversation.previewBold} </Text>
          ) : null}
          {conversation.preview}
        </Text>
        {conversation.meta ? (
          <Text style={styles.conversationMeta}>{conversation.meta}</Text>
        ) : null}
      </View>
      {conversation.unread ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{conversation.unread}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = {
  searchBox: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: Colors.graySoft,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.ink,
    paddingVertical: 12,
    fontFamily: Fonts.body,
  },
  dateLabel: {
    color: Colors.muted,
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  conversation: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.graySoft2,
  },
  conversationFaded: { opacity: 0.55 },
  conversationHead: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: 8,
  },
  conversationName: { flex: 1, fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink },
  conversationTime: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  conversationPreview: { color: Colors.muted, fontSize: 14, marginTop: 2, fontFamily: Fonts.body },
  conversationMeta: {
    color: Colors.brand,
    fontSize: 12,
    marginTop: 3,
    fontFamily: Fonts.bodySemiBold,
  },
  groupAvatar: { width: 48, height: 48, justifyContent: "center" as const },
  groupAvatarSmall: {
    position: "absolute" as const,
    right: -6,
    bottom: -6,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.brand,
    paddingHorizontal: 6,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  unreadBadgeText: { color: "#ffffff", fontSize: 12, fontFamily: Fonts.bodyBold },
  emptyState: { alignItems: "center" as const, paddingVertical: 48, gap: 8 },
  emptyTitle: { fontFamily: Fonts.displayBold, fontSize: 16, color: Colors.ink },
  emptyText: { color: Colors.muted, fontSize: 14, fontFamily: Fonts.body },
};
