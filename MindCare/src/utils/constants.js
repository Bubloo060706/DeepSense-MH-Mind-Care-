// ─────────────────────────────────────────────
//  Global Constants
// ─────────────────────────────────────────────

// Mood levels and their mapping
export const MOOD_LEVELS = {
  GREAT: { label: 'Great', icon: 'emoticon-happy-outline', score: 5, color: '#00E5A0' },
  GOOD: { label: 'Good', icon: 'emoticon-happy-outline', score: 4, color: '#66D9B0' },
  OKAY: { label: 'Okay', icon: 'emoticon-neutral-outline', score: 3, color: '#FFD166' },
  LOW: { label: 'Low', icon: 'emoticon-sad-outline', score: 2, color: '#FF8C42' },
  VERY_LOW: { label: 'Very Low', icon: 'emoticon-cry-outline', score: 1, color: '#FF3A5C' },
};

// Risk score ranges
export const RISK_LEVELS = {
  LOW: { min: 0, max: 20, label: 'Low', color: '#00E5A0' },
  MILD: { min: 21, max: 40, label: 'Mild', color: '#FFD166' },
  MODERATE: { min: 41, max: 60, label: 'Moderate', color: '#FF8C42' },
  SEVERE: { min: 61, max: 80, label: 'Severe', color: '#FF3A5C' },
  CRITICAL: { min: 81, max: 100, label: 'Critical', color: '#BF5AF2' },
};

// Time periods for data views
export const TIME_PERIODS = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

// PHQ-9 questions (Patient Health Questionnaire)
export const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself',
  'Trouble concentrating on things',
  'Moving or speaking so slowly that others have noticed',
  'Thoughts that you would be better off dead',
];

// Storage keys
export const STORAGE_KEYS = {
  USER_DATA: '@mindcare_user',
  MOOD_HISTORY: '@mindcare_moods',
  RISK_HISTORY: '@mindcare_risk',
  SETTINGS: '@mindcare_settings',
  AUTH_TOKEN: '@mindcare_token',
};

// Navigation screen names
export const SCREENS = {
  SPLASH: 'Splash',
  LOGIN: 'Login',
  ONBOARDING: 'Onboarding',
  HOME: 'Home',
  RISK_SCORE: 'RiskScore',
  PROFILE: 'Profile',
  ALERT: 'Alert',
  REMEDIES: 'Remedies',
  MOOD_LOG: 'MoodLog',
  SENSOR_DASHBOARD: 'SensorDashboard',
  HISTORY: 'History',
  PHQ9: 'PHQ9',
  SETTINGS: 'Settings',
};

export default {
  MOOD_LEVELS,
  RISK_LEVELS,
  TIME_PERIODS,
  PHQ9_QUESTIONS,
  STORAGE_KEYS,
  SCREENS,
};
