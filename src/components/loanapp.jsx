import { Button, Divider, Modal, Select, Table, Tag, Space, Tooltip, Popconfirm, Avatar } from "antd";
import React, { useEffect, useState } from "react";
import { loanapplicationservices } from "../services/api";
import { BiTrash, BiEdit } from "react-icons/bi";
import { MdDelete, MdEdit, MdPerson, MdAttachMoney, MdSchedule, MdDescription } from "react-icons/md";
import { UserOutlined, DeleteOutlined, EditOutlined, CheckOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import moment from "moment";

function Loanapp({ refreshTrigger = 0, onStatusUpdate = null }) {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);

  // Handle approve loan
  const handleApproveLoan = async (loanId) => {
    setLoading(true);
    try {
      const result = await loanapplicationservices.approveLoan(loanId);

      // Refresh the applications list
      setTimeout(() => {
        getAllapplication();
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      }, 1000);

    } catch (error) {
      console.error("Approve loan error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'orange';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'completed': return 'blue';
      case 'disbursed': return 'purple';
      default: return 'default';
    }
  };

  // Delete function
  const handleDelete = async (loan_application_id) => {
    try {
      await loanapplicationservices.deleteApplication(loan_application_id);
      getAllapplication(); // Refresh the table
    } catch (error) {
      console.error("Error deleting loan application:", error);
    }
  };

  const columns = [
    {
      title: "S/NO",
      dataIndex: "no",
      key: "no",
      width: 60,
      align: 'center',
    },
    {
      title: "Applicant",
      dataIndex: "fullname",
      key: "fullname",
      width: 200,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar size={32} icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <div className="font-medium text-gray-800">{text || 'N/A'}</div>
            <div className="text-xs text-gray-500">{record.email || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "mobile",
      key: "mobile",
      width: 120,
      render: (mobile) => (
        <span className="text-gray-600">{mobile || 'N/A'}</span>
      ),
    },
    {
      title: "Loan Amount",
      dataIndex: "loan_amount",
      key: "loan_amount",
      width: 130,
      align: 'right',
      render: (amount) => (
        <span className="font-semibold text-green-600">
          ₦{parseFloat(amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Term",
      dataIndex: "loan_term",
      key: "loan_term",
      width: 80,
      align: 'center',
      render: (term) => (
        <Tag color="blue">{term || 0} months</Tag>
      ),
    },
    {
      title: "Purpose",
      dataIndex: "loan_purpose",
      key: "loan_purpose",
      width: 150,
      render: (purpose) => (
        <Tooltip title={purpose}>
          <span className="text-gray-600">
            {purpose && purpose.length > 20 ? `${purpose.substring(0, 20)}...` : purpose || 'N/A'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "loan_status",
      key: "loan_status",
      width: 100,
      align: 'center',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="font-medium">
          {status?.toUpperCase() || 'PENDING'}
        </Tag>
      ),
    },
    {
      title: "Applied Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => (
        <span className="text-gray-600">
          {date ? moment(date).format('MMM DD, YYYY') : 'N/A'}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size="small" wrap>
          {record.loan_status === 'pending' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApproveLoan(record.loan_application_id)}
              className="bg-green-600 hover:bg-green-700"
              loading={loading}
            >
              Approve
            </Button>
          )}
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Application"
            description="Are you sure you want to delete this loan application?"
            onConfirm={() => handleDelete(record.loan_application_id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loan_application, setloan_application] = useState(null);
  const [newStatus, setNewStatus] = useState("");


  const getAllapplication = async () => {
    try {
      console.log("🔍 Fetching loan applications...");
      const res = await loanapplicationservices.Allapplication();
      console.log("📊 Applications received:", res);

      // Ensure we always set an array
      const applicationsData = Array.isArray(res) ? res : [];
      setApplications(applicationsData);

      console.log("✅ Applications set to state:", applicationsData.length);
    } catch (error) {
      console.error("❌ Error in getAllapplication:", error);
      setApplications([]); // Set empty array on error
    }
  };

  

  useEffect(() => {
    getAllapplication();
  }, [refreshTrigger]); // Refresh when trigger changes

  

  const openEditModal = (loan) => {
    setloan_application(loan); // Set the selected loan
    setNewStatus(loan.loan_status); // Pre-fill status
    setIsModalOpen(true);
  };




  const handleStatusUpdate = async () => {
    try {
      await loanapplicationservices.updateapplication(loan_application.loan_application_id, {
        loan_status: newStatus,
      });

      if (newStatus === 'approved') {
        toast.success("Loan approved and automatically disbursed!");
      } else {
        toast.success("Loan status updated successfully");
      }

      // Refresh the applications list
      setTimeout(() => {
        getAllapplication();
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      }, 1000);

      setIsModalOpen(false);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update loan status");
    }
  };


  return (
    <>


    <Modal
  title="Edit Loan Status"
  open={isModalOpen}
  onCancel={() => setIsModalOpen(false)}
  onOk={handleStatusUpdate}
  okText="Update"
>
  <div>
    <Select
      className="w-full mb-2"
      value={newStatus}
      onChange={(value) => setNewStatus(value)}
      options={[
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved (Auto-disburses)" },
        { value: "rejected", label: "Rejected" },
        { value: "disbursed", label: "Disbursed" },
        { value: "completed", label: "Completed" }
      ]}
    />
    {newStatus === 'approved' && (
      <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
        ℹ️ Note: Approving this loan will automatically move it to the disbursed loans table.
      </div>
    )}
  </div>
</Modal>

      <Table
        columns={columns}
        dataSource={(applications || []).map((loan_application, i) => ({
          key: loan_application.loan_application_id || i,
          loan_application_id: loan_application.loan_application_id,
          no: i + 1,
          fullname: loan_application.fullname || 'N/A',
          email: loan_application.email || 'N/A',
          mobile: loan_application.mobile || 'N/A',
          loan_amount: loan_application.loan_amount || 0,
          loan_term: loan_application.loan_term || 0,
          loan_purpose: loan_application.loan_purpose || 'N/A',
          loan_status: loan_application.loan_status || 'pending',
          createdAt: loan_application.createdAt,
          monthly_installment: loan_application.monthly_installment,
          total_interest: loan_application.total_interest,
          total_amount: loan_application.total_amount,
        }))}
        loading={applications === null || applications === undefined}
        locale={{
          emptyText: (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Loan Applications Found</h3>
              <p className="text-gray-500 mb-4">
                There are currently no loan applications in the system.
              </p>
              <p className="text-sm text-gray-400">
                New applications will appear here once they are submitted.
              </p>
            </div>
          )
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} loan applications`,
        }}
        scroll={{ x: 1200 }}
        className="custom-table"
        size="middle"
      />
    </>
  );
}

export default Loanapp;
