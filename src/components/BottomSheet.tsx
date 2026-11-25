import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";

export function BottomSheet({
  visible,
  onClose,
  children,
  scroll = true,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  scroll?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const contentPaddingBottom = Math.max(28, insets.bottom + 16);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.avoider}
        pointerEvents="box-none"
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {scroll ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: contentPaddingBottom }]}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.scrollContent, { paddingBottom: contentPaddingBottom }]}>{children}</View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(45, 52, 54, 0.69)",
  },
  avoider: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 9,
    maxHeight: "92%",
  },
  handle: {
    height: 4,
    width: 42,
    backgroundColor: Colors.canvas,
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 6,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
  },
});
