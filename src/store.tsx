import AsyncStorage from "@react-native-async-storage/async-storage";

import { formatTimeBR } from "@/lib/format";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  type SetStateAction,
} from "react";

export type StoredPerson = {
  id: number;
  name: string;
  initials: string;
  course: string;
  rating: number;
  color: string;
  photo?: string;
};

export type StoredRide = {
  id: number;
  driver: StoredPerson;
  ownerId: number;
  from: string;
  to: string;
  originCoordinates?: [number, number];
  destinationCoordinates?: [number, number];
  campus: string;
  date: string;
  time: string;
  arrive: string;
  price: number;
  seats: number;
  totalSeats: number;
  extra: number;
  days: string;
  distance: string;
  note: string;
  passengers: StoredPerson[];
  recurring: boolean;
  recurrenceDays: number[];
  recurrenceEnd?: string;
  direction: "ida" | "volta";
  status: "ativa" | "cancelada" | "concluida";
  occurrences: {
    id: number;
    date: string;
    driverConfirmed: boolean;
    passengerConfirmed: boolean;
    status: "agendada" | "confirmada" | "cancelada";
    seats: number;
  }[];
};

export type StoredRequest = {
  id: number;
  rideId: number;
  passenger: StoredPerson;
  status: "pendente" | "aprovada" | "recusada" | "cancelada" | "espera";
  createdAt: string;
};

export type StoredMessage = {
  id: number;
  conversationId: string;
  senderId: number;
  senderName: string;
  text: string;
  createdAt: string;
  read: boolean;
  attachment?: { type: "imagem" | "documento" | "localizacao" | "carona"; name: string };
};

export type StoredNotification = {
  id: number;
  title: string;
  text: string;
  createdAt: string;
  read: boolean;
  target: "details" | "requests" | "messages" | "trips" | "history" | "payment";
};

export type PaymentState =
  | "aguardando"
  | "processando"
  | "aprovado"
  | "recusado"
  | "reembolso"
  | "reembolsado";

export type StoreState = {
  profile: StoredPerson & { campus: string; address: string; email: string };
  rides: StoredRide[];
  requests: StoredRequest[];
  messages: StoredMessage[];
  notifications: StoredNotification[];
  payments: Record<string, PaymentState>;
  paymentMethods: Record<string, "pix" | "card">;
  reviews: {
    id: number;
    rideId: number;
    authorId: number;
    targetId: number;
    rating: number;
    comment: string;
  }[];
  reports: {
    id: number;
    type: "usuario" | "grupo" | "mensagem";
    targetId: string;
    category: string;
    description: string;
    createdAt: string;
  }[];
  blockedUserIds: number[];
  leftConversationIds: string[];
  preferences: { push: boolean; messages: boolean; rides: boolean; payments: boolean };
};

const me: StoreState["profile"] = {
  id: 4,
  name: "Gabriel Rocha",
  initials: "GR",
  course: "Engenharia de Computação",
  rating: 4.9,
  color: "green",
  campus: "JK",
  address: "Rua da Glória, 187 - Centro",
  email: "gabriel.rocha@ufvjm.edu.br",
};

const initialState: StoreState = {
  profile: me,
  rides: [],
  requests: [],
  messages: [
    {
      id: 1,
      conversationId: "ride-main",
      senderId: 2,
      senderName: "Lucas",
      text: "Oi, pessoal! Hoje saio pelo estacionamento da Reitoria, tudo bem?",
      createdAt: "14:02",
      read: true,
    },
    {
      id: 2,
      conversationId: "ride-main",
      senderId: 4,
      senderName: "Gabriel",
      text: "Perfeito! Estarei lá uns 5 min antes.",
      createdAt: "14:04",
      read: true,
    },
    {
      id: 3,
      conversationId: "ride-main",
      senderId: 3,
      senderName: "Ana",
      text: "Combinado, até mais tarde!",
      createdAt: "14:06",
      read: true,
    },
  ],
  notifications: [],
  payments: { "ride-1": "aguardando" },
  paymentMethods: { "ride-1": "pix" },
  reviews: [],
  reports: [],
  blockedUserIds: [],
  leftConversationIds: [],
  preferences: { push: true, messages: true, rides: true, payments: true },
};

type StoreApi = {
  state: StoreState;
  hydrated: boolean;
  setState: Dispatch<SetStateAction<StoreState>>;
  addRide: (ride: Omit<StoredRide, "id">) => StoredRide;
  cancelRide: (rideId: number) => void;
  requestRide: (rideId: number, waitlist?: boolean) => StoredRequest;
  updateRequest: (requestId: number, status: StoredRequest["status"]) => void;
  updateOccurrence: (
    rideId: number,
    occurrenceId: number,
    patch: Partial<StoredRide["occurrences"][number]>,
  ) => void;
  addMessage: (message: Omit<StoredMessage, "id" | "createdAt" | "read">) => void;
  addNotification: (notification: Omit<StoredNotification, "id" | "createdAt" | "read">) => void;
  markNotificationsRead: () => void;
  markNotificationRead: (id: number) => void;
  setPayment: (rideId: number, status: PaymentState, method?: "pix" | "card") => void;
  addReview: (review: Omit<StoreState["reviews"][number], "id">) => void;
  addReport: (report: Omit<StoreState["reports"][number], "id" | "createdAt">) => void;
  toggleBlock: (userId: number) => void;
  leaveConversation: (conversationId: string) => void;
  updateProfile: (patch: Partial<StoreState["profile"]>) => void;
  updatePreferences: (patch: Partial<StoreState["preferences"]>) => void;
};

const StoreContext = createContext<StoreApi | null>(null);
const STORAGE_KEY = "unicar-poc-state-v1";
const LOGGED_KEY = "unicar-poc-logged";

export const authStorage = {
  getLogged: async (): Promise<boolean> => {
    try {
      return (await AsyncStorage.getItem(LOGGED_KEY)) === "true";
    } catch {
      return false;
    }
  },
  setLogged: async (value: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem(LOGGED_KEY, String(value));
    } catch {
      // persistence is best-effort for the PoC
    }
  },
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!cancelled && saved) {
          try {
            setState({ ...initialState, ...JSON.parse(saved) });
          } catch {
            // corrupted payload — keep initial state
          }
        }
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  useEffect(() => {
    const now = Date.now();
    setState((current) => {
      let changed = false;
      const rides = current.rides.map((ride) => {
        const occurrences = ride.occurrences.map((occurrence) => {
          const departure = new Date(`${occurrence.date}T${ride.time}:00`).getTime();
          const confirmationDeadline = departure - 30 * 60 * 1000;
          if (
            occurrence.status !== "cancelada" &&
            !(occurrence.driverConfirmed && occurrence.passengerConfirmed) &&
            confirmationDeadline <= now
          ) {
            changed = true;
            return { ...occurrence, status: "cancelada" as const };
          }
          return occurrence;
        });
        return changed ? { ...ride, occurrences } : ride;
      });
      return changed ? { ...current, rides } : current;
    });
  }, []);

  const api = useMemo<StoreApi>(() => {
    const notify = (notification: Omit<StoredNotification, "id" | "createdAt" | "read">) =>
      setState((current) => ({
        ...current,
        notifications: [
          { ...notification, id: Date.now(), createdAt: "agora", read: false },
          ...current.notifications,
        ],
      }));

    return {
      state,
      hydrated,
      setState,
      addRide: (ride) => {
        const created = { ...ride, id: Date.now() };
        setState((current) => ({
          ...current,
          rides: [created, ...current.rides],
          notifications: [
            {
              id: Date.now() + 1,
              title: "Carona publicada",
              text: `${ride.from} → ${ride.to}, às ${ride.time}.`,
              createdAt: "agora",
              read: false,
              target: "trips",
            },
            ...current.notifications,
          ],
        }));
        return created;
      },
      cancelRide: (rideId) =>
        setState((current) => ({
          ...current,
          rides: current.rides.map((ride) =>
            ride.id === rideId ? { ...ride, status: "cancelada" } : ride,
          ),
          notifications: [
            {
              id: Date.now(),
              title: "Carona cancelada",
              text: "A carona foi cancelada e os participantes foram avisados.",
              createdAt: "agora",
              read: false,
              target: "trips",
            },
            ...current.notifications,
          ],
        })),
      requestRide: (rideId, waitlist = false) => {
        const request: StoredRequest = {
          id: Date.now(),
          rideId,
          passenger: state.profile,
          status: waitlist ? "espera" : "pendente",
          createdAt: "agora",
        };
        setState((current) => ({
          ...current,
          requests: [
            request,
            ...current.requests.filter(
              (item) => !(item.rideId === rideId && item.passenger.id === state.profile.id),
            ),
          ],
          notifications: [
            {
              id: Date.now() + 1,
              title: waitlist ? "Entrada na lista de espera" : "Solicitação enviada",
              text: waitlist
                ? "Você será avisado quando uma vaga for liberada."
                : "O motorista recebeu sua solicitação.",
              createdAt: "agora",
              read: false,
              target: "trips",
            },
            ...current.notifications,
          ],
        }));
        return request;
      },
      updateRequest: (requestId, status) =>
        setState((current) => {
          const request = current.requests.find((item) => item.id === requestId);
          const rides = current.rides.map((ride) => {
            if (!request || ride.id !== request.rideId) return ride;
            if (
              status === "aprovada" &&
              !ride.passengers.some((person) => person.id === request.passenger.id)
            )
              return {
                ...ride,
                seats: Math.max(0, ride.seats - 1),
                passengers: [...ride.passengers, request.passenger],
              };
            if (
              status === "cancelada" &&
              ride.passengers.some((person) => person.id === request.passenger.id)
            )
              return {
                ...ride,
                seats: Math.min(ride.totalSeats, ride.seats + 1),
                passengers: ride.passengers.filter((person) => person.id !== request.passenger.id),
              };
            return ride;
          });
          return {
            ...current,
            rides,
            requests: current.requests.map((item) =>
              item.id === requestId ? { ...item, status } : item,
            ),
            notifications: request
              ? [
                  {
                    id: Date.now(),
                    title:
                      status === "aprovada"
                        ? "Solicitação aprovada"
                        : status === "recusada"
                          ? "Solicitação recusada"
                          : "Solicitação atualizada",
                    text: `O estado da participação agora é: ${status}.`,
                    createdAt: "agora",
                    read: false,
                    target: "details",
                  },
                  ...current.notifications,
                ]
              : current.notifications,
          };
        }),
      updateOccurrence: (rideId, occurrenceId, patch) =>
        setState((current) => ({
          ...current,
          rides: current.rides.map((ride) =>
            ride.id === rideId
              ? {
                  ...ride,
                  occurrences: ride.occurrences.map((occurrence) =>
                    occurrence.id === occurrenceId ? { ...occurrence, ...patch } : occurrence,
                  ),
                }
              : ride,
          ),
          notifications: [
            {
              id: Date.now(),
              title:
                patch.status === "cancelada" ? "Ocorrência cancelada" : "Ocorrência atualizada",
              text: "A alteração afeta somente esta data da recorrência.",
              createdAt: "agora",
              read: false,
              target: "trips",
            },
            ...current.notifications,
          ],
        })),
      addMessage: (message) =>
        setState((current) => ({
          ...current,
          messages: [
            ...current.messages,
            {
              ...message,
              id: Date.now(),
              createdAt: formatTimeBR(new Date()),
              read: true,
            },
          ],
          notifications:
            message.senderId === me.id
              ? current.notifications
              : [
                  {
                    id: Date.now() + 1,
                    title: "Nova mensagem",
                    text: message.text,
                    createdAt: "agora",
                    read: false,
                    target: "messages",
                  },
                  ...current.notifications,
                ],
        })),
      addNotification: notify,
      markNotificationsRead: () =>
        setState((current) => ({
          ...current,
          notifications: current.notifications.map((item) => ({ ...item, read: true })),
        })),
      markNotificationRead: (id) =>
        setState((current) => ({
          ...current,
          notifications: current.notifications.map((item) =>
            item.id === id ? { ...item, read: true } : item,
          ),
        })),
      setPayment: (rideId, status, method) =>
        setState((current) => ({
          ...current,
          payments: { ...current.payments, [`ride-${rideId}`]: status },
          paymentMethods: method
            ? { ...current.paymentMethods, [`ride-${rideId}`]: method }
            : current.paymentMethods,
          notifications: [
            {
              id: Date.now(),
              title: "Pagamento atualizado",
              text: `O pagamento agora está: ${status}.`,
              createdAt: "agora",
              read: false,
              target: "payment",
            },
            ...current.notifications,
          ],
        })),
      addReview: (review) =>
        setState((current) => ({
          ...current,
          reviews: [...current.reviews, { ...review, id: Date.now() }],
        })),
      addReport: (report) =>
        setState((current) => ({
          ...current,
          reports: [
            ...current.reports,
            { ...report, id: Date.now(), createdAt: new Date().toISOString() },
          ],
        })),
      toggleBlock: (userId) =>
        setState((current) => ({
          ...current,
          blockedUserIds: current.blockedUserIds.includes(userId)
            ? current.blockedUserIds.filter((id) => id !== userId)
            : [...current.blockedUserIds, userId],
        })),
      leaveConversation: (conversationId) =>
        setState((current) => ({
          ...current,
          leftConversationIds: [...new Set([...current.leftConversationIds, conversationId])],
        })),
      updateProfile: (patch) =>
        setState((current) => ({ ...current, profile: { ...current.profile, ...patch } })),
      updatePreferences: (patch) =>
        setState((current) => ({ ...current, preferences: { ...current.preferences, ...patch } })),
    };
  }, [state, hydrated]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useAppStore must be used inside StoreProvider");
  return store;
}
