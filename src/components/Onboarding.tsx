import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { Avatar } from "@/components/Avatar";
import { BottomSheet } from "@/components/BottomSheet";
import { CoursePicker } from "@/components/CoursePicker";
import { Icon } from "@/components/Icon";
import { FormGroup, InputShell, ShellInput } from "@/components/Field";
import { PrimaryButton, SafeNote } from "@/components/ui";
import { Colors, Fonts } from "@/constants/theme";
import { campusForCourse, riders } from "@/data";
import { useAuth } from "@/auth";
import { initialsFromName, nameFromEmail } from "@/lib/profile";
import { useAppStore } from "@/store";

const logoCircular = require("@/assets/images/unicar-logo-circular.png");
const logoTransparent = require("@/assets/images/unicar-logo-transparent.png");

const INSTITUTIONAL_DOMAIN = "@ufvjm.edu.br";
const CODE_LENGTH = 4;
const RESEND_COOLDOWN_SECONDS = 42;

const emptyCode = () => Array<string>(CODE_LENGTH).fill("");
const generateCode = (previous = "") => {
  let code = "";
  do {
    code = Array.from({ length: CODE_LENGTH }, () => Math.floor(Math.random() * 10)).join("");
  } while (code === previous);
  return code;
};
const formatCountdown = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export function Onboarding() {
  const { login } = useAuth();
  const { hydrated, updateProfile } = useAppStore();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeDigits, setCodeDigits] = useState<string[]>(emptyCode);
  const [codeError, setCodeError] = useState("");
  const [codeNotice, setCodeNotice] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState("");
  const codeInputs = useRef<(TextInput | null)[]>([]);

  const normalizedEmail = email.trim().toLowerCase();
  const localIdentifier = normalizedEmail.split("@")[0] ?? "";
  const valid =
    normalizedEmail.endsWith(INSTITUTIONAL_DOMAIN) && localIdentifier.length > 0;
  const generatedName = nameFromEmail(normalizedEmail);
  const firstName = generatedName.split(" ")[0] || "Estudante";
  const selectedCampus = campusForCourse(selectedCourse);
  const countdownRunning = secondsLeft > 0;

  useEffect(() => {
    if (!countdownRunning) return;
    const timer = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdownRunning]);

  const sendCode = (toEmail: string) => {
    const code = generateCode();
    setVerificationCode(code);
    setCodeDigits(emptyCode());
    setCodeError("");
    setCodeNotice(`Código enviado a ${toEmail} (simulação): ${code}`);
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    setStep(2);
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    const code = generateCode(verificationCode);
    setVerificationCode(code);
    setCodeDigits(emptyCode());
    setCodeError("");
    setCodeNotice(`Novo código enviado a ${email} (simulação): ${code}`);
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
  };

  const handleAutofill = () => {
    if (!verificationCode) return;
    setCodeDigits(verificationCode.split(""));
    setCodeError("");
    setCodeNotice("Código recebido e preenchido automaticamente (simulação).");
  };

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCodeDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    setCodeError("");
    if (digit && index < CODE_LENGTH - 1) codeInputs.current[index + 1]?.focus();
  };

  const handleDigitBackspace = (index: number, key: string) => {
    if (key === "Backspace" && !codeDigits[index] && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  };

  const verifyCode = () => {
    const entered = codeDigits.join("");
    if (entered.length !== CODE_LENGTH) {
      setCodeError("Digite os 4 dígitos do código enviado.");
      return;
    }
    if (entered !== verificationCode) {
      setCodeError("Código incorreto. Confira o código simulado e tente novamente.");
      return;
    }
    setCodeError("");
    setCodeNotice("");
    setSecondsLeft(0);
    setStep(3);
  };

  const confirmProfile = () => {
    if (!hydrated || !selectedCourse) return;
    updateProfile({
      name: generatedName,
      initials: initialsFromName(generatedName),
      email: normalizedEmail,
      course: selectedCourse,
    });
    login();
  };

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
                    Use um e-mail terminado em {INSTITUTIONAL_DOMAIN}
                  </Text>
                ) : null}
              </FormGroup>
              <PrimaryButton
                title="Receber código"
                disabled={!valid}
                onPress={() => {
                  setEmail(normalizedEmail);
                  sendCode(normalizedEmail);
                }}
                style={{ marginTop: 4 }}
              />
              <SafeNote text="Seus dados são usados apenas para validar seu vínculo acadêmico." />
            </View>
          )}

          {step === 2 && (
            <View style={styles.panel}>
              <Pressable
                onPress={() => {
                  setSecondsLeft(0);
                  setStep(1);
                }}
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
              <View style={styles.codeRow} accessibilityLabel="Código de verificação">
                {codeDigits.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(input) => {
                      codeInputs.current[index] = input;
                    }}
                    value={digit}
                    onChangeText={(value) => handleDigitChange(index, value)}
                    onKeyPress={(event) => handleDigitBackspace(index, event.nativeEvent.key)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    autoCorrect={false}
                    accessibilityLabel={`Dígito ${index + 1} do código`}
                    style={styles.codeCell}
                  />
                ))}
              </View>
              {codeNotice ? (
                <Text accessibilityLiveRegion="polite" style={styles.codeNotice}>
                  {codeNotice}
                </Text>
              ) : null}
              {codeError ? (
                <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                  {codeError}
                </Text>
              ) : null}
              <Pressable
                onPress={handleAutofill}
                accessibilityRole="button"
                style={({ pressed }) => [styles.simulateRow, pressed && styles.pressed]}
              >
                <Icon name="chat" size={17} color={Colors.brand} />
                <Text style={styles.simulateText}>Simular recebimento do código</Text>
              </Pressable>
              {countdownRunning ? (
                <Text accessibilityLiveRegion="polite" style={styles.resend}>
                  Reenviar código em {formatCountdown(secondsLeft)}
                </Text>
              ) : (
                <Pressable
                  onPress={handleResend}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.resend, pressed && styles.pressed]}
                >
                  <Text style={styles.resendLink}>Reenviar código</Text>
                </Pressable>
              )}
              <PrimaryButton title="Verificar código" onPress={verifyCode} />
            </View>
          )}

          {step === 3 && (
            <View style={[styles.panel, styles.verifiedPanel]}>
              <View style={styles.successRing}>
                <Icon name="check" size={36} color={Colors.brand} />
              </View>
              <Text style={styles.eyebrow}>PERFIL ENCONTRADO</Text>
              <Text style={styles.verifiedTitle}>Olá, {firstName}!</Text>
              <Text style={styles.panelText}>
                Encontramos seus dados institucionais. Confirme seu curso para continuar.
              </Text>
              <View style={styles.institutionalProfile}>
                <Avatar
                  person={{
                    name: generatedName,
                    initials: initialsFromName(generatedName),
                    color: "green",
                  }}
                  size="xl"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {generatedName}
                  </Text>
                  <Text style={styles.profileCourse} numberOfLines={1}>
                    {selectedCourse || "Selecione seu curso"}
                  </Text>
                  <Text style={styles.profileMeta}>
                    {selectedCampus ? `Campus ${selectedCampus} · Matrícula ativa` : "Campus a definir"}
                  </Text>
                </View>
                <View style={styles.profileCheck}>
                  <Icon name="check" size={14} color={Colors.brand} />
                </View>
              </View>
              <View style={styles.courseField}>
                <Text style={styles.fieldLabel}>Curso</Text>
                <CoursePicker value={selectedCourse} onChange={setSelectedCourse} />
              </View>
              <PrimaryButton
                title="Confirmar e continuar"
                onPress={confirmProfile}
                disabled={!selectedCourse || !hydrated}
                style={{ marginTop: 16 }}
              />
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
  codeRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  codeCell: {
    flex: 1,
    minWidth: 0,
    maxWidth: 62,
    height: 65,
    borderWidth: 1.5,
    borderColor: Colors.brand,
    backgroundColor: Colors.surface,
    borderRadius: 15,
    textAlign: "center",
    fontFamily: Fonts.displayExtraBold,
    fontSize: 25,
    color: Colors.ink,
    paddingVertical: 0,
  },
  codeNotice: {
    color: Colors.brand,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.bodySemiBold,
    marginBottom: 4,
  },
  simulateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 8,
    marginBottom: 4,
  },
  simulateText: { color: Colors.brand, fontSize: 14, fontFamily: Fonts.bodySemiBold },
  pressed: { opacity: 0.7 },
  resend: {
    color: Colors.muted,
    fontSize: 15,
    marginBottom: 16,
    fontFamily: Fonts.body,
  },
  resendLink: { color: Colors.brand, fontSize: 15, fontFamily: Fonts.bodySemiBold },
  courseField: { width: "100%", marginTop: 4 },
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
