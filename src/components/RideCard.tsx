import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Stars } from "@/components/Stars";
import { Colors, Fonts } from "@/constants/theme";
import type { Rider } from "@/data";
import type { StoredRide } from "@/store";

export type RideCardRide = Pick<
  StoredRide,
  "id" | "driver" | "from" | "to" | "time" | "arrive" | "price" | "seats" | "extra"
>;

export function RideCard({
  ride,
  onPress,
}: {
  ride: RideCardRide;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Carona de ${ride.driver.name}, ${ride.from} para ${ride.to}`}
      style={({ pressed }) => ({
        width: "100%",
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.canvas,
        borderRadius: 12,
        padding: 16,
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 }}>
          <Avatar person={ride.driver as Rider} />
          <View style={{ flexShrink: 1 }}>
            <Text numberOfLines={1} style={{ fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink }}>
              {ride.driver.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 }}>
              <Stars value={ride.driver.rating} />
              <Text numberOfLines={1} style={{ fontSize: 12, color: Colors.muted, flexShrink: 1 }}>
                · {ride.driver.course}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontFamily: Fonts.displayExtraBold, fontSize: 19, color: Colors.ink, lineHeight: 22 }}>
            R$ {ride.price}
            <Text style={{ fontSize: 12, color: Colors.muted, fontFamily: Fonts.body }}>/pessoa</Text>
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 13 }}>
        <View style={{ alignItems: "center", paddingTop: 5 }}>
          <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.brand }} />
          <View style={{ width: 2, flex: 1, backgroundColor: Colors.border, marginVertical: 3 }} />
          <Icon name="pin" size={14} color={Colors.error} />
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "baseline" }}>
            <Text style={{ fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink, width: 38 }}>
              {ride.time}
            </Text>
            <Text style={{ fontSize: 14, color: Colors.ink, flexShrink: 1 }}>{ride.from}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "baseline" }}>
            <Text style={{ fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink, width: 38 }}>
              {ride.arrive}
            </Text>
            <Text style={{ fontSize: 14, color: Colors.ink, flexShrink: 1 }}>{ride.to}</Text>
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          marginTop: 12,
          paddingTop: 11,
          borderTopWidth: 1,
          borderTopColor: Colors.graySoft2,
        }}
      >
        <View style={{ backgroundColor: Colors.blueSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
          <Text style={{ color: Colors.brand, fontFamily: Fonts.bodyBold, fontSize: 12 }}>
            +{ride.extra} min de desvio
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1 }}>
          <Icon name="users" size={16} color={Colors.muted} />
          <Text style={{ fontSize: 13, color: Colors.muted, fontFamily: Fonts.bodySemiBold }}>
            {ride.seats} {ride.seats === 1 ? "vaga" : "vagas"}
          </Text>
        </View>
        <Icon name="arrow" size={18} color={Colors.muted} />
      </View>
    </Pressable>
  );
}
