// ─────────────────────────────────────────────
//  MindPulse Design System
//  Aesthetic: Deep-space clinical + warm human
// ─────────────────────────────────────────────

export const COLORS = {
  // Primary palette
  deepSpace: '#0A0E1A',
  midnight: '#0F1629',
  navyCard: '#131C35',
  cardSurface: '#1A2340',
  cardBorder: '#243058',

  // Accent spectrum (risk levels map to these)
  safeGreen: '#00E5A0',
  safeGreenDim: '#00E5A020',
  mildYellow: '#FFD166',
  mildYellowDim: '#FFD16620',
  moderateOrange: '#FF8C42',
  moderateOrangeDim: '#FF8C4220',
  severeRed: '#FF3A5C',
  severeRedDim: '#FF3A5C20',
  criticalPurple: '#BF5AF2',
  criticalPurpleDim: '#BF5AF220',

  // UI grays
  textPrimary: '#EEF2FF',
  textSecondary: '#8A94B8',
  textMuted: '#4A5478',
  divider: '#1F2A4A',

  // Gradients (used as arrays)
  gradientPrimary: ['#0A0E1A', '#131C35'],
  gradientAccent: ['#00E5A0', '#0099FF'],
  gradientCard: ['#1A2340', '#131C35'],
  gradientSafe: ['#00E5A0', '#00B4D8'],
  gradientMild: ['#FFD166', '#FF8C42'],
  gradientModerate: ['#FF8C42', '#FF3A5C'],
  gradientSevere: ['#FF3A5C', '#BF5AF2'],
  gradientHeader: ['#0F1629', '#0A0E1A'],

  // Transparent overlays
  overlay: 'rgba(10, 14, 26, 0.85)',
  overlayLight: 'rgba(255,255,255,0.04)',
  glassCard: 'rgba(26, 35, 64, 0.8)',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const FONTS = {
  // React Native uses system fonts; these map to available ones
  displayBold: 'serif',       // will fallback to serif
  displayMedium: 'serif',
  bodyRegular: 'System',
  bodyMedium: 'System',
  mono: 'Courier',

  // Weights
  weightLight: '300',
  weightRegular: '400',
  weightMedium: '500',
  weightSemiBold: '600',
  weightBold: '700',
  weightBlack: '900',
};

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Typography
  caption: 11,
  small: 13,
  body: 15,
  bodyLg: 17,
  subtitle: 19,
  title: 22,
  heading: 26,
  display: 32,
  hero: 42,
  mega: 56,

  // Radius
  radiusSm: 8,
  radiusMd: 14,
  radiusLg: 20,
  radiusXl: 28,
  radiusFull: 999,

  // Screen
  screenPadding: 20,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  }),
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
};

// Risk level config — single source of truth
export const RISK_LEVELS = {
  none: {
    label: 'No Risk',
    shortLabel: 'Healthy',
    score: 0,
    color: COLORS.safeGreen,
    dimColor: COLORS.safeGreenDim,
    gradient: COLORS.gradientSafe,
    icon: 'checkmark-circle',
    description: 'Your behavioral patterns indicate excellent mental wellness.',
    phq: '0–4',
  },
  mild: {
    label: 'Mild',
    shortLabel: 'Mild',
    score: 25,
    color: COLORS.mildYellow,
    dimColor: COLORS.mildYellowDim,
    gradient: COLORS.gradientMild,
    icon: 'sunny',
    description: 'Slight changes detected. Keep monitoring and practice self-care.',
    phq: '5–9',
  },
  moderate: {
    label: 'Moderate',
    shortLabel: 'Moderate',
    score: 55,
    color: COLORS.moderateOrange,
    dimColor: COLORS.moderateOrangeDim,
    gradient: COLORS.gradientModerate,
    icon: 'alert-circle',
    description: 'Behavioral shifts noticed. Consider speaking with someone you trust.',
    phq: '10–14',
  },
  severe: {
    label: 'Severe',
    shortLabel: 'Severe',
    score: 78,
    color: COLORS.severeRed,
    dimColor: COLORS.severeRedDim,
    gradient: COLORS.gradientSevere,
    icon: 'warning',
    description: 'Significant risk detected. Clinician has been notified.',
    phq: '15–19',
  },
  critical: {
    label: 'Critical',
    shortLabel: 'Critical',
    score: 93,
    color: COLORS.criticalPurple,
    dimColor: COLORS.criticalPurpleDim,
    gradient: ['#BF5AF2', '#FF3A5C'],
    icon: 'alert',
    description: 'Immediate support needed. Please contact a professional now.',
    phq: '20–27',
  },
};

export const getRiskLevel = (score) => {
  if (score < 15) return RISK_LEVELS.none;
  if (score < 40) return RISK_LEVELS.mild;
  if (score < 65) return RISK_LEVELS.moderate;
  if (score < 85) return RISK_LEVELS.severe;
  return RISK_LEVELS.critical;
};

// Simulated sensor data helper
export const DEMO_SCENARIOS = {
  healthy: {
    label: 'Healthy User',
    riskScore: 8,
    steps: 9400,
    sleepHours: 7.8,
    screenTime: 2.3,
    locationEntropy: 'High',
    socialCalls: 5,
    homePct: 38,
  },
  mild: {
    label: 'Mild Risk',
    riskScore: 32,
    steps: 5200,
    sleepHours: 6.1,
    screenTime: 4.8,
    locationEntropy: 'Medium',
    socialCalls: 2,
    homePct: 62,
  },
  moderate: {
    label: 'Moderate Risk',
    riskScore: 58,
    steps: 2800,
    sleepHours: 5.0,
    screenTime: 7.2,
    locationEntropy: 'Low',
    socialCalls: 1,
    homePct: 81,
  },
  severe: {
    label: 'Severe Risk',
    riskScore: 79,
    steps: 800,
    sleepHours: 3.5,
    screenTime: 10.1,
    locationEntropy: 'Very Low',
    socialCalls: 0,
    homePct: 96,
  },
  critical: {
    label: 'Critical',
    riskScore: 94,
    steps: 200,
    sleepHours: 2.0,
    screenTime: 13.5,
    locationEntropy: 'Minimal',
    socialCalls: 0,
    homePct: 99,
  },
};
