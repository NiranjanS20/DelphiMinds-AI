/**
 * Auth state management (lightweight — Context-based).
 * If Redux is needed later, this can be converted to a Redux Toolkit slice.
 */

// Initial state
export const initialAuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
export const AUTH_ACTIONS = {
  SET_USER: 'SET_USER',
  SET_PROFILE: 'SET_PROFILE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
export function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };
    case AUTH_ACTIONS.SET_PROFILE:
      return {
        ...state,
        profile: action.payload,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialAuthState,
        loading: false,
      };
    default:
      return state;
  }
}
