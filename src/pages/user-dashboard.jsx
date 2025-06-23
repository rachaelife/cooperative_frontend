import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Button, List, Avatar, Tag, Spin } from 'antd';
import {
  WalletOutlined,
  BankOutlined,
  RiseOutlined,
  CalendarOutlined,
  PlusOutlined,
  EyeOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import UserDashboardLayout from '../components/user-dashboard-layout';
import { memberServices, savingServices, loanServices, loanapplicationservices } from '../services/api';
import { toast } from 'sonner';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalSavings: 0,
    totalLoans: 0,
    outstandingBalance: 0,
    nextPayment: null,
    savingsByType: {},
    recentTransactions: [],
    loanApplications: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userId = userInfo.user_id;

      if (!userId) {
        toast.error('User not found. Please login again.');
        navigate('/user/login');
        return;
      }

      console.log('🔍 Fetching dashboard data for user:', userId);

      // Fetch all user data in parallel
      const [savingsData, loansData, loanApplicationsData] = await Promise.allSettled([
        savingServices.getUserSavings(userId),
        loanServices.getUserLoans(userId),
        loanapplicationservices.getUserLoanApplications(userId)
      ]);

      // Process savings data
      const savings = savingsData.status === 'fulfilled' ? savingsData.value : { data: [], total: { total_savings: 0 } };
      const totalSavings = savings?.total?.total_savings || 0;

      // Process loans data
      const loans = loansData.status === 'fulfilled' ? loansData.value : [];
      const totalLoans = loans?.reduce((sum, loan) => sum + parseFloat(loan.loan_amount || 0), 0) || 0;
      const outstandingBalance = loans?.reduce((sum, loan) =>
        loan.status === 'active' ? sum + parseFloat(loan.remaining_balance || 0) : sum, 0) || 0;

      // Process loan applications data
      const applications = loanApplicationsData.status === 'fulfilled' ? loanApplicationsData.value : [];

      // Group savings by type
      const savingsByType = (savings?.data || []).reduce((acc, saving) => {
        const type = saving.savings_type || 'other';
        acc[type] = (acc[type] || 0) + parseFloat(saving.amount || 0);
        return acc;
      }, {});

      // Find next payment (from active loans or pending applications)
      const nextPayment = loans?.find(loan => loan.status === 'active')?.next_payment_date || null;

      console.log('✅ Dashboard data processed:', {
        totalSavings,
        totalLoans,
        outstandingBalance,
        savingsCount: savings?.data?.length || 0,
        loansCount: loans?.length || 0,
        applicationsCount: applications?.length || 0
      });

      setUserStats({
        totalSavings,
        totalLoans,
        outstandingBalance,
        nextPayment,
        savingsByType,
        recentTransactions: savings?.data?.slice(0, 5) || [],
        loanApplications: applications?.slice(0, 3) || []
      });

    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const savingsChartData = {
    labels: ['Regular Savings', 'Shares', 'Building Fund', 'Development Fund'],
    datasets: [
      {
        data: [
          userStats.savingsByType.savings || 0,
          userStats.savingsByType.shares || 0,
          userStats.savingsByType.building || 0,
          userStats.savingsByType.development || 0,
        ],
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#FF9800',
          '#9C27B0',
        ],
        borderWidth: 0,
      },
    ],
  };

  const savingsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ₦${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Monthly Savings Trend Chart Data
  const monthlyTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Savings',
        data: [15000, 20000, 18000, 25000, 22000, 30000],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const monthlyTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `Savings: ₦${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
          },
          callback: function(value) {
            return '₦' + value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const quickActions = [
    {
      title: 'Add Savings',
      description: 'Make a new savings contribution',
      icon: <PlusOutlined />,
      color: '#52c41a',
      action: () => navigate('/user/savings'),
    },
    {
      title: 'Apply for Loan',
      description: 'Submit a new loan application',
      icon: <BankOutlined />,
      color: '#1890ff',
      action: () => navigate('/user/loans'),
    },
    {
      title: 'View Savings',
      description: 'Check all your savings',
      icon: <EyeOutlined />,
      color: '#722ed1',
      action: () => navigate('/user/savings'),
    },
    {
      title: 'View Profile',
      description: 'Manage your profile',
      icon: <UserOutlined />,
      color: '#fa8c16',
      action: () => navigate('/user/profile'),
    },
  ];

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-blue-950 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome to Your Financial Dashboard</h1>
          <p className="text-blue-100">Manage your savings, loans, and financial goals all in one place.</p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-green-100">Total Savings</span>}
                value={userStats.totalSavings}
                prefix={<WalletOutlined className="text-green-200" />}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-blue-100">Total Loans</span>}
                value={userStats.totalLoans}
                prefix={<BankOutlined className="text-blue-200" />}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-orange-100">Outstanding Balance</span>}
                value={userStats.outstandingBalance}
                prefix={<ExclamationCircleOutlined className="text-orange-200" />}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-purple-100">Savings Goal</span>}
                value={85}
                suffix="%"
                prefix={<RiseOutlined className="text-purple-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
              <Progress percent={85} strokeColor="#fff" showInfo={false} />
            </Card>
          </Col>
        </Row>

        {/* Charts and Quick Actions */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Savings Breakdown" className="shadow-md">
              <div style={{ height: '300px' }}>
                {Object.values(userStats.savingsByType).some(value => value > 0) ? (
                  <Doughnut data={savingsChartData} options={savingsChartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-4">💰</div>
                      <h3 className="text-lg font-medium text-gray-600 mb-2">No Savings Yet</h3>
                      <p className="text-gray-500">Start saving to see your breakdown chart</p>
                      <Button
                        type="primary"
                        className="mt-4 bg-blue-950 hover:bg-blue-900"
                        onClick={() => navigate('/user/savings')}
                      >
                        Add Savings
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Monthly Savings Trend" className="shadow-md">
              <div style={{ height: '300px' }}>
                <Line data={monthlyTrendData} options={monthlyTrendOptions} />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="Quick Actions" className="shadow-md">
              <Row gutter={[16, 16]}>
                {quickActions.map((action, index) => (
                  <Col xs={12} sm={6} lg={6} key={index}>
                    <Card
                      hoverable
                      className="text-center cursor-pointer h-32"
                      onClick={action.action}
                      style={{ borderColor: action.color }}
                    >
                      <div style={{ color: action.color, fontSize: '24px', marginBottom: '8px' }}>
                        {action.icon}
                      </div>
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity and Loan Status Chart */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Recent Savings" className="shadow-md">
              <List
                dataSource={userStats.recentTransactions}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<DollarOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                      title={`₦${Number(item.amount).toLocaleString()}`}
                      description={
                        <div>
                          <Tag color="blue">{item.savings_type}</Tag>
                          <span className="text-gray-500 ml-2">{item.month_paid}</span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No recent savings found' }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Loan Applications Overview" className="shadow-md">
              {userStats.loanApplications.length > 0 ? (
                <div>
                  <div className="mb-4">
                    <Row gutter={[16, 16]}>
                      <Col span={8} className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {userStats.loanApplications.filter(app => app.loan_status === 'approved').length}
                        </div>
                        <div className="text-sm text-gray-500">Approved</div>
                      </Col>
                      <Col span={8} className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {userStats.loanApplications.filter(app => app.loan_status === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-500">Pending</div>
                      </Col>
                      <Col span={8} className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {userStats.loanApplications.filter(app => app.loan_status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-500">Completed</div>
                      </Col>
                    </Row>
                  </div>
                  <List
                    dataSource={userStats.loanApplications.slice(0, 3)}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<BankOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                          title={`₦${Number(item.loan_amount).toLocaleString()}`}
                          description={
                            <div>
                              <Tag color={item.loan_status === 'approved' ? 'green' : item.loan_status === 'pending' ? 'orange' : item.loan_status === 'completed' ? 'blue' : 'red'}>
                                {item.loan_status}
                              </Tag>
                              <span className="text-gray-500 ml-2">{item.loan_purpose}</span>
                              {item.loan_term && (
                                <span className="text-gray-400 ml-2">• {item.loan_term} months</span>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                  {userStats.loanApplications.length > 3 && (
                    <div className="text-center mt-4">
                      <Button
                        type="link"
                        onClick={() => navigate('/user/loans')}
                        className="text-blue-600"
                      >
                        View All Applications ({userStats.loanApplications.length})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏦</div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Loan Applications</h3>
                  <p className="text-gray-500 mb-4">Apply for a loan to get started</p>
                  <Button
                    type="primary"
                    className="bg-blue-950 hover:bg-blue-900"
                    onClick={() => navigate('/user/loans')}
                  >
                    Apply for Loan
                  </Button>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </UserDashboardLayout>
  );
};

export default UserDashboard;
