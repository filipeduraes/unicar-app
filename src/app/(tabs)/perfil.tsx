import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { BottomSheet } from "@/components/BottomSheet";
import { Icon, type IconName } from "@/components/Icon";
import { Stars } from "@/components/Stars";
import { TopBar } from "@/components/TopBar";
import { InputShell, ShellInput } from "@/components/Field";
import { Toggle } from "@/components/ui";
import { Colors, Fonts } from "@/constants/theme";
import { useAuth } from "@/auth";
import { useAppStore } from "@/store";

type Panel = "edit" | "reviews" | "addresses" | "preferences" | "blocked" | "terms" | null;

const PREFERENCE_LABELS: Record<string, string> = {
  push: "Notificações push",
  messages: "Novas mensagens",
  rides: "Atualizações de caronas",
  payments: "Pagamentos",
};

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { state, updateProfile, updatePreferences, toggleBlock } = useAppStore();
  const me = state.profile;
  const [panel, setPanel] = useState<Panel>(null);
  const [draftName, setDraftName] = useState(me.name);
  const [draftCourse, setDraftCourse] = useState(me.course);
  const [draftAddress, setDraftAddress] = useState(me.address);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as ImagePicker.MediaType[],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (asset.base64) {
      updateProfile({ photo: `data:image/jpeg;base64,${asset.base64}` });
    } else if (asset.uri) {
      updateProfile({ photo: asset.uri });
    }
  };

  const menuItems: { icon: IconName; label: string; onPress: () => void }[] = [
    { icon: "user", label: "Avaliações recebidas", onPress: () => setPanel("reviews") },
    { icon: "pin", label: "Endereços salvos", onPress: () => setPanel("addresses") },
    { icon: "card", label: "Pagamentos", onPress: () => router.push("/payment") },
    {
      icon: "shield",
      label: "Notificações e privacidade",
      onPress: () => setPanel("preferences"),
    },
    { icon: "users", label: "Usuários bloqueados", onPress: () => setPanel("blocked") },
    { icon: "chat", label: "Ajuda e suporte", onPress: () => router.push("/support") },
    { icon: "shield", label: "Termos e privacidade", onPress: () => setPanel("terms") },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <TopBar
        title="Meu perfil"
        subtitle="CONTA UFVJM"
        action={
          <Pressable
            onPress={() => {
              setDraftName(me.name);
              setDraftCourse(me.course);
              setPanel("edit");
            }}
            accessibilityRole="button"
            accessibilityLabel="Editar perfil"
            style={styles.iconButton}
          >
            <Icon name="edit" size={22} color={Colors.ink} />
          </Pressable>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <View style={styles.hero}>
          <View>
            <Avatar person={me} size="xl" />
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.heroName}>{me.name}</Text>
          <Text style={styles.heroCourse}>{me.course}</Text>
          <View style={styles.verifiedPill}>
            <Icon name="shield" size={15} color={Colors.brand} />
            <Text style={styles.verifiedText}>Perfil institucional verificado</Text>
          </View>
        </View>

        <View style={styles.reputationCard}>
          <View style={styles.reputationItem}>
            <Text style={styles.reputationValue}>4,9</Text>
            <Stars value={4.9} compact />
            <Text style={styles.reputationLabel}>32 avaliações</Text>
          </View>
          <View style={styles.reputationDivider} />
          <View style={styles.reputationItem}>
            <Text style={styles.reputationValue}>47</Text>
            <Text style={styles.reputationLabel}>viagens</Text>
          </View>
          <View style={styles.reputationDivider} />
          <View style={styles.reputationItem}>
            <Text style={styles.reputationValue}>98%</Text>
            <Text style={styles.reputationLabel}>presença</Text>
          </View>
        </View>

        <View style={styles.dataSection}>
          <Text style={styles.dateLabel}>DADOS ACADÊMICOS</Text>
          <View style={styles.dataRow}>
            <View style={styles.dataLabel}>
              <Icon name="pin" size={18} color={Colors.muted} />
              <Text style={styles.dataLabelText}>Campus</Text>
            </View>
            <Text style={styles.dataValue}>Campus {me.campus}</Text>
          </View>
          <View style={styles.dataRow}>
            <View style={styles.dataLabel}>
              <Icon name="user" size={18} color={Colors.muted} />
              <Text style={styles.dataLabelText}>Matrícula</Text>
            </View>
            <Text style={styles.dataValue}>Ativa · 2022</Text>
          </View>
        </View>

        <View style={styles.menuList}>
          <Text style={styles.dateLabel}>CONTA E SEGURANÇA</Text>
          {menuItems.map((item) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              accessibilityRole="button"
              style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.85 }]}
            >
              <View style={styles.menuItemLeft}>
                <Icon name={item.icon} size={20} color={Colors.muted} />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Icon name="arrow" size={18} color={Colors.muted} />
            </Pressable>
          ))}
          <Pressable
            onPress={logout}
            accessibilityRole="button"
            style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.menuItemLeft}>
              <Icon name="logout" size={20} color={Colors.error} />
              <Text style={[styles.menuItemText, { color: Colors.error }]}>Sair da conta</Text>
            </View>
          </Pressable>
        </View>
        <Text style={styles.version}>Unicar v1.0 · Feito para a comunidade UFVJM</Text>
      </ScrollView>

      <BottomSheet visible={!!panel} onClose={() => setPanel(null)}>
        {panel === "edit" && (
          <>
            <Text style={styles.sheetTitle}>Editar perfil</Text>
            <Text style={styles.sheetLabel}>Nome</Text>
            <InputShell>
              <ShellInput value={draftName} onChangeText={setDraftName} accessibilityLabel="Nome" />
            </InputShell>
            <Text style={styles.sheetLabel}>Curso</Text>
            <InputShell>
              <ShellInput
                value={draftCourse}
                onChangeText={setDraftCourse}
                accessibilityLabel="Curso"
              />
            </InputShell>
            <Text style={styles.sheetLabel}>Foto de perfil</Text>
            <Pressable
              onPress={pickPhoto}
              accessibilityRole="button"
              style={({ pressed }) => [styles.photoButton, pressed && { opacity: 0.85 }]}
            >
              <Icon name="user" size={20} color={Colors.brand} />
              <Text style={styles.photoButtonText}>Escolher da galeria</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                updateProfile({
                  name: draftName,
                  course: draftCourse,
                  initials: draftName
                    .split(" ")
                    .filter(Boolean)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase(),
                });
                setPanel(null);
              }}
              accessibilityRole="button"
              style={styles.primaryCta}
            >
              <Text style={styles.ctaTextWhite}>Salvar alterações</Text>
            </Pressable>
          </>
        )}

        {panel === "reviews" && (
          <>
            <Text style={styles.sheetTitle}>Avaliações recebidas</Text>
            {[
              { rating: 5, text: "“Pontual e muito respeitoso durante todo o trajeto.”" },
              { rating: 4, text: "“Boa comunicação e direção tranquila.”" },
            ].map((item, index) => (
              <View key={index} style={styles.reviewQuote}>
                <Stars value={item.rating} />
                <Text style={styles.reviewQuoteText}>{item.text}</Text>
              </View>
            ))}
          </>
        )}

        {panel === "addresses" && (
          <>
            <Text style={styles.sheetTitle}>Endereço salvo</Text>
            <Text style={styles.sheetLabel}>Residência</Text>
            <InputShell>
              <ShellInput
                value={draftAddress}
                onChangeText={setDraftAddress}
                accessibilityLabel="Endereço de residência"
              />
            </InputShell>
            <Pressable
              onPress={() => {
                updateProfile({ address: draftAddress });
                setPanel(null);
              }}
              accessibilityRole="button"
              style={styles.primaryCta}
            >
              <Text style={styles.ctaTextWhite}>Salvar endereço</Text>
            </Pressable>
          </>
        )}

        {panel === "preferences" && (
          <>
            <Text style={styles.sheetTitle}>Preferências</Text>
            {Object.entries(state.preferences).map(([key, value]) => (
              <View key={key} style={styles.toggleRow}>
                <Text style={styles.toggleTitle}>{PREFERENCE_LABELS[key] ?? key}</Text>
                <Toggle
                  value={value}
                  onValueChange={() =>
                    updatePreferences({ [key]: !value } as Partial<typeof state.preferences>)
                  }
                />
              </View>
            ))}
          </>
        )}

        {panel === "blocked" && (
          <>
            <Text style={styles.sheetTitle}>Usuários bloqueados</Text>
            {state.blockedUserIds.length === 0 ? (
              <Text style={styles.sheetText}>Nenhum usuário bloqueado.</Text>
            ) : (
              state.blockedUserIds.map((id) => (
                <Pressable
                  key={id}
                  onPress={() => toggleBlock(id)}
                  accessibilityRole="button"
                  style={styles.blockedRow}
                >
                  <Text style={styles.blockedRowText}>Usuário #{id}</Text>
                  <Text style={styles.blockedRowAction}>Desbloquear</Text>
                </Pressable>
              ))
            )}
          </>
        )}

        {panel === "terms" && (
          <>
            <Text style={styles.sheetTitle}>Termos e privacidade</Text>
            <Text style={styles.sheetText}>
              Conteúdo demonstrativo do PoC. Dados, pagamentos e interações são simulados e
              permanecem apenas neste dispositivo.
            </Text>
            <Text style={styles.sheetHeading}>Segurança</Text>
            <Text style={styles.sheetText}>
              Use denúncias e bloqueios para controlar interações indesejadas.
            </Text>
            <Text style={styles.sheetHeading}>Pagamentos</Text>
            <Text style={styles.sheetText}>Nenhuma cobrança real é realizada.</Text>
          </>
        )}

        <Pressable
          onPress={() => setPanel(null)}
          accessibilityRole="button"
          style={{ paddingVertical: 14, alignItems: "center" }}
        >
          <Text style={styles.textButtonLabel}>Fechar</Text>
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
  hero: { alignItems: "center" as const, paddingTop: 8, paddingBottom: 16, gap: 4 },
  onlineDot: {
    position: "absolute" as const,
    right: 2,
    bottom: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  heroName: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 24,
    color: Colors.ink,
    marginTop: 10,
    letterSpacing: -0.6,
  },
  heroCourse: { color: Colors.muted, fontSize: 15, fontFamily: Fonts.body },
  verifiedPill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: Colors.blueSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6,
  },
  verifiedText: { color: Colors.brand, fontSize: 12, fontFamily: Fonts.bodySemiBold },
  reputationCard: {
    flexDirection: "row" as const,
    marginHorizontal: 16,
    backgroundColor: Colors.graySoft,
    borderRadius: 18,
    paddingVertical: 18,
    marginBottom: 20,
  },
  reputationItem: { flex: 1, alignItems: "center" as const, gap: 4 },
  reputationValue: { fontFamily: Fonts.displayExtraBold, fontSize: 22, color: Colors.ink },
  reputationLabel: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body },
  reputationDivider: { width: 1, backgroundColor: Colors.canvas },
  dataSection: { paddingHorizontal: 16, marginBottom: 20, gap: 8 },
  dateLabel: {
    color: Colors.muted,
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  dataRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 6,
  },
  dataLabel: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10 },
  dataLabelText: { color: Colors.muted, fontSize: 15, fontFamily: Fonts.body },
  dataValue: { color: Colors.ink, fontSize: 15, fontFamily: Fonts.bodyBold },
  menuList: { paddingHorizontal: 16, gap: 2 },
  menuItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    minHeight: 54,
    borderBottomWidth: 1,
    borderBottomColor: Colors.graySoft2,
  },
  menuItemLeft: { flexDirection: "row" as const, alignItems: "center" as const, gap: 14 },
  menuItemText: { color: Colors.ink, fontSize: 16, fontFamily: Fonts.body },
  version: {
    textAlign: "center" as const,
    color: Colors.border,
    fontSize: 12,
    marginTop: 20,
    fontFamily: Fonts.body,
  },
  sheetTitle: { fontFamily: Fonts.displayExtraBold, fontSize: 20, color: Colors.ink, marginBottom: 8 },
  sheetLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.ink, marginBottom: 6, marginTop: 10 },
  sheetText: { color: Colors.muted, fontSize: 15, lineHeight: 22, fontFamily: Fonts.body },
  sheetHeading: { fontFamily: Fonts.displayBold, fontSize: 16, color: Colors.ink, marginTop: 14, marginBottom: 2 },
  photoButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 13,
    padding: 14,
    marginBottom: 4,
  },
  photoButtonText: { color: Colors.brand, fontFamily: Fonts.bodySemiBold, fontSize: 15 },
  primaryCta: {
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: Colors.brand,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: 16,
  },
  ctaTextWhite: { color: "#ffffff", fontFamily: Fonts.bodyBold, fontSize: 16 },
  textButtonLabel: { color: Colors.muted, fontFamily: Fonts.bodySemiBold, fontSize: 15 },
  reviewQuote: {
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    marginBottom: 10,
  },
  reviewQuoteText: { color: Colors.ink, fontSize: 15, lineHeight: 21, fontFamily: Fonts.body },
  toggleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.graySoft2,
  },
  toggleTitle: { color: Colors.ink, fontSize: 15, fontFamily: Fonts.body },
  blockedRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.graySoft2,
  },
  blockedRowText: { color: Colors.ink, fontSize: 15, fontFamily: Fonts.body },
  blockedRowAction: { color: Colors.error, fontSize: 14, fontFamily: Fonts.bodySemiBold },
};
