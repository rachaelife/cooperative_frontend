import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Steps, Alert, Row, Col } from 'antd';
import { LockOutlined, UserOutlined, CheckCircleOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { memberServices } from '../services/api';

const { Step } = Steps;

const UserPasswordSetup = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get user info from location state (passed from login)
    if (location.state?.user) {
      setUserInfo(location.state.user);
    } else {
      // If no user info, redirect to login
      navigate('/user/login');
    }
  }, [location, navigate]);

  const handlePasswordSetup = async (values) => {
    try {
      setLoading(true);
      
      if (!userInfo?.user_id) {
        toast.error('User information not found. Please try again.');
        navigate('/user/login');
        return;
      }

      await memberServices.setUserPassword(
        userInfo.user_id,
        values.password,
        values.confirm_password
      );

      setCurrentStep(2); // Move to success step
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/user/login', {
          state: { 
            message: 'Password set successfully! Please login with your new password.',
            email_mobile: userInfo.email || userInfo.mobile
          }
        });
      }, 3000);

    } catch (error) {
      console.error('Password setup error:', error);
      toast.error(error.response?.data?.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = [
    { required: true, message: 'Please enter a password' },
    { min: 6, message: 'Password must be at least 6 characters long' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  ];

  const steps = [
    {
      title: 'Welcome',
      icon: <UserOutlined />,
      content: (
        <div className="text-center py-8">
          <div className="mb-6">
            <UserOutlined className="text-6xl text-blue-950 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome, {userInfo?.fullname}!
            </h2>
            <p className="text-gray-600 mb-4">
              To secure your account and access your financial dashboard, please set up a password.
            </p>
          </div>
          
          <Alert
            message="Password Setup Required"
            description="As an existing member, you need to create a password to access your dashboard. This is a one-time setup process."
            type="info"
            showIcon
            className="mb-6"
          />

          <Button
            type="primary"
            size="large"
            onClick={() => setCurrentStep(1)}
            className="bg-blue-950 hover:bg-blue-900"
          >
            Continue to Password Setup
          </Button>
        </div>
      )
    },
    {
      title: 'Set Password',
      icon: <LockOutlined />,
      content: (
        <div className="py-4">
          <div className="text-center mb-6">
            <LockOutlined className="text-4xl text-blue-950 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Create Your Password</h3>
            <p className="text-gray-600">
              Choose a strong password to protect your account
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handlePasswordSetup}
            size="large"
          >
            <Form.Item
              name="password"
              label="Password"
              rules={passwordRules}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </Form.Item>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Password Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• At least 6 characters long</li>
                <li>• Contains at least one uppercase letter (A-Z)</li>
                <li>• Contains at least one lowercase letter (a-z)</li>
                <li>• Contains at least one number (0-9)</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button onClick={() => setCurrentStep(0)}>
                Back
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-blue-950 hover:bg-blue-900"
              >
                Set Password
              </Button>
            </div>
          </Form>
        </div>
      )
    },
    {
      title: 'Complete',
      icon: <CheckCircleOutlined />,
      content: (
        <div className="text-center py-8">
          <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Password Set Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your account is now secure. You'll be redirected to the login page shortly.
          </p>
          
          <Alert
            message="Password Created Successfully!"
            description="Your account is now secure. You can now login to your dashboard using your email/phone and the password you just created."
            type="success"
            showIcon
            className="mb-6"
          />

          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/user/login')}
            className="bg-blue-950 hover:bg-blue-900"
          >
            Go to Login
          </Button>
        </div>
      )
    }
  ];

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <p>Loading user information...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-950 rounded-full mb-4">
            <SafetyOutlined className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Account Setup</h1>
          <p className="text-gray-600">Secure your FinCoop account</p>
        </div>

        <Card className="shadow-lg border-0">
          {/* Progress Steps */}
          <Steps current={currentStep} className="mb-8">
            {steps.map((step, index) => (
              <Step
                key={index}
                title={step.title}
                icon={step.icon}
                status={currentStep === index ? 'process' : currentStep > index ? 'finish' : 'wait'}
              />
            ))}
          </Steps>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {steps[currentStep]?.content}
          </div>
        </Card>

        {/* User Info Card */}
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <div className="text-center">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Account Information</h4>
            <Row gutter={16} className="text-xs text-blue-600">
              <Col span={12}>
                <strong>Name:</strong> {userInfo.fullname}
              </Col>
              <Col span={12}>
                <strong>Email:</strong> {userInfo.email}
              </Col>
            </Row>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserPasswordSetup;
