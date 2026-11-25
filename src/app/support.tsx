import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { TopBar } from "@/components/TopBar";
import { Colors, Fonts } from "@/constants/theme";

const CATEGORIES: { label: string; icon: IconName }[] = [
  { label: "Ausência do motorista", icon: "car" },
  { label: "Ausência de passageiro", icon: "user" },
  { label: "Problema com pagamento", icon: "card" },
  { label: "Conduta ou segurança", icon: "shield" },
  { label: "Alteração não combinada", icon: "edit" },
];

export default function SupportScreen() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <TopBar title="Ajuda e suporte" subtitle="SEGURANÇA E RESOLUÇÃO" onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 14 }}
      >
        {sent ? (
          <View style={styles.successContainer}>
            <View style={styles.successRing}>
              <Icon name="check" size={34} color={Colors.brand} />
            </View>
            <Text style={styles.successTitle}>Registro enviado</Text>
            <Text style={styles.successText}>
              Protocolo UNI-240521. A equipe de suporte analisará o caso e enviará atualizações
              pelas notificações.
            </Text>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              style={styles.primaryCta}
            >
              <Text style={styles.ctaTextWhite}>Voltar ao perfil</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.hero}>
              <View style={styles.heroIcon}>
                <Icon name="shield" size={29} color={Colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>Como podemos ajudar?</Text>
                <Text style={styles.heroText}>
                  Registre problemas de viagem, pagamento ou segurança.
                </Text>
              </View>
            </View>
            <Text style={styles.sectionLabel}>Selecione o tipo de problema</Text>
            <View style={styles.options}>
              {CATEGORIES.map((item) => {
                const active = category === item.label;
                return (
                  <Pressable
                    key={item.label}
                    onPress={() => setCategory(item.label)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[styles.option, active && styles.optionActive]}
                  >
                    <Icon name={item.icon} size={19} color={active ? Colors.brand : Colors.muted} />
                    <Text style={[styles.optionText, active && { color: Colors.brand }]}>
                      {item.label}
                    </Text>
                    {active ? <Icon name="check" size={16} color={Colors.brand} /> : null}
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.sectionLabel}>Conte o que aconteceu</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva a situação com o máximo de detalhes..."
              placeholderTextColor={Colors.border}
              multiline
              style={styles.input}
              accessibilityLabel="Descrição do problema"
            />
            <View style={styles.safeNote}>
              <Icon name="shield" size={18} color={Colors.brand} />
              <Text style={styles.safeNoteText}>
                O registro fica associado à viagem e é tratado de forma confidencial.
              </Text>
            </View>
            <Pressable
              onPress={() => setSent(true)}
              disabled={!category}
              accessibilityRole="button"
              accessibilityState={{ disabled: !category }}
              style={({ pressed }) => [
                styles.primaryCta,
                !category && { opacity: 0.42 },
                pressed && category && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.ctaTextWhite}>Enviar para o suporte</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = {
  hero: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
    backgroundColor: Colors.blueSoft2,
    borderRadius: 18,
    padding: 16,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.blueSoft,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  heroTitle: { fontFamily: Fonts.displayBold, fontSize: 17, color: Colors.ink },
  heroText: { color: Colors.muted, fontSize: 13, lineHeight: 18, marginTop: 2, fontFamily: Fonts.body },
  sectionLabel: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink },
  options: { gap: 8 },
  option: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 14,
    padding: 14,
    backgroundColor: Colors.surface,
  },
  optionActive: { borderColor: Colors.brand, backgroundColor: Colors.blueSoft2 },
  optionText: { flex: 1, color: Colors.ink, fontSize: 15, fontFamily: Fonts.bodySemiBold },
  input: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 13,
    padding: 14,
    fontSize: 15,
    color: Colors.ink,
    textAlignVertical: "top" as const,
    fontFamily: Fonts.body,
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
  primaryCta: {
    minHeight: 56,
    borderRadius: 15,
    backgroundColor: Colors.brand,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    alignSelf: "stretch" as const,
  },
  ctaTextWhite: { color: "#ffffff", fontFamily: Fonts.bodyBold, fontSize: 16 },
  successContainer: { alignItems: "center" as const, gap: 10, paddingTop: 32 },
  successRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: Colors.blueSoft,
    borderWidth: 6,
    borderColor: Colors.graySoft,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 4,
  },
  successTitle: { fontFamily: Fonts.displayExtraBold, fontSize: 22, color: Colors.ink },
  successText: {
    color: Colors.muted,
    fontSize: 15,
    textAlign: "center" as const,
    lineHeight: 22,
    maxWidth: 330,
    fontFamily: Fonts.body,
  },
};
