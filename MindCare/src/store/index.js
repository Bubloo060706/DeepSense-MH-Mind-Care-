// ─────────────────────────────────────────────
//  Redux Store Setup (using simple Context API pattern)
// ─────────────────────────────────────────────

import React, { createContext, useReducer, useCallback } from 'react';

// Initial state
const initialState = {
  user: {
    id: null,
    name: null,
    email: null,
    avatar: null,
    isAuthenticated: false,
    isLoading: false,
  },
  mood: {
    history: [],
    current: null,
    isLoading: false,
  },
  risk: {
    score: 0,
    level: 'Low',
    trend: 'stable',
    alerts: [],
    isLoading: false,
  },
  app: {
    theme: 'dark',
    notifications: true,
    initialized: false,
  },
};

// Actions
export const ACTIONS = {
  // User
  SET_USER: 'SET_USER',
  CLEAR_USER: 'CLEAR_USER',
  SET_USER_LOADING: 'SET_USER_LOADING',
  
  // Mood
  ADD_MOOD_ENTRY: 'ADD_MOOD_ENTRY',
  SET_MOOD_HISTORY: 'SET_MOOD_HISTORY',
  SET_MOOD_LOADING: 'SET_MOOD_LOADING',
  
  // Risk
  SET_RISK_SCORE: 'SET_RISK_SCORE',
  SET_RISK_LEVEL: 'SET_RISK_LEVEL',
  SET_RISK_ALERTS: 'SET_RISK_ALERTS',
  SET_RISK_LOADING: 'SET_RISK_LOADING',
  
  // App
  SET_APP_INITIALIZED: 'SET_APP_INITIALIZED',
  SET_THEME: 'SET_THEME',
};

// Reducer
const storeReducer = (state, action) => {
  switch (action.type) {
    // User actions
    case ACTIONS.SET_USER:
      return {
        ...state,
        user: { ...action.payload, isAuthenticated: true },
      };
    case ACTIONS.CLEAR_USER:
      return {
        ...state,
        user: { ...initialState.user },
      };
    case ACTIONS.SET_USER_LOADING:
      return {
        ...state,
        user: { ...state.user, isLoading: action.payload },
      };

    // Mood actions
    case ACTIONS.ADD_MOOD_ENTRY:
      return {
        ...state,
        mood: {
          ...state.mood,
          current: action.payload,
          history: [action.payload, ...state.mood.history].slice(0, 100),
        },
      };
    case ACTIONS.SET_MOOD_HISTORY:
      return {
        ...state,
        mood: { ...state.mood, history: action.payload },
      };
    case ACTIONS.SET_MOOD_LOADING:
      return {
        ...state,
        mood: { ...state.mood, isLoading: action.payload },
      };

    // Risk actions
    case ACTIONS.SET_RISK_SCORE:
      return {
        ...state,
        risk: { ...state.risk, score: action.payload },
      };
    case ACTIONS.SET_RISK_LEVEL:
      return {
        ...state,
        risk: { ...state.risk, level: action.payload },
      };
    case ACTIONS.SET_RISK_ALERTS:
      return {
        ...state,
        risk: { ...state.risk, alerts: action.payload },
      };
    case ACTIONS.SET_RISK_LOADING:
      return {
        ...state,
        risk: { ...state.risk, isLoading: action.payload },
      };

    // App actions
    case ACTIONS.SET_APP_INITIALIZED:
      return {
        ...state,
        app: { ...state.app, initialized: action.payload },
      };
    case ACTIONS.SET_THEME:
      return {
        ...state,
        app: { ...state.app, theme: action.payload },
      };

    default:
      return state;
  }
};

// Create context
export const AppStateContext = createContext();

// Store provider component
export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  const setUser = useCallback((userData) => {
    dispatch({ type: ACTIONS.SET_USER, payload: userData });
  }, []);

  const clearUser = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_USER });
  }, []);

  const addMoodEntry = useCallback((mood) => {
    dispatch({ type: ACTIONS.ADD_MOOD_ENTRY, payload: mood });
  }, []);

  const setMoodHistory = useCallback((history) => {
    dispatch({ type: ACTIONS.SET_MOOD_HISTORY, payload: history });
  }, []);

  const setRiskScore = useCallback((score) => {
    dispatch({ type: ACTIONS.SET_RISK_SCORE, payload: score });
  }, []);

  const setRiskLevel = useCallback((level) => {
    dispatch({ type: ACTIONS.SET_RISK_LEVEL, payload: level });
  }, []);

  const setRiskAlerts = useCallback((alerts) => {
    dispatch({ type: ACTIONS.SET_RISK_ALERTS, payload: alerts });
  }, []);

  const setAppInitialized = useCallback((initialized) => {
    dispatch({ type: ACTIONS.SET_APP_INITIALIZED, payload: initialized });
  }, []);

  const value = {
    state,
    dispatch,
    setUser,
    clearUser,
    addMoodEntry,
    setMoodHistory,
    setRiskScore,
    setRiskLevel,
    setRiskAlerts,
    setAppInitialized,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export default AppStateContext;
