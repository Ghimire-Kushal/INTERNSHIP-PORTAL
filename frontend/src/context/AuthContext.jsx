import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { AUTH_SESSION_CLEARED_EVENT, clearStoredSession } from "../services/api";

const AuthContext = createContext(null);
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("accessToken")));
  const saveUser = useCallback((value) => { localStorage.setItem("user", JSON.stringify(value)); setUser(value); }, []);
  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  }, []);
  const login = async (credentials) => {
    const { data } = await api.post("/auth/login/", credentials);
    localStorage.setItem("accessToken", data.access); localStorage.setItem("refreshToken", data.refresh);
    try {
      const profile = await api.get("/auth/profile/"); saveUser(profile.data); return profile.data;
    } catch (error) {
      logout();
      throw error;
    }
  };
  const register = (payload) => api.post("/auth/register/", payload);
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) { setLoading(false); return undefined; }
    api.get("/auth/profile/").then(({ data }) => saveUser(data)).catch(logout).finally(() => setLoading(false));
    return undefined;
  }, [logout, saveUser]);
  useEffect(() => {
    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, logout);
    return () => window.removeEventListener(AUTH_SESSION_CLEARED_EVENT, logout);
  }, [logout]);
  const value = useMemo(() => ({ user, loading, login, register, logout, updateUser: saveUser, isAuthenticated: Boolean(user) }), [user, loading, logout, saveUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
