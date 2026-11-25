import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors, Fonts } from "@/constants/theme";

export const WEEKDAYS = [
  { short: "S", label: "Seg" },
  { short: "T", label: "Ter" },
  { short: "Q", label: "Qua" },
  { short: "Q", label: "Qui" },
  { short: "S", label: "Sex" },
  { short: "S", label: "Sáb" },
  { short: "D", label: "Dom" },
] as const;

export function WeekdayPicker({
  selected,
  onToggle,
  accessibilityLabel,
}: {
  selected: number[];
  onToggle: (index: number) => void;
  accessibilityLabel?: string;
}) {
  return (
    <View style={styles.row} accessibilityLabel={accessibilityLabel ?? "Dias da semana"}>
      {WEEKDAYS.map((day, index) => {
        const active = selected.includes(index);
        return (
          <Pressable
            key={`${day.label}-${index}`}
            onPress={() => onToggle(index)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={day.label}
            style={[styles.day, active && styles.dayActive]}
          >
            <Text style={[styles.short, active && styles.textActive]}>{day.short}</Text>
            <Text style={[styles.label, active && styles.textActive]}>{day.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 5,
  },
  day: {
    flex: 1,
    minHeight: 60,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 9,
    backgroundColor: Colors.surface,
  },
  dayActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brand,
  },
  short: { color: Colors.muted, fontFamily: Fonts.bodyBold, fontSize: 16 },
  label: { color: Colors.muted, fontFamily: Fonts.bodySemiBold, fontSize: 11 },
  textActive: { color: "#ffffff" },
});
