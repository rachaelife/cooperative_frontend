import React from 'react';
import { Result, Button, Card, Typography, Space } from 'antd';
import { ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons';
const { Paragraph, Text } = Typography;
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }
  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service here
    this.logErrorToService(error, errorInfo);
  }
  logErrorToService = (error, errorInfo) => {
    // Log to console for development
    console.group('🚨 Error Boundary Report');
    console.groupEnd();
    // In production, you would send this to your error tracking service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    /*
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      errorTrackingService.captureException(error, {
        extra: errorInfo,
        tags: {
          component: 'ErrorBoundary',
          errorId: this.state.errorId
        }
      });
    }
    */
  };
  handleReload = () => {
    window.location.reload();
  };
  handleGoHome = () => {
    window.location.href = '/';
  };
  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };
  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full shadow-lg">
            <Result
              status="error"
              title="Oops! Something went wrong"
              subTitle="We're sorry, but something unexpected happened. Our team has been notified."
              icon={<BugOutlined className="text-red-500" />}
              extra={[
                <Space key="actions" direction="vertical" className="w-full">
                  <Space wrap>
                    <Button 
                      type="primary" 
                      icon={<ReloadOutlined />}
                      onClick={this.handleRetry}
                      size="large"
                    >
                      Try Again
                    </Button>
                    <Button 
                      icon={<ReloadOutlined />}
                      onClick={this.handleReload}
                      size="large"
                    >
                      Reload Page
                    </Button>
                    <Button 
                      icon={<HomeOutlined />}
                      onClick={this.handleGoHome}
                      size="large"
                    >
                      Go Home
                    </Button>
                  </Space>
                </Space>
              ]}
            />
            {/* Error Details for Development */}
            {isDevelopment && this.state.error && (
              <Card 
                title="🔧 Development Error Details" 
                className="mt-4 bg-red-50 border-red-200"
                size="small"
              >
                <Space direction="vertical" className="w-full">
                  <div>
                    <Text strong>Error ID:</Text>
                    <Paragraph code copyable className="mb-2">
                      {this.state.errorId}
                    </Paragraph>
                  </div>
                  <div>
                    <Text strong>Error Message:</Text>
                    <Paragraph code className="mb-2 text-red-600">
                      {this.state.error.toString()}
                    </Paragraph>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <Text strong>Component Stack:</Text>
                      <Paragraph 
                        code 
                        className="mb-2 text-xs bg-gray-100 p-2 rounded max-h-40 overflow-auto"
                      >
                        {this.state.errorInfo.componentStack}
                      </Paragraph>
                    </div>
                  )}
                  {this.state.error.stack && (
                    <div>
                      <Text strong>Error Stack:</Text>
                      <Paragraph 
                        code 
                        className="mb-2 text-xs bg-gray-100 p-2 rounded max-h-40 overflow-auto"
                      >
                        {this.state.error.stack}
                      </Paragraph>
                    </div>
                  )}
                </Space>
              </Card>
            )}
            {/* User-friendly suggestions */}
            <Card 
              title="💡 What you can do:" 
              className="mt-4 bg-blue-50 border-blue-200"
              size="small"
            >
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Try refreshing the page</li>
                <li>Check your internet connection</li>
                <li>Clear your browser cache and cookies</li>
                <li>Try again in a few minutes</li>
                <li>Contact support if the problem persists</li>
              </ul>
            </Card>
            {/* Contact Information */}
            <Card 
              title="📞 Need Help?" 
              className="mt-4 bg-green-50 border-green-200"
              size="small"
            >
              <Space direction="vertical" className="w-full">
                <Text>If this problem continues, please contact our support team:</Text>
                <div className="space-y-1">
                  <div>📧 Email: support@cooperative.com</div>
                  <div>📱 Phone: +234 123 456 7890</div>
                  <div>🆔 Error ID: <Text code>{this.state.errorId}</Text></div>
                </div>
              </Space>
            </Card>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};
// Hook for error boundary in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);
  const resetError = () => setError(null);
  const captureError = (error) => {
    setError(error);
  };
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  return { captureError, resetError };
};
export default ErrorBoundary;
