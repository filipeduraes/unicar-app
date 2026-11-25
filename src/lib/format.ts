const WEEKDAYS_SHORT = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."] as const;
const WEEKDAYS_LONG = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
] as const;
const MONTHS_SHORT = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "mai.",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
] as const;

const pad = (value: number) => String(value).padStart(2, "0");

/** "ter., 21 de mai. de 2026" */
export function formatDateBR(date: Date): string {
  return `${WEEKDAYS_SHORT[date.getDay()]}, ${pad(date.getDate())} de ${
    MONTHS_SHORT[date.getMonth()]
  } de ${date.getFullYear()}`;
}

/** "21 de mai." */
export function formatShortDateBR(date: Date): string {
  return `${pad(date.getDate())} de ${MONTHS_SHORT[date.getMonth()]}`;
}

/** "21 mai, 10:38"-like time only */
export function formatTimeBR(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "TER., 21 DE MAI" style uppercase date used in the offer success screen */
export function formatWeekdayShortDateBR(date: Date): string {
  return `${WEEKDAYS_SHORT[date.getDay()]} ${pad(date.getDate())} ${
    MONTHS_SHORT[date.getMonth()]
  }`.toUpperCase();
}

export function formatWeekdayLongBR(date: Date): string {
  return WEEKDAYS_LONG[date.getDay()];
}
