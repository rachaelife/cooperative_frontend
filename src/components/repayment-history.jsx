import { Table, Tag, Space, Tooltip, Button, Avatar, Empty } from "antd";
import React, { useEffect, useState } from "react";
import { loanRepaymentServices } from "../services/api";
import { UserOutlined, CalendarOutlined, DollarOutlined } from "@ant-design/icons";
import moment from "moment";

const RepaymentHistory = ({ userId = null }) => {
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRepayments = async () => {
    setLoading(true);
    try {
      let data;
      if (userId) {
        console.log("🔍 Fetching repayments for user:", userId);
        data = await loanRepaymentServices.getUserRepayments(userId);
      } else {
        console.log("🔍 Fetching all repayments...");
        data = await loanRepaymentServices.getAllRepayments();
      }
      console.log("📊 Repayments received:", data);
      setRepayments(data || []);
    } catch (error) {
      console.error("❌ Error fetching repayments:", error);
      setRepayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepayments();
  }, [userId]);

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
      title: 'Installment',
      dataIndex: 'installment_number',
      key: 'installment_number',
      width: 100,
      align: 'center',
      render: (installment) => (
        <Tag color="blue" className="font-medium">
          #{installment || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Amount Due',
      dataIndex: 'amount_due',
      key: 'amount_due',
      width: 130,
      align: 'right',
      render: (amount) => (
        <span className="font-semibold text-blue-600">
          ₦{parseFloat(amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Amount Paid',
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      width: 130,
      align: 'right',
      render: (amount) => (
        <span className="font-semibold text-green-600">
          ₦{parseFloat(amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 120,
      render: (date) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-gray-400" />
          <span className="text-gray-600">
            {date ? moment(date).format('MMM DD, YYYY') : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      title: 'Payment Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
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
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="font-medium">
          {status?.toUpperCase() || 'PENDING'}
        </Tag>
      ),
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 130,
      render: (method) => (
        <span className="text-gray-600 capitalize">
          {method || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Loan Details',
      key: 'loan_details',
      width: 150,
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-gray-600">Amount: ₦{parseFloat(record.loan_amount || 0).toLocaleString()}</div>
          <div className="text-gray-500">Term: {record.loan_term || 'N/A'} months</div>
          <div className="text-gray-500 truncate">{record.loan_purpose || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 120,
      render: (_, record) => {
        const paidPercentage = record.amount_due > 0 ? (record.amount_paid / record.amount_due) * 100 : 0;
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

  return (
    <Table
      columns={columns}
      dataSource={(repayments || []).map((repayment, i) => ({
        key: repayment.repayment_id || i,
        ...repayment
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
  );
};

export default RepaymentHistory;
