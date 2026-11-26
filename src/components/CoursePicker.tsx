import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors, Fonts, Radius } from "@/constants/theme";
import { COURSE_CATALOG } from "@/data";

import { BottomSheet } from "./BottomSheet";
import { Icon } from "./Icon";

/** Lista agrupada por campus e área — única representação visual do catálogo. */
export function CourseList({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (course: string) => void;
}) {
  return (
    <>
      {COURSE_CATALOG.map((group) => (
        <View key={group.campus} style={styles.group}>
          <Text style={styles.campusTitle}>Campus {group.campus}</Text>
          <Text style={styles.campusAddress}>{group.address}</Text>
          {group.courses?.map((course) => (
            <CourseOption
              key={course}
              course={course}
              selected={course === value}
              onPress={() => onSelect(course)}
            />
          ))}
          {group.areas?.map((area) => (
            <View key={area.name} style={styles.area}>
              <Text style={styles.areaTitle}>{area.name}</Text>
              {area.courses.map((course) => (
                <CourseOption
                  key={course}
                  course={course}
                  selected={course === value}
                  onPress={() => onSelect(course)}
                />
              ))}
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

function CourseOption({
  course,
  selected,
  onPress,
}: {
  course: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}
    >
      <Text numberOfLines={1} style={[styles.optionText, selected && styles.optionTextSelected]}>
        {course}
      </Text>
      {selected ? <Icon name="check" size={18} color={Colors.brand} /> : null}
    </Pressable>
  );
}

/** Gatilho + bottom sheet para escolher curso; o campus é derivado depois. */
export function CoursePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (course: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Selecionar curso"
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <View style={styles.triggerText}>
          <Text numberOfLines={1} style={[styles.triggerValue, !value && styles.placeholder]}>
            {value || "Selecione seu curso"}
          </Text>
          <Text style={styles.triggerHint}>Curso e campus são definidos juntos</Text>
        </View>
        <Icon name="arrow" size={18} color={Colors.muted} />
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)}>
        <Text style={styles.sheetTitle}>Selecione seu curso</Text>
        <Text style={styles.sheetText}>
          O campus do seu perfil é definido automaticamente pelo curso escolhido.
        </Text>
        <CourseList
          value={value}
          onSelect={(course) => {
            onChange(course);
            setOpen(false);
          }}
        />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 14,
  },
  triggerText: { flex: 1, minWidth: 0 },
  triggerValue: { color: Colors.ink, fontSize: 16, fontFamily: Fonts.body },
  placeholder: { color: Colors.border },
  triggerHint: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body, marginTop: 2 },
  pressed: { opacity: 0.7 },
  sheetTitle: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 20,
    color: Colors.ink,
    marginBottom: 4,
  },
  sheetText: { color: Colors.muted, fontSize: 14, lineHeight: 20, fontFamily: Fonts.body },
  group: { marginTop: 16 },
  campusTitle: { fontFamily: Fonts.displayBold, fontSize: 16, color: Colors.ink },
  campusAddress: { color: Colors.muted, fontSize: 12, fontFamily: Fonts.body, marginTop: 1 },
  area: { marginTop: 10 },
  areaTitle: {
    color: Colors.brand,
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  option: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.graySoft2,
    paddingHorizontal: 8,
  },
  optionText: { color: Colors.ink, fontSize: 15, fontFamily: Fonts.body, flexShrink: 1 },
  optionTextSelected: { color: Colors.brand, fontFamily: Fonts.bodySemiBold },
});
