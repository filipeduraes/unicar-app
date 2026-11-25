import { type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { Colors, Fonts, Radius } from "@/constants/theme";

export function Label({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        color: Colors.ink,
        fontFamily: Fonts.bodySemiBold,
        fontSize: 14,
        marginBottom: 6,
      }}
    >
      {children}
    </Text>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return (
    <Text style={{ color: Colors.muted, fontSize: 12, marginTop: 4, fontFamily: Fonts.body }}>
      {children}
    </Text>
  );
}

export function FormGroup({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[{ marginBottom: 16 }, style]}>{children}</View>;
}

export function InputShell({
  icon,
  invalid,
  right,
  children,
}: {
  icon?: ReactNode;
  invalid?: boolean;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View
      style={[
        shell.container,
        invalid && shell.invalid,
      ]}
    >
      {icon ? <View style={shell.icon}>{icon}</View> : null}
      {children}
      {right ? <View style={shell.right}>{right}</View> : null}
    </View>
  );
}

export function ShellInput({
  invalid,
  ...props
}: TextInputProps & { invalid?: boolean }) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={invalid ? "#d63031" : "#b2bec3"}
      style={[shell.input, props.style]}
    />
  );
}

const shell = StyleSheet.create({
  container: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: Colors.canvas,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 14,
    color: Colors.muted,
  },
  invalid: {
    borderColor: Colors.error,
    backgroundColor: Colors.redSoft,
  },
  icon: { justifyContent: "center", alignItems: "center" },
  right: { justifyContent: "center", alignItems: "center" },
  input: {
    flex: 1,
    minWidth: 0,
    color: Colors.ink,
    fontSize: 16,
    fontFamily: Fonts.body,
    paddingVertical: 12,
  },
});
