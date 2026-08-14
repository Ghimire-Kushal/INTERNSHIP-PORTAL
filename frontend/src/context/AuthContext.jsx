import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
const getStoredUser = () => JSON.parse(localStorage.getItem("user") || "null");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("accessToken")));
  const saveUser = (value) => { localStorage.setItem("user", JSON.stringify(value)); setUser(value); };
  const logout = () => { localStorage.removeItem("accessToken"); localStorage.removeItem("refreshToken"); localStorage.removeItem("user"); setUser(null); };
  const login = async (credentials) => {
    const { data } = await api.post("/auth/login/", credentials);
    localStorage.setItem("accessToken", data.access); localStorage.setItem("refreshToken", data.refresh);
    const profile = await api.get("/auth/profile/"); saveUser(profile.data); return profile.data;
  };
  const register = (payload) => api.post("/auth/register/", payload);
  useEffect(() => { if (!localStorage.getItem("accessToken")) { setLoading(false); return; } api.get("/auth/profile/").then(({ data }) => saveUser(data)).catch(logout).finally(() => setLoading(false)); }, []);
  const value = useMemo(() => ({ user, loading, login, register, logout, isAuthenticated: Boolean(user) }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
