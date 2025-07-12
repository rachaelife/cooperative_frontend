import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/_layout";
import {
  AutoComplete,
  Button,
  Input,
  Modal,
  Select,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Tag,
  Avatar,
  Tooltip,
  Popconfirm
} from "antd";
import { CgAdd } from "react-icons/cg";
import { months } from "../months";
import { memberServices, savingServices } from "../services/api";
import { toast } from "sonner";
import {
  MdOutlineSavings,
  MdShare,
  MdTrendingUp,
  MdAccountBalance,
  MdPerson,
  MdAttachMoney,
  MdCalendarToday,
  MdPayment,
  MdBusinessCenter
} from "react-icons/md";
import {
  PlusOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  DollarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { Fade } from "react-awesome-reveal";

const Shares = () => {
  const [open, setOPen] = useState(false);
  const [members, setmembers] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [totalshares, setTotalshares] = useState(0);

  const columns = [
    {
      title: "S/NO",
      dataIndex: "no",
      key: "no",
    },

    {
      title: "Full Name",
      dataIndex: "fullname",
      key: "fullname",
    },

    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },

    {
      title: "Phone Number",
      dataIndex: "phonenumber",
      key: "phonenumber",
    },

    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },

    {
      title: "month",
      dataIndex: "month",
      key: "month",
    },

    {
      title: "payment type",
      dataIndex: "payment_type",
      key: "payment_type",
    },

    {
      title: "saving type",
      dataIndex: "savings_type",
      key: "savings_type",
    },

    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.savings_id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleEdit = (record) => {
    setIsEditing(true);
    setEditingRecord(record);
    setNewSavings({
      ...newSavings,
      user_id: record.user_id,
      amount: record.amount,
      savings_type: record.savings_type,
    });
    setOPen(true);
  };

  const [shares, setShares] = useState([]);
  const [member, setMember] = useState("");

  const [newSavings, setNewSavings] = useState({
    user_id: "",
    amount: "",
    month_paid: "",
    payment_type: "",
    savings_type: "shares",
  });

  const fetchAllMember = async () => {
    const data = await memberServices.Allmembers();
    setmembers(data);
  };

  useEffect(() => {
    fetchAllMember();
  }, []);

  const fetchShares = async () => {
    try {
      const res = await savingServices.getAllshares();
      const data = await savingServices.getTotalshares();
      setTotalshares(data[0] || 0);
      setShares(res); // Make sure your backend returns an array
      console.log(res);
    } catch (error) {
      toast.error("Error fetching savings");
    }
  };

  // Test basic connectivity
  const testBasicConnectivity = async () => {
    try {
      console.log("🔍 Testing basic connectivity...");

      // Test 1: Check if backend is running
      const response = await fetch('http://localhost:8000/health');
      console.log("📊 Health check response:", response.status);

      if (response.ok) {
        toast.success("✅ Backend is running!");
      } else {
        toast.error("❌ Backend health check failed");
      }

      // Test 2: Check token
      const token = localStorage.getItem("token");
      console.log("🔑 Token exists:", !!token);

      if (!token) {
        toast.warning("⚠️ No authentication token found");
      } else {
        toast.info("🔑 Token found");
      }

    } catch (error) {
      console.error("❌ Connectivity test failed:", error);
      toast.error("❌ Cannot connect to backend");
    }
  };

  // Test API function
  const testSharesAPI = async () => {
    try {
      console.log("🧪 Testing shares API...");
      console.log("🔍 Current token:", localStorage.getItem("token"));

      const testData = {
        user_id: "1", // Test with user ID 1
        amount: "1000",
        month_paid: "January",
        payment_type: "cash",
        savings_type: "shares"
      };

      console.log("📞 About to call API with:", testData);

      const result = await savingServices.addSavings(
        testData.user_id,
        testData.amount,
        testData.month_paid,
        testData.payment_type,
        testData.savings_type
      );

      console.log("✅ Test successful:", result);
      fetchShares(); // Refresh data
    } catch (error) {
      console.error("❌ Test failed:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });

      // Don't let the error propagate and cause navigation
      toast.error("Test failed: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      console.log("🔍 Submitting shares:", newSavings);

      // Basic validation
      if (!newSavings.user_id || !newSavings.amount || !newSavings.payment_type) {
        toast.error("Please fill in all required fields");
        return;
      }

      console.log("📞 Calling API with:", {
        user_id: newSavings.user_id,
        amount: newSavings.amount,
        month_paid: newSavings.month_paid,
        payment_type: newSavings.payment_type,
        savings_type: newSavings.savings_type
      });

      const result = await savingServices.addSavings(
        newSavings.user_id,
        newSavings.amount,
        newSavings.month_paid,
        newSavings.payment_type,
        newSavings.savings_type
      );

      console.log("✅ API Response:", result);

      setNewSavings({
        user_id: "",
        amount: "",
        month_paid: "",
        payment_type: "",
        savings_type: "shares",
      });
      setOPen(false); // Close the modal
      fetchShares(); // Refresh the data
      console.log("✅ Shares added successfully!");
    } catch (error) {
      console.error("❌ Error adding shares:", error);
      console.error("❌ Error details:", error.response?.data);
      toast.error("Failed to add shares: " + (error.response?.data?.message || error.message));

      // Prevent error from bubbling up to ErrorBoundary
      return false;
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <Fade direction="left" delay={300}>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">📈 Shares Management</h1>
            <p className="text-gray-600">Manage member shares and equity contributions</p>
          </Fade>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-green-100">Total Shares Value</span>}
                value={totalshares ? totalshares.total : 0}
                prefix={<MdShare className="text-green-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-blue-100">Total Shareholders</span>}
                value={shares.length || 0}
                prefix={<MdPerson className="text-blue-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-purple-100">This Month</span>}
                value={shares.filter(s => s.month_paid === new Date().toLocaleString('default', { month: 'long' })).length || 0}
                prefix={<MdCalendarToday className="text-purple-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-orange-100">Average Share Value</span>}
                value={shares.length > 0 ? (totalshares ? totalshares.total : 0) / shares.length : 0}
                prefix={<MdTrendingUp className="text-orange-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
        </Row>

        {/* Action Bar */}
        <Card className="mb-6 shadow-md">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Shares Records</h2>
              <Tag color="green">{shares.length} Total Share Records</Tag>
            </div>

            <Space size="middle">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setOPen(true)}
                className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                size="large"
              >
                Add New Shares
              </Button>

            </Space>
          </div>
        </Card>

        {/* Search and Filter Section */}
        <Card className="mb-6 shadow-md">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Search Shares</label>
                <Input
                  placeholder="Search by member name, amount, or month..."
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
                    { value: "all", label: "All Shares" },
                    { value: "this_month", label: "This Month" },
                    { value: "last_month", label: "Last Month" },
                    { value: "high_value", label: "High Value (>₦25,000)" },
                  ]}
                />
              </div>
            </Col>
          </Row>
        </Card>
        {/* Enhanced Add Shares Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MdShare className="text-green-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Add Share Purchase</h2>
                <p className="text-sm text-gray-600">Record a member's share purchase</p>
              </div>
            </div>
          }
          open={open}
          onCancel={() => setOPen(false)}
          footer={null}
          width={600}
          className="top-8"
        >
          <form onSubmit={handleSubmit} className="mt-6">
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
                    value={member}
                    options={members.map((member) => ({
                      label: (
                        <div className="flex items-center gap-3">
                          <Avatar size={24} icon={<UserOutlined />} />
                          <span>{member.fullname}</span>
                        </div>
                      ),
                      value: `${member.user_id} ${member.fullname}`,
                      searchText: member.fullname, // Add searchable text
                    }))}
                    onChange={(value) => {
                      setMember(value.split(" ")[1]);
                      setNewSavings({
                        ...newSavings,
                        user_id: value.split(" ")[0],
                      });
                    }}
                    filterOption={(inputValue, option) =>
                      option.searchText?.toLowerCase().includes(inputValue.toLowerCase()) ||
                      option.value?.toLowerCase().includes(inputValue.toLowerCase())
                    }
                  />
                </div>
              </Col>

              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdAttachMoney className="text-gray-500" />
                    Share Value *
                  </label>
                  <Input
                    size="large"
                    type="number"
                    placeholder="Enter share value"
                    prefix="₦"
                    value={newSavings.amount}
                    onChange={(e) =>
                      setNewSavings({ ...newSavings, amount: e.target.value })
                    }
                  />
                </div>
              </Col>

              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdCalendarToday className="text-gray-500" />
                    Month *
                  </label>
                  <Select
                    size="large"
                    placeholder="Select month"
                    options={months.map((m) => ({
                      label: m.label,
                      value: m.value
                    }))}
                    onChange={(value) =>
                      setNewSavings({ ...newSavings, month_paid: value })
                    }
                  />
                </div>
              </Col>

              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdPayment className="text-gray-500" />
                    Payment Type
                  </label>
                  <Select
                    size="large"
                    placeholder="Select payment type"
                    value={newSavings.payment_type}
                    onChange={(value) =>
                      setNewSavings({
                        ...newSavings,
                        payment_type: value,
                      })
                    }
                    options={[
                      { value: "cash", label: "Cash" },
                      { value: "bank_transfer", label: "Bank Transfer" },
                      { value: "mobile_money", label: "Mobile Money" },
                      { value: "check", label: "Check" },
                    ]}
                  />
                </div>
              </Col>

              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Share Type</label>
                  <Select
                    size="large"
                    placeholder="Select share type"
                    value={newSavings.savings_type}
                    onChange={(value) =>
                      setNewSavings({ ...newSavings, savings_type: value })
                    }
                    options={[
                      { value: "shares", label: "Share Contributions" },
                      { value: "savings", label: "Regular Savings" },
                      { value: "building", label: "Building Fund" },
                      { value: "development", label: "Development Fund" },
                    ]}
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
                Add Shares
              </Button>
            </div>
          </form>
        </Modal>

        {/* Enhanced Shares Table */}
        <Card className="shadow-lg">
          <Table
            columns={[
              {
                title: "S/NO",
                dataIndex: "no",
                key: "no",
                width: 70,
                render: (text) => (
                  <span className="font-medium text-gray-600">#{text}</span>
                ),
              },
              {
                title: "Shareholder",
                dataIndex: "fullname",
                key: "fullname",
                render: (text, record) => (
                  <div className="flex items-center gap-3">
                    <Avatar
                      size={40}
                      icon={<UserOutlined />}
                      className="bg-green-100 text-green-600"
                    />
                    <div>
                      <div className="font-medium text-gray-800">{text}</div>
                      <div className="text-sm text-gray-500">{record.gender}</div>
                    </div>
                  </div>
                ),
              },
              {
                title: "Share Value",
                dataIndex: "amount",
                key: "amount",
                render: (amount) => (
                  <div className="flex items-center gap-2">
                    <DollarOutlined className="text-green-500" />
                    <span className="font-semibold text-green-600">
                      ₦{Number(amount).toLocaleString()}
                    </span>
                  </div>
                ),
                sorter: (a, b) => a.amount - b.amount,
              },
              {
                title: "Month",
                dataIndex: "month",
                key: "month",
                render: (month) => (
                  <Tag
                    color="blue"
                    icon={<CalendarOutlined />}
                    className="capitalize"
                  >
                    {month}
                  </Tag>
                ),
              },
              {
                title: "Payment Type",
                dataIndex: "payment_type",
                key: "payment_type",
                render: (type) => (
                  <Tag
                    color="purple"
                    icon={<CreditCardOutlined />}
                    className="capitalize"
                  >
                    {type?.replace('_', ' ')}
                  </Tag>
                ),
              },
              {
                title: "Share Type",
                dataIndex: "savings_type",
                key: "savings_type",
                render: (type) => (
                  <Tag
                    color="green"
                    icon={<ShareAltOutlined />}
                    className="capitalize"
                  >
                    {type?.replace('_', ' ')}
                  </Tag>
                ),
              },
              {
                title: "Contact",
                dataIndex: "phonenumber",
                key: "phonenumber",
                render: (phone) => (
                  <span className="text-gray-600">{phone}</span>
                ),
              },
              {
                title: "Actions",
                key: "action",
                width: 150,
                render: (_, record) => (
                  <Space size="small">
                    <Tooltip title="Edit Share">
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleEdit(record)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Popconfirm
                      title="Delete Share"
                      description="Are you sure you want to delete this share record?"
                      onConfirm={() => handleDelete(record.savings_id)}
                      okText="Yes, Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Tooltip title="Delete Share">
                        <Button danger size="small">
                          Delete
                        </Button>
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
            dataSource={shares.map((shares, i) => ({
              key: shares.savings_id || i,
              savings_id: shares.savings_id,
              no: i + 1,
              fullname: shares.fullname,
              gender: shares.gender,
              phonenumber: shares.mobile,
              amount: shares.amount,
              month: shares.month_paid,
              payment_type: shares.payment_type,
              savings_type: shares.savings_type,
            }))}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} share records`,
            }}
            scroll={{ x: 800 }}
            className="custom-table"
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Shares;
