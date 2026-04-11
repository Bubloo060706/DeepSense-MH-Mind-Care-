// ─────────────────────────────────────────────
//  Environment Configuration
//  For demo purposes only - no real backend
// ─────────────────────────────────────────────

export const ENV = {
  // API endpoints (demo - not functional)
  API_URL: 'https://api.mindcare.demo',
  BACKUP_API_URL: 'https://backup.mindcare.demo',
  
  // Feature flags
  ENABLE_SENSOR_DATA: false, // Demo: data is mocked
  ENABLE_ANALYTICS: false,
  ENABLE_NOTIFICATIONS: true,
  
  // Timeouts
  API_TIMEOUT: 15000,
  
  // Demo mode flag
  DEMO_MODE: true,
};

export default ENV;
