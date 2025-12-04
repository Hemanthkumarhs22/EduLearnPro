import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import type { User } from "../types";

interface Credentials {
  email: string;
  password: string;
}

interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role: "student" | "instructor";
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("edulearn_token"));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<User>('/auth/me');
      setUser(data);
    } catch (error) {
      localStorage.removeItem("edulearn_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = useCallback(
    async ({ email, password }: Credentials) => {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const { data: tokenResponse } = await api.post<{ access_token: string }>("/auth/token", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("edulearn_token", tokenResponse.access_token);
      setToken(tokenResponse.access_token);

      const { data: profile } = await api.get<User>("/auth/me");
      setUser(profile);
      navigate(profile.role === "instructor" ? "/instructor" : "/student", { replace: true });
    },
    [navigate]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { data } = await api.post<{ token: { access_token: string }; user: User }>("/auth/register", payload);
      localStorage.setItem("edulearn_token", data.token.access_token);
      setToken(data.token.access_token);
      setUser(data.user);
      navigate(data.user.role === "instructor" ? "/instructor" : "/student", { replace: true });
    },
    [navigate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("edulearn_token");
    setToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
