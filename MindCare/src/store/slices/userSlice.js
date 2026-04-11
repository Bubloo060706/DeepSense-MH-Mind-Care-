// ─────────────────────────────────────────────
//  User Slice (Reducer actions)
// ─────────────────────────────────────────────

export const userSlice = {
  name: 'user',
  
  initialState: {
    id: null,
    name: null,
    email: null,
    avatar: null,
    age: null,
    joinDate: null,
    bio: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },

  actions: {
    setUser: (state, action) => {
      state.user = { ...action.payload, isAuthenticated: true };
    },
    clearUser: (state) => {
      state.user = {
        id: null,
        name: null,
        email: null,
        avatar: null,
        age: null,
        joinDate: null,
        bio: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    },
    setUserLoading: (state, action) => {
      state.user.isLoading = action.payload;
    },
    setUserError: (state, action) => {
      state.user.error = action.payload;
    },
  },

  reducers: {
    setUser: (state, action) => {
      return { ...action.payload, isAuthenticated: true };
    },
    clearUser: () => {
      return {
        id: null,
        name: null,
        email: null,
        avatar: null,
        age: null,
        joinDate: null,
        bio: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    },
    setUserLoading: (state, action) => {
      return { ...state, isLoading: action.payload };
    },
    setUserError: (state, action) => {
      return { ...state, error: action.payload };
    },
  },
};

export default userSlice;
