import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/auth-context';
import { toast } from 'sonner';

const useSessionTimeout = (timeoutMinutes = 30) => {
  const { isAuthenticated, logout } = useAuth();
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Convert minutes to milliseconds
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = timeoutMs - (5 * 60 * 1000); // 5 minutes before timeout

  const resetTimeout = useCallback(() => {
    if (!isAuthenticated) return;

    lastActivityRef.current = Date.now();

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Set warning timeout (5 minutes before session expires)
    warningRef.current = setTimeout(() => {
      if (isAuthenticated) {
        toast.warning('Your session will expire in 5 minutes. Please save your work.', {
          duration: 10000,
        });
      }
    }, warningMs);

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      if (isAuthenticated) {
        console.log('🔒 Session timeout - logging out user');
        toast.error('Session expired due to inactivity. Please login again.');
        logout();
      }
    }, timeoutMs);
  }, [isAuthenticated, logout, timeoutMs, warningMs]);

  const handleActivity = useCallback(() => {
    if (isAuthenticated) {
      resetTimeout();
    }
  }, [isAuthenticated, resetTimeout]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear timeouts when user is not authenticated
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
      return;
    }

    // Start timeout when user is authenticated
    resetTimeout();

    // Activity events to monitor
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [isAuthenticated, handleActivity, resetTimeout]);

  // Return session info
  return {
    lastActivity: lastActivityRef.current,
    resetTimeout,
    timeoutMinutes,
  };
};

export default useSessionTimeout;
