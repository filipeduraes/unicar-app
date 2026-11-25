import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Avatar } from "@/components/Avatar";
import { BottomSheet } from "@/components/BottomSheet";
import { Icon } from "@/components/Icon";
import { TopBar } from "@/components/TopBar";
import { Colors, Fonts } from "@/constants/theme";
import { riders } from "@/data";
import { useAppStore } from "@/store";

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, addMessage, addReport, leaveConversation } = useAppStore();
  const [message, setMessage] = useState("");
  const [moderationError, setModerationError] = useState("");
  const [reported, setReported] = useState(false);
  const [chatMenu, setChatMenu] = useState(false);
  const [attachmentMenu, setAttachmentMenu] = useState(false);
  const [reportType, setReportType] = useState<"usuario" | "grupo" | "mensagem" | null>(null);
  const [reportCategory, setReportCategory] = useState("Comportamento inadequado");
  const [reportDescription, setReportDescription] = useState("");
  const [confirmLeave, setConfirmLeave] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const hasLeft = state.leftConversationIds.includes("ride-main");

  const storedMessages = state.messages.filter(
    (item) => item.conversationId === "ride-main" && item.id > 3,
  );

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [storedMessages.length]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as ImagePicker.MediaType[],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name = asset.fileName ?? "imagem.jpg";
      addMessage({
        conversationId: "ride-main",
        senderId: state.profile.id,
        senderName: state.profile.name,
        text: `Anexo: ${name}`,
        attachment: { type: "imagem", name },
      });
    }
    setAttachmentMenu(false);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/*"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      addMessage({
        conversationId: "ride-main",
        senderId: state.profile.id,
        senderName: state.profile.name,
        text: `Anexo: ${asset.name}`,
        attachment: {
          type: asset.mimeType?.startsWith("image/") ? "imagem" : "documento",
          name: asset.name,
        },
      });
    }
    setAttachmentMenu(false);
  };

  const submitMessage = () => {
    const text = message.trim();
    if (!text) return;
    const normalized = text.toLowerCase();
    const financial = /(pix|cpf|chave|conta bancária|agência|r\$)/i.test(normalized);
    const abusive = /(idiota|racista|homofób|nazista|macaco)/i.test(normalized);
    if (financial || abusive) {
      setModerationError(
        abusive
          ? "Mensagem bloqueada por conter linguagem discriminatória ou ofensiva."
          : "Por segurança, não compartilhe dados financeiros no chat. Use Pagamentos.",
      );
      return;
    }
    addMessage({
      conversationId: "ride-main",
      senderId: state.profile.id,
      senderName: state.profile.name,
      text,
    });
    setMessage("");
    setModerationError("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <TopBar
        title="Grupo da carona"
        subtitle="3 PARTICIPANTES · HOJE, 17:30"
        onBack={() => router.back()}
        action={
          <Pressable
            onPress={() => setChatMenu(!chatMenu)}
            accessibilityRole="button"
            accessibilityLabel="Opções do grupo"
            style={styles.iconButton}
          >
            <Icon name="dots" size={22} color={Colors.ink} />
          </Pressable>
        }
      />

      {chatMenu ? (
        <View style={styles.chatMenu}>
          <Pressable
            onPress={() => {
              setReportType("usuario");
              setChatMenu(false);
            }}
            accessibilityRole="button"
            style={styles.chatMenuItem}
          >
            <Icon name="shield" size={17} color={Colors.ink} />
            <Text style={styles.chatMenuText}>Denunciar usuário</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setReportType("grupo");
              setChatMenu(false);
            }}
            accessibilityRole="button"
            style={styles.chatMenuItem}
          >
            <Icon name="shield" size={17} color={Colors.ink} />
            <Text style={styles.chatMenuText}>Denunciar grupo</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setConfirmLeave(true);
              setChatMenu(false);
            }}
            accessibilityRole="button"
            style={styles.chatMenuItem}
          >
            <Icon name="logout" size={17} color={Colors.error} />
            <Text style={[styles.chatMenuText, { color: Colors.error }]}>Sair do grupo</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.tripBanner}>
        <Icon name="car" size={22} color={Colors.brand} />
        <View style={{ flex: 1 }}>
          <Text style={styles.tripBannerTitle}>Campus JK → Centro</Text>
          <Text style={styles.tripBannerSub}>Lucas · 17:30 · Confirmada</Text>
        </View>
        <Icon name="arrow" size={20} color={Colors.muted} />
      </View>
      <View style={styles.approvedOnly}>
        <Icon name="shield" size={14} color={Colors.brand} />
        <Text style={styles.approvedOnlyText}>Chat exclusivo para participantes aprovados</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatBody}
        >
          <Text style={styles.dayDivider}>HOJE</Text>

          <View style={styles.messageOtherRow}>
            <Avatar person={riders[1]} size="sm" />
            <View style={styles.messageOtherBubble}>
              <Text style={styles.messageMeta}>Lucas · 14:02</Text>
              <Text style={styles.messageText}>
                Oi, pessoal! Hoje saio pelo estacionamento da Reitoria, tudo bem?
              </Text>
              <Pressable
                onPress={() => setReportType("mensagem")}
                accessibilityRole="button"
              >
                <Text style={styles.reportMessage}>Denunciar mensagem</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.messageMeRow}>
            <View style={styles.messageMeBubble}>
              <Text style={styles.messageMetaRight}>14:04</Text>
              <Text style={styles.messageMeText}>Perfeito! Estarei lá uns 5 min antes.</Text>
              <View style={styles.readReceipts}>
                <Icon name="check" size={13} color="#dff2ff" />
                <Icon name="check" size={13} color="#dff2ff" />
              </View>
            </View>
          </View>

          <View style={styles.messageOtherRow}>
            <Avatar person={riders[2]} size="sm" />
            <View style={styles.messageOtherBubble}>
              <Text style={styles.messageMeta}>Ana · 14:06</Text>
              <Text style={styles.messageText}>Combinado, até mais tarde!</Text>
            </View>
          </View>

          {storedMessages.map((item) => {
            const mine = item.senderId === state.profile.id;
            const initials = item.senderName
              .split(" ")
              .map((part) => part[0] ?? "")
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <View key={item.id} style={mine ? styles.messageMeRow : styles.messageOtherRow}>
                {!mine && (
                  <Avatar person={{ name: item.senderName, initials, color: "blue" }} size="sm" />
                )}
                <View style={mine ? styles.messageMeBubble : styles.messageOtherBubble}>
                  <Text style={mine ? styles.messageMetaRight : styles.messageMeta}>
                    {item.createdAt}
                  </Text>
                  <Text style={mine ? styles.messageMeText : styles.messageText}>{item.text}</Text>
                  {item.attachment && (
                    <View style={[styles.attachment, mine && styles.attachmentMine]}>
                      <Icon
                        name={
                          item.attachment.type === "localizacao"
                            ? "pin"
                            : item.attachment.type === "carona"
                              ? "car"
                              : "card"
                        }
                        size={20}
                        color={mine ? "#ffffff" : Colors.brand}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          style={[styles.attachmentName, mine && { color: "#ffffff" }]}
                        >
                          {item.attachment.name}
                        </Text>
                        <Text style={[styles.attachmentType, mine && { color: "#dff2ff" }]}>
                          {item.attachment.type}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {reported && (
            <View style={styles.moderationNotice}>
              <Icon name="shield" size={17} color={Colors.route} />
              <View style={{ flex: 1 }}>
                <Text style={styles.moderationNoticeTitle}>Denúncia registrada</Text>
                <Text style={styles.moderationNoticeText}>
                  A equipe de suporte analisará o conteúdo com segurança.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {moderationError ? (
          <View style={styles.composerWarning}>
            <Icon name="shield" size={16} color={Colors.amberInk} />
            <Text style={styles.composerWarningText}>{moderationError}</Text>
          </View>
        ) : null}

        {attachmentMenu ? (
          <View style={styles.attachmentMenu}>
            <Pressable onPress={pickImage} accessibilityRole="button" style={styles.attachmentItem}>
              <Icon name="plus" size={20} color={Colors.brand} />
              <View style={{ flex: 1 }}>
                <Text style={styles.attachmentItemTitle}>Imagem</Text>
                <Text style={styles.attachmentItemSub}>Escolha da galeria</Text>
              </View>
            </Pressable>
            <Pressable onPress={pickDocument} accessibilityRole="button" style={styles.attachmentItem}>
              <Icon name="card" size={20} color={Colors.brand} />
              <View style={{ flex: 1 }}>
                <Text style={styles.attachmentItemTitle}>Documento</Text>
                <Text style={styles.attachmentItemSub}>PDF, DOC ou imagem</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => {
                addMessage({
                  conversationId: "ride-main",
                  senderId: state.profile.id,
                  senderName: state.profile.name,
                  text: "Compartilhou a localização: Campus JK",
                  attachment: { type: "localizacao", name: "Campus JK · Estacionamento" },
                });
                setAttachmentMenu(false);
              }}
              accessibilityRole="button"
              style={styles.attachmentItem}
            >
              <Icon name="pin" size={20} color={Colors.brand} />
              <View style={{ flex: 1 }}>
                <Text style={styles.attachmentItemTitle}>Compartilhar localização</Text>
                <Text style={styles.attachmentItemSub}>Campus JK · Estacionamento</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => {
                addMessage({
                  conversationId: "ride-main",
                  senderId: state.profile.id,
                  senderName: state.profile.name,
                  text: "Compartilhou os detalhes da carona",
                  attachment: { type: "carona", name: "Campus JK → Centro · 17:30" },
                });
                setAttachmentMenu(false);
              }}
              accessibilityRole="button"
              style={styles.attachmentItem}
            >
              <Icon name="car" size={20} color={Colors.brand} />
              <View style={{ flex: 1 }}>
                <Text style={styles.attachmentItemTitle}>Compartilhar carona</Text>
                <Text style={styles.attachmentItemSub}>Campus JK → Centro · 17:30</Text>
              </View>
            </Pressable>
          </View>
        ) : null}

        {!hasLeft ? (
          <View style={[styles.composer, { paddingBottom: Math.max(12, insets.bottom + 8) }]}>
            <Pressable
              onPress={() => setAttachmentMenu(!attachmentMenu)}
              accessibilityRole="button"
              accessibilityLabel="Anexar"
              style={styles.attachButton}
            >
              <Icon name="plus" size={22} color={Colors.ink} />
            </Pressable>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Mensagem para o grupo"
              placeholderTextColor={Colors.border}
              style={styles.composerInput}
              accessibilityLabel="Mensagem para o grupo"
              onSubmitEditing={submitMessage}
              returnKeyType="send"
            />
            <Pressable
              onPress={submitMessage}
              accessibilityRole="button"
              accessibilityLabel="Enviar mensagem"
              style={styles.sendButton}
            >
              <Icon name="arrow" size={20} color="#ffffff" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.leftGroupNote}>
            <Text style={styles.leftGroupNoteText}>
              Você saiu deste grupo e não pode mais enviar mensagens.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>

      <BottomSheet visible={!!reportType} onClose={() => setReportType(null)}>
        <Text style={styles.sheetTitle}>Denunciar {reportType}</Text>
        <Text style={styles.sheetLabel}>Motivo</Text>
        <View style={styles.reportOptions}>
          {[
            "Comportamento inadequado",
            "Discurso de ódio",
            "Assédio",
            "Informação falsa",
          ].map((category) => (
            <Pressable
              key={category}
              onPress={() => setReportCategory(category)}
              accessibilityRole="button"
              accessibilityState={{ selected: reportCategory === category }}
              style={[
                styles.reportOption,
                reportCategory === category && styles.reportOptionActive,
              ]}
            >
              <View
                style={[
                  styles.reportRadio,
                  reportCategory === category && styles.reportRadioActive,
                ]}
              >
                {reportCategory === category ? (
                  <View style={styles.reportRadioInner} />
                ) : null}
              </View>
              <Text style={styles.reportOptionText}>{category}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.sheetLabel}>Descrição opcional</Text>
        <TextInput
          value={reportDescription}
          onChangeText={setReportDescription}
          placeholder="Conte o que aconteceu"
          placeholderTextColor={Colors.border}
          multiline
          style={styles.reportInput}
          accessibilityLabel="Descrição da denúncia"
        />
        <Pressable
          onPress={() => {
            if (!reportType) return;
            addReport({
              type: reportType,
              targetId: reportType === "grupo" ? "ride-main" : String(riders[1].id),
              category: reportCategory,
              description: reportDescription,
            });
            setReportType(null);
            setReportDescription("");
            setReported(true);
          }}
          accessibilityRole="button"
          style={styles.primaryCta}
        >
          <Text style={styles.ctaTextWhite}>Registrar denúncia</Text>
        </Pressable>
        <Pressable
          onPress={() => setReportType(null)}
          accessibilityRole="button"
          style={{ paddingVertical: 12, alignItems: "center" }}
        >
          <Text style={styles.textButtonLabel}>Cancelar</Text>
        </Pressable>
      </BottomSheet>

      <BottomSheet visible={confirmLeave} onClose={() => setConfirmLeave(false)}>
        <Text style={styles.sheetTitle}>Sair do grupo?</Text>
        <Text style={styles.sheetText}>Você perderá o acesso ao envio de novas mensagens.</Text>
        <Pressable
          onPress={() => {
            leaveConversation("ride-main");
            setConfirmLeave(false);
            router.back();
          }}
          accessibilityRole="button"
          style={[styles.primaryCta, { marginTop: 16 }]}
        >
          <Text style={styles.ctaTextWhite}>Confirmar saída</Text>
        </Pressable>
        <Pressable
          onPress={() => setConfirmLeave(false)}
          accessibilityRole="button"
          style={{ paddingVertical: 12, alignItems: "center" }}
        >
          <Text style={styles.textButtonLabel}>Permanecer</Text>
        </Pressable>
      </BottomSheet>
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
  chatMenu: {
    position: "absolute" as const,
    top: 96,
    right: 16,
    zIndex: 30,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.canvas,
    padding: 6,
    minWidth: 220,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  chatMenuItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  chatMenuText: { fontSize: 15, color: Colors.ink, fontFamily: Fonts.bodySemiBold },
  tripBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginHorizontal: 16,
    marginTop: 2,
    backgroundColor: Colors.blueSoft,
    borderRadius: 14,
    padding: 12,
  },
  tripBannerTitle: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink },
  tripBannerSub: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  approvedOnly: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 8,
  },
  approvedOnlyText: { color: Colors.brand, fontSize: 11, fontFamily: Fonts.bodySemiBold },
  chatBody: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  dayDivider: {
    alignSelf: "center" as const,
    color: Colors.muted,
    fontSize: 11,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.4,
    marginVertical: 4,
  },
  messageOtherRow: { flexDirection: "row" as const, alignItems: "flex-end" as const, gap: 8 },
  messageMeRow: { flexDirection: "row" as const, justifyContent: "flex-end" as const },
  messageOtherBubble: {
    maxWidth: "78%" as const,
    backgroundColor: Colors.graySoft2,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 10,
    gap: 2,
  },
  messageMeBubble: {
    maxWidth: "78%" as const,
    backgroundColor: Colors.brand,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 10,
    gap: 2,
  },
  messageMeta: { color: Colors.muted, fontSize: 11, fontFamily: Fonts.body },
  messageMetaRight: { color: "#dff2ff", fontSize: 11, fontFamily: Fonts.body },
  messageText: { color: Colors.ink, fontSize: 15, lineHeight: 21, fontFamily: Fonts.body },
  messageMeText: { color: "#ffffff", fontSize: 15, lineHeight: 21, fontFamily: Fonts.body },
  readReceipts: { flexDirection: "row" as const, justifyContent: "flex-end" as const, marginTop: 2 },
  reportMessage: { color: Colors.error, fontSize: 11, fontFamily: Fonts.bodySemiBold, marginTop: 4 },
  attachment: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 8,
    marginTop: 6,
  },
  attachmentMine: { backgroundColor: "rgba(255,255,255,0.18)" },
  attachmentName: { color: Colors.ink, fontSize: 13, fontFamily: Fonts.bodySemiBold },
  attachmentType: { color: Colors.muted, fontSize: 11, fontFamily: Fonts.body },
  moderationNotice: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: Colors.mintSoft,
    borderRadius: 12,
    padding: 12,
  },
  moderationNoticeTitle: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.route },
  moderationNoticeText: { color: Colors.route, fontSize: 12, fontFamily: Fonts.body },
  composerWarning: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: Colors.amberSoft,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  composerWarningText: { flex: 1, color: Colors.amberInk, fontSize: 13, fontFamily: Fonts.body },
  attachmentMenu: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.canvas,
    padding: 10,
    gap: 2,
  },
  attachmentItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  attachmentItemTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.ink },
  attachmentItemSub: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  composer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.canvas,
    backgroundColor: Colors.surface,
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.graySoft2,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  composerInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    backgroundColor: Colors.graySoft,
    borderRadius: 23,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Colors.ink,
    fontFamily: Fonts.body,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.brand,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  leftGroupNote: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: Colors.canvas,
    backgroundColor: Colors.graySoft,
  },
  leftGroupNoteText: { textAlign: "center" as const, color: Colors.muted, fontFamily: Fonts.body },
  sheetTitle: { fontFamily: Fonts.displayExtraBold, fontSize: 20, color: Colors.ink, marginBottom: 4 },
  sheetText: { color: Colors.muted, fontSize: 15, lineHeight: 21, marginTop: 4, fontFamily: Fonts.body },
  sheetLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.ink,
    marginTop: 12,
    marginBottom: 6,
  },
  reportOptions: { gap: 4, marginBottom: 4 },
  reportOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  reportOptionActive: { backgroundColor: Colors.blueSoft },
  reportRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  reportRadioActive: { borderColor: Colors.brand },
  reportRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.brand },
  reportOptionText: { color: Colors.ink, fontSize: 15, fontFamily: Fonts.body },
  reportInput: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 13,
    padding: 12,
    fontSize: 15,
    color: Colors.ink,
    textAlignVertical: "top" as const,
    marginBottom: 14,
    fontFamily: Fonts.body,
  },
  primaryCta: {
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: Colors.brand,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  ctaTextWhite: { color: "#ffffff", fontFamily: Fonts.bodyBold, fontSize: 16 },
  textButtonLabel: { color: Colors.muted, fontFamily: Fonts.bodySemiBold, fontSize: 15 },
};
