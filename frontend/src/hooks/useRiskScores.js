import { useState, useEffect, useCallback } from "react";
import {
  getRiskScores,
  getLatestScore,
  getWeeklyTrend,
  getPhqCorrelation,
  getFeatureSummary,
} from "../api/apiClient";

export const useRiskScores = (userId, limit = 30) => {
  const [scores,       setScores]       = useState([]);
  const [latestScore,  setLatestScore]  = useState(null);
  const [weeklyTrend,  setWeeklyTrend]  = useState([]);
  const [phqCorr,      setPhqCorr]      = useState([]);
  const [featureSummary, setFeatureSummary] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const [
        scoresRes,
        latestRes,
        trendRes,
        corrRes,
        summaryRes,
      ] = await Promise.all([
        getRiskScores(userId, limit),
        getLatestScore(userId),
        getWeeklyTrend(userId, 8),
        getPhqCorrelation(userId),
        getFeatureSummary(userId),
      ]);

      setScores(scoresRes.data);
      setLatestScore(latestRes.data);
      setWeeklyTrend(trendRes.data);
      setPhqCorr(corrRes.data);
      setFeatureSummary(summaryRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch risk data");
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Derive severity color for UI
  const severityColor = (score) => {
    if (score == null) return "#888";
    if (score >= 0.65)  return "#e53e3e";  // red
    if (score >= 0.30)  return "#dd6b20";  // orange
    return "#38a169";                       // green
  };

  return {
    scores,
    latestScore,
    weeklyTrend,
    phqCorr,
    featureSummary,
    loading,
    error,
    refetch: fetchAll,
    severityColor,
  };
};