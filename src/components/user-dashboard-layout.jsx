import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Badge, notification, Spin } from 'antd';
import {
  DashboardOutlined,
  WalletOutlined,
  BankOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  FileTextOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/auth-context';
import useSessionTimeout from '../hooks/use-session-timeout';
const { Header, Sider, Content } = Layout;
const UserDashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading, isAuthenticated } = useAuth();
  // Enable session timeout monitoring (30 minutes)
  useSessionTimeout(30);
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/user/login');
    }
  }, [loading, isAuthenticated, navigate]);
  const handleLogout = () => {
    logout();
    navigate('/user/login');
  };
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }
  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }
  const menuItems = [
    {
      key: '/user/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/user/savings',
      icon: <WalletOutlined />,
      label: 'My Savings',
      children: [
        {
          key: '/user/savings/overview',
          label: 'Overview',
        },
        {
          key: '/user/savings/regular',
          label: 'Regular Savings',
        },
        {
          key: '/user/savings/shares',
          label: 'Share Contributions',
        },
        {
          key: '/user/savings/building',
          label: 'Building Fund',
        },
        {
          key: '/user/savings/development',
          label: 'Development Fund',
        },
      ],
    },
    {
      key: '/user/loans',
      icon: <BankOutlined />,
      label: 'My Loans',
      children: [
        {
          key: '/user/loans/overview',
          label: 'Loan Overview',
        },
        {
          key: '/user/loans/apply',
          label: 'Apply for Loan',
          icon: <PlusOutlined />,
        },
        {
          key: '/user/loans/history',
          label: 'Loan History',
        },
        {
          key: '/user/loans/repayments',
          label: 'Repayment Schedule',
        },
      ],
    },
    {
      key: '/user/applications',
      icon: <FileTextOutlined />,
      label: 'My Applications',
    },
    {
      key: '/user/profile',
      icon: <UserOutlined />,
      label: 'My Profile',
    },
  ];
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'View Profile',
      onClick: () => navigate('/user/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/user/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#1e3a8a', // bg-blue-950 equivalent
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        }}
        width={250}
      >
        <div className="flex items-center py-6 px-4">
          <div className="text-white">
            <div className="text-xl font-bold">
              {collapsed ? 'OM' : 'OMCS'}
            </div>
            {!collapsed && (
              <div className="text-sm opacity-80">User Dashboard</div>
            )}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            border: 'none',
          }}
          className="user-dashboard-menu"
        />
      </Sider>
      <Layout>
        <Header 
          style={{ 
            padding: '0 24px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
              }}
            />
            <div className="text-lg font-semibold text-gray-800">
              Welcome back, {user?.fullname || 'User'}!
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                size="large"
                style={{ fontSize: '18px' }}
              />
            </Badge>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  style={{
                    background: '#1e3a8a', // bg-blue-950 equivalent
                  }}
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-800">
                    {user?.fullname || 'User Name'}
                  </div>
                  <div className="text-gray-500">
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#f5f5f5',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          {children}
        </Content>
      </Layout>
      <style jsx>{`
        .user-dashboard-menu .ant-menu-item {
          margin: 4px 8px;
          border-radius: 8px;
          height: 48px;
          line-height: 48px;
        }
        .user-dashboard-menu .ant-menu-item:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        .user-dashboard-menu .ant-menu-item-selected {
          background-color: rgba(255, 255, 255, 0.2) !important;
          color: #fff !important;
        }
        .user-dashboard-menu .ant-menu-submenu-title {
          margin: 4px 8px;
          border-radius: 8px;
          height: 48px;
          line-height: 48px;
        }
        .user-dashboard-menu .ant-menu-submenu-title:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
    </Layout>
  );
};
export default UserDashboardLayout;
