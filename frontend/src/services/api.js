import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api" });

export const AUTH_SESSION_CLEARED_EVENT = "careerbridge:session-cleared";

export function clearStoredSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT));
}

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const refreshToken = localStorage.getItem("refreshToken");
    const isAuthenticationRequest = request?.url?.includes("/auth/login/") || request?.url?.includes("/auth/token/refresh/");
    if (error.response?.status !== 401 || request?._retried || !refreshToken || isAuthenticationRequest) return Promise.reject(error);
    request._retried = true;
    try {
      refreshPromise ??= axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, { refresh: refreshToken });
      const { data } = await refreshPromise;
      localStorage.setItem("accessToken", data.access);
      if (data.refresh) localStorage.setItem("refreshToken", data.refresh);
      request.headers.Authorization = `Bearer ${data.access}`;
      return api(request);
    } catch (refreshError) {
      clearStoredSession();
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  },
);

export default api;
