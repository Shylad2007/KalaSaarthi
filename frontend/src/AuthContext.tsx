// Auth context — stores user, role, token, profile
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiCall } from "./api";

interface AuthUser {
  id: number;
  email: string;
  role: "artisan" | "buyer";
  onboarding_complete: boolean;
  profile: any;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null, loading: true,
  login: () => {}, logout: () => {}, refreshUser: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      apiCall("/auth/me").then(setUser).catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const refreshUser = () => {
    if (token) apiCall("/auth/me").then(setUser).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
