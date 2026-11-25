import {
  Camera,
  GeoJSONSource,
  Layer,
  Map as MapLibreMap,
  Marker,
  UserLocation,
  type CameraRef,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { coordinatesForPlace, type Coordinates } from "@/data";
import { Colors, Fonts } from "@/constants/theme";
import { Icon } from "./Icon";

const OPENFREEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/bright";

export type MapPickup = { label: string; coordinates: Coordinates; initials?: string };

type RouteState = "loading" | "ready" | "unavailable";

export function MapView({
  compact = false,
  detailed = false,
  origin = "Centro Histórico",
  destination = "Campus JK",
  originCoordinates,
  destinationCoordinates,
  pickups = [],
  editableOrigin = false,
  onOriginChange,
  height,
}: {
  compact?: boolean;
  detailed?: boolean;
  origin?: string;
  destination?: string;
  originCoordinates?: Coordinates;
  destinationCoordinates?: Coordinates;
  pickups?: MapPickup[];
  editableOrigin?: boolean;
  onOriginChange?: (coordinates: Coordinates) => void;
  height?: number;
}) {
  const cameraRef = useRef<CameraRef>(null);
  const originPoint = originCoordinates || coordinatesForPlace(origin);
  const destinationPoint = destinationCoordinates || coordinatesForPlace(destination);
  const [routeState, setRouteState] = useState<RouteState>("loading");
  const [routeGeoJSON, setRouteGeoJSON] = useState<GeoJSON.Feature | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);

  const routeKey = [
    ...originPoint,
    ...pickups.flatMap((point) => point.coordinates),
    ...destinationPoint,
  ].join(",");

  const mapHeight = height ?? (compact ? 185 : 260);

  // Compute the bounding box once per input change.
  const allPoints = [
    originPoint,
    ...pickups.map((point) => point.coordinates),
    destinationPoint,
  ];
  const west = Math.min(...allPoints.map((p) => p[0]));
  const east = Math.max(...allPoints.map((p) => p[0]));
  const south = Math.min(...allPoints.map((p) => p[1]));
  const north = Math.max(...allPoints.map((p) => p[1]));

  useEffect(() => {
    const controller = new AbortController();
    setRouteState("loading");
    setRouteGeoJSON(null);

    const routeCoordinates = allPoints.map((point) => point.join(",")).join(";");
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${routeCoordinates}?overview=full&geometries=geojson`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("Serviço de rotas indisponível");
        const result = await response.json();
        const geometry = result.routes?.[0]?.geometry;
        if (!geometry) throw new Error("Rota não encontrada");
        return geometry as GeoJSON.Geometry;
      })
      .then((geometry) => {
        if (controller.signal.aborted) return;
        setRouteGeoJSON({ type: "Feature", properties: {}, geometry });
        setRouteState("ready");
        cameraRef.current?.fitBounds(
          [west, south, east, north],
          {
            padding: compact
              ? { top: 42, right: 42, bottom: 42, left: 42 }
              : { top: 34, right: 48, bottom: 150, left: 48 },
            duration: 0,
          },
        );
        if (!compact) {
          cameraRef.current?.jumpTo({ center: originPoint, zoom: 14 });
        }
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setRouteState("unavailable");
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey, compact, detailed]);

  const centerOnUser = async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;
      setLocationGranted(true);
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      cameraRef.current?.easeTo({
        center: [position.coords.longitude, position.coords.latitude],
        zoom: 15,
        duration: 600,
      });
    } catch {
      // geolocation is best-effort; the map remains usable without it
    }
  };

  return (
    <View
      style={[styles.container, { height: mapHeight }]}
      accessibilityLabel={`Mapa interativo da rota entre ${origin} e ${destination}`}
    >
      <MapLibreMap
        style={StyleSheet.absoluteFill}
        mapStyle={OPENFREEMAP_STYLE_URL}
        attribution
        attributionPosition={{ bottom: 8, left: 8 }}
        logo={false}
        contentInset={{ top: 0, right: 0, bottom: 0, left: 0 }}
        onPress={
          editableOrigin
            ? (event) => {
                const { lngLat } = event.nativeEvent;
                onOriginChange?.([lngLat[0], lngLat[1]]);
              }
            : undefined
        }
      >
        <Camera
          ref={cameraRef}
          initialViewState={{ center: originPoint, zoom: 14 }}
          minZoom={11}
          maxZoom={19}
        />
        {locationGranted ? <UserLocation accuracy animated /> : null}

        <Marker id="origin" lngLat={originPoint} anchor="bottom">
          <View style={[styles.marker, { backgroundColor: Colors.route }]}>
            <Text style={styles.markerText}>A</Text>
          </View>
        </Marker>
        {pickups.map((point, index) => (
          <Marker
            key={`pickup-${index}`}
            id={`pickup-${index}`}
            lngLat={point.coordinates}
            anchor="center"
          >
            <View style={[styles.pickupMarker]}>
              <Text style={styles.markerText}>{point.initials || "P"}</Text>
            </View>
          </Marker>
        ))}
        <Marker id="destination" lngLat={destinationPoint} anchor="bottom">
          <View style={[styles.marker, { backgroundColor: Colors.destructivePink }]}>
            <Text style={styles.markerText}>B</Text>
          </View>
        </Marker>

        {routeGeoJSON ? (
          <GeoJSONSource id="unicar-route" data={routeGeoJSON}>
            <Layer
              id="unicar-route-outline"
              type="line"
              paint={{ "line-color": "#ffffff", "line-width": 8, "line-opacity": 0.9 }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
            <Layer
              id="unicar-route"
              type="line"
              paint={{ "line-color": Colors.route, "line-width": 5 }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
          </GeoJSONSource>
        ) : null}
      </MapLibreMap>

      <Pressable
        onPress={centerOnUser}
        accessibilityRole="button"
        accessibilityLabel="Centralizar na minha localização"
        style={({ pressed }) => [styles.locateButton, pressed && styles.locatePressed]}
      >
        <Icon name="pin" size={20} color={Colors.ink} />
      </Pressable>

      <View style={[styles.pill, styles.routePill, routeState === "unavailable" && styles.pillError]}>
        <View
          style={[
            styles.pillDot,
            routeState === "loading" && styles.pillDotLoading,
            routeState === "unavailable" && styles.pillDotError,
          ]}
        />
        <Text style={styles.pillText}>
          {routeState === "loading"
            ? "Calculando rota"
            : routeState === "ready"
              ? detailed
                ? `${pickups.length} ponto${pickups.length === 1 ? "" : "s"} de embarque`
                : "Rota viária"
              : "Rota indisponível"}
        </Text>
      </View>

      {editableOrigin ? (
        <View style={[styles.pill, styles.editHint]}>
          <Text style={styles.pillText}>Toque no mapa para ajustar a origem</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#eef5fa",
  },
  marker: {
    width: 34,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    borderRadius: 17,
    borderBottomRightRadius: 5,
    shadowColor: "#173d32",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.27,
    shadowRadius: 8,
    elevation: 5,
  },
  pickupMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    backgroundColor: Colors.pickupBlue,
    shadowColor: "#173d32",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.27,
    shadowRadius: 8,
    elevation: 5,
  },
  markerText: {
    color: "#ffffff",
    fontFamily: Fonts.displayExtraBold,
    fontSize: 12,
  },
  locateButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#d8e6e1",
    shadowColor: "#183f33",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  locatePressed: { opacity: 0.8 },
  pill: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d7e5e0",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  routePill: { right: 10, bottom: 27 },
  pillError: { borderColor: "#f2c9ce" },
  pillDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.route,
  },
  pillDotLoading: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#b8ccc5",
    borderTopColor: Colors.route,
  },
  pillDotError: { backgroundColor: Colors.destructivePink },
  pillText: {
    color: "#335248",
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
  },
  editHint: {
    top: 10,
    alignSelf: "center",
    left: 60,
    right: 60,
    justifyContent: "center",
  },
});
