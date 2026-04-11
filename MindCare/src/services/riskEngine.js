// ─────────────────────────────────────────────
//  Risk Engine Service (Demo - Mocked calculations)
// ─────────────────────────────────────────────

import { RISK_LEVELS, MOOD_LEVELS } from '../utils/constants';
import { calculateRiskScore } from '../utils/helpers';

class RiskEngine {
  /**
   * Analyze mood trend
   */
  analyzeMoodTrend(moodHistory) {
    if (!moodHistory || moodHistory.length === 0) {
      return { trend: 'neutral', change: 0, average: 3 };
    }

    const scores = moodHistory.map((m) => m.score);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (scores.length > 1) {
      const recent = scores.slice(-3);
      const older = scores.slice(0, Math.ceil(scores.length / 2));
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      const change = recentAvg - olderAvg;
      
      return {
        trend: change > 0.5 ? 'improving' : change < -0.5 ? 'declining' : 'stable',
        change: Math.round(change * 100) / 100,
        average: Math.round(average * 100) / 100,
      };
    }

    return { trend: 'neutral', change: 0, average };
  }

  /**
   * Calculate risk based on multiple factors
   */
  calculateComprehensiveRisk(moodHistory, phq9Score, sensorData = null) {
    let risk = 0;
    const factors = {};

    // Mood factor (40% weight)
    if (moodHistory && moodHistory.length > 0) {
      const avgMood = moodHistory.reduce((sum, m) => sum + m.score, 0) / moodHistory.length;
      const moodRisk = (1 - avgMood / 5) * 100;
      factors.mood = Math.round(moodRisk * 0.4);
      risk += factors.mood;
    }

    // PHQ-9 factor (40% weight)
    if (phq9Score !== undefined && phq9Score !== null) {
      const phq9Risk = (phq9Score / 27) * 100; // Max PHQ-9 is 27
      factors.phq9 = Math.round(phq9Risk * 0.4);
      risk += factors.phq9;
    }

    // Sensor factor (20% weight) - mocked data
    if (sensorData) {
      const stressLevel = sensorData.stressLevel || 50;
      factors.stress = Math.round((stressLevel / 100) * 20);
      risk += factors.stress;
    } else {
      // Default 10 points
      factors.stress = 10;
      risk += 10;
    }

    return {
      score: Math.min(100, Math.round(risk)),
      factors,
      level: this.getRiskLevel(Math.min(100, Math.round(risk))),
    };
  }

  /**
   * Get risk level from score
   */
  getRiskLevel(score) {
    return Object.values(RISK_LEVELS).find((r) => score >= r.min && score <= r.max)
      || RISK_LEVELS.LOW;
  }

  /**
   * Generate alerts based on risk
   */
  generateAlerts(riskScore, moodTrend) {
    const alerts = [];

    if (riskScore >= 80) {
      alerts.push({
        id: 'alert_critical',
        level: 'CRITICAL',
        icon: 'phone-alert',
        title: 'Immediate Support Needed',
        message: 'Please consider contacting a mental health professional',
        action: 'Contact Support',
      });
    } else if (riskScore >= 60) {
      alerts.push({
        id: 'alert_severe',
        level: 'SEVERE',
        icon: 'alert-circle-outline',
        title: 'Support Recommended',
        message: 'Consider reaching out for professional guidance',
        action: 'View Resources',
      });
    } else if (riskScore >= 40 && moodTrend?.trend === 'declining') {
      alerts.push({
        id: 'alert_declining',
        level: 'WARNING',
        icon: 'lightning-bolt',
        title: 'Mood Declining',
        message: 'Your mood has been declining. Consider self-care activities.',
        action: 'View Remedies',
      });
    }

    return alerts;
  }

  /**
   * Get personalized recommendations
   */
  getRecommendations(riskLevel, moodTrend) {
    const baseRecommendations = {
      Low: [
        '✨ Maintain your current wellness routine',
        'Continue with regular physical activity',
        'Practice daily mindfulness or meditation',
        'Keep strong social connections',
      ],
      Mild: [
        'Try daily journaling to track your feelings',
        'Increase physical activity to 30+ min/day',
        'Reach out to friends or family members',
        'Engage in activities you enjoy',
      ],
      Moderate: [
        'Talk to a counselor or therapist',
        'Establish a consistent sleep schedule',
        'Practice stress management techniques',
        'Use mental health apps for support',
      ],
      Severe: [
        'Contact a mental health professional immediately',
        'Crisis support: Call 1-800-273-8255 (US)',
        'Consider scheduling a therapy session',
        'Reach out to trusted friends or family',
      ],
      Critical: [
        'Please seek immediate professional help',
        'National Suicide Prevention Lifeline: 988',
        'Visit your nearest emergency room if needed',
        'Contact someone you trust right now',
      ],
    };

    const recs = baseRecommendations[riskLevel] || baseRecommendations.Low;

    if (moodTrend?.trend === 'declining') {
      recs.push('Focus on activities that boost your mood');
    }

    return recs;
  }
}

export default new RiskEngine();
