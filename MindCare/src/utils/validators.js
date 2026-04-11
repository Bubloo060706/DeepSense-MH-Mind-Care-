// ─────────────────────────────────────────────
//  Validation Utilities
// ─────────────────────────────────────────────

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate password (min 6 chars for demo)
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate username
 */
export const isValidUsername = (username) => {
  return username && username.length >= 3 && username.length <= 50;
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone) => {
  const re = /^[0-9]{10,15}$/;
  return re.test(phone.replace(/\D/g, ''));
};

/**
 * Validate age
 */
export const isValidAge = (age) => {
  const ageNum = parseInt(age, 10);
  return ageNum >= 13 && ageNum <= 120;
};

/**
 * Validate PHQ-9 score
 */
export const isValidPHQ9 = (answers) => {
  if (!Array.isArray(answers) || answers.length !== 9) return false;
  return answers.every((ans) => ans >= 0 && ans <= 3);
};

/**
 * Validate mood entry
 */
export const isValidMoodEntry = (mood) => {
  return (
    mood &&
    mood.emoji &&
    mood.label &&
    mood.score >= 1 &&
    mood.score <= 5
  );
};

export default {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  isValidPhone,
  isValidAge,
  isValidPHQ9,
  isValidMoodEntry,
};
