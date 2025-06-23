import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('userToken');
      const userInfo = localStorage.getItem('userInfo');

      if (!token || !userInfo) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      const user = JSON.parse(userInfo);
      
      // Validate token format and expiration
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (tokenPayload.exp && tokenPayload.exp < currentTime) {
          console.log('🔒 Token expired during auth check');
          logout();
          return;
        }
      } catch (tokenError) {
        console.log('🔒 Invalid token format during auth check');
        logout();
        return;
      }

      // Set authenticated state
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });
    } catch (error) {
      console.error('🔒 Auth check error:', error);
      logout();
    }
  };

  const login = (userData, authToken) => {
    try {
      // Store in localStorage
      localStorage.setItem('userToken', authToken);
      localStorage.setItem('userInfo', JSON.stringify(userData));

      // Update state
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: userData, token: authToken },
      });

      console.log('✅ User logged in successfully');
      toast.success('Login successful!');
    } catch (error) {
      console.error('❌ Login error:', error);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: 'Failed to process login',
      });
    }
  };

  const logout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');

      // Update state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });

      console.log('✅ User logged out successfully');
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const updateUser = (userData) => {
    try {
      // Update localStorage
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));

      // Update state
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: userData,
      });

      console.log('✅ User data updated');
    } catch (error) {
      console.error('❌ Update user error:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Auto-logout on token expiration
  useEffect(() => {
    if (state.token) {
      try {
        const tokenPayload = JSON.parse(atob(state.token.split('.')[1]));
        const expirationTime = tokenPayload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;

        if (timeUntilExpiration > 0) {
          const timeoutId = setTimeout(() => {
            console.log('🔒 Token expired - auto logout');
            toast.warning('Session expired. Please login again.');
            logout();
          }, timeUntilExpiration);

          return () => clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('🔒 Token expiration check error:', error);
      }
    }
  }, [state.token]);

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
