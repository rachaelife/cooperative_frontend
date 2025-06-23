import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/auth-context';
import { toast } from 'sonner';

const RouteGuard = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/user/login',
  fallbackComponent = null 
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;

    if (requireAuth && !isAuthenticated) {
      console.log('🔒 Route guard: Authentication required, redirecting to login');
      toast.warning('Please login to access this page');
      
      // Store the current location for redirect after login
      navigate(redirectTo, { 
        state: { 
          from: location,
          returnUrl: location.pathname + location.search 
        },
        replace: true 
      });
    }
  }, [isAuthenticated, loading, requireAuth, navigate, redirectTo, location]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Show fallback component if provided, otherwise show access denied
    if (fallbackComponent) {
      return fallbackComponent;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Result
          status="403"
          title="Access Denied"
          subTitle="You need to be logged in to access this page."
          icon={<LockOutlined className="text-red-500" />}
          extra={
            <Button 
              type="primary" 
              onClick={() => navigate('/user/login')}
              className="bg-blue-950 hover:bg-blue-900"
            >
              Go to Login
            </Button>
          }
        />
      </div>
    );
  }

  // If authentication is not required but user is authenticated (e.g., login page)
  if (!requireAuth && isAuthenticated) {
    console.log('✅ Route guard: User already authenticated, redirecting to dashboard');
    const returnUrl = location.state?.returnUrl || '/user/dashboard';
    navigate(returnUrl, { replace: true });
    return null;
  }

  // Render children if all checks pass
  return children;
};

// Higher-order component for protecting routes
export const withRouteGuard = (Component, options = {}) => {
  return function ProtectedComponent(props) {
    return (
      <RouteGuard {...options}>
        <Component {...props} />
      </RouteGuard>
    );
  };
};

// Specific guards for different route types
export const DashboardGuard = ({ children }) => (
  <RouteGuard 
    requireAuth={true}
    redirectTo="/user/login"
    fallbackComponent={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Result
          status="warning"
          title="Dashboard Access Required"
          subTitle="Please login to access your financial dashboard."
          icon={<ExclamationCircleOutlined className="text-orange-500" />}
          extra={
            <Button 
              type="primary" 
              href="/user/login"
              className="bg-blue-950 hover:bg-blue-900"
            >
              Login to Dashboard
            </Button>
          }
        />
      </div>
    }
  >
    {children}
  </RouteGuard>
);

export const PublicGuard = ({ children }) => (
  <RouteGuard requireAuth={false}>
    {children}
  </RouteGuard>
);

export default RouteGuard;
