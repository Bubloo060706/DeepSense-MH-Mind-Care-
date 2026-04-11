// ─────────────────────────────────────────────
//  useAuth Hook
// ─────────────────────────────────────────────

import { useContext, useCallback, useState } from 'react';
import { AppStateContext } from '../store';
import APIService from '../services/api';
import { isValidEmail, isValidPassword } from '../utils/validators';

export const useAuth = () => {
  const { state, setUser, clearUser } = useContext(AppStateContext);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
      }
      if (!isValidPassword(password)) {
        throw new Error('Password must be at least 6 characters');
      }

      const response = await APIService.login(email, password);
      
      if (response.success) {
        setUser(response.data.user);
        return response.data;
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (err) {
      const errorMsg = err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const signup = useCallback(async (email, password, name) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
      }
      if (!isValidPassword(password)) {
        throw new Error('Password must be at least 6 characters');
      }
      if (!name || name.length < 2) {
        throw new Error('Name must be at least 2 characters');
      }

      const response = await APIService.signup(email, password, name);

      if (response.success) {
        setUser(response.data.user);
        return response.data;
      } else {
        throw new Error(response.error || 'Signup failed');
      }
    } catch (err) {
      const errorMsg = err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const logout = useCallback(() => {
    clearUser();
    setError(null);
  }, [clearUser]);

  return {
    user: state.user,
    isAuthenticated: state.user.isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
  };
};

export default useAuth;
