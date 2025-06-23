import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { toast } from 'sonner';

const ProtectedRoute = ({ children, requireAuth = true, redirectTo = '/user/login' }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Enhanced authentication check
  const checkAuthentication = () => {
    try {
      const token = localStorage.getItem('userToken');
      const userInfo = localStorage.getItem('userInfo');

      if (!token || !userInfo) {
        console.log('🔒 No token or user info found');
        return false;
      }

      // Parse and validate user info
      const user = JSON.parse(userInfo);
      if (!user.user_id || !user.email) {
        console.log('🔒 Invalid user info structure');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        return false;
      }

      // Check if token is expired (basic check)
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (tokenPayload.exp && tokenPayload.exp < currentTime) {
          console.log('🔒 Token has expired');
          localStorage.removeItem('userToken');
          localStorage.removeItem('userInfo');
          toast.error('Session expired. Please login again.');
          return false;
        }
      } catch (tokenError) {
        console.log('🔒 Invalid token format');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        return false;
      }

      console.log('✅ User is authenticated');
      return true;
    } catch (error) {
      console.error('🔒 Authentication check error:', error);
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      return false;
    }
  };

  useEffect(() => {
    const authStatus = checkAuthentication();
    setIsAuthenticated(authStatus);
    setIsLoading(false);
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('🔒 Redirecting to login - authentication required');
    // Store the attempted URL for redirect after login
    const returnUrl = location.pathname + location.search;
    return <Navigate to={redirectTo} state={{ from: location, returnUrl }} replace />;
  }

  // If authentication is not required and user is authenticated (e.g., login page)
  if (!requireAuth && isAuthenticated) {
    console.log('✅ Redirecting to dashboard - already authenticated');
    // Check if there's a return URL from previous redirect
    const returnUrl = location.state?.returnUrl || '/user/dashboard';
    return <Navigate to={returnUrl} replace />;
  }

  return children;
};

export default ProtectedRoute;
