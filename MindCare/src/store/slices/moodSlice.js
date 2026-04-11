// ─────────────────────────────────────────────
//  Mood Slice (Reducer actions)
// ─────────────────────────────────────────────

export const moodSlice = {
  name: 'mood',

  initialState: {
    history: [],
    current: null,
    isLoading: false,
    error: null,
  },

  actions: {
    addMoodEntry: (state, action) => {
      state.mood = {
        ...state.mood,
        current: action.payload,
        history: [action.payload, ...state.mood.history].slice(0, 100),
      };
    },
    setMoodHistory: (state, action) => {
      state.mood = {
        ...state.mood,
        history: action.payload,
      };
    },
    setMoodLoading: (state, action) => {
      state.mood = {
        ...state.mood,
        isLoading: action.payload,
      };
    },
    setMoodError: (state, action) => {
      state.mood = {
        ...state.mood,
        error: action.payload,
      };
    },
  },

  reducers: {
    addMoodEntry: (state, action) => {
      return {
        ...state,
        current: action.payload,
        history: [action.payload, ...state.history].slice(0, 100),
      };
    },
    setMoodHistory: (state, action) => {
      return {
        ...state,
        history: action.payload,
      };
    },
    setMoodLoading: (state, action) => {
      return {
        ...state,
        isLoading: action.payload,
      };
    },
    setMoodError: (state, action) => {
      return {
        ...state,
        error: action.payload,
      };
    },
  },
};

export default moodSlice;
