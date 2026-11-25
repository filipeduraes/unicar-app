import { Text, View } from "react-native";

import { Colors, Fonts } from "@/constants/theme";

export function Stars({ value, compact = false }: { value: number; compact?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      <Text style={{ color: Colors.warning, fontSize: 14, lineHeight: 18 }}>★</Text>
      {!compact && (
        <Text style={{ fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.ink }}>
          {value.toFixed(1)}
        </Text>
      )}
    </View>
  );
}
