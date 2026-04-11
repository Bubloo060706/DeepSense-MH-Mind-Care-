import { useState, useEffect, useCallback } from "react";
import { getAlerts, markAlertRead, markAllAlertsRead } from "../api/apiClient";

export function useAlerts(userId, options = {}) {
  const { limit = 20, unreadOnly = false, autoRefresh = true, refreshInterval = 30000 } = options;

  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAlerts(userId, { limit, unread: unreadOnly });
      const data = res.data;
      setAlerts(data);
      setUnreadCount(data.filter((a) => !a.is_read).length);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  }, [userId, limit, unreadOnly]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchAlerts, refreshInterval);
    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval, fetchAlerts]);

  const dismissAlert = useCallback(async (alertId) => {
    try {
      await markAlertRead(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_read: 1 } : a))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark alert as read:", err);
    }
  }, []);

  const dismissAll = useCallback(async () => {
    try {
      await markAllAlertsRead(userId);
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all alerts as read:", err);
    }
  }, [userId]);

  return { alerts, unreadCount, loading, error, dismissAlert, dismissAll, refetch: fetchAlerts };
}