import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authStorage } from "./store";

type AuthContextValue = {
  logged: boolean | null;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [logged, setLogged] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    authStorage.getLogged().then((value) => {
      if (!cancelled) setLogged(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(() => {
    setLogged(true);
    void authStorage.setLogged(true);
  }, []);

  const logout = useCallback(() => {
    setLogged(false);
    void authStorage.setLogged(false);
  }, []);

  const value = useMemo(() => ({ logged, login, logout }), [logged, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth must be used inside AuthProvider");
  return auth;
}
