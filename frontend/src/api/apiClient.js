import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const login = (email, password) =>
  apiClient.post("/auth/login", { email, password });

// --- Scores ---
export const getRiskScores = (userId, limit = 30) =>
  apiClient.get(`/scores/${userId}?limit=${limit}`);

export const getLatestScore = (userId) =>
  apiClient.get(`/scores/latest/${userId}`);

export const submitScore = (payload) =>
  apiClient.post("/scores/", payload);

// --- PHQ-9 ---
export const getPhqHistory = (userId, limit = 10) =>
  apiClient.get(`/phq/${userId}?limit=${limit}`);

export const getLatestPhq = (userId) =>
  apiClient.get(`/phq/latest/${userId}`);

export const submitPhq = (userId, score) =>
  apiClient.post("/phq/", { user_id: userId, score });

// --- Trends ---
export const getWeeklyTrend = (userId, weeks = 8) =>
  apiClient.get(`/trends/${userId}/weekly?weeks=${weeks}`);

export const getPhqCorrelation = (userId) =>
  apiClient.get(`/trends/${userId}/phq-correlation`);

export const getFeatureSummary = (userId) =>
  apiClient.get(`/trends/${userId}/feature-summary`);

// --- Alerts ---
export const getAlerts = (userId, unreadOnly = false) =>
  apiClient.get(`/alerts/${userId}?unread_only=${unreadOnly}`);

export const getUnreadCount = (userId) =>
  apiClient.get(`/alerts/${userId}/count`);

export const markAlertRead = (alertId) =>
  apiClient.patch(`/alerts/${alertId}/read`);

export const markAllAlertsRead = (userId) =>
  apiClient.patch(`/alerts/${userId}/read-all`);

export default apiClient;