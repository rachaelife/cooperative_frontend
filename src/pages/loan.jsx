import DashboardLayout from "../components/_layout";
import {
  Input,
  Modal,
  Select,
  AutoComplete,
  Button,
  Tabs,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Tag,
  Avatar
} from "antd";
import "../styles/table.css";
import { useEffect, useState } from "react";
import Loans from "../components/loans";
import Loanapp from "../components/loanapp";
import { loanapplicationservices, memberServices, loanServices } from "../services/api";
import RepaymentHistory from "../components/repayment-history";
import AdminRepaymentManagement from "../components/admin-repayment-management";
import { toast } from "sonner";
import {
  MdAccountBalance,
  MdAssignment,
  MdPayment,
  MdPerson,
  MdAttachMoney,
  MdCalendarToday,
  MdDescription,
  MdSchedule
} from "react-icons/md";
import {
  PlusOutlined,
  UserOutlined,
  SearchOutlined,
  DollarOutlined,
  FileTextOutlined,
  BankOutlined
} from '@ant-design/icons';
import { Fade } from "react-awesome-reveal";

function Loan() {
  
  const [open, setOPen] = useState(false);
  const [loanapplication, setloanapplication] = useState(false);
  const [members, setmembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Refresh triggers for child components
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  // Loan Statistics State
  const [loanStats, setLoanStats] = useState({
    activeLoans: 0,
    totalDisbursed: 0,
    totalApplications: 0,
    pendingApplications: 0,
    loading: true
  });

  // Loan Calculator State
  const [calculator, setCalculator] = useState({
    loanAmount: "",
    loanTerm: "",
    showCalculation: false,
    repaymentSchedule: []
  });
  const [loanDisbursement, setLoanDisbursement] = useState({
    user_id: "",
    amount_disbursed: "",
    date: "",
    loan_repayment: "",
    total_interest: ""
  });


  const loanPeriod = [
    {label: "1 Month(s)", value:1},
    {label: "2 Month(s)", value:2},
    {label: "3 Month(s)", value:3},
    {label: "4 Month(s)", value:4},
    {label: "5 Month(s)", value:5},
    {label: "6 Month(s)", value:6},
    {label: "7 Month(s)", value:7},
    {label: "8 Month(s)", value:8},
    {label: "9 Month(s)", value:9},
    {label: "10 Month(s)", value:10},
    {label: "11 Month(s)", value:11},
    {label: "12 Month(s)", value:12}
  ]

  const loanPurpose = [
    {
      label: "School Fee",
      value: "School Fee"
    },
    {
      label: "Pay Rent",
      value: "Pay Rent"
    },
    {
      label: "Balance Loan",
      value: "Balance Loan"
    },
    {
      label: "Develop Business",
      value: "Develop Business"
    },
    {
      label: "Start up Business",
      value: "Start up Business"
    },
    {
      label: "Pay Hospital Bills",
      value: "Pay Hospital Bills"
    },
    {
      label: "Others",
      value: "Others"
    },
  ]

  // Function to refresh all loan data - defined before items array
  const refreshAllLoanData = () => {
    try {
      console.log("🔄 Refreshing all loan data...");
      fetchLoanStatistics();
      setRefreshTrigger(prev => prev + 1); // This will trigger child components to refresh
      toast.success("Loan data refreshed");
    } catch (error) {
      console.error("❌ Error refreshing loan data:", error);
      toast.error("Failed to refresh data");
    }
  };

  const items = [
    {
      key: "1",
      label: "Disbursed Loans",
      children: <Loans refreshTrigger={refreshTrigger} />,
    },
    {
      key: "2",
      label: "Loan Applications",
      children: <Loanapp refreshTrigger={refreshTrigger} onStatusUpdate={refreshAllLoanData} />,
    },
    {
      key: "3",
      label: "Repayment History",
      children: <RepaymentHistory refreshTrigger={refreshTrigger} />,
    },
    {
      key: "4",
      label: "Admin Repayment Management",
      children: <AdminRepaymentManagement refreshTrigger={refreshTrigger} />,
    }
    ];

  const [loan_application, setloan_application] = useState({
    user_id: "",
    loan_amount: "",
    loan_term: "",
    loan_purpose: "",
    loan_status: "",
  });

  // Loan Calculator Functions
  const calculateLoanRepayment = () => {
    const amount = parseFloat(calculator.loanAmount);
    const term = parseInt(calculator.loanTerm);

    if (!amount || !term || amount <= 0 || term <= 0) {
      toast.error("Please enter valid loan amount and term");
      return;
    }

    const monthlyPrincipal = amount / term;
    const schedule = [];
    let remainingBalance = amount;
    let totalInterest = 0;

    for (let month = 1; month <= term; month++) {
      const interestForMonth = remainingBalance * 0.01; // 1% interest
      const totalMonthlyPayment = monthlyPrincipal + interestForMonth;

      schedule.push({
        month: month,
        remainingBalance: remainingBalance,
        principal: monthlyPrincipal,
        interest: interestForMonth,
        totalPayment: totalMonthlyPayment,
        balanceAfterPayment: remainingBalance - monthlyPrincipal
      });

      remainingBalance -= monthlyPrincipal;
      totalInterest += interestForMonth;
    }

    setCalculator(prev => ({
      ...prev,
      repaymentSchedule: schedule,
      showCalculation: true,
      totalInterest: totalInterest,
      totalAmount: amount + totalInterest
    }));
  };

  const resetCalculator = () => {
    setCalculator({
      loanAmount: "",
      loanTerm: "",
      showCalculation: false,
      repaymentSchedule: []
    });
  };

  const fetchAllMember = async () => {
    setLoadingMembers(true);
    try {
      console.log("🔍 Fetching members for loan application form...");

      const data = await Promise.race([
        memberServices.Allmembers(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      ]);

      console.log("📊 Members data received:", data);
      console.log("📊 Members count:", data?.length || 0);

      if (data && Array.isArray(data) && data.length > 0) {
        setmembers(data);
        console.log("✅ Members set successfully:", data.length);
      } else {
        console.log("⚠️ No members found or invalid data format");
        setmembers([]);
      }
    } catch (error) {
      console.error("❌ Error fetching members:", error.message);
      setmembers([]);
      // Don't show error toast - page should still work without members initially
      console.warn("⚠️ Members will be empty - can be fetched later");
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchLoanStatistics = async () => {
    try {
      setLoanStats(prev => ({ ...prev, loading: true }));
      console.log("🔄 Fetching loan statistics...");

      // Fetch active loans count with timeout
      let activeLoansResponse = [];
      let applicationsResponse = [];

      try {
        activeLoansResponse = await Promise.race([
          loanServices.getAllLoans(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ]);
        console.log("✅ Active loans fetched:", activeLoansResponse?.length || 0);
      } catch (error) {
        console.warn("⚠️ Failed to fetch active loans:", error.message);
        activeLoansResponse = [];
      }

      try {
        applicationsResponse = await Promise.race([
          loanapplicationservices.Allapplication(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ]);
        console.log("✅ Applications fetched:", applicationsResponse?.length || 0);
      } catch (error) {
        console.warn("⚠️ Failed to fetch applications:", error.message);
        applicationsResponse = [];
      }

      const activeLoans = Array.isArray(activeLoansResponse) ? activeLoansResponse.filter(loan => loan.status === 'active').length : 0;
      const totalDisbursed = Array.isArray(activeLoansResponse)
        ? activeLoansResponse.reduce((sum, loan) => sum + (parseFloat(loan.amount_disbursed) || 0), 0)
        : 0;
      const totalApplications = Array.isArray(applicationsResponse) ? applicationsResponse.length : 0;
      const pendingApplications = Array.isArray(applicationsResponse)
        ? applicationsResponse.filter(app => app.loan_status === 'pending').length
        : 0;

      setLoanStats({
        activeLoans,
        totalDisbursed,
        totalApplications,
        pendingApplications,
        loading: false
      });

      console.log("✅ Loan statistics updated successfully");
    } catch (error) {
      console.error("❌ Error fetching loan statistics:", error);
      setLoanStats({
        activeLoans: 0,
        totalDisbursed: 0,
        totalApplications: 0,
        pendingApplications: 0,
        loading: false
      });
      // Don't show error toast for statistics - page should still work
      console.warn("⚠️ Using default statistics values");
    }
  };

  const handlesubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!loan_application.user_id) {
      toast.error("Please select a member");
      return;
    }

    if (!loan_application.loan_amount) {
      toast.error("Please enter loan amount");
      return;
    }

    const loanAmount = parseFloat(loan_application.loan_amount);
    if (isNaN(loanAmount)) {
      toast.error("Please enter a valid loan amount");
      return;
    }

    if (loanAmount < 1000) {
      toast.error("Minimum loan amount is ₦1,000");
      return;
    }

    if (loanAmount > 10000000) {
      toast.error("Maximum loan amount is ₦10,000,000");
      return;
    }

    if (!loan_application.loan_term) {
      toast.error("Please select loan term");
      return;
    }

    if (!loan_application.loan_purpose) {
      toast.error("Please select loan purpose");
      return;
    }

    const success = await loanapplicationservices.Newloanapplication(
      loan_application.user_id,
      loan_application.loan_amount,
      loan_application.loan_term,
      loan_application.loan_purpose,
      "pending" // Set initial status as pending
    );

    if (success) {
      setloanapplication(false); // Close the modal
      setloan_application({ // Reset the form
        user_id: "",
        loan_amount: "",
        loan_term: "",
        loan_purpose: "",
        loan_status: "",
      });
      // Refresh loan statistics after successful submission
      fetchLoanStatistics();
    }
  };

  const handleDisbursementSubmit = async (e) => {
    e.preventDefault();
    
    const success = await loanServices.disburseLoan(
      loanDisbursement.user_id,
      loanDisbursement.amount_disbursed,
      loanDisbursement.date,
      loanDisbursement.loan_repayment,
      loanDisbursement.total_interest
    );
    
    if (success) {
      setOPen(false);
      // Reset form
      setLoanDisbursement({
        user_id: "",
        amount_disbursed: "",
        date: "",
        loan_repayment: "",
        total_interest: ""
      });
      // Refresh loan statistics after successful disbursement
      fetchLoanStatistics();
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      try {
        setPageLoading(true);
        setPageError(null);
        console.log("🚀 Initializing loan page...");

        // Run both functions concurrently but don't let them block the page
        await Promise.allSettled([
          fetchAllMember(),
          fetchLoanStatistics()
        ]);

        console.log("✅ Loan page initialized successfully");
      } catch (error) {
        console.error("❌ Error initializing loan page:", error);
        setPageError(error.message);
      } finally {
        setPageLoading(false);
      }
    };

    initializePage();
  }, []);

  // Show loading screen while page initializes
  if (pageLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Loading Loan Management...</h2>
            <p className="text-gray-500 mt-2">Please wait while we fetch your data</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error screen if page failed to load
  if (pageError) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-700">Failed to Load Loan Management</h2>
            <p className="text-gray-600 mt-2 mb-4">Error: {pageError}</p>
            <Button
              type="primary"
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              🔄 Reload Page
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <Fade direction="left" delay={300}>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🏦 Loan Management</h1>
            <p className="text-gray-600">Manage loan applications, disbursements, and repayments</p>
          </Fade>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={6}>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-blue-100">Active Loans</span>}
                value={loanStats.loading ? 0 : loanStats.activeLoans}
                prefix={<MdAccountBalance className="text-blue-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
                loading={loanStats.loading}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-green-100">Total Disbursed</span>}
                value={loanStats.loading ? 0 : loanStats.totalDisbursed}
                prefix={<MdPayment className="text-green-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
                loading={loanStats.loading}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-purple-100">Applications</span>}
                value={loanStats.loading ? 0 : loanStats.totalApplications}
                prefix={<MdAssignment className="text-purple-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
                loading={loanStats.loading}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-orange-100">Pending</span>}
                value={loanStats.loading ? 0 : loanStats.pendingApplications}
                prefix={<MdSchedule className="text-orange-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
                loading={loanStats.loading}
              />
            </Card>
          </Col>
        </Row>

        {/* Loan Repayment Calculator */}
        <Card className="mb-6 shadow-lg border-0">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🧮 Loan Repayment Calculator
              <Tag color="blue">1% Monthly Interest</Tag>
            </h3>
            <p className="text-gray-600 mt-1">Calculate loan repayment schedule with 1% interest on remaining balance</p>
          </div>

          <Row gutter={[24, 16]}>
            {/* Calculator Input */}
            <Col xs={24} lg={8}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💰 Loan Amount (₦)
                  </label>
                  <Input
                    size="large"
                    placeholder="Enter loan amount"
                    value={calculator.loanAmount}
                    onChange={(e) => setCalculator(prev => ({ ...prev, loanAmount: e.target.value }))}
                    prefix="₦"
                    type="number"
                    className="rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📅 Loan Term (Months)
                  </label>
                  <Select
                    size="large"
                    placeholder="Select loan term"
                    value={calculator.loanTerm}
                    onChange={(value) => setCalculator(prev => ({ ...prev, loanTerm: value }))}
                    className="w-full"
                    options={[
                      { value: "3", label: "3 Months" },
                      { value: "6", label: "6 Months" },
                      { value: "9", label: "9 Months" },
                      { value: "12", label: "12 Months" },
                      { value: "18", label: "18 Months" },
                      { value: "24", label: "24 Months" },
                    ]}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="primary"
                    size="large"
                    onClick={calculateLoanRepayment}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    icon={<DollarOutlined />}
                  >
                    Calculate
                  </Button>
                  <Button
                    size="large"
                    onClick={resetCalculator}
                    className="px-4"
                  >
                    Reset
                  </Button>
                </div>

                {/* Example */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">📝 Example:</p>
                  <p className="text-xs text-blue-700 mt-1">
                    ₦60,000 for 6 months = ₦10,000 monthly principal<br/>
                    Month 1: ₦10,000 + ₦600 interest = ₦10,600<br/>
                    Month 2: ₦10,000 + ₦500 interest = ₦10,500
                  </p>
                </div>
              </div>
            </Col>

            {/* Calculation Summary */}
            {calculator.showCalculation && (
              <Col xs={24} lg={16}>
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                        <Statistic
                          title={<span className="text-green-100">Loan Amount</span>}
                          value={parseFloat(calculator.loanAmount)}
                          prefix="₦"
                          valueStyle={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}
                          formatter={(value) => `${Number(value).toLocaleString()}`}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                        <Statistic
                          title={<span className="text-orange-100">Total Interest</span>}
                          value={calculator.totalInterest}
                          prefix="₦"
                          valueStyle={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}
                          formatter={(value) => `${Number(value).toLocaleString()}`}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                        <Statistic
                          title={<span className="text-purple-100">Total Repayment</span>}
                          value={calculator.totalAmount}
                          prefix="₦"
                          valueStyle={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}
                          formatter={(value) => `${Number(value).toLocaleString()}`}
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* Repayment Schedule Table */}
                  <Card className="border border-gray-200">
                    <div className="mb-3">
                      <h4 className="text-lg font-semibold text-gray-800">📋 Repayment Schedule</h4>
                      <p className="text-sm text-gray-600">Monthly breakdown with 1% interest on remaining balance</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="text-left p-3 font-semibold text-gray-700">Month</th>
                            <th className="text-right p-3 font-semibold text-gray-700">Balance Before</th>
                            <th className="text-right p-3 font-semibold text-gray-700">Principal</th>
                            <th className="text-right p-3 font-semibold text-gray-700">Interest (1%)</th>
                            <th className="text-right p-3 font-semibold text-gray-700">Total Payment</th>
                            <th className="text-right p-3 font-semibold text-gray-700">Balance After</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calculator.repaymentSchedule.map((payment, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-medium text-blue-600">Month {payment.month}</td>
                              <td className="p-3 text-right">₦{payment.remainingBalance.toLocaleString()}</td>
                              <td className="p-3 text-right">₦{payment.principal.toLocaleString()}</td>
                              <td className="p-3 text-right text-orange-600">₦{payment.interest.toLocaleString()}</td>
                              <td className="p-3 text-right font-semibold text-green-600">₦{payment.totalPayment.toLocaleString()}</td>
                              <td className="p-3 text-right">₦{payment.balanceAfterPayment.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </Col>
            )}
          </Row>
        </Card>

        {/* Action Bar */}
        <Card className="mb-6 shadow-md">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Loan Operations</h2>
              <Tag color="blue">Quick Actions</Tag>
            </div>

            <Space size="middle">
              <Button
                type="primary"
                icon={<BankOutlined />}
                onClick={() => setOPen(true)}
                className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                size="large"
              >
                Disburse Loan
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setloanapplication(true);
                  if (members.length === 0) {
                    fetchAllMember();
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                size="large"
              >
                New Application
              </Button>

              <Button
                onClick={refreshAllLoanData}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="large"
              >
                🔄 Refresh All Data
              </Button>
            </Space>
          </div>
        </Card>

        {/* Enhanced Loan Disbursement Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <BankOutlined className="text-green-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Loan Disbursement</h2>
                <p className="text-sm text-gray-600">Disburse approved loan to member</p>
              </div>
            </div>
          }
          open={open}
          footer={null}
          onCancel={() => setOPen(false)}
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
          <form onSubmit={handleDisbursementSubmit} className="mt-6">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdPerson className="text-gray-500" />
                    Select Member *
                  </label>
                  <AutoComplete
                    size="large"
                    placeholder="Search and select member"
                    options={members?.map((member) => ({
                      label: (
                        <div className="flex items-center gap-3">
                          <Avatar size={24} icon={<UserOutlined />} />
                          <span>{member.fullname || `Member ${member.user_id}`}</span>
                        </div>
                      ),
                      value: member.user_id,
                    })) || []}
                    onChange={(value) => {
                      setLoanDisbursement({
                        ...loanDisbursement,
                        user_id: value,
                      });
                    }}
                    value={loanDisbursement.user_id}
                    loading={loadingMembers}
                    notFoundContent={
                      loadingMembers ? "Loading..." :
                      members?.length === 0 ? "No members found" :
                      "No matching members"
                    }
                  />
                </div>
              </Col>

              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdAttachMoney className="text-gray-500" />
                    Amount Disbursed *
                  </label>
                  <Input
                    size="large"
                    type="number"
                    placeholder="Enter amount"
                    prefix="₦"
                    value={loanDisbursement.amount_disbursed}
                    onChange={(e) =>
                      setLoanDisbursement({
                        ...loanDisbursement,
                        amount_disbursed: e.target.value
                      })
                    }
                  />
                </div>
              </Col>

              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdCalendarToday className="text-gray-500" />
                    Disbursement Date *
                  </label>
                  <Input
                    size="large"
                    type="date"
                    value={loanDisbursement.date}
                    onChange={(e) =>
                      setLoanDisbursement({
                        ...loanDisbursement,
                        date: e.target.value
                      })
                    }
                  />
                </div>
              </Col>

              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Repayment Amount</label>
                  <Input
                    size="large"
                    type="number"
                    placeholder="Enter repayment amount"
                    prefix="₦"
                    value={loanDisbursement.loan_repayment}
                    onChange={(e) =>
                      setLoanDisbursement({
                        ...loanDisbursement,
                        loan_repayment: e.target.value
                      })
                    }
                  />
                </div>
              </Col>

              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Total Interest</label>
                  <Input
                    size="large"
                    type="number"
                    placeholder="Enter interest amount"
                    prefix="₦"
                    value={loanDisbursement.total_interest}
                    onChange={(e) =>
                      setLoanDisbursement({
                        ...loanDisbursement,
                        total_interest: e.target.value
                      })
                    }
                  />
                </div>
              </Col>
            </Row>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
              <Button size="large" onClick={() => setOPen(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                className="bg-green-600 hover:bg-green-700"
              >
                Disburse Loan
              </Button>
            </div>
          </form>
        </Modal>

        {/* Enhanced Loan Application Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileTextOutlined className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Loan Application</h2>
                <p className="text-sm text-gray-600">Submit a new loan application</p>
              </div>
            </div>
          }
          open={loanapplication}
          footer={null}
          onCancel={() => setloanapplication(false)}
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
          <form onSubmit={handlesubmit} className="mt-6">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MdPerson className="text-gray-500" />
                      Select Applicant *
                    </label>
                    <Button
                      size="small"
                      onClick={fetchAllMember}
                      loading={loadingMembers}
                      icon={<SearchOutlined />}
                    >
                      Refresh
                    </Button>
                  </div>
                  <Select
                    size="large"
                    placeholder="Select member"
                    value={loan_application.user_id}
                    options={members?.map((member) => ({
                      label: member.fullname || `Member ${member.user_id}`,
                      value: member.user_id,
                    })) || []}
                    loading={loadingMembers}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    notFoundContent={
                      loadingMembers ? "Loading..." :
                      members?.length === 0 ? "No members found" :
                      "No matching members"
                    }
                    onChange={(value) => {
                      setloan_application({
                        ...loan_application,
                        user_id: value,
                      });
                    }}
                  />
                </div>
              </Col>

              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdAttachMoney className="text-gray-500" />
                    Loan Amount *
                  </label>
                  <Input
                    size="large"
                    type="number"
                    placeholder="Enter loan amount (minimum ₦1,000)"
                    prefix="₦"
                    min={1000}
                    max={10000000}
                    value={loan_application.loan_amount}
                    onChange={(e) =>
                      setloan_application({
                        ...loan_application,
                        loan_amount: e.target.value,
                      })
                    }
                  />
                </div>
              </Col>

              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdSchedule className="text-gray-500" />
                    Loan Term *
                  </label>
                  <Select
                    size="large"
                    placeholder="Select loan term"
                    value={loan_application.loan_term}
                    options={loanPeriod.map((term) => ({
                      value: term.value,
                      label: term.label
                    }))}
                    onChange={(value) => setloan_application({...loan_application, loan_term: value})}
                  />
                </div>
              </Col>

              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdDescription className="text-gray-500" />
                    Loan Purpose *
                  </label>
                  <Select
                    size="large"
                    placeholder="Select loan purpose"
                    value={loan_application.loan_purpose}
                    options={loanPurpose.map((purpose) => ({
                      value: purpose.value,
                      label: purpose.label
                    }))}
                    onChange={(value) => setloan_application({...loan_application, loan_purpose: value})}
                  />
                </div>
              </Col>
            </Row>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
              <Button size="large" onClick={() => setloanapplication(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Submit Application
              </Button>
            </div>
          </form>
        </Modal>

        {/* Search and Filter Section */}
        <Card className="mb-6 shadow-md">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Search Loans</label>
                <Input
                  placeholder="Search by member name, amount, or status..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  size="large"
                  className="rounded-lg"
                />
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Filter by</label>
                <Select
                  placeholder="Select filter criteria"
                  size="large"
                  className="w-full"
                  options={[
                    { value: "all", label: "All Loans" },
                    { value: "pending", label: "Pending Applications" },
                    { value: "approved", label: "Approved Loans" },
                    { value: "active", label: "Active Loans" },
                    { value: "completed", label: "Completed Loans" },
                  ]}
                />
              </div>
            </Col>
          </Row>
        </Card>

        {/* Enhanced Tabs */}
        <Card className="shadow-lg">
          <Tabs
            defaultActiveKey="1"
            items={items}
            className="custom-tabs"
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default Loan;
