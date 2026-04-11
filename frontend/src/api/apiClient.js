import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Scores ────────────────────────────────────────────────────
export const postScore = (userId, score, features = {}) =>
  api.post("/scores", { user_id: userId, score, features });

export const getScores = (userId, limit = 30) =>
  api.get(`/scores/${userId}`, { params: { limit } });

export const getLatestScore = (userId) =>
  api.get(`/scores/${userId}/latest`);

// ── PHQ-9 ─────────────────────────────────────────────────────
export const submitPHQ = (userId, responses) =>
  api.post("/phq", { user_id: userId, responses });

export const getPHQHistory = (userId, limit = 20) =>
  api.get(`/phq/${userId}`, { params: { limit } });

// ── Trends ────────────────────────────────────────────────────
export const getTrends = (userId, days = 30) =>
  api.get(`/trends/${userId}`, { params: { days } });

export const getTrendSummary = (userId) =>
  api.get(`/trends/${userId}/summary`);

// ── Alerts ────────────────────────────────────────────────────
export const getAlerts = (userId, { limit = 20, unread = false } = {}) =>
  api.get(`/alerts/${userId}`, { params: { limit, unread } });

export const markAlertRead = (alertId) =>
  api.patch(`/alerts/${alertId}/read`);

export const markAllAlertsRead = (userId) =>
  api.patch(`/alerts/${userId}/read-all`);

export default api;