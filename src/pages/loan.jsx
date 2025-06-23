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
  Avatar,
  Tooltip
} from "antd";
import "../styles/table.css";
import { CgAdd } from "react-icons/cg";
import { useEffect, useState } from "react";
import Loans from "../components/loans";
import Loanapp from "../components/loanapp";
import { loanapplicationservices, memberServices, loanServices } from "../services/api";
import RepaymentHistory from "../components/repayment-history";
import AdminRepaymentManagement from "../components/admin-repayment-management";
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
  FilterOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BankOutlined
} from '@ant-design/icons';
import { Fade } from "react-awesome-reveal";

function Loan() {
  
  const [open, setOPen] = useState(false);
  const [loanapplication, setloanapplication] = useState(false);
  const [members, setmembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
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

  const items = [
    {
      key: "1",
      label: "Disbursed Loans",
      children: <Loans />,
    },
    {
      key: "2",
      label: "Loan Applications",
      children: <Loanapp />,
    },
    {
      key: "3",
      label: "Repayment History",
      children: <RepaymentHistory />,
    },
    {
      key: "4",
      label: "Admin Repayment Management",
      children: <AdminRepaymentManagement />,
    }
    ];

  const [loan_application, setloan_application] = useState({
    user_id: "",
    loan_amount: "",
    loan_term: "",
    loan_purpose: "",
    loan_status: "",
  });

  const fetchAllMember = async () => {
    setLoadingMembers(true);
    try {
      console.log("🔍 Fetching members for loan application form...");
      const data = await memberServices.Allmembers();
      console.log("📊 Members data received:", data);
      console.log("📊 Members count:", data?.length || 0);
      console.log("📊 Sample member:", data?.[0]);

      if (data && Array.isArray(data) && data.length > 0) {
        setmembers(data);
        console.log("✅ Members set successfully:", data.length);
      } else {
        console.log("⚠️ No members found or invalid data format");
        setmembers([]);
      }
    } catch (error) {
      console.error("❌ Error fetching members:", error);
      setmembers([]);
    } finally {
      setLoadingMembers(false);
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
    }
  };

  useEffect(() => {
    fetchAllMember();
  }, []);

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
                value={25}
                prefix={<MdAccountBalance className="text-blue-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-green-100">Total Disbursed</span>}
                value={2500000}
                prefix={<MdPayment className="text-green-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-purple-100">Applications</span>}
                value={45}
                prefix={<MdAssignment className="text-purple-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-orange-100">Pending</span>}
                value={12}
                prefix={<MdSchedule className="text-orange-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

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
