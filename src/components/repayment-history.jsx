import { Table, Tag, Space, Tooltip, Button, Avatar, Empty, Card, Row, Col, Statistic } from "antd";
import React, { useEffect, useState } from "react";
import { loanRepaymentServices, loanServices } from "../services/api";
import { UserOutlined, CalendarOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import moment from "moment";

const RepaymentHistory = ({ userId = null, refreshTrigger = 0 }) => {
  const [repayments, setRepayments] = useState([]);
  const [completedLoans, setCompletedLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRepayments = async () => {
    setLoading(true);
    try {
      let repaymentData;
      if (userId) {
        console.log("🔍 Fetching repayments for user:", userId);
        repaymentData = await loanRepaymentServices.getUserRepayments(userId);
      } else {
        console.log("🔍 Fetching all repayments...");
        repaymentData = await loanRepaymentServices.getAllRepayments();
      }
      console.log("📊 Repayments received:", repaymentData);

      // Fetch completed loans
      console.log("🔍 Fetching completed loans...");
      const completedLoansData = await loanServices.getCompletedLoans();
      console.log("📊 Completed loans received:", completedLoansData);

      setRepayments(repaymentData || []);
      setCompletedLoans(completedLoansData || []);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setRepayments([]);
      setCompletedLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepayments();
  }, [userId, refreshTrigger]); // Refresh when trigger changes

  // Calculate loan details for completed loans
  const calculateLoanDetails = (loan) => {
    const principal = parseFloat(loan.amount_disbursed || 0);
    const totalRepaid = parseFloat(loan.loan_repayment || 0);
    const totalInterest = totalRepaid - principal;
    const loanTerm = loan.loan_term || loan.duration || 'N/A';

    return {
      principal,
      totalInterest: Math.max(0, totalInterest), // Ensure non-negative
      totalRepaid,
      loanTerm
    };
  };

  // Combine repayments and completed loans for display
  const getCombinedData = () => {
    const combinedData = [];

    // Add regular repayments
    repayments.forEach(rep => {
      // For regular repayments, we might not have complete loan details
      combinedData.push({
        ...rep,
        type: 'repayment',
        display_date: rep.payment_date,
        display_amount: rep.amount_paid || rep.amount,
        display_status: rep.status,
        principal: rep.principal || 0,
        total_interest: rep.total_interest || 0,
        total_amount_paid: rep.amount_paid || rep.amount || 0,
        loan_term: rep.loan_term || 'N/A'
      });
    });

    // Add completed loans as repayment records
    completedLoans.forEach(loan => {
      const loanDetails = calculateLoanDetails(loan);

      combinedData.push({
        loan_id: loan.loan_id,
        user_id: loan.user_id,
        fullname: loan.fullname,
        email: loan.email,
        mobile: loan.mobile,
        registration_number: loan.registration_number,
        amount_due: loan.amount_disbursed,
        amount_paid: loan.loan_repayment,
        type: 'completed_loan',
        display_date: loan.updated_at || loan.created_at,
        display_amount: loan.loan_repayment,
        display_status: 'completed',
        payment_method: 'loan_completion',
        notes: 'Loan marked as completed',
        // Enhanced loan details
        principal: loanDetails.principal,
        total_interest: loanDetails.totalInterest,
        total_amount_paid: loanDetails.totalRepaid,
        loan_term: loanDetails.loanTerm
      });
    });

    // Sort by date (newest first)
    return combinedData.sort((a, b) => new Date(b.display_date) - new Date(a.display_date));
  };

  // Calculate repayment summary
  const calculateSummary = () => {
    const combinedData = getCombinedData();
    const totalPrincipal = combinedData.reduce((sum, rep) => sum + parseFloat(rep.principal || 0), 0);
    const totalInterest = combinedData.reduce((sum, rep) => sum + parseFloat(rep.total_interest || 0), 0);
    const totalPaid = combinedData.reduce((sum, rep) => sum + parseFloat(rep.total_amount_paid || 0), 0);
    const paidCount = combinedData.filter(rep => rep.display_status?.toLowerCase() === 'paid' || rep.display_status?.toLowerCase() === 'completed').length;
    const pendingCount = combinedData.filter(rep => rep.display_status?.toLowerCase() === 'pending').length;

    return {
      totalPrincipal,
      totalInterest,
      totalPaid,
      totalOutstanding: totalPrincipal - totalPaid,
      paidCount,
      pendingCount,
      totalRecords: combinedData.length
    };
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'green';
      case 'pending': return 'orange';
      case 'overdue': return 'red';
      case 'partial': return 'blue';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'S/N',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 60,
      align: 'center',
    },
    {
      title: 'Member',
      dataIndex: 'fullname',
      key: 'fullname',
      width: 200,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar size={32} icon={<UserOutlined />} className="bg-purple-500" />
          <div>
            <div className="font-medium text-gray-800">{text || 'N/A'}</div>
            <div className="text-xs text-gray-500">ID: {record.user_id || 'N/A'}</div>
          </div>
        </div>
      ),
    },
  
    
    {
      title: 'Principal',
      dataIndex: 'principal',
      key: 'principal',
      width: 120,
      align: 'right',
      render: (amount) => (
        <span className="font-medium text-blue-600">
          ₦{parseFloat(amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Total Interest',
      dataIndex: 'total_interest',
      key: 'total_interest',
      width: 120,
      align: 'right',
      render: (amount) => (
        <span className="font-medium text-orange-600">
          ₦{parseFloat(amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Total Amount Paid',
      dataIndex: 'total_amount_paid',
      key: 'total_amount_paid',
      width: 140,
      align: 'right',
      render: (amount) => (
        <span className="font-semibold text-green-600">
          ₦{parseFloat(amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Loan Term',
      dataIndex: 'loan_term',
      key: 'loan_term',
      width: 100,
      align: 'center',
      render: (term) => (
        <Tag color="purple" className="font-medium">
          {term || 'N/A'}
        </Tag>
      ),
    },
    
    {
      title: 'Payment Date',
      dataIndex: 'display_date',
      key: 'display_date',
      width: 120,
      render: (date) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-gray-400" />
          <span className="text-gray-600">
            {date ? moment(date).format('MMM DD, YYYY') : 'Not Paid'}
          </span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'display_status',
      key: 'display_status',
      width: 100,
      align: 'center',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="font-medium">
          {status?.toUpperCase() || 'PENDING'}
        </Tag>
      ),
    },
   
   
    {
      title: 'Progress',
      key: 'progress',
      width: 120,
      render: (_, record) => {
        const paidPercentage = record.principal > 0 ? (record.total_amount_paid / record.principal) * 100 : 0;
        return (
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">
              {paidPercentage.toFixed(0)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${paidPercentage >= 100 ? 'bg-green-500' : paidPercentage > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                style={{ width: `${Math.min(paidPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
  ];

  const summary = calculateSummary();
  const combinedData = getCombinedData();

  return (
    <div>
      {/* Compact Repayment Summary */}
      {combinedData.length > 0 && (
        <Card className="mb-4 shadow-sm">
          <Row gutter={[16, 8]}>
            <Col xs={12} sm={6}>
              <Statistic
                title="Total Principal"
                value={summary.totalPrincipal}
                prefix="₦"
                valueStyle={{ fontSize: '16px', color: '#1890ff' }}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Total Interest"
                value={summary.totalInterest}
                prefix="₦"
                valueStyle={{ fontSize: '16px', color: '#fa8c16' }}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Total Paid"
                value={summary.totalPaid}
                prefix="₦"
                valueStyle={{ fontSize: '16px', color: '#52c41a' }}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
            </Col>
            <Col xs={12} sm={6}>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <div className="flex justify-center gap-2">
                  <Tag color="green" className="text-xs">
                    <CheckCircleOutlined /> {summary.paidCount} Paid
                  </Tag>
                  <Tag color="orange" className="text-xs">
                    <ClockCircleOutlined /> {summary.pendingCount} Pending
                  </Tag>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <Table
      columns={columns}
      dataSource={combinedData.map((item, i) => ({
        key: item.repayment_id || item.loan_id || i,
        ...item
      }))}
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} repayment records`,
      }}
      locale={{
        emptyText: (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Repayment History Found</h3>
            <p className="text-gray-500 mb-4">
              There are currently no repayment records in the system.
            </p>
            <p className="text-sm text-gray-400">
              Repayment history will appear here once loans are approved and payment schedules are created.
            </p>
          </div>
        )
      }}
      scroll={{ x: 1200 }}
      className="custom-table"
      size="middle"
    />
    </div>
  );
};

export default RepaymentHistory;
