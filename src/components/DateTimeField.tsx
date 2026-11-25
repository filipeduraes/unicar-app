import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";

import { Colors, Fonts } from "@/constants/theme";
import { formatDateBR } from "@/lib/format";
import { Icon, type IconName } from "./Icon";

function parseISODate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseTime(value: string): Date {
  const [h, m] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(Number.isFinite(h) ? h : 8, Number.isFinite(m) ? m : 0, 0, 0);
  return date;
}

function toTimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function ShellButton({
  icon,
  text,
  onPress,
  accessibilityLabel,
}: {
  icon: IconName;
  text: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => ({
        minHeight: 58,
        borderWidth: 1,
        borderColor: Colors.canvas,
        backgroundColor: pressed ? Colors.graySoft : Colors.surface,
        borderRadius: 13,
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        paddingHorizontal: 12,
        alignSelf: "stretch",
      })}
    >
      <Icon name={icon} size={19} color={Colors.muted} />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        style={{ flex: 1, color: Colors.ink, fontSize: 15, fontFamily: Fonts.body }}
      >
        {text}
      </Text>
    </Pressable>
  );
}

export function DateField({
  value,
  onChange,
  minimumDate,
  accessibilityLabel = "Selecionar data",
}: {
  value: string;
  onChange: (isoDate: string) => void;
  minimumDate?: string;
  accessibilityLabel?: string;
}) {
  const [visible, setVisible] = useState(false);
  const selected = parseISODate(value);
  const min = minimumDate ? parseISODate(minimumDate) : undefined;

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setVisible(false);
    if (event.type === "set" && date) onChange(toISODate(date));
  };

  if (Platform.OS === "android") {
    return (
      <>
        <ShellButton
          icon="calendar"
          text={formatDateBR(selected)}
          onPress={() => setVisible(true)}
          accessibilityLabel={accessibilityLabel}
        />
        {visible ? (
          <DateTimePicker
            value={selected}
            mode="date"
            display="default"
            minimumDate={min}
            onChange={handleChange}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <ShellButton
        icon="calendar"
        text={formatDateBR(selected)}
        onPress={() => setVisible(true)}
        accessibilityLabel={accessibilityLabel}
      />
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(45,52,54,0.69)" }} onPress={() => setVisible(false)} />
        <View
          style={{
            backgroundColor: Colors.surface,
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            padding: 20,
            alignItems: "center",
          }}
        >
          <DateTimePicker
            value={selected}
            mode="date"
            display="spinner"
            minimumDate={min}
            onChange={handleChange}
          />
          <Pressable
            onPress={() => setVisible(false)}
            accessibilityRole="button"
            style={{
              minHeight: 48,
              justifyContent: "center",
              paddingHorizontal: 32,
              backgroundColor: Colors.brand,
              borderRadius: 12,
              marginTop: 8,
            }}
          >
            <Text style={{ color: "#fff", fontFamily: Fonts.bodyBold, fontSize: 16 }}>Concluir</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

export function TimeField({
  value,
  onChange,
  accessibilityLabel = "Selecionar horário",
}: {
  value: string;
  onChange: (time: string) => void;
  accessibilityLabel?: string;
}) {
  const [visible, setVisible] = useState(false);
  const selected = parseTime(value);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setVisible(false);
    if (event.type === "set" && date) onChange(toTimeString(date));
  };

  if (Platform.OS === "android") {
    return (
      <>
        <ShellButton
          icon="clock"
          text={value}
          onPress={() => setVisible(true)}
          accessibilityLabel={accessibilityLabel}
        />
        {visible ? (
          <DateTimePicker
            value={selected}
            mode="time"
            display="default"
            is24Hour
            onChange={handleChange}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <ShellButton
        icon="clock"
        text={value}
        onPress={() => setVisible(true)}
        accessibilityLabel={accessibilityLabel}
      />
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(45,52,54,0.69)" }} onPress={() => setVisible(false)} />
        <View
          style={{
            backgroundColor: Colors.surface,
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            padding: 20,
            alignItems: "center",
          }}
        >
          <DateTimePicker
            value={selected}
            mode="time"
            display="spinner"
            is24Hour
            onChange={handleChange}
          />
          <Pressable
            onPress={() => setVisible(false)}
            accessibilityRole="button"
            style={{
              minHeight: 48,
              justifyContent: "center",
              paddingHorizontal: 32,
              backgroundColor: Colors.brand,
              borderRadius: 12,
              marginTop: 8,
            }}
          >
            <Text style={{ color: "#fff", fontFamily: Fonts.bodyBold, fontSize: 16 }}>Concluir</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
