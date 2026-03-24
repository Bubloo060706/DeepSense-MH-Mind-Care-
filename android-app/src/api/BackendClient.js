import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * BackendClient.js
 *
 * Handles all communication from the Android app to the Flask backend.
 * Only sends derived features and risk scores — never raw sensor data.
 * Implements retry logic and offline queuing for unreliable connections.
 */

const BASE_URL     = "http://10.0.2.2:5000/api";   // Android emulator localhost
const MAX_RETRIES  = 3;
const RETRY_DELAY  = 2000;   // ms
const QUEUE_KEY    = "pending_sync_queue";

class BackendClient {
  constructor() {
    this.token      = null;
    this.userId     = null;
    this.isOnline   = true;
  }

  async init() {
    this.token  = await AsyncStorage.getItem("access_token");
    this.userId = await AsyncStorage.getItem("user_id");
  }

  // --- Auth ---
  async login(email, password) {
    const res = await this._post("/auth/login", { email, password }, false);
    if (res?.access_token) {
      this.token  = res.access_token;
      this.userId = res.user_id;
      await AsyncStorage.setItem("access_token", res.access_token);
      await AsyncStorage.setItem("user_id",      res.user_id);
      await AsyncStorage.setItem("user_role",    res.role);
    }
    return res;
  }

  async logout() {
    this.token  = null;
    this.userId = null;
    await AsyncStorage.multiRemove(["access_token", "user_id", "user_role"]);
  }

  // --- Risk Score Sync ---
  async submitRiskScore(scoreData) {
    if (!this.userId) await this.init();

    const payload = {
      user_id:      this.userId,
      score:        scoreData.score,
      window_start: scoreData.window_start,
      window_end:   scoreData.window_end,
    };

    try {
      const res = await this._post("/scores/", payload);
      console.log("[BackendClient] Score synced:", res?.id);
      return res;
    } catch (err) {
      // Queue for retry when back online
      await this._queueForRetry("score", payload);
      console.warn("[BackendClient] Score queued for retry:", err.message);
      return null;
    }
  }

  // --- PHQ-9 Sync ---
  async submitPhq(score) {
    if (!this.userId) await this.init();
    return this._post("/phq/", { user_id: this.userId, score });
  }

  // --- Fetch latest score from backend ---
  async getLatestScore() {
    if (!this.userId) await this.init();
    return this._get(`/scores/latest/${this.userId}`);
  }

  // --- Fetch weekly trend ---
  async getWeeklyTrend(weeks = 8) {
    if (!this.userId) await this.init();
    return this._get(`/trends/${this.userId}/weekly?weeks=${weeks}`);
  }

  // --- Fetch alerts ---
  async getAlerts(unreadOnly = false) {
    if (!this.userId) await this.init();
    return this._get(`/alerts/${this.userId}?unread_only=${unreadOnly}`);
  }

  // --- Flush pending queue ---
  async flushQueue() {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return;

    const queue = JSON.parse(raw);
    const failed = [];

    for (const item of queue) {
      try {
        if (item.type === "score") {
          await this._post("/scores/", item.payload);
          console.log("[BackendClient] Queued score flushed");
        }
      } catch {
        failed.push(item);
      }
    }

    if (failed.length) {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
    } else {
      await AsyncStorage.removeItem(QUEUE_KEY);
    }
  }

  // --- Internal helpers ---
  async _post(endpoint, body, withAuth = true) {
    return this._request("POST", endpoint, body, withAuth);
  }

  async _get(endpoint, withAuth = true) {
    return this._request("GET", endpoint, null, withAuth);
  }

  async _request(method, endpoint, body = null, withAuth = true, attempt = 1) {
    const headers = { "Content-Type": "application/json" };
    if (withAuth && this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
      const res  = await fetch(`${BASE_URL}${endpoint}`, options);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      return data;
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        await _sleep(RETRY_DELAY * attempt);
        return this._request(method, endpoint, body, withAuth, attempt + 1);
      }
      throw err;
    }
  }

  async _queueForRetry(type, payload) {
    const raw   = await AsyncStorage.getItem(QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push({ type, payload, queuedAt: new Date().toISOString() });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }
}

function _sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default new BackendClient();