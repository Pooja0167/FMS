import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // Unauthorized
      if (status === 401) {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        Cookies.remove("username");
        Cookies.remove("position");

        window.location.href = "/";
      }

      // Forbidden
      if (status === 403) {
        console.warn("Permission Denied");
      }
    }

    return Promise.reject(error);
  }
);

export default api;