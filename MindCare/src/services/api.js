// ─────────────────────────────────────────────
//  API Service (Demo - All responses are mocked)
// ─────────────────────────────────────────────

import ENV from '../config/env';

class APIService {
  constructor() {
    this.baseURL = ENV.API_URL;
    this.timeout = ENV.API_TIMEOUT;
  }

  /**
   * Mock login request
   */
  async login(email, password) {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            token: `demo_token_${Date.now()}`,
            user: {
              id: 'user_demo_001',
              email: email,
              name: email.split('@')[0],
              avatar: 'account-circle-outline',
            },
          },
        });
      }, 800);
    });
  }

  /**
   * Mock signup request
   */
  async signup(email, password, name) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            token: `demo_token_${Date.now()}`,
            user: {
              id: 'user_' + Date.now(),
              email,
              name,
              avatar: 'account-circle-outline',
            },
          },
        });
      }, 800);
    });
  }

  /**
   * Mock fetch user profile
   */
  async getUserProfile(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: userId,
            name: 'Demo User',
            email: 'user@demo.com',
            age: 28,
            joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            avatar: 'account-circle-outline',
            bio: 'Mental wellness journey tracker',
          },
        });
      }, 600);
    });
  }

  /**
   * Mock risk assessment
   */
  async assessRisk(moodScore, phq9Answers) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const baseRisk = (1 - moodScore / 5) * 40;
        const phq9Risk = phq9Answers.reduce((s, a) => s + a, 0) % 40;
        const score = Math.min(100, Math.round(baseRisk + phq9Risk));
        
        resolve({
          success: true,
          data: {
            score,
            level: score < 20 ? 'Low' : score < 40 ? 'Mild' : score < 60 ? 'Moderate' : 'Severe',
            timestamp: new Date().toISOString(),
          },
        });
      }, 1000);
    });
  }

  /**
   * Mock fetch recommendations
   */
  async getRecommendations(riskLevel) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recommendations = {
          Low: [
            'Keep up your current wellness routine!',
            'Stay active and maintain social connections',
            'Practice daily mindfulness',
          ],
          Mild: [
            'Consider journaling your feelings daily',
            'Increase physical activity',
            'Reach out to friends or family',
          ],
          Moderate: [
            'Talk to a counselor',
            'Establish a regular sleep schedule',
            'Practice stress management techniques',
          ],
          Severe: [
            'Contact a mental health professional',
            'Crisis support: Call 1-800-273-8255',
            'Seek immediate professional help',
          ],
        };
        
        resolve({
          success: true,
          data: {
            level: riskLevel,
            recommendations: recommendations[riskLevel] || [],
          },
        });
      }, 600);
    });
  }

  /**
   * Mock save mood entry
   */
  async saveMood(mood) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { id: `mood_${Date.now()}`, ...mood },
        });
      }, 500);
    });
  }

  /**
   * Mock fetch mood history
   */
  async getMoodHistory(days = 7) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const moods = [];
        const now = Date.now();
        for (let i = 0; i < days; i++) {
          const score = Math.floor(Math.random() * 5) + 1;
          const labels = ['Very Low', 'Low', 'Okay', 'Good', 'Great'];
          const icons = ['emoticon-cry-outline', 'emoticon-sad-outline', 'emoticon-neutral-outline', 'emoticon-happy-outline', 'emoticon-happy-outline'];
          moods.push({
            id: `mood_${i}`,
            label: labels[score - 1],
            icon: icons[score - 1],
            score,
            ts: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
        resolve({ success: true, data: moods });
      }, 700);
    });
  }

  /**
   * Mock error handler
   */
  handleError(error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred',
    };
  }
}

export default new APIService();
