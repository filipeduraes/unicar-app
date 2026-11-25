import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { Avatar } from "@/components/Avatar";
import { BottomSheet } from "@/components/BottomSheet";
import { Icon } from "@/components/Icon";
import { FormGroup, InputShell, ShellInput } from "@/components/Field";
import { PrimaryButton, SafeNote } from "@/components/ui";
import { Colors, Fonts } from "@/constants/theme";
import { riders } from "@/data";
import { useAuth } from "@/auth";

const logoCircular = require("@/assets/images/unicar-logo-circular.png");
const logoTransparent = require("@/assets/images/unicar-logo-transparent.png");

export function Onboarding() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const normalizedEmail = email.trim().toLowerCase();
  const valid = normalizedEmail.endsWith("@ufvjm.edu.br");

  return (
    <LinearGradient colors={["#ffffff", "#ffffff", "#eaf4ff"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 14, paddingBottom: Math.max(24, insets.bottom + 16) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <Image
              source={logoTransparent}
              accessibilityLabel="Unicar"
              style={{ width: 112, height: 46 }}
              contentFit="contain"
              contentPosition="left center"
            />
          </View>

          {step === 0 && (
            <View style={styles.welcome}>
              <View style={styles.art}>
                <View
                  style={[
                    styles.orbit,
                    { width: 270, height: 150, marginLeft: -135, marginTop: -75, transform: [{ rotate: "-12deg" }] },
                  ]}
                />
                <View
                  style={[
                    styles.orbit,
                    { width: 190, height: 235, marginLeft: -95, marginTop: -118, transform: [{ rotate: "45deg" }] },
                  ]}
                />
                <View style={[styles.pin, { left: 25, top: 72 }]}>
                  <Avatar person={riders[0]} size="sm" />
                </View>
                <View style={[styles.pin, { right: 28, bottom: 46 }]}>
                  <Avatar person={riders[1]} size="sm" />
                </View>
                <View style={styles.car}>
                  <Image
                    source={logoCircular}
                    accessibilityLabel="Ícone do Unicar"
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </View>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Exclusivo para a comunidade UFVJM</Text>
              </View>
              <Text style={styles.welcomeTitle}>
                Seu caminho até a faculdade, <Text style={styles.brandText}>compartilhado.</Text>
              </Text>
              <Text style={styles.welcomeText}>
                Encontre estudantes com rotas parecidas, divida os custos e chegue junto.
              </Text>
              <PrimaryButton title="Começar" icon="arrow" onPress={() => setStep(1)} />
              <View style={styles.termsRow}>
                <Text style={styles.termsCopy}>Ao continuar, você concorda com os </Text>
                <Pressable onPress={() => setShowTerms(true)} accessibilityRole="button">
                  <Text style={styles.termsLink}>Termos de Uso</Text>
                </Pressable>
                <Text style={styles.termsCopy}>.</Text>
              </View>
            </View>
          )}

          {step === 1 && (
            <View style={styles.panel}>
              <Pressable
                onPress={() => setStep(0)}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                style={styles.backFloat}
              >
                <Icon name="back" size={22} />
              </Pressable>
              <View style={styles.loginIcon}>
                <Icon name="shield" size={30} color={Colors.brand} />
              </View>
              <Text style={styles.eyebrow}>ACESSO SEGURO</Text>
              <Text style={styles.panelTitle}>Entre com seu e-mail institucional</Text>
              <Text style={styles.panelText}>
                Seu vínculo com a UFVJM mantém nossa comunidade mais segura.
              </Text>
              <FormGroup>
                <Text style={styles.fieldLabel}>E-mail institucional</Text>
                <InputShell
                  icon={<Icon name="user" size={19} color={Colors.muted} />}
                  invalid={!!email && !valid}
                >
                  <ShellInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="seu.nome@ufvjm.edu.br"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    invalid={!!email && !valid}
                    accessibilityLabel="E-mail institucional"
                  />
                </InputShell>
                {email && !valid ? (
                  <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                    Use um e-mail terminado em @ufvjm.edu.br
                  </Text>
                ) : null}
              </FormGroup>
              <PrimaryButton
                title="Receber código"
                disabled={!valid}
                onPress={() => {
                  setEmail(normalizedEmail);
                  setStep(2);
                }}
                style={{ marginTop: 4 }}
              />
              <SafeNote text="Seus dados são usados apenas para validar seu vínculo acadêmico." />
            </View>
          )}

          {step === 2 && (
            <View style={styles.panel}>
              <Pressable
                onPress={() => setStep(1)}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                style={styles.backFloat}
              >
                <Icon name="back" size={22} />
              </Pressable>
              <View style={styles.loginIcon}>
                <Icon name="chat" size={30} color={Colors.brand} />
              </View>
              <Text style={styles.eyebrow}>VERIFICAÇÃO</Text>
              <Text style={styles.panelTitle}>Confira seu e-mail</Text>
              <Text style={styles.panelText}>
                Enviamos um código para <Text style={{ fontFamily: Fonts.bodyBold }}>{email}</Text>
              </Text>
              <View style={styles.codeRow} accessibilityLabel="Código de verificação 4 8 2 6">
                {["4", "8", "2", "6"].map((digit, index) => (
                  <View key={index} style={styles.codeCell}>
                    <Text style={styles.codeDigit}>{digit}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.resend}>Reenviar código em 00:42</Text>
              <PrimaryButton title="Verificar código" onPress={() => setStep(3)} />
            </View>
          )}

          {step === 3 && (
            <View style={[styles.panel, styles.verifiedPanel]}>
              <View style={styles.successRing}>
                <Icon name="check" size={36} color={Colors.brand} />
              </View>
              <Text style={styles.eyebrow}>PERFIL ENCONTRADO</Text>
              <Text style={styles.verifiedTitle}>Olá, Gabriel!</Text>
              <Text style={styles.panelText}>
                Encontramos seus dados institucionais. Confirme para continuar.
              </Text>
              <View style={styles.institutionalProfile}>
                <Avatar
                  person={{
                    name: "Gabriel Rocha",
                    initials: "GR",
                    color: "green",
                  }}
                  size="xl"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>Gabriel Rocha</Text>
                  <Text style={styles.profileCourse}>Engenharia de Computação</Text>
                  <Text style={styles.profileMeta}>Campus JK · Matrícula ativa</Text>
                </View>
                <View style={styles.profileCheck}>
                  <Icon name="check" size={14} color={Colors.brand} />
                </View>
              </View>
              <PrimaryButton title="Confirmar e continuar" onPress={login} style={{ marginTop: 16 }} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheet visible={showTerms} onClose={() => setShowTerms(false)}>
        <Text style={styles.sheetTitle}>Termos de Uso do PoC</Text>
        <Text style={styles.sheetText}>
          Conteúdo demonstrativo para o protótipo Unicar. Não constitui documento jurídico.
        </Text>
        <Text style={styles.sheetHeading}>Uso da plataforma</Text>
        <Text style={styles.sheetText}>
          Utilize dados fictícios neste protótipo e trate os demais participantes com respeito.
        </Text>
        <Text style={styles.sheetHeading}>Caronas e cancelamentos</Text>
        <Text style={styles.sheetText}>
          Motoristas e passageiros devem confirmar presença e comunicar alterações ou cancelamentos.
        </Text>
        <Text style={styles.sheetHeading}>Pagamentos simulados</Text>
        <Text style={styles.sheetText}>
          PIX e cartão são apenas simulações. Nenhuma transação financeira real é processada.
        </Text>
        <Text style={styles.sheetHeading}>Avaliações e segurança</Text>
        <Text style={styles.sheetText}>
          Avaliações, bloqueios e denúncias ficam armazenados apenas neste dispositivo para
          demonstrar os fluxos.
        </Text>
        <PrimaryButton title="Entendi" onPress={() => setShowTerms(false)} style={{ marginTop: 8 }} />
      </BottomSheet>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 },
  brand: { minHeight: 42, justifyContent: "center" },
  welcome: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 12,
  },
  art: { height: 305, width: "100%", position: "relative", marginBottom: 8 },
  orbit: {
    position: "absolute",
    left: "50%",
    top: "50%",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.brandLight,
    borderRadius: 999,
  },
  pin: {
    position: "absolute",
    padding: 4,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderBottomRightRadius: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  car: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: Colors.brandDark,
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -37,
    marginTop: -37,
    overflow: "hidden",
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.25,
    shadowRadius: 35,
    elevation: 8,
  },
  pill: {
    backgroundColor: Colors.blueSoft,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 4,
  },
  pillText: {
    color: Colors.brand,
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  welcomeTitle: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 34,
    lineHeight: 38,
    textAlign: "center",
    color: Colors.ink,
    marginTop: 12,
    marginBottom: 12,
    letterSpacing: -1.2,
  },
  brandText: { color: Colors.brand },
  welcomeText: {
    color: Colors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 330,
    marginBottom: 22,
    fontFamily: Fonts.body,
  },
  termsRow: { flexDirection: "row", marginTop: 13, flexWrap: "wrap", justifyContent: "center" },
  termsCopy: { color: Colors.muted, fontSize: 13 },
  termsLink: { color: Colors.brand, fontSize: 13, fontFamily: Fonts.bodySemiBold },
  panel: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 20,
    position: "relative",
  },
  verifiedPanel: { alignItems: "center" },
  backFloat: {
    position: "absolute",
    top: 12,
    left: 0,
    width: 41,
    height: 41,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  loginIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.blueSoft,
    marginBottom: 20,
  },
  eyebrow: {
    color: Colors.muted,
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1.6,
    marginBottom: 5,
  },
  panelTitle: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 29,
    lineHeight: 33,
    color: Colors.ink,
    letterSpacing: -1,
    marginBottom: 10,
    maxWidth: 350,
  },
  verifiedTitle: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 29,
    lineHeight: 33,
    color: Colors.ink,
    letterSpacing: -1,
    marginBottom: 10,
  },
  panelText: {
    color: Colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: Fonts.body,
  },
  fieldLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.ink,
    marginBottom: 6,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 6,
    fontFamily: Fonts.body,
  },
  codeRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  codeCell: {
    width: 62,
    height: 65,
    borderWidth: 1.5,
    borderColor: Colors.brand,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  codeDigit: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 25,
    color: Colors.ink,
  },
  resend: {
    color: Colors.muted,
    fontSize: 15,
    marginBottom: 16,
    fontFamily: Fonts.body,
  },
  successRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.mintSoft,
    borderWidth: 7,
    borderColor: Colors.graySoft,
    marginBottom: 18,
  },
  institutionalProfile: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 20,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.05,
    shadowRadius: 22,
    elevation: 2,
  },
  profileName: { fontFamily: Fonts.displayBold, fontSize: 18, color: Colors.ink },
  profileCourse: { fontSize: 15, color: Colors.muted, marginTop: 1 },
  profileMeta: { color: Colors.brand, fontSize: 13, marginTop: 3, fontFamily: Fonts.bodySemiBold },
  profileCheck: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: Colors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 22,
    color: Colors.ink,
    marginBottom: 4,
  },
  sheetHeading: {
    fontFamily: Fonts.displayBold,
    fontSize: 16,
    color: Colors.ink,
    marginTop: 12,
    marginBottom: 2,
  },
  sheetText: { color: Colors.muted, fontSize: 15, lineHeight: 21, fontFamily: Fonts.body },
});
