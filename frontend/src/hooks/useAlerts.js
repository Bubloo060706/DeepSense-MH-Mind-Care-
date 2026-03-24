import { useState, useEffect, useCallback } from "react";
import {
  getAlerts,
  getUnreadCount,
  markAlertRead,
  markAllAlertsRead,
} from "../api/apiClient";

export const useAlerts = (userId) => {
  const [alerts,      setAlerts]      = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const fetchAlerts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const [alertsRes, countRes] = await Promise.all([
        getAlerts(userId),
        getUnreadCount(userId),
      ]);
      setAlerts(alertsRes.data);
      setUnreadCount(countRes.data.unread_count);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAlerts();
    // Poll for new alerts every 60 seconds
    const interval = setInterval(fetchAlerts, 60_000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleMarkRead = async (alertId) => {
    try {
      await markAlertRead(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark alert as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAlertsRead(userId);
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all alerts as read:", err);
    }
  };

  // Severity badge color
  const severityColor = (severity) => {
    switch (severity) {
      case "high":   return { bg: "#fff5f5", text: "#c53030", border: "#fc8181" };
      case "medium": return { bg: "#fffaf0", text: "#c05621", border: "#f6ad55" };
      default:       return { bg: "#f0fff4", text: "#276749", border: "#68d391" };
    }
  };

  return {
    alerts,
    unreadCount,
    loading,
    error,
    refetch:          fetchAlerts,
    handleMarkRead,
    handleMarkAllRead,
    severityColor,
  };
};