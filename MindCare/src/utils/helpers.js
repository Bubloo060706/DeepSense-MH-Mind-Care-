// ─────────────────────────────────────────────
//  Helper Utilities
// ─────────────────────────────────────────────

import { RISK_LEVELS, MOOD_LEVELS } from './constants';

/**
 * Get risk level object from score
 */
export const getRiskLevel = (score) => {
  const level = Object.values(RISK_LEVELS).find(
    (r) => score >= r.min && score <= r.max
  );
  return level || RISK_LEVELS.LOW;
};

/**
 * Calculate risk score (demo: mocked calculation)
 */
export const calculateRiskScore = (moodHistory, phq9Score) => {
  // Mock calculation for demo
  const avgMood = moodHistory && moodHistory.length > 0
    ? moodHistory.reduce((sum, m) => sum + m.score, 0) / moodHistory.length
    : 3;
  
  const moodFactorScore = (1 - (avgMood / 5)) * 40; // Lower mood = higher risk
  const phq9Factor = (phq9Score || 0) * 0.6; // PHQ-9 weight
  
  const score = Math.min(100, Math.round(moodFactorScore + phq9Factor));
  return Math.max(0, score);
};

/**
 * Format timestamp to human readable
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format date to human readable
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const today = new Date();
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

/**
 * Get PHQ-9 score category
 */
export const getPHQ9Category = (score) => {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  if (score <= 19) return 'Moderately Severe';
  return 'Severe';
};

/**
 * Mock sensor data generator (for demo)
 */
export const generateMockSensorData = () => {
  return {
    heartRate: Math.floor(Math.random() * 40 + 60),
    steps: Math.floor(Math.random() * 5000 + 2000),
    sleepHours: (Math.random() * 3 + 5).toFixed(1),
    activityLevel: Math.floor(Math.random() * 100),
    stressLevel: Math.floor(Math.random() * 100),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Generate mock mood entry
 */
export const generateMoodEntry = (moodLevel) => {
  return {
    id: `mood_${Date.now()}`,
    emoji: moodLevel.emoji,
    label: moodLevel.label,
    score: moodLevel.score,
    note: '',
    ts: new Date().toISOString(),
  };
};

export default {
  getRiskLevel,
  calculateRiskScore,
  formatTime,
  formatDate,
  getPHQ9Category,
  generateMockSensorData,
  generateMoodEntry,
};
