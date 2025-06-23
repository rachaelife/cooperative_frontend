import { Table, Tag, Space, Tooltip, Popconfirm, Button, Avatar } from 'antd'
import React, { useEffect, useState } from 'react'
import { loanServices } from '../services/api'
import { UserOutlined, DeleteOutlined, EditOutlined, BankOutlined } from '@ant-design/icons'
import { MdAccountBalance, MdPayment, MdCalendarToday } from 'react-icons/md'
import moment from 'moment'

const Loans = ({ userId = null }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);

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
  }, []);

  const columns = [
    {
      title: "Member Name",
      dataIndex: "fullname",
      key: "fullname",
      render: (text) => text || 'N/A'
    },
    {
      title: "Loan Amount",
      dataIndex: "amount_disbursed",
      key: "amount_disbursed",
      render: (text) => `₦${parseFloat(text || 0).toLocaleString()}`
    },
    {
      title: "Amount Repaid",
      dataIndex: "loan_repayment",
      key: "loan_repayment",
      render: (text) => `₦${parseFloat(text || 0).toLocaleString()}`
    },
    {
      title: "Remaining Balance",
      dataIndex: "remaining_balance",
      key: "remaining_balance",
      render: (text) => `₦${parseFloat(text || 0).toLocaleString()}`
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
      title: "Disbursement Date",
      dataIndex: "disbursement_date",
      key: "disbursement_date",
      render: (text) => text ? moment(text).format("MMM DD, YYYY") : 'N/A'
    },
    {
      title: "Actions",
      key: "action",
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Space size="small">
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
          </Space>
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
                block
              >
                Delete
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={(loans || []).map((loan, i) => ({
        key: loan.loan_id || i,
        ...loan
      }))}
      loading={loading}
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
      scroll={{ x: 1200 }}
      className="custom-table"
      size="middle"
    />
  )
}

export default Loans