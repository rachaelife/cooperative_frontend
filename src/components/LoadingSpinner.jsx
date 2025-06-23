import React from 'react';
import { Spin, Card, Progress, Space, Typography } from 'antd';
import { LoadingOutlined, SyncOutlined } from '@ant-design/icons';
const { Text } = Typography;
// Custom loading icons
const customLoadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const syncIcon = <SyncOutlined style={{ fontSize: 24 }} spin />;
// Main Loading Spinner Component
const LoadingSpinner = ({ 
  size = 'default', 
  message = 'Loading...', 
  tip = null,
  spinning = true,
  children = null,
  overlay = false,
  fullScreen = false,
  showProgress = false,
  progress = 0,
  variant = 'default'
}) => {
  // Full screen loading
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <Spin 
            size="large" 
            indicator={variant === 'sync' ? syncIcon : customLoadingIcon}
          />
          <div className="mt-4">
            <Text className="text-lg text-gray-600">{message}</Text>
            {tip && <div className="text-sm text-gray-500 mt-2">{tip}</div>}
            {showProgress && (
              <div className="mt-4 w-64">
                <Progress percent={progress} status="active" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  // Overlay loading
  if (overlay) {
    return (
      <div className="relative">
        {children}
        {spinning && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <Spin 
                size={size} 
                indicator={variant === 'sync' ? syncIcon : customLoadingIcon}
              />
              <div className="mt-2">
                <Text className="text-gray-600">{message}</Text>
                {tip && <div className="text-xs text-gray-500 mt-1">{tip}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  // Regular loading with children
  if (children) {
    return (
      <Spin 
        spinning={spinning} 
        size={size} 
        tip={tip || message}
        indicator={variant === 'sync' ? syncIcon : customLoadingIcon}
      >
        {children}
      </Spin>
    );
  }
  // Simple loading spinner
  return (
    <div className="flex items-center justify-center p-8">
      <Space direction="vertical" align="center">
        <Spin 
          size={size} 
          indicator={variant === 'sync' ? syncIcon : customLoadingIcon}
        />
        <Text className="text-gray-600">{message}</Text>
        {tip && <Text className="text-xs text-gray-500">{tip}</Text>}
        {showProgress && (
          <div className="w-48">
            <Progress percent={progress} status="active" size="small" />
          </div>
        )}
      </Space>
    </div>
  );
};
// Card Loading Component
export const CardLoading = ({ 
  title = 'Loading...', 
  height = 200,
  showSkeleton = true 
}) => {
  return (
    <Card className="w-full" style={{ height }}>
      <div className="flex items-center justify-center h-full">
        {showSkeleton ? (
          <div className="w-full space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        ) : (
          <Space direction="vertical" align="center">
            <Spin size="large" />
            <Text className="text-gray-600">{title}</Text>
          </Space>
        )}
      </div>
    </Card>
  );
};
// Table Loading Component
export const TableLoading = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full">
      <div className="animate-pulse">
        {/* Table Header */}
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 mb-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
// Button Loading Component
export const ButtonLoading = ({ 
  loading = false, 
  children, 
  icon = null,
  ...props 
}) => {
  return (
    <button 
      {...props}
      disabled={loading || props.disabled}
      className={`${props.className} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <Space>
          <LoadingOutlined spin />
          {typeof children === 'string' ? 'Loading...' : children}
        </Space>
      ) : (
        <Space>
          {icon}
          {children}
        </Space>
      )}
    </button>
  );
};
// Page Loading Component
export const PageLoading = ({ message = 'Loading page...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
        <Text className="text-xl text-gray-600">{message}</Text>
        <div className="mt-4">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
// Skeleton Loading Components
export const SkeletonCard = ({ lines = 3 }) => {
  return (
    <Card>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div 
              key={index} 
              className="h-3 bg-gray-200 rounded" 
              style={{ width: `${Math.random() * 40 + 60}%` }}
            ></div>
          ))}
        </div>
      </div>
    </Card>
  );
};
export const SkeletonList = ({ items = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
// Loading Hook
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = React.useState(initialState);
  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);
  const toggleLoading = () => setLoading(prev => !prev);
  return {
    loading,
    startLoading,
    stopLoading,
    toggleLoading,
    setLoading
  };
};
// Async Loading Hook
export const useAsyncLoading = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const execute = async (asyncFunction) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return {
    loading,
    error,
    execute
  };
};
export default LoadingSpinner;
