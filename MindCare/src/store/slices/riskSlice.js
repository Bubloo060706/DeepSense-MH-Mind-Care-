// ─────────────────────────────────────────────
//  Risk Slice (Reducer actions)
// ─────────────────────────────────────────────

export const riskSlice = {
  name: 'risk',

  initialState: {
    score: 0,
    level: 'Low',
    trend: 'stable',
    alerts: [],
    recommendations: [],
    lastUpdated: null,
    isLoading: false,
    error: null,
  },

  actions: {
    setRiskScore: (state, action) => {
      state.risk = {
        ...state.risk,
        score: action.payload,
      };
    },
    setRiskLevel: (state, action) => {
      state.risk = {
        ...state.risk,
        level: action.payload,
      };
    },
    setRiskTrend: (state, action) => {
      state.risk = {
        ...state.risk,
        trend: action.payload,
      };
    },
    setRiskAlerts: (state, action) => {
      state.risk = {
        ...state.risk,
        alerts: action.payload,
      };
    },
    setRecommendations: (state, action) => {
      state.risk = {
        ...state.risk,
        recommendations: action.payload,
      };
    },
    setRiskLoading: (state, action) => {
      state.risk = {
        ...state.risk,
        isLoading: action.payload,
      };
    },
    setRiskError: (state, action) => {
      state.risk = {
        ...state.risk,
        error: action.payload,
      };
    },
  },

  reducers: {
    setRiskScore: (state, action) => {
      return {
        ...state,
        score: action.payload,
        lastUpdated: new Date().toISOString(),
      };
    },
    setRiskLevel: (state, action) => {
      return {
        ...state,
        level: action.payload,
      };
    },
    setRiskTrend: (state, action) => {
      return {
        ...state,
        trend: action.payload,
      };
    },
    setRiskAlerts: (state, action) => {
      return {
        ...state,
        alerts: action.payload,
      };
    },
    setRecommendations: (state, action) => {
      return {
        ...state,
        recommendations: action.payload,
      };
    },
    setRiskLoading: (state, action) => {
      return {
        ...state,
        isLoading: action.payload,
      };
    },
    setRiskError: (state, action) => {
      return {
        ...state,
        error: action.payload,
      };
    },
  },
};

export default riskSlice;
