import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Input, Button, Avatar, Upload, Select, DatePicker, Divider, Statistic } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined,
  WalletOutlined,
  BankOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import UserDashboardLayout from '../components/user-dashboard-layout';
import { memberServices, savingServices, loanServices } from '../services/api';
import { toast } from 'sonner';
import moment from 'moment';

const UserProfile = () => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [userStats, setUserStats] = useState({
    totalSavings: 0,
    totalLoans: 0,
    outstandingBalance: 0,
    memberSince: null
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUserProfile();
    loadUserStats();
    loadProfileImage();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('userInfo');
      if (userData) {
        const user = JSON.parse(userData);
        setUserInfo(user);
        form.setFieldsValue({
          fullname: user.fullname,
          email: user.email,
          mobile: user.mobile,
          gender: user.gender,
          address: user.address,
          date_of_birth: user.date_of_birth ? moment(user.date_of_birth) : null,
          occupation: user.occupation,
          next_of_kin: user.next_of_kin,
          next_of_kin_phone: user.next_of_kin_phone,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const userData = localStorage.getItem('userInfo');
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user.user_id;

        // Fetch user savings
        const savingsData = await savingServices.getUserSavings(userId);
        const totalSavings = savingsData?.total || 0;

        // Fetch user loans
        const loansData = await loanServices.getUserLoans(userId);
        const totalLoans = loansData?.reduce((sum, loan) => sum + parseFloat(loan.loan_amount || 0), 0) || 0;
        const outstandingBalance = loansData?.reduce((sum, loan) =>
          loan.status === 'active' ? sum + parseFloat(loan.remaining_balance || 0) : sum, 0) || 0;

        setUserStats({
          totalSavings,
          totalLoans,
          outstandingBalance,
          memberSince: user.createdAt || user.created_at
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadProfileImage = async () => {
    try {
      const userData = localStorage.getItem('userInfo');
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user.user_id;

        const imageUrl = await memberServices.getProfileImage(userId);
        if (imageUrl) {
          // Construct full URL for the image
          const fullImageUrl = `http://localhost:8000${imageUrl}`;
          setProfileImage(fullImageUrl);
        }
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
      // Don't show error toast for missing profile image as it's optional
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setImageLoading(true);
      const userData = localStorage.getItem('userInfo');
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user.user_id;

        const result = await memberServices.uploadProfileImage(userId, file);
        if (result && result.imageUrl) {
          // Construct full URL for the image
          const fullImageUrl = `http://localhost:8000${result.imageUrl}`;
          setProfileImage(fullImageUrl);

          // Update user info in localStorage with new image
          const updatedUser = { ...user, profile_image: result.imageUrl };
          localStorage.setItem('userInfo', JSON.stringify(updatedUser));
          setUserInfo(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      // Error toast is handled in the service
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageDelete = async () => {
    try {
      setImageLoading(true);
      const userData = localStorage.getItem('userInfo');
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user.user_id;

        await memberServices.deleteProfileImage(userId);
        setProfileImage(null);

        // Update user info in localStorage
        const updatedUser = { ...user, profile_image: null };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUserInfo(updatedUser);
      }
    } catch (error) {
      console.error('Error deleting profile image:', error);
      // Error toast is handled in the service
    } finally {
      setImageLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('userInfo');
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user.user_id;

        console.log('🔄 Updating profile with values:', values);

        await memberServices.updateMember(userId, values);

        // Update localStorage
        const updatedUser = { ...user, ...values };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUserInfo(updatedUser);

        toast.success('Profile updated successfully!');
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    loadUserProfile(); // Reset form to original values
  };

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and account settings</p>
          </div>
          {!editing && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditing(true)}
              size="large"
            >
              Edit Profile
            </Button>
          )}
        </div>

        <Row gutter={[24, 24]}>
          {/* Profile Information */}
          <Col xs={24} lg={16}>
            <Card title="Personal Information" className="shadow-md">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
                disabled={!editing}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="fullname"
                      label="Full Name"
                      rules={[{ required: true, message: 'Please enter your full name' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Enter full name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label="Email Address"
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Please enter a valid email' }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="Enter email address" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="mobile"
                      label="Phone Number"
                      rules={[{ required: true, message: 'Please enter your phone number' }]}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="gender"
                      label="Gender"
                      rules={[{ required: true, message: 'Please select your gender' }]}
                    >
                      <Select placeholder="Select gender">
                        <Select.Option value="male">Male</Select.Option>
                        <Select.Option value="female">Female</Select.Option>
                        <Select.Option value="other">Other</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      name="address"
                      label="Address"
                    >
                      <Input.TextArea
                        rows={3}
                        prefix={<HomeOutlined />}
                        placeholder="Enter your address"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Note: Additional fields like date_of_birth, occupation, next_of_kin are not yet supported in the database */}
                {/* These can be added in future database migrations */}

                {editing && (
                  <div className="flex justify-end gap-3 mt-6">
                    <Button onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </Form>
            </Card>
          </Col>

          {/* Profile Summary */}
          <Col xs={24} lg={8}>
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="text-center shadow-md">
                <div className="relative inline-block mb-4">
                  <Avatar
                    size={100}
                    src={profileImage}
                    icon={<UserOutlined />}
                    style={{
                      background: profileImage ? 'transparent' : '#1e3a8a', // bg-blue-950 equivalent
                      opacity: imageLoading ? 0.6 : 1,
                    }}
                  />

                  {/* Loading overlay */}
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <Upload
                    showUploadList={false}
                    beforeUpload={(file) => {
                      // Validate file type
                      const isImage = file.type.startsWith('image/');
                      if (!isImage) {
                        toast.error('You can only upload image files!');
                        return false;
                      }

                      // Validate file size (5MB)
                      const isLt5M = file.size / 1024 / 1024 < 5;
                      if (!isLt5M) {
                        toast.error('Image must be smaller than 5MB!');
                        return false;
                      }

                      handleImageUpload(file);
                      return false; // Prevent default upload
                    }}
                    accept="image/*"
                    disabled={imageLoading}
                  >
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<CameraOutlined />}
                      size="small"
                      className="absolute bottom-0 right-0"
                      style={{ background: '#52c41a' }}
                      loading={imageLoading}
                      title="Upload Profile Picture"
                    />
                  </Upload>

                  {/* Delete Button (only show if image exists) */}
                  {profileImage && (
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      size="small"
                      className="absolute top-0 right-0"
                      style={{ background: '#ff4d4f' }}
                      onClick={handleImageDelete}
                      loading={imageLoading}
                      title="Remove Profile Picture"
                    />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {userInfo.fullname || 'User Name'}
                </h3>
                <p className="text-gray-500 mb-2">{userInfo.email || 'user@example.com'}</p>
                {userInfo.registration_number && (
                  <p className="text-sm font-mono bg-purple-50 text-purple-700 px-2 py-1 rounded mb-2 inline-block">
                    ID: {userInfo.registration_number}
                  </p>
                )}
                <p className="text-sm text-gray-400">
                  Member since {userStats.memberSince ? moment(userStats.memberSince).format('MMMM YYYY') : 'N/A'}
                </p>
              </Card>

              {/* Financial Summary */}
              <Card title="Financial Summary" className="shadow-md">
                <div className="space-y-4">
                  <Statistic
                    title="Total Savings"
                    value={userStats.totalSavings}
                    prefix={<WalletOutlined className="text-green-500" />}
                    formatter={(value) => `₦${Number(value).toLocaleString()}`}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Divider style={{ margin: '12px 0' }} />
                  <Statistic
                    title="Total Loans"
                    value={userStats.totalLoans}
                    prefix={<BankOutlined className="text-blue-500" />}
                    formatter={(value) => `₦${Number(value).toLocaleString()}`}
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <Divider style={{ margin: '12px 0' }} />
                  <Statistic
                    title="Outstanding Balance"
                    value={userStats.outstandingBalance}
                    prefix={<CalendarOutlined className="text-orange-500" />}
                    formatter={(value) => `₦${Number(value).toLocaleString()}`}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </div>
              </Card>

              {/* Account Status */}
              <Card title="Account Status" className="shadow-md">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account Status</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Verification</span>
                    <span className="text-green-600 font-medium">Verified</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Loan Eligibility</span>
                    <span className="text-green-600 font-medium">Eligible</span>
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </UserDashboardLayout>
  );
};

export default UserProfile;
