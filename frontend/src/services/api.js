import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api" });

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
    if (error.response?.status !== 401 || request?._retried || !refreshToken) return Promise.reject(error);
    request._retried = true;
    try {
      const { data } = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, { refresh: refreshToken });
      localStorage.setItem("accessToken", data.access);
      request.headers.Authorization = `Bearer ${data.access}`;
      return api(request);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return Promise.reject(refreshError);
    }
  },
);

export default api;
