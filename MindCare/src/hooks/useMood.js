// ─────────────────────────────────────────────
//  useMood Hook
// ─────────────────────────────────────────────

import { useContext, useCallback, useState, useEffect } from 'react';
import { AppStateContext } from '../store';
import APIService from '../services/api';
import { generateMoodEntry } from '../utils/helpers';
import { MOOD_LEVELS } from '../utils/constants';

export const useMood = () => {
  const { state, addMoodEntry, setMoodHistory } = useContext(AppStateContext);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMoodHistory = useCallback(async (days = 7) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await APIService.getMoodHistory(days);
      
      if (response.success) {
        setMoodHistory(response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch mood history');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setMoodHistory]);

  const recordMood = useCallback(async (moodLabel, note = '') => {
    setIsLoading(true);
    setError(null);

    try {
      const moodLevel = Object.values(MOOD_LEVELS).find((m) => m.label === moodLabel);
      
      if (!moodLevel) {
        throw new Error('Invalid mood level');
      }

      const moodEntry = generateMoodEntry(moodLevel);
      moodEntry.note = note;

      const response = await APIService.saveMood(moodEntry);

      if (response.success) {
        addMoodEntry(response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to save mood');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addMoodEntry]);

  const getMoodTrend = useCallback(() => {
    const history = state.mood.history;
    if (!history || history.length === 0) {
      return { trend: 'neutral', average: 0 };
    }

    const scores = history.map((m) => m.score);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (history.length > 1) {
      const recent = scores.slice(-3);
      const older = scores.slice(0, Math.ceil(scores.length / 2));
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      const change = recentAvg - olderAvg;

      return {
        trend: change > 0.5 ? 'improving' : change < -0.5 ? 'declining' : 'stable',
        average: Math.round(average * 100) / 100,
        change: Math.round(change * 100) / 100,
      };
    }

    return { trend: 'neutral', average: Math.round(average * 100) / 100 };
  }, [state.mood.history]);

  return {
    history: state.mood.history,
    current: state.mood.current,
    isLoading,
    error,
    fetchMoodHistory,
    recordMood,
    getMoodTrend,
  };
};

export default useMood;
