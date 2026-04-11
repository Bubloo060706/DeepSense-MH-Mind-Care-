/**
 * Icon mappings for the app
 * Maps emoji/label usage to proper Material Design icon names
 */

export const ICON_NAMES = {
  // Navigation icons
  home: 'home-outline',
  pulse: 'pulse',
  alerts: 'alert-circle-outline',
  history: 'history',
  profile: 'account-circle-outline',

  // Navigation focused
  homeFilled: 'home',
  pulseFilled: 'pulse',
  alertsFilled: 'alert-circle',
  historyFilled: 'history',
  profileFilled: 'account-circle',

  // Common actions
  settings: 'cog-outline',
  menu: 'menu',
  close: 'close',
  back: 'chevron-left',
  forward: 'chevron-right',
  search: 'magnify',

  // Health & Mood
  mood: 'emoticon-happy-outline',
  moodLog: 'emoticon-outline',
  health: 'heart-outline',
  healthFilled: 'heart',
  phq: 'clipboard-list-outline',
  checklist: 'clipboard-check-outline',

  // Monitoring & Data
  monitoring: 'satellite-uplink',
  sensors: 'speedometer',
  bluetooth: 'bluetooth',
  wifi: 'wifi',
  chart: 'chart-line',
  chartBar: 'chart-bar',
  gauge: 'gauge',

  // Features
  steps: 'walk',
  sleep: 'sleep',
  screenTime: 'phone',
  phone: 'phone-outline',
  home_location: 'home-map-marker',
  social: 'phone-in-talk',
  calls: 'phone-incoming',

  // Medical & Health
  clinic: 'hospital-box',
  clinician: 'hospital-box-outline',
  medicine: 'pill',
  medical: 'medical-bag',
  doctor: 'stethoscope',
  biometric: 'fingerprint',

  // Security & Privacy
  security: 'lock-outline',
  privacy: 'shield-outline',
  biometrics: 'fingerprint',
  authentication: 'lock-check-outline',

  // Themes & Appearance
  appearance: 'palette-outline',
  darkMode: 'moon-waning-crescent',
  themes: 'palette',

  // Export & Data
  export: 'export',
  download: 'download',
  delete: 'delete-outline',
  trash: 'trash-can-outline',

  // Alerts & Notifications
  notification: 'bell-outline',
  notificationFilled: 'bell',
  alert: 'alert-circle-outline',
  alertFilled: 'alert-circle',
  warning: 'alert-outline',

  // Status indicators
  success: 'check-circle-outline',
  successFilled: 'check-circle',
  error: 'close-circle-outline',
  errorFilled: 'close-circle',
  info: 'information-outline',
  infoFilled: 'information',

  // Mood states (emojis)
  healthy: 'emoticon-happy-outline', // 😄
  mild: 'emoticon-neutral-outline', // 😊
  moderate: 'emoticon-confused-outline', // 😐
  severe: 'emoticon-sad-outline', // 😔
  critical: 'emoticon-cry-outline', // 😢

  // Resources & Help
  help: 'help-circle-outline',
  crisis: 'phone-alert',
  support: 'heart-multiple',
  emergency: 'phone-emergency',

  // Remedies & Activities
  exercise: 'run-fast',
  walk: 'walk',
  outdoor: 'tree',
  music: 'music',
  meditation: 'flower',
  breathing: 'lung',
  journal: 'notebook-outline',
  mindfulness: 'spa',

  // Simulation & Debug
  simulation: 'play-circle-outline',
  debug: 'bug-outline',
  test: 'flask-outline',

  // Additional
  info_circle: 'information-outline',
  door: 'door-open',
  logout: 'logout',
  signout: 'logout',
  calendar: 'calendar-outline',
  clock: 'clock-outline',
  time: 'alarm-outline',
};

/**
 * Get icon name by emoji or label
 * @param {string} emojiOrLabel - The emoji or text label
 * @returns {string} - Icon name from MaterialCommunityIcons
 */
export const getIconName = (emojiOrLabel) => {
  const emojiMap = {
    // Mood emojis
    '😊': ICON_NAMES.mood,
    '😄': ICON_NAMES.healthy,
    '😐': ICON_NAMES.moderate,
    '😔': ICON_NAMES.severe,
    '😢': ICON_NAMES.critical,
    '😌': ICON_NAMES.mindfulness,

    // Activity emojis
    '🚶': ICON_NAMES.walk,
    '🌙': ICON_NAMES.sleep,
    '📱': ICON_NAMES.phone,
    '🏠': ICON_NAMES.home_location,
    '📞': ICON_NAMES.calls,

    // Feature emojis
    '📅': ICON_NAMES.calendar,
    '📊': ICON_NAMES.chartBar,
    '📈': ICON_NAMES.chart,
    '📋': ICON_NAMES.phq,
    '📡': ICON_NAMES.monitoring,

    // Icon emojis
    '🔔': ICON_NAMES.notification,
    '🩺': ICON_NAMES.doctor,
    '🔐': ICON_NAMES.security,
    '⚙️': ICON_NAMES.settings,
    '💊': ICON_NAMES.medicine,
    '🎭': ICON_NAMES.themes,
    '👤': ICON_NAMES.profile,
    '🎨': ICON_NAMES.appearance,
    '🔒': ICON_NAMES.security,
    'ℹ️': ICON_NAMES.info,
    '🚪': ICON_NAMES.door,
    '✅': ICON_NAMES.successFilled,
    '✓': ICON_NAMES.success,
    '❌': ICON_NAMES.error,
    '🚨': ICON_NAMES.emergency,
    '👋': ICON_NAMES.help,
    '♡': ICON_NAMES.health,
    '📲': ICON_NAMES.phone,
    '🎯': ICON_NAMES.alert,
    '🎵': ICON_NAMES.music,
    '🌈': ICON_NAMES.themes,

    // Navigation/UI symbols
    '‹': ICON_NAMES.back,
    '›': ICON_NAMES.forward,
    '→': ICON_NAMES.forward,
    '↑': ICON_NAMES.search,
  };

  return emojiMap[emojiOrLabel] || ICON_NAMES[emojiOrLabel] || 'help-circle-outline';
};

/**
 * Alternative text-based icons for fallback
 */
export const TEXT_ICONS = {
  home: '⬡',
  homeFilled: '⬢',
  pulse: '●',
  pulseFilled: '◉',
  alerts: '▲',
  alertsFilled: '△',
  history: '▰',
  historyFilled: '▱',
  profile: '◎',
  profileFilled: '●',
  forward: '›',
  back: '‹',
  check: '✓',
  checkFilled: '✅',
  close: '✕',
  closeFilled: '❌',
  heart: '♡',
  heartFilled: '♥',
};
