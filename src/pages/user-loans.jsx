import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Modal, Form, Input, Select, Tag, Tabs, Progress, Timeline } from 'antd';
import {
  BankOutlined,
  PlusOutlined,
  CalendarOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import UserDashboardLayout from '../components/user-dashboard-layout';
import { loanapplicationservices, loanServices, loanRepaymentServices } from '../services/api';
import { toast } from 'sonner';
import moment from 'moment';

const { TabPane } = Tabs;
const { TextArea } = Input;

const UserLoans = () => {
  const [loading, setLoading] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [userLoans, setUserLoans] = useState([]);
  const [loanApplications, setLoanApplications] = useState([]);
  const [repaymentSchedule, setRepaymentSchedule] = useState([]);
  const [loanStats, setLoanStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    outstandingBalance: 0,
    nextPayment: 0
  });
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUserLoans();
    fetchLoanApplications();
    fetchRepaymentSchedule();
  }, []);

  const fetchUserLoans = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userId = userInfo.user_id;

      if (!userId) {
        toast.error('User not found. Please login again.');
        return;
      }

      const data = await loanServices.getUserLoans(userId);
      setUserLoans(data || []);

      // Calculate statistics
      const stats = (data || []).reduce((acc, loan) => {
        const amount = parseFloat(loan.loan_amount || 0);
        const balance = parseFloat(loan.remaining_balance || 0);
        
        acc.totalLoans += amount;
        if (loan.status === 'active') {
          acc.activeLoans += 1;
          acc.outstandingBalance += balance;
        }
        return acc;
      }, { totalLoans: 0, activeLoans: 0, outstandingBalance: 0, nextPayment: 0 });

      setLoanStats(stats);
    } catch (error) {
      console.error('Error fetching user loans:', error);
      toast.error('Failed to load loan data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanApplications = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userId = userInfo.user_id;

      if (!userId) {
        toast.error('User not found. Please login again.');
        return;
      }

      console.log('🔍 Fetching loan applications for user:', userId);
      const data = await loanapplicationservices.getUserLoanApplications(userId);
      console.log('✅ Loan applications fetched:', data);
      setLoanApplications(data || []);
    } catch (error) {
      console.error('❌ Error fetching loan applications:', error);
      toast.error('Failed to load loan applications');
    }
  };

  const fetchRepaymentSchedule = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userId = userInfo.user_id;

      if (!userId) {
        toast.error('User not found. Please login again.');
        return;
      }

      console.log('🔍 Fetching repayment schedule for user:', userId);

      // Fetch both pending payments and repayment history
      const [pendingPayments, repaymentHistory] = await Promise.allSettled([
        loanRepaymentServices.getPendingPayments(userId),
        loanRepaymentServices.getUserRepayments(userId)
      ]);

      const pending = pendingPayments.status === 'fulfilled' ? pendingPayments.value : [];
      const history = repaymentHistory.status === 'fulfilled' ? repaymentHistory.value : [];

      // Combine pending and completed payments for full schedule
      const fullSchedule = [
        ...pending.map(payment => ({ ...payment, type: 'pending' })),
        ...history.map(payment => ({ ...payment, type: 'completed' }))
      ];

      // Sort by due date or payment date
      fullSchedule.sort((a, b) => {
        const dateA = new Date(a.due_date || a.payment_date);
        const dateB = new Date(b.due_date || b.payment_date);
        return dateA - dateB;
      });

      console.log('✅ Repayment schedule fetched:', {
        pending: pending.length,
        completed: history.length,
        total: fullSchedule.length
      });

      setRepaymentSchedule(fullSchedule);
    } catch (error) {
      console.error('❌ Error fetching repayment schedule:', error);
      toast.error('Failed to load repayment schedule');
    }
  };

  const handleLoanApplication = async (values) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userId = userInfo.user_id;

      const success = await loanapplicationservices.Newloanapplication(
        userId,
        values.loan_amount,
        values.loan_term,
        values.loan_purpose,
        'pending'
      );

      if (success) {
        toast.success('Loan application submitted successfully!');
        setApplyModalVisible(false);
        form.resetFields();
        fetchLoanApplications();
      }
    } catch (error) {
      console.error('Error submitting loan application:', error);
      toast.error('Failed to submit loan application');
    }
  };

  const loanColumns = [
    {
      title: 'Loan ID',
      dataIndex: 'loan_id',
      key: 'loan_id',
      render: (id) => `#${id}`,
    },
    {
      title: 'Amount',
      dataIndex: 'loan_amount',
      key: 'loan_amount',
      render: (amount) => (
        <span className="font-semibold text-blue-600">
          ₦{Number(amount).toLocaleString()}
        </span>
      ),
      sorter: (a, b) => parseFloat(a.loan_amount) - parseFloat(b.loan_amount),
    },
    {
      title: 'Term',
      dataIndex: 'loan_term',
      key: 'loan_term',
      render: (term) => `${term} months`,
    },
    {
      title: 'Monthly Payment',
      dataIndex: 'monthly_payment',
      key: 'monthly_payment',
      render: (payment) => (
        <span className="text-green-600">
          ₦{Number(payment || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Outstanding Balance',
      dataIndex: 'remaining_balance',
      key: 'remaining_balance',
      render: (balance) => (
        <span className="text-orange-600">
          ₦{Number(balance || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          active: 'green',
          completed: 'blue',
          overdue: 'red',
          pending: 'orange'
        };
        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Disbursed Date',
      dataIndex: 'disbursed_date',
      key: 'disbursed_date',
      render: (date) => date ? moment(date).format('MMM DD, YYYY') : 'N/A',
    },
  ];

  const applicationColumns = [
    {
      title: 'Application ID',
      dataIndex: 'loan_application_id',
      key: 'loan_application_id',
      render: (id) => `#${id}`,
    },
    {
      title: 'Amount Requested',
      dataIndex: 'loan_amount',
      key: 'loan_amount',
      render: (amount) => (
        <span className="font-semibold text-blue-600">
          ₦{Number(amount).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Purpose',
      dataIndex: 'loan_purpose',
      key: 'loan_purpose',
    },
    {
      title: 'Term',
      dataIndex: 'loan_term',
      key: 'loan_term',
      render: (term) => `${term} months`,
    },
    {
      title: 'Status',
      dataIndex: 'loan_status',
      key: 'loan_status',
      render: (status) => {
        const colors = {
          approved: 'green',
          pending: 'orange',
          rejected: 'red'
        };
        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Applied Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('MMM DD, YYYY'),
    },
  ];

  const repaymentColumns = [
    {
      title: 'Installment #',
      dataIndex: 'installment_number',
      key: 'installment_number',
      render: (number) => `#${number || 'N/A'}`,
    },
    {
      title: 'Amount Due',
      dataIndex: 'amount_due',
      key: 'amount_due',
      render: (amount, record) => {
        const displayAmount = amount || record.amount || 0;
        return `₦${Number(displayAmount).toLocaleString()}`;
      },
    },
    {
      title: 'Amount Paid',
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      render: (amount, record) => {
        if (record.type === 'completed') {
          const paidAmount = amount || record.amount || 0;
          return `₦${Number(paidAmount).toLocaleString()}`;
        }
        return '₦0';
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date) => date ? moment(date).format('MMM DD, YYYY') : 'N/A',
    },
    {
      title: 'Payment Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (date) => date ? moment(date).format('MMM DD, YYYY') : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        let color = 'default';
        let text = status || record.type || 'unknown';

        if (record.type === 'completed' || status === 'paid') {
          color = 'green';
          text = 'PAID';
        } else if (status === 'pending') {
          color = 'orange';
          text = 'PENDING';
        } else if (status === 'overdue') {
          color = 'red';
          text = 'OVERDUE';
        }

        return <Tag color={color}>{text.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => method || '-',
    },
  ];

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Loans</h1>
            <p className="text-gray-600">Manage your loans and track repayments</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setApplyModalVisible(true)}
            size="large"
            className="bg-blue-950 hover:bg-blue-900"
          >
            Apply for Loan
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-blue-100">Total Loans</span>}
                value={loanStats.totalLoans}
                prefix={<BankOutlined className="text-blue-200" />}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-green-100">Active Loans</span>}
                value={loanStats.activeLoans}
                suffix=" loans"
                prefix={<CheckCircleOutlined className="text-green-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-orange-100">Outstanding Balance</span>}
                value={loanStats.outstandingBalance}
                prefix={<ExclamationCircleOutlined className="text-orange-200" />}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-purple-100">Next Payment</span>}
                value={loanStats.nextPayment}
                prefix={<CalendarOutlined className="text-purple-200" />}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Loan Management Tabs */}
        <Card className="shadow-md">
          <Tabs defaultActiveKey="loans">
            <TabPane tab="My Loans" key="loans">
              <Table
                columns={loanColumns}
                dataSource={userLoans.map((loan, index) => ({
                  ...loan,
                  key: loan.loan_id || index,
                }))}
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} loans`,
                }}
                scroll={{ x: 800 }}
                locale={{ emptyText: 'No loans found' }}
              />
            </TabPane>
            
            <TabPane tab="Applications" key="applications">
              <Table
                columns={applicationColumns}
                dataSource={loanApplications.map((app, index) => ({
                  ...app,
                  key: app.loan_application_id || index,
                }))}
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
                locale={{ emptyText: 'No applications found' }}
              />
            </TabPane>

            <TabPane tab="Repayment Schedule" key="repayments">
              {repaymentSchedule.length > 0 ? (
                <div>
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <Row gutter={[16, 16]}>
                      <Col span={6}>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {repaymentSchedule.filter(r => r.type === 'completed' || r.status === 'paid').length}
                          </div>
                          <div className="text-sm text-gray-600">Paid</div>
                        </div>
                      </Col>
                      <Col span={6}>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {repaymentSchedule.filter(r => r.status === 'pending').length}
                          </div>
                          <div className="text-sm text-gray-600">Pending</div>
                        </div>
                      </Col>
                      <Col span={6}>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">
                            {repaymentSchedule.filter(r => r.status === 'overdue').length}
                          </div>
                          <div className="text-sm text-gray-600">Overdue</div>
                        </div>
                      </Col>
                      <Col span={6}>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {repaymentSchedule.length}
                          </div>
                          <div className="text-sm text-gray-600">Total</div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <Table
                    columns={repaymentColumns}
                    dataSource={repaymentSchedule.map((payment, index) => ({
                      ...payment,
                      key: payment.repayment_id || index,
                    }))}
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} payments`,
                    }}
                    scroll={{ x: 800 }}
                    locale={{ emptyText: 'No repayment schedule found' }}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClockCircleOutlined className="text-4xl text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Repayment Schedule</h3>
                  <p className="text-gray-500 mb-4">
                    Your repayment schedule will appear here once you have approved loans.
                  </p>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setApplyModalVisible(true)}
                    className="bg-blue-950 hover:bg-blue-900"
                  >
                    Apply for Loan
                  </Button>
                </div>
              )}
            </TabPane>
          </Tabs>
        </Card>

        {/* Loan Application Modal */}
        <Modal
          title="Apply for Loan"
          open={applyModalVisible}
          onCancel={() => setApplyModalVisible(false)}
          footer={null}
          width={700}
          style={{ top: 20 }}
          styles={{
            body: {
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto',
              padding: '24px'
            }
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleLoanApplication}
            className="mt-4"
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="loan_amount"
                  label="Loan Amount"
                  rules={[
                    { required: true, message: 'Please enter loan amount' },
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.resolve(); // Let required rule handle empty values
                        }
                        const numValue = parseFloat(value);
                        if (isNaN(numValue)) {
                          return Promise.reject(new Error('Please enter a valid amount'));
                        }
                        if (numValue < 1000) {
                          return Promise.reject(new Error('Minimum loan amount is ₦1,000'));
                        }
                        if (numValue > 10000000) {
                          return Promise.reject(new Error('Maximum loan amount is ₦10,000,000'));
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Input
                    type="number"
                    prefix="₦"
                    placeholder="Enter loan amount (minimum ₦1,000)"
                    size="large"
                    min={1000}
                    max={10000000}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="loan_term"
                  label="Loan Term (Months)"
                  rules={[{ required: true, message: 'Please select loan term' }]}
                >
                  <Select placeholder="Select loan term" size="large">
                    <Select.Option value={3}>3 Months</Select.Option>
                    <Select.Option value={6}>6 Months</Select.Option>
                    <Select.Option value={12}>12 Months</Select.Option>
                    <Select.Option value={18}>18 Months</Select.Option>
                    <Select.Option value={24}>24 Months</Select.Option>
                    <Select.Option value={36}>36 Months</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="loan_purpose"
                  label="Loan Purpose"
                  rules={[{ required: true, message: 'Please select the loan purpose' }]}
                >
                  <Select
                    placeholder="Select loan purpose"
                    size="large"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    <Select.Option value="Business Expansion">Business Expansion</Select.Option>
                    <Select.Option value="Equipment Purchase">Equipment Purchase</Select.Option>
                    <Select.Option value="Working Capital">Working Capital</Select.Option>
                    <Select.Option value="Inventory Purchase">Inventory Purchase</Select.Option>
                    <Select.Option value="Education">Education</Select.Option>
                    <Select.Option value="Medical Emergency">Medical Emergency</Select.Option>
                    <Select.Option value="Home Improvement">Home Improvement</Select.Option>
                    <Select.Option value="Debt Consolidation">Debt Consolidation</Select.Option>
                    <Select.Option value="Agricultural Investment">Agricultural Investment</Select.Option>
                    <Select.Option value="Vehicle Purchase">Vehicle Purchase</Select.Option>
                    <Select.Option value="Wedding/Event">Wedding/Event</Select.Option>
                    <Select.Option value="Emergency Expenses">Emergency Expenses</Select.Option>
                    <Select.Option value="Other">Other</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-blue-800 mb-2">Loan Information</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Interest rate: 1% per monthly payment</li>
                <li>• Equal monthly installments</li>
                <li>• Processing time: 3-5 business days</li>
                <li>• Approval depends on savings history and eligibility</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={() => setApplyModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-blue-950 hover:bg-blue-900"
              >
                Submit Application
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </UserDashboardLayout>
  );
};

export default UserLoans;
