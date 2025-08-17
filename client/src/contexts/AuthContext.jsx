import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload.error
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload.user
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async (retryCount = 0) => {
      try {
        console.log('AuthContext - Checking authentication...', retryCount > 0 ? `(retry ${retryCount})` : '');
        const response = await api.get('/auth/me');
        console.log('AuthContext - Auth check response:', response.data);
        if (response.data.success) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: response.data.data.user }
          });
          console.log('AuthContext - User authenticated:', response.data.data.user);
        }
      } catch (error) {
        console.log('AuthContext - Auth check failed:', error.response?.data || error.message);
        
        // Retry once if it's a network error and we have a token
        if (retryCount < 1 && localStorage.getItem('authToken') && 
            (!error.response || error.response.status >= 500)) {
          console.log('AuthContext - Retrying auth check...');
          setTimeout(() => checkAuth(retryCount + 1), 1000);
          return;
        }
        
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: { error: 'Authentication check failed' }
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      console.log('AuthContext - Attempting login...');
      const response = await api.post('/auth/login', credentials);
      console.log('AuthContext - Login response:', response.data);
      if (response.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: response.data.data.user }
        });
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          console.log('AuthContext - Token stored in localStorage');
        }
        console.log('AuthContext - User logged in:', response.data.data.user);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.log('AuthContext - Login failed:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: { error: errorMessage }
      });
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear any potential localStorage token
      localStorage.removeItem('authToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: { user: userData }
    });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: { user: response.data.data.user }
        });
        return response.data.data.user;
      }
    } catch (error) {
      console.log('AuthContext - Refresh user failed:', error.response?.data || error.message);
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
