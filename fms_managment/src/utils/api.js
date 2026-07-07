import axios from "axios";
import Cookies from "js-cookie";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: apiBaseUrl,
});

/* -----------------------------
   REQUEST INTERCEPTOR
--------------------------------*/

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (err) => Promise.reject(err),
);

/* -----------------------------
   RESPONSE INTERCEPTOR (FIXED)
--------------------------------*/

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      const status = err.response.status;

      // ❌ Do NOT redirect during login
      if (status === 401 && !err.config.url.includes("/")) {
        console.log("Unauthorized request");

        const refreshToken = Cookies.get("refresh_token");

        // Only logout if both tokens missing
        if (!refreshToken) {
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          Cookies.remove("username");
          Cookies.remove("position");
          window.location.href = "/";
        }
      }

      // ❌ Do NOT force logout on 403
      if (status === 403) {
        console.warn("Permission denied:", err.response.data);
      }
    }

    return Promise.reject(err);
  },
);

export default api;
