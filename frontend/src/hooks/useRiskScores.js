import { useState, useEffect, useCallback } from "react";
import { getScores, getLatestScore, getTrends } from "../api/apiClient";

export function useRiskScores(userId, options = {}) {
  const { limit = 30, days = 30, autoRefresh = false, refreshInterval = 60000 } = options;

  const [scores, setScores] = useState([]);
  const [latestScore, setLatestScore] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [scoresRes, latestRes, trendsRes] = await Promise.all([
        getScores(userId, limit),
        getLatestScore(userId),
        getTrends(userId, days),
      ]);
      setScores(scoresRes.data);
      setLatestScore(latestRes.data);
      setTrends(trendsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load risk scores.");
    } finally {
      setLoading(false);
    }
  }, [userId, limit, days]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchAll, refreshInterval);
    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval, fetchAll]);

  return { scores, latestScore, trends, loading, error, refetch: fetchAll };
}

export function useLatestScore(userId) {
  const [latestScore, setLatestScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getLatestScore(userId)
      .then((res) => setLatestScore(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load score."))
      .finally(() => setLoading(false));
  }, [userId]);

  return { latestScore, loading, error };
}