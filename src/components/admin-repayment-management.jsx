import { Table, Tag, Space, Button, Modal, Form, Input, Select, DatePicker, Avatar, Tooltip, Popconfirm } from "antd";
import React, { useEffect, useState } from "react";
import { UserOutlined, EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import moment from "moment";

const AdminRepaymentManagement = () => {
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRepayment, setSelectedRepayment] = useState(null);
  const [form] = Form.useForm();

  const fetchRepayments = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching admin repayments...");
      const response = await fetch("http://localhost:8000/admin/repayments");
      const data = await response.json();
      
      if (response.ok) {
        console.log("✅ Admin repayments fetched:", data.message?.length || 0);
        setRepayments(data.message || []);
      } else {
        console.error("❌ Error fetching repayments:", data.message);
        toast.error(data.message || "Failed to fetch repayments");
        setRepayments([]);
      }
    } catch (error) {
      console.error("❌ Error fetching repayments:", error);
      toast.error("Failed to fetch repayments");
      setRepayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepayments();
  }, []);

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

  // Open edit modal
  const openEditModal = (repayment) => {
    setSelectedRepayment(repayment);
    form.setFieldsValue({
      status: repayment.status,
      amount_paid: repayment.amount_paid,
      payment_date: repayment.payment_date ? moment(repayment.payment_date) : null,
      payment_method: repayment.payment_method,
      notes: repayment.notes
    });
    setEditModalVisible(true);
  };

  // Update repayment status
  const updateRepaymentStatus = async (values) => {
    try {
      console.log("✏️ Updating repayment:", selectedRepayment.repayment_id);
      
      const updateData = {
        status: values.status,
        amount_paid: values.amount_paid,
        payment_date: values.payment_date ? values.payment_date.format('YYYY-MM-DD') : null,
        payment_method: values.payment_method,
        notes: values.notes
      };

      const response = await fetch(`http://localhost:8000/admin/repayment/${selectedRepayment.repayment_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Repayment updated successfully");
        toast.success("Repayment status updated successfully");
        setEditModalVisible(false);
        fetchRepayments(); // Refresh the table
      } else {
        console.error("❌ Error updating repayment:", data.message);
        toast.error(data.message || "Failed to update repayment");
      }
    } catch (error) {
      console.error("❌ Error updating repayment:", error);
      toast.error("Failed to update repayment");
    }
  };

  // Quick status update functions
  const markAsPaid = async (repayment) => {
    try {
      const updateData = {
        status: 'paid',
        amount_paid: repayment.amount_due,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'bank transfer'
      };

      const response = await fetch(`http://localhost:8000/admin/repayment/${repayment.repayment_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Payment marked as paid");
        fetchRepayments();
      } else {
        toast.error(data.message || "Failed to update payment");
      }
    } catch (error) {
      console.error("❌ Error marking as paid:", error);
      toast.error("Failed to update payment");
    }
  };

  const markAsOverdue = async (repayment) => {
    try {
      const updateData = {
        status: 'overdue'
      };

      const response = await fetch(`http://localhost:8000/admin/repayment/${repayment.repayment_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Payment marked as overdue");
        fetchRepayments();
      } else {
        toast.error(data.message || "Failed to update payment");
      }
    } catch (error) {
      console.error("❌ Error marking as overdue:", error);
      toast.error("Failed to update payment");
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
          <Avatar size={32} icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <div className="font-medium text-gray-800">{text || 'N/A'}</div>
            <div className="text-xs text-gray-500">{record.email || 'N/A'}</div>
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
      width: 120,
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
      width: 120,
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
        <span className="text-gray-600">
          {date ? moment(date).format('MMM DD, YYYY') : 'N/A'}
        </span>
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
      title: 'Actions',
      key: 'action',
      width: 250,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Details">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Edit
            </Button>
          </Tooltip>
          
          {record.status !== 'paid' && (
            <Popconfirm
              title="Mark as Paid"
              description="Mark this payment as fully paid?"
              onConfirm={() => markAsPaid(record)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Mark as Paid">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Paid
                </Button>
              </Tooltip>
            </Popconfirm>
          )}
          
          {record.status === 'pending' && new Date(record.due_date) < new Date() && (
            <Popconfirm
              title="Mark as Overdue"
              description="Mark this payment as overdue?"
              onConfirm={() => markAsOverdue(record)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Mark as Overdue">
                <Button
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                >
                  Overdue
                </Button>
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">💰 Repayment Management</h2>
        <p className="text-gray-600">Manage and update loan repayment statuses</p>
      </div>

      <Table
        columns={columns}
        dataSource={(repayments || []).map((repayment, i) => ({
          key: repayment.repayment_id || i,
          ...repayment
        }))}
        loading={loading}
        pagination={{
          pageSize: 15,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} repayment records`,
        }}
        locale={{
          emptyText: (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">💰</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Repayment Records Found</h3>
              <p className="text-gray-500 mb-4">
                There are currently no repayment records in the system.
              </p>
              <p className="text-sm text-gray-400">
                Records will appear here once loans are approved and repayment schedules are created.
              </p>
            </div>
          )
        }}
        scroll={{ x: 1400 }}
        className="custom-table"
        size="middle"
      />

      {/* Edit Repayment Modal */}
      <Modal
        title="Edit Repayment Details"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={updateRepaymentStatus}
          className="mt-4"
        >
          <Form.Item
            name="status"
            label="Payment Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="paid">Paid</Select.Option>
              <Select.Option value="overdue">Overdue</Select.Option>
              <Select.Option value="partial">Partial</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amount_paid"
            label="Amount Paid"
            rules={[{ required: true, message: 'Please enter amount paid' }]}
          >
            <Input type="number" prefix="₦" placeholder="Enter amount paid" />
          </Form.Item>

          <Form.Item
            name="payment_date"
            label="Payment Date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="payment_method"
            label="Payment Method"
          >
            <Select placeholder="Select payment method">
              <Select.Option value="bank transfer">Bank Transfer</Select.Option>
              <Select.Option value="cash">Cash</Select.Option>
              <Select.Option value="mobile money">Mobile Money</Select.Option>
              <Select.Option value="check">Check</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={3} placeholder="Add any notes..." />
          </Form.Item>

          <div className="flex justify-end gap-3">
            <Button onClick={() => setEditModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-700">
              Update Repayment
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminRepaymentManagement;
