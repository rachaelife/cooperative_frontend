import { toast } from 'react-toastify';
// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};
// Error messages
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Network connection failed. Please check your internet connection.',
  [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
  [ERROR_TYPES.AUTHENTICATION]: 'Authentication failed. Please login again.',
  [ERROR_TYPES.AUTHORIZATION]: 'You do not have permission to perform this action.',
  [ERROR_TYPES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_TYPES.SERVER]: 'Server error occurred. Please try again later.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};
// Determine error type from HTTP status code
export const getErrorType = (status) => {
  if (!status) return ERROR_TYPES.NETWORK;
  switch (status) {
    case 400:
      return ERROR_TYPES.VALIDATION;
    case 401:
      return ERROR_TYPES.AUTHENTICATION;
    case 403:
      return ERROR_TYPES.AUTHORIZATION;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
};
// Extract error message from API response
export const extractErrorMessage = (error) => {
  // If it's a string, return it directly
  if (typeof error === 'string') return error;
  // Check for API response error message
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  // Check for API response error
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  // Check for network error
  if (error?.message) {
    if (error.message.includes('Network Error')) {
      return ERROR_MESSAGES[ERROR_TYPES.NETWORK];
    }
    return error.message;
  }
  // Check for HTTP status
  if (error?.response?.status) {
    const errorType = getErrorType(error.response.status);
    return ERROR_MESSAGES[errorType];
  }
  return ERROR_MESSAGES[ERROR_TYPES.UNKNOWN];
};
// Enhanced error handler
export class ErrorHandler {
  static handle(error, options = {}) {
    const {
      showToast = true,
      logError = true,
      customMessage = null,
      onError = null
    } = options;
    // Log error for debugging
    if (logError) {
      }
    // Extract error details
    const status = error?.response?.status;
    const errorType = getErrorType(status);
    const message = customMessage || extractErrorMessage(error);
    // Create error object
    const errorObj = {
      type: errorType,
      message,
      status,
      originalError: error,
      timestamp: new Date().toISOString()
    };
    // Show toast notification
    if (showToast) {
      switch (errorType) {
        case ERROR_TYPES.VALIDATION:
          toast.error(message, { autoClose: 5000 });
          break;
        case ERROR_TYPES.AUTHENTICATION:
          toast.error(message, { autoClose: 7000 });
          break;
        case ERROR_TYPES.NETWORK:
          toast.error(message, { autoClose: 10000 });
          break;
        default:
          toast.error(message, { autoClose: 5000 });
      }
    }
    // Call custom error handler
    if (onError && typeof onError === 'function') {
      onError(errorObj);
    }
    return errorObj;
  }
  // Handle API errors specifically
  static handleApiError(error, operation = 'operation') {
    return this.handle(error, {
      customMessage: `Failed to ${operation}. ${extractErrorMessage(error)}`,
      logError: true
    });
  }
  // Handle form submission errors
  static handleFormError(error, formName = 'form') {
    return this.handle(error, {
      customMessage: `Failed to submit ${formName}. Please check your input and try again.`,
      logError: true
    });
  }
  // Handle authentication errors
  static handleAuthError(error) {
    return this.handle(error, {
      customMessage: 'Authentication failed. Please login again.',
      logError: true,
      onError: (errorObj) => {
        // Redirect to login page or clear auth tokens
        if (errorObj.type === ERROR_TYPES.AUTHENTICATION) {
          localStorage.removeItem('authToken');
          // You can add navigation logic here
        }
      }
    });
  }
}
// Async operation wrapper with error handling
export const withErrorHandling = async (operation, options = {}) => {
  try {
    return await operation();
  } catch (error) {
    ErrorHandler.handle(error, options);
    throw error; // Re-throw so calling code can handle it if needed
  }
};
// React hook for error handling
export const useErrorHandler = () => {
  const handleError = (error, options = {}) => {
    return ErrorHandler.handle(error, options);
  };
  const handleApiError = (error, operation) => {
    return ErrorHandler.handleApiError(error, operation);
  };
  const handleFormError = (error, formName) => {
    return ErrorHandler.handleFormError(error, formName);
  };
  const handleAuthError = (error) => {
    return ErrorHandler.handleAuthError(error);
  };
  return {
    handleError,
    handleApiError,
    handleFormError,
    handleAuthError
  };
};
// Success message handler
export const showSuccess = (message, options = {}) => {
  const { autoClose = 3000, position = 'top-right' } = options;
  toast.success(message, {
    position,
    autoClose,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
};
// Info message handler
export const showInfo = (message, options = {}) => {
  const { autoClose = 4000, position = 'top-right' } = options;
  toast.info(message, {
    position,
    autoClose,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
};
// Warning message handler
export const showWarning = (message, options = {}) => {
  const { autoClose = 5000, position = 'top-right' } = options;
  toast.warning(message, {
    position,
    autoClose,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
};
// Loading state manager
export class LoadingManager {
  static loadingStates = new Map();
  static setLoading(key, isLoading) {
    this.loadingStates.set(key, isLoading);
  }
  static isLoading(key) {
    return this.loadingStates.get(key) || false;
  }
  static clearLoading(key) {
    this.loadingStates.delete(key);
  }
  static clearAllLoading() {
    this.loadingStates.clear();
  }
}
// Retry mechanism for failed operations
export const withRetry = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw lastError;
};
