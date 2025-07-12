import { Table, Tag, Space, Tooltip, Popconfirm, Button, Avatar, Card, Row, Col, Statistic, Collapse } from 'antd'
import React, { useEffect, useState } from 'react'
import { loanServices, loanRepaymentServices } from '../services/api'
import { UserOutlined, DeleteOutlined, EditOutlined, BankOutlined, HistoryOutlined, DownOutlined, RightOutlined, CalendarOutlined } from '@ant-design/icons'
import { MdAccountBalance, MdPayment, MdCalendarToday, MdHistory, MdAttachMoney } from 'react-icons/md'
import moment from 'moment'

const Loans = ({ userId = null, refreshTrigger = 0 }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [repaymentHistory, setRepaymentHistory] = useState({});

  const fetchLoans = async () => {
    setLoading(true);
    try {
      if (userId) {
        console.log("🔍 Fetching loans for user:", userId);
        const data = await loanServices.getUserLoans(userId);
        console.log("📊 User loans received:", data);
        setLoans(data || []);
      } else {
        console.log("🔍 Fetching all loans...");
        const data = await loanServices.getAllLoans();
        console.log("📊 All loans received:", data);
        setLoans(data || []);
      }
    } catch (error) {
      console.error("❌ Error fetching loans:", error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch repayment history for a specific loan
  const fetchRepaymentHistory = async (loanId) => {
    try {
      const repayments = await loanRepaymentServices.getLoanRepayments(loanId);
      setRepaymentHistory(prev => ({
        ...prev,
        [loanId]: repayments || []
      }));
    } catch (error) {
      console.error("Error fetching repayment history:", error);
      setRepaymentHistory(prev => ({
        ...prev,
        [loanId]: []
      }));
    }
  };

  // Handle row expansion
  const handleExpand = (expanded, record) => {
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeys, record.loan_id]);
      // Fetch repayment history if not already loaded
      if (!repaymentHistory[record.loan_id]) {
        fetchRepaymentHistory(record.loan_id);
      }
    } else {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.loan_id));
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'defaulted': return 'red';
      case 'partial': return 'orange';
      case 'cancelled': return 'gray';
      default: return 'default';
    }
  };

  // Delete function
  const handleDelete = async (loan_id) => {
    try {
      await loanServices.deleteLoan(loan_id);
      fetchLoans(); // Refresh the table
    } catch (error) {
      console.error("Error deleting loan:", error);
    }
  };

  // Complete loan function
  const handleCompleteLoan = async (loan) => {
    try {
      await loanServices.updateLoan(
        loan.loan_id,
        loan.amount_disbursed,
        loan.amount_disbursed, // Set repayment equal to disbursed amount
        'completed'
      );
      fetchLoans(); // Refresh the table
    } catch (error) {
      console.error("Error completing loan:", error);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [refreshTrigger]); // Refresh when trigger changes

  // Calculate loan details for display
  const calculateLoanDetails = (loan) => {
    const principal = parseFloat(loan.amount_disbursed || 0);
    const loanTerm = parseInt(loan.loan_term) || 6;
    const duration = `${loanTerm} months`;

    // Calculate total interest using the 1% monthly interest on remaining balance method
    let totalInterest = 0;
    let remainingBalance = principal;
    const monthlyPrincipal = principal / loanTerm;

    for (let month = 1; month <= loanTerm; month++) {
      const interestForMonth = remainingBalance * 0.01; // 1% interest on remaining balance
      totalInterest += interestForMonth;
      remainingBalance -= monthlyPrincipal;
    }

    // Use stored total_interest if available, otherwise use calculated
    const finalTotalInterest = parseFloat(loan.total_interest) || totalInterest;
    const totalRepayment = principal + finalTotalInterest;

    // Calculate completion date based on disbursement date and duration
    const disbursementDate = moment(loan.disbursement_date || loan.created_at);
    const completionDate = disbursementDate.clone().add(loanTerm, 'months');

    return {
      totalRepayment,
      totalInterest: finalTotalInterest,
      duration,
      completionDate
    };
  };

  const columns = [
    {
      title: "Member Name",
      dataIndex: "fullname",
      key: "fullname",
      width: 150,
      render: (text) => text || 'N/A'
    },
    {
      title: "Amount Disbursed",
      dataIndex: "amount_disbursed",
      key: "amount_disbursed",
      width: 130,
      align: 'right',
      render: (text) => (
        <span className="font-semibold text-blue-600">
          ₦{parseFloat(text || 0).toLocaleString()}
        </span>
      )
    },
    {
      title: "Total Repayment Due",
      key: "total_repayment",
      width: 150,
      align: 'right',
      render: (_, record) => {
        const { totalRepayment, totalInterest } = calculateLoanDetails(record);
        return (
          <div className="text-right">
            <div className="font-semibold text-green-600">
              ₦{totalRepayment.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              (Interest: ₦{totalInterest.toLocaleString()})
            </div>
          </div>
        );
      }
    },
    {
      title: "Duration",
      key: "duration",
      width: 100,
      align: 'center',
      render: (_, record) => {
        const { duration } = calculateLoanDetails(record);
        return (
          <Tag color="purple" className="font-medium">
            {duration}
          </Tag>
        );
      }
    },
    {
      title: "Completion Date",
      key: "completion_date",
      width: 130,
      render: (_, record) => {
        const { completionDate } = calculateLoanDetails(record);
        return (
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-gray-400" />
            <span className="text-gray-600">
              {completionDate.format("MMM DD, YYYY")}
            </span>
          </div>
        );
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      align: 'center',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="font-medium">
          {status?.toUpperCase() || 'ACTIVE'}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Space size="small">
            <Tooltip title="View Repayment History">
              <Button
                type="primary"
                size="small"
                icon={<HistoryOutlined />}
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  const isExpanded = expandedRowKeys.includes(record.loan_id);
                  handleExpand(!isExpanded, record);
                }}
              >
                {expandedRowKeys.includes(record.loan_id) ? 'Hide' : 'Repayments'}
              </Button>
            </Tooltip>
            <Tooltip title="View Details">
              <Button
                type="primary"
                size="small"
                icon={<BankOutlined />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View
              </Button>
            </Tooltip>
          </Space>
          <Space size="small">
            {record.status !== 'completed' && (
              <Popconfirm
                title="Mark Loan as Completed"
                description="Are you sure you want to mark this loan as fully paid?"
                onConfirm={() => handleCompleteLoan(record)}
                okText="Yes, Complete"
                cancelText="Cancel"
                okButtonProps={{ className: "bg-green-600 hover:bg-green-700" }}
              >
                <Tooltip title="Mark as Completed">
                  <Button
                    type="primary"
                    size="small"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Complete
                  </Button>
                </Tooltip>
              </Popconfirm>
            )}
            <Popconfirm
              title="Delete Loan"
              description="Are you sure you want to delete this loan record?"
              onConfirm={() => handleDelete(record.loan_id)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete Loan">
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                >
                  Delete
                </Button>
              </Tooltip>
            </Popconfirm>
          </Space>
        </Space>
      ),
    }
  ];

  // Expandable row render function
  const expandedRowRender = (record) => {
    const repayments = repaymentHistory[record.loan_id] || [];
    const totalRepaid = repayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    const remainingBalance = parseFloat(record.amount_disbursed || 0) - totalRepaid;

    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MdHistory className="text-purple-600" />
            Repayment History for {record.fullname}
          </h4>
          <p className="text-sm text-gray-600">Complete payment history for this loan</p>
        </div>

        {/* Repayment Summary */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={8}>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <Statistic
                title={<span className="text-blue-100">Loan Amount</span>}
                value={parseFloat(record.amount_disbursed || 0)}
                prefix="₦"
                valueStyle={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <Statistic
                title={<span className="text-green-100">Total Repaid</span>}
                value={totalRepaid}
                prefix="₦"
                valueStyle={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <Statistic
                title={<span className="text-orange-100">Remaining</span>}
                value={remainingBalance}
                prefix="₦"
                valueStyle={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
        </Row>

        {/* Repayment History Table */}
        {repayments.length > 0 ? (
          <Table
            dataSource={repayments.map((payment, i) => ({
              key: payment.repayment_id || i,
              ...payment
            }))}
            pagination={false}
            size="small"
            className="bg-white rounded-lg"
            columns={[
              {
                title: "Payment Date",
                dataIndex: "payment_date",
                key: "payment_date",
                render: (date) => moment(date).format("MMM DD, YYYY"),
                width: 120,
              },
              {
                title: "Amount Paid",
                dataIndex: "amount",
                key: "amount",
                render: (amount) => `₦${parseFloat(amount || 0).toLocaleString()}`,
                width: 120,
              },
              {
                title: "Payment Method",
                dataIndex: "payment_method",
                key: "payment_method",
                render: (method) => (
                  <Tag color="blue" className="capitalize">
                    {method || 'Cash'}
                  </Tag>
                ),
                width: 120,
              },
              {
                title: "Installment",
                dataIndex: "installment_number",
                key: "installment_number",
                render: (installment) => installment ? `#${installment}` : 'N/A',
                width: 100,
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (status) => (
                  <Tag color={status === 'confirmed' ? 'green' : 'orange'}>
                    {(status || 'Pending').toUpperCase()}
                  </Tag>
                ),
                width: 100,
              },
              {
                title: "Notes",
                dataIndex: "notes",
                key: "notes",
                render: (notes) => notes || 'No notes',
                ellipsis: true,
              },
            ]}
          />
        ) : (
          <div className="text-center py-8 bg-white rounded-lg">
            <div className="text-gray-400 text-4xl mb-2">💳</div>
            <h4 className="text-md font-medium text-gray-600 mb-1">No Repayments Yet</h4>
            <p className="text-sm text-gray-500">
              No repayment history found for this loan.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Table
      columns={columns}
      dataSource={(loans || []).map((loan, i) => ({
        key: loan.loan_id || i,
        ...loan
      }))}
      loading={loading}
      expandable={{
        expandedRowRender,
        expandedRowKeys,
        onExpand: handleExpand,
        expandIcon: ({ expanded, onExpand, record }) => (
          <Button
            type="text"
            size="small"
            icon={expanded ? <DownOutlined /> : <RightOutlined />}
            onClick={(e) => onExpand(record, e)}
            className="text-purple-600 hover:text-purple-700"
          />
        ),
      }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} disbursed loans`,
      }}
      locale={{
        emptyText: (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">🏦</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Loans Found</h3>
            <p className="text-gray-500 mb-4">
              There are currently no disbursed loans in the system.
            </p>
            <p className="text-sm text-gray-400">
              Loans will appear here once they are disbursed to members.
            </p>
          </div>
        )
      }}
      scroll={{ x: 1400 }}
      className="custom-table"
      size="middle"
    />
  )
}

export default Loans