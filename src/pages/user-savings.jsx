import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Modal, Form, Input, Select, DatePicker, Tag, Tabs } from 'antd';
import {
  WalletOutlined,
  PlusOutlined,
  EyeOutlined,
  CalendarOutlined,
  DollarOutlined,
  RiseOutlined,
  BankOutlined,
  HomeOutlined,
  RocketOutlined
} from '@ant-design/icons';
import UserDashboardLayout from '../components/user-dashboard-layout';
import { savingServices } from '../services/api';
import { toast } from 'sonner';
import { months } from '../months';
import moment from 'moment';

const { TabPane } = Tabs;

const UserSavings = () => {
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [userSavings, setUserSavings] = useState([]);
  const [savingsStats, setSavingsStats] = useState({
    total: 0,
    savings: 0,
    shares: 0,
    building: 0,
    development: 0
  });
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUserSavings();
  }, []);

  const fetchUserSavings = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userId = userInfo.user_id;

      if (!userId) {
        toast.error('User not found. Please login again.');
        return;
      }

      console.log('🔍 Fetching savings for user:', userId);
      const data = await savingServices.getUserSavings(userId);
      console.log('✅ Savings data received:', data);

      setUserSavings(data?.data || []);

      // Calculate statistics
      const stats = (data?.data || []).reduce((acc, saving) => {
        const amount = parseFloat(saving.amount || 0);
        acc.total += amount;
        acc[saving.savings_type] = (acc[saving.savings_type] || 0) + amount;
        return acc;
      }, { total: 0, savings: 0, shares: 0, building: 0, development: 0 });

      // Use the total from backend if available
      if (data?.total?.total_savings) {
        stats.total = parseFloat(data.total.total_savings);
      }

      console.log('📊 Calculated savings stats:', stats);
      setSavingsStats(stats);
    } catch (error) {
      console.error('Error fetching user savings:', error);
      toast.error('Failed to load savings data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSavings = async (values) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userId = userInfo.user_id;

      await savingServices.addsavings(
        userId,
        values.amount,
        values.month_paid,
        values.payment_type,
        values.savings_type
      );

      toast.success('Savings added successfully!');
      setAddModalVisible(false);
      form.resetFields();
      fetchUserSavings();
    } catch (error) {
      console.error('Error adding savings:', error);
      toast.error('Failed to add savings');
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('MMM DD, YYYY'),
      sorter: (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix(),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span className="font-semibold text-green-600">
          ₦{Number(amount).toLocaleString()}
        </span>
      ),
      sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount),
    },
    {
      title: 'Type',
      dataIndex: 'savings_type',
      key: 'savings_type',
      render: (type) => {
        const colors = {
          savings: 'green',
          shares: 'blue',
          building: 'orange',
          development: 'purple'
        };
        const labels = {
          savings: 'Regular Savings',
          shares: 'Share Contributions',
          building: 'Building Fund',
          development: 'Development Fund'
        };
        return <Tag color={colors[type]}>{labels[type] || type}</Tag>;
      },
      filters: [
        { text: 'Regular Savings', value: 'savings' },
        { text: 'Share Contributions', value: 'shares' },
        { text: 'Building Fund', value: 'building' },
        { text: 'Development Fund', value: 'development' },
      ],
      onFilter: (value, record) => record.savings_type === value,
    },
    {
      title: 'Month',
      dataIndex: 'month_paid',
      key: 'month_paid',
      render: (month) => <Tag color="blue">{month}</Tag>,
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_type',
      key: 'payment_type',
      render: (type) => (
        <span className="capitalize">{type?.replace('_', ' ')}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'confirmed' ? 'green' : 'orange'}>
          {status || 'Pending'}
        </Tag>
      ),
    },
  ];

  const getSavingsByType = (type) => {
    return userSavings.filter(saving => saving.savings_type === type);
  };



  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Savings</h1>
            <p className="text-gray-600">Track and manage all your savings contributions</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
            size="large"
            className="bg-blue-950 hover:bg-blue-900"
          >
            Add Savings
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-green-100">Total Savings</span>}
                value={savingsStats.total}
                prefix={<WalletOutlined className="text-green-200" />}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-blue-100">Regular Savings</span>}
                value={savingsStats.savings}
                prefix={<DollarOutlined className="text-blue-200" />}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-purple-100">Share Contributions</span>}
                value={savingsStats.shares}
                prefix={<RiseOutlined className="text-purple-200" />}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-orange-100">Building Fund</span>}
                value={savingsStats.building}
                prefix={<HomeOutlined className="text-orange-200" />}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Savings Table */}
        <Card title="Savings History" className="shadow-md">
          <Tabs defaultActiveKey="all" className="mb-4">
            <TabPane tab="All Savings" key="all">
              <Table
                columns={columns}
                dataSource={userSavings.map((saving, index) => ({
                  ...saving,
                  key: saving.savings_id || index,
                }))}
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} savings records`,
                }}
                scroll={{ x: 800 }}
              />
            </TabPane>
            <TabPane tab="Regular Savings" key="savings">
              <Table
                columns={columns}
                dataSource={getSavingsByType('savings').map((saving, index) => ({
                  ...saving,
                  key: saving.savings_id || index,
                }))}
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            </TabPane>
            <TabPane tab="Share Contributions" key="shares">
              <Table
                columns={columns}
                dataSource={getSavingsByType('shares').map((saving, index) => ({
                  ...saving,
                  key: saving.savings_id || index,
                }))}
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            </TabPane>
            <TabPane tab="Building Fund" key="building">
              <Table
                columns={columns}
                dataSource={getSavingsByType('building').map((saving, index) => ({
                  ...saving,
                  key: saving.savings_id || index,
                }))}
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            </TabPane>
            <TabPane tab="Development Fund" key="development">
              <Table
                columns={columns}
                dataSource={getSavingsByType('development').map((saving, index) => ({
                  ...saving,
                  key: saving.savings_id || index,
                }))}
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            </TabPane>
          </Tabs>
        </Card>

        {/* Add Savings Modal */}
        <Modal
          title="Add New Savings"
          open={addModalVisible}
          onCancel={() => setAddModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddSavings}
            className="mt-4"
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="amount"
                  label="Amount"
                  rules={[
                    { required: true, message: 'Please enter amount' },
                    { type: 'number', min: 1, message: 'Amount must be greater than 0' }
                  ]}
                >
                  <Input
                    type="number"
                    prefix="₦"
                    placeholder="Enter amount"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="savings_type"
                  label="Savings Type"
                  rules={[{ required: true, message: 'Please select savings type' }]}
                >
                  <Select placeholder="Select savings type" size="large">
                    <Select.Option value="savings">Regular Savings</Select.Option>
                    <Select.Option value="shares">Share Contributions</Select.Option>
                    <Select.Option value="building">Building Fund</Select.Option>
                    <Select.Option value="development">Development Fund</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="month_paid"
                  label="Month"
                  rules={[{ required: true, message: 'Please select month' }]}
                >
                  <Select placeholder="Select month" size="large">
                    {months.map((month) => (
                      <Select.Option key={month.value} value={month.value}>
                        {month.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="payment_type"
                  label="Payment Method"
                  rules={[{ required: true, message: 'Please select payment method' }]}
                >
                  <Select placeholder="Select payment method" size="large">
                    <Select.Option value="cash">Cash</Select.Option>
                    <Select.Option value="bank_transfer">Bank Transfer</Select.Option>
                    <Select.Option value="mobile_money">Mobile Money</Select.Option>
                    <Select.Option value="check">Check</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={() => setAddModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-blue-950 hover:bg-blue-900"
              >
                Add Savings
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </UserDashboardLayout>
  );
};

export default UserSavings;
