import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Checkbox, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { memberServices } from '../services/api';
import { useAuth } from '../contexts/auth-context';

const UserLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Show success message if redirected from password setup
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const returnUrl = location.state?.returnUrl || '/user/dashboard';
      navigate(returnUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleLogin = async (values) => {
    try {
      setLoading(true);

      const { email_or_phone, password } = values;

      if (!password) {
        // Check if user needs to set password first
        const userStatus = await memberServices.checkUserStatus(email_or_phone);

        if (userStatus.needsPassword) {
          toast.info('Please set up your password first');
          navigate('/user/password-setup', {
            state: { user: userStatus.user }
          });
          return;
        }
      }

      // Attempt login
      const loginResult = await memberServices.loginUser(email_or_phone, password);

      if (loginResult.needsPassword) {
        // User exists but needs to set password
        toast.info('Please set up your password first');
        navigate('/user/password-setup', {
          state: { user: loginResult.user }
        });
        return;
      }

      // Successful login - use auth context
      login(loginResult.user, loginResult.token);

      // Navigate to return URL or dashboard
      const returnUrl = location.state?.returnUrl || '/user/dashboard';
      navigate(returnUrl, { replace: true });

    } catch (error) {
      console.error('Login error:', error);

      if (error.response?.data?.needsPassword) {
        // User needs to set password
        navigate('/user/password-setup', {
          state: { user: error.response.data.user }
        });
      } else {
        const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      const emailOrPhone = document.querySelector('input[placeholder="Enter email or phone number"]')?.value;

      if (!emailOrPhone) {
        toast.error('Please enter your email or phone number first');
        return;
      }

      setLoading(true);
      const userStatus = await memberServices.checkUserStatus(emailOrPhone);

      if (userStatus.needsPassword) {
        toast.info('Account found! Please set up your password.');
        navigate('/user/password-setup', {
          state: { user: userStatus.user }
        });
      } else {
        toast.success('Account is ready! Please enter your password to login.');
      }

    } catch (error) {
      console.error('Status check error:', error);
      if (error.response?.status === 404) {
        toast.error('Account not found. Please contact admin or register.');
      } else {
        toast.error('Failed to check account status.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePassword = async () => {
    try {
      const emailOrPhone = document.querySelector('input[placeholder="Enter email or phone number"]')?.value;

      if (!emailOrPhone) {
        toast.error('Please enter your email or phone number first');
        return;
      }

      setLoading(true);
      const userStatus = await memberServices.checkUserStatus(emailOrPhone);

      if (userStatus.needsPassword) {
        toast.info('Redirecting to password setup...');
        navigate('/user/password-setup', {
          state: { user: userStatus.user }
        });
      } else {
        toast.info('You already have a password set. Please use the login form above.');
      }

    } catch (error) {
      console.error('Create password error:', error);
      if (error.response?.status === 404) {
        toast.error('Account not found. Please contact the administrator to create your account.');
      } else {
        toast.error('Failed to check account status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-950 rounded-full mb-4">
            <UserOutlined className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">OMCS</h1>
          <p className="text-gray-600">
            Welcome back! Please sign in to your account
          </p>
        </div>

        <Card className="shadow-lg border-0">
          {/* Login Form */}
          <Form
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
          >
              <Form.Item
                name="email_or_phone"
                label="Email or Phone Number"
                rules={[
                  { required: true, message: 'Please enter your email or phone number' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter email or phone number"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter your password' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter password"
                />
              </Form.Item>

              <Form.Item>
                <div className="flex justify-between items-center">
                  <Checkbox>Remember me</Checkbox>
                  <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
                    Forgot password?
                  </Link>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="bg-blue-950 hover:bg-blue-900 border-0 h-12"
                >
                  Sign In
                </Button>
              </Form.Item>

              <Divider>or</Divider>

              <div className="text-center space-y-3">
                <Button
                  type="default"
                  onClick={handleCheckStatus}
                  loading={loading}
                  block
                  className="mb-2"
                >
                  Check Account Status
                </Button>

                <Divider>First time user?</Divider>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>New to OMCS?</strong> If you're a member but haven't set up your password yet:
                  </p>
                  <Button
                    type="primary"
                    onClick={handleCreatePassword}
                    loading={loading}
                    block
                    className="bg-blue-950 hover:bg-blue-900"
                  >
                    Create Password
                  </Button>
                  <p className="text-xs text-blue-600 mt-2">
                    Enter your email/phone above, then click this button to set up your password.
                  </p>
                </div>
              </div>
            </Form>
        </Card>

        {/* User Information */}
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <div className="text-center">
            <h4 className="text-sm font-medium text-blue-800 mb-2">For Existing Members</h4>
            <p className="text-xs text-blue-600">
              If you're already a member but haven't set up your password:<br />
              1. Enter your registered email or phone number<br />
              2. Click "Create Password" to set up your login<br />
              3. Follow the setup wizard to secure your account
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserLogin;
