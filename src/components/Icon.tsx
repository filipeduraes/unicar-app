import Svg, { Circle, Path, Rect } from "react-native-svg";

export type IconName =
  | "home"
  | "car"
  | "plus"
  | "chat"
  | "user"
  | "bell"
  | "pin"
  | "clock"
  | "arrow"
  | "back"
  | "search"
  | "filter"
  | "calendar"
  | "users"
  | "edit"
  | "card"
  | "shield"
  | "check"
  | "close"
  | "dots"
  | "logout";

export function Icon({
  name,
  size = 22,
  color = "#2d3436",
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const stroke = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  const filled = { fill: color, stroke: "none" };

  const paths: Record<IconName, React.ReactNode> = {
    home: (
      <>
        <Path d="M3 11.5 12 4l9 7.5" {...stroke} />
        <Path d="M5.5 10v10h13V10M9 20v-6h6v6" {...stroke} />
      </>
    ),
    car: (
      <>
        <Path d="m5 11 1.5-4h11l1.5 4" {...stroke} />
        <Path d="M3.5 12.5h17v5h-17zM6 17.5v2M18 17.5v2" {...stroke} />
        <Circle cx="7" cy="15" r=".8" {...filled} />
        <Circle cx="17" cy="15" r=".8" {...filled} />
      </>
    ),
    plus: <Path d="M12 5v14M5 12h14" {...stroke} />,
    chat: (
      <Path d="M20 15a3 3 0 0 1-3 3H8l-4 3v-6a8 8 0 1 1 16 0Z" {...stroke} />
    ),
    user: (
      <>
        <Circle cx="12" cy="8" r="4" {...stroke} />
        <Path d="M4.5 21a7.5 7.5 0 0 1 15 0" {...stroke} />
      </>
    ),
    bell: (
      <Path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7M10 20h4" {...stroke} />
    ),
    pin: (
      <>
        <Path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" {...stroke} />
        <Circle cx="12" cy="10" r="2.5" {...stroke} />
      </>
    ),
    clock: (
      <>
        <Circle cx="12" cy="12" r="9" {...stroke} />
        <Path d="M12 7v5l3.5 2" {...stroke} />
      </>
    ),
    arrow: <Path d="m9 18 6-6-6-6" {...stroke} />,
    back: <Path d="m15 18-6-6 6-6" {...stroke} />,
    search: (
      <>
        <Circle cx="10.5" cy="10.5" r="6.5" {...stroke} />
        <Path d="m16 16 4 4" {...stroke} />
      </>
    ),
    filter: <Path d="M4 7h16M7 12h10M10 17h4" {...stroke} />,
    calendar: (
      <>
        <Rect x="3.5" y="5" width="17" height="15" rx="2" {...stroke} />
        <Path d="M8 3v4M16 3v4M3.5 10h17" {...stroke} />
      </>
    ),
    users: (
      <>
        <Circle cx="9" cy="9" r="3" {...stroke} />
        <Path d="M3 19a6 6 0 0 1 12 0M16 6.5a3 3 0 0 1 0 5.5M17 14a5 5 0 0 1 4 5" {...stroke} />
      </>
    ),
    edit: <Path d="m14 5 5 5M4 20l3.5-.8L20 6.7 17.3 4 4.8 16.5 4 20Z" {...stroke} />,
    card: (
      <>
        <Rect x="3" y="5" width="18" height="14" rx="2" {...stroke} />
        <Path d="M3 10h18M7 15h3" {...stroke} />
      </>
    ),
    shield: (
      <>
        <Path d="M12 3 5 6v5c0 4.5 2.7 8 7 10 4.3-2 7-5.5 7-10V6l-7-3Z" {...stroke} />
        <Path d="m9 12 2 2 4-4" {...stroke} />
      </>
    ),
    check: <Path d="m5 12 4.5 4.5L19 7" {...stroke} />,
    close: <Path d="m6 6 12 12M18 6 6 18" {...stroke} />,
    dots: (
      <>
        <Circle cx="5" cy="12" r="1" {...filled} />
        <Circle cx="12" cy="12" r="1" {...filled} />
        <Circle cx="19" cy="12" r="1" {...filled} />
      </>
    ),
    logout: <Path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" {...stroke} />,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {paths[name]}
    </Svg>
  );
}
