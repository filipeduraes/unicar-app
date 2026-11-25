/**
 * Unicar design system — ported from the original web `index.css`
 * (Tailwind/Figma Make) to React Native style tokens.
 */

export const Colors = {
  brand: "#0984e3",
  brandLight: "#74b9ff",
  brandDark: "#2d3436",
  surface: "#ffffff",
  canvas: "#dfe6e9",
  border: "#b2bec3",
  success: "#00b894",
  route: "#087f5b",
  warning: "#fdcb6e",
  error: "#d63031",
  orange: "#e17055",
  purple: "#a29bfe",
  purpleDeep: "#6c5ce7",
  ink: "#2d3436",
  muted: "#636e72",
  // soft tints used across cards and states
  blueSoft: "#eaf4ff",
  blueSoft2: "#eef6ff",
  redSoft: "#fdecec",
  amberSoft: "#fff7e5",
  amberInk: "#a06b00",
  graySoft: "#f7f9fa",
  graySoft2: "#f1f4f5",
  purpleSoft: "#f0efff",
  coralSoft: "#fff3f0",
  mintSoft: "#e9faf4",
  destructivePink: "#d9485f",
  destructivePinkInk: "#a72d41",
  pickupBlue: "#1769aa",
  shadow: "#2d3436",
} as const;

export const Fonts = {
  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodySemiBold: "DMSans_600SemiBold",
  bodyBold: "DMSans_700Bold",
  displaySemiBold: "Manrope_600SemiBold",
  displayBold: "Manrope_700Bold",
  displayExtraBold: "Manrope_800ExtraBold",
} as const;

export const Radius = {
  sm: 9,
  md: 13,
  lg: 15,
  xl: 18,
  sheet: 20,
  pill: 999,
} as const;

export const Shadows = {
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  raised: {
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
} as const;
