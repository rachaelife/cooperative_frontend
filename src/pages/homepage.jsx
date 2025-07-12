import { useEffect, useState } from "react";
import DashboardLayout from "../components/_layout";
import {
  MdSavings,
  MdPeople,
  MdAccountBalance,
  // MdTrendingUp,
  MdAssignment,
  MdBusiness,
  MdDeveloperMode,
  MdShare
} from "react-icons/md";
import { FaUsers, FaMoneyBillWave, FaChartLine, FaFileAlt } from "react-icons/fa";
import { Card, Row, Col, Statistic, Spin, Alert, Modal, Button } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import {useNavigate} from "react-router-dom" 
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { memberServices, savingServices, loanServices, dashboardServices } from "../services/api";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);


function Homepage() {

  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState({
    totalMembers: 0,
    totalSavings: 0,
    totalLoans: 0,
    totalLoanAmount: 0,
    totalLoanApplications: 0,
    totalShares: 0,
    totalBuilding: 0,
    totalDevelopment: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  const logout = () =>{
    localStorage.removeItem("token")
    navigate("/login")
  }
  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Try to use the new dashboard stats endpoint first
      try {
        const dashboardStats = await dashboardServices.getDashboardStats();
        setDashboardData({
          totalMembers: dashboardStats.totalMembers || 0,
          totalSavings: dashboardStats.totalSavings || 0,
          totalLoans: dashboardStats.totalLoans || 0,
          totalLoanAmount: dashboardStats.totalLoanAmount || 0,
          pendingApplications: dashboardStats.pendingApplications || 0,
          totalShares: dashboardStats.totalShares || 0,
          totalBuilding: dashboardStats.totalBuilding || 0,
          totalDevelopment: dashboardStats.totalDevelopment || 0,
          recentMembers: dashboardStats.recentMembers || 0,
          recentLoans: dashboardStats.recentLoans || 0
        });
        return;
      } catch (dashboardError) {
        }
      // Fallback to individual API calls
      const [
        membersResponse,
        savingsResponse,
        loansResponse,
        loanAmountResponse,
        loanApplicationsResponse,
        sharesResponse,
        buildingResponse,
        developmentResponse
      ] = await Promise.allSettled([
        memberServices.Allmembers(),
        savingServices.getTotalsavings(),
        loanServices.getTotalLoans(),
        loanServices.getTotalLoanAmount(),
        loanServices.getTotalLoanApplications(),
        savingServices.getTotalshares(),
        savingServices.getTotalbuilding(),
        savingServices.getUserDev()
      ]);
      setDashboardData({
        totalMembers: membersResponse.status === 'fulfilled' ?
          (Array.isArray(membersResponse.value) ? membersResponse.value.length : 0) : 0,
        totalSavings: savingsResponse.status === 'fulfilled' ?
          (savingsResponse.value?.[0]?.total || 0) : 0,
        totalLoans: loansResponse.status === 'fulfilled' ?
          (loansResponse.value || 0) : 0,
        totalLoanAmount: loanAmountResponse.status === 'fulfilled' ?
          (loanAmountResponse.value || 0) : 0,
        totalLoanApplications: loanApplicationsResponse.status === 'fulfilled' ?
          (loanApplicationsResponse.value || 0) : 0,
        totalShares: sharesResponse.status === 'fulfilled' ?
          (sharesResponse.value?.[0]?.total || 0) : 0,
        totalBuilding: buildingResponse.status === 'fulfilled' ?
          (buildingResponse.value?.[0]?.total || 0) : 0,
        totalDevelopment: developmentResponse.status === 'fulfilled' ?
          (developmentResponse.value?.[0]?.total || 0) : 0
      });
      } catch (error) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, []);
  // Chart data configurations
  const savingsChartData = {
    labels: ['Savings', 'Shares', 'Building', 'Development'],
    datasets: [{
      label: 'Amount (₦)',
      data: [
        dashboardData.totalSavings,
        dashboardData.totalShares,
        dashboardData.totalBuilding,
        dashboardData.totalDevelopment
      ],
      backgroundColor: [
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Yellow
        '#EF4444'  // Red
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };
  const loanChartData = {
    labels: ['Total Loans', 'Loan Applications'],
    datasets: [{
      label: 'Count',
      data: [dashboardData.totalLoans, dashboardData.totalLoanApplications],
      backgroundColor: ['#8B5CF6', '#06B6D4'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };
  const monthlyTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Savings',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Loans',
        data: [8000, 12000, 18000, 15000, 20000, 25000],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      }
    ]
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Financial Overview'
      }
    }
  };
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
          <span className="ml-3">Loading dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 ADMIN DASHBOARD</h1>
          <p className="text-gray-600">Welcome to your cooperative management system overview</p>
        </div>
         <Button  onClick={ logout} className="p-2 bg-red-600 rounded-md text-white">sign out</Button>
        
        </div>
        
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-6"
            action={
              <button
                onClick={fetchDashboardData}
                className="text-blue-600 hover:text-blue-800"
              >
                Retry
              </button>
            }
          />
        )}
        {/* Summary Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-blue-100">Total Members</span>}
                value={dashboardData.totalMembers}
                prefix={<FaUsers className="text-blue-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-green-100">Total Savings</span>}
                value={dashboardData.totalSavings}
                prefix={<MdSavings className="text-green-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-purple-100">Active Loans</span>}
                value={dashboardData.totalLoans}
                prefix={<FaMoneyBillWave className="text-purple-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-orange-100">Loan Amount</span>}
                value={dashboardData.totalLoanAmount}
                prefix={<MdAccountBalance className="text-orange-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
        </Row>
        {/* Secondary Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={6}>
            <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Loan Applications</p>
                  <p className="text-2xl font-bold text-gray-800">{dashboardData.totalLoanApplications}</p>
                </div>
                <FaFileAlt className="text-3xl text-blue-500" />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Shares</p>
                  <p className="text-2xl font-bold text-gray-800">₦{Number(dashboardData.totalShares).toLocaleString()}</p>
                </div>
                <MdShare className="text-3xl text-green-500" />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-gray-600 text-sm">Building Fund</p>
                  <p className="text-2xl font-bold text-gray-800">₦{Number(dashboardData.totalBuilding).toLocaleString()}</p>
                </div>
                <MdBusiness className="text-3xl text-yellow-500" />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Development</p>
                  <p className="text-2xl font-bold text-gray-800">₦{Number(dashboardData.totalDevelopment).toLocaleString()}</p>
                </div>
                <MdDeveloperMode className="text-3xl text-red-500" />
              </div>
            </Card>
          </Col>
        </Row>
        {/* Charts Section */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={12}>
            <Card title="💰 Savings Distribution" className="shadow-lg">
              <div className="h-80">
                <Doughnut data={savingsChartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    title: {
                      display: true,
                      text: 'Savings by Category'
                    }
                  }
                }} />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="📊 Loan Overview" className="shadow-lg">
              <div className="h-80">
                <Bar data={loanChartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Loan Statistics'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} />
              </div>
            </Card>
          </Col>
        </Row>
        {/* Trend Chart */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24}>
            <Card title="📈 Monthly Trends" className="shadow-lg">
              <div className="h-80">
                <Line data={monthlyTrendData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Savings vs Loans Trend'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '₦' + value.toLocaleString();
                        }
                      }
                    }
                  }
                }} />
              </div>
            </Card>
          </Col>
        </Row>
        {/* Quick Actions */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="🚀 Quick Actions" className="shadow-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                  <MdPeople className="text-2xl text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-800 font-medium">Add Member</p>
                </button>
                <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                  <MdSavings className="text-2xl text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-800 font-medium">Record Savings</p>
                </button>
                <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                  <MdAssignment className="text-2xl text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-purple-800 font-medium">Process Loan</p>
                </button>
                <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
                  <FaChartLine className="text-2xl text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-orange-800 font-medium">View Reports</p>
                </button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
}
export default Homepage;
