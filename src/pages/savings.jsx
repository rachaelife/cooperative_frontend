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
import { useEffect, useState } from "react";
import {months} from "../months"
import { memberServices, savingServices } from "../services/api";
import { toast } from "sonner";
import {
  MdOutlineSavings,
  MdAccountBalance,
  MdTrendingUp,
  MdCalendarToday,
  MdPayment,
  MdPerson,
  MdAttachMoney
} from "react-icons/md";
import {
  PlusOutlined,
  UserOutlined,
  SearchOutlined,
  DollarOutlined,
  CalendarOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { Fade } from "react-awesome-reveal";
function Savings() {
const [currentsavings, setCurrentSavings] = useState({
  savings_id: "",
  amount: "",
  savings_type: "",
});
  const [open, setOPen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [members, setmembers] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  // Open edit modal
  const openEditModal = (savings) => {
    // Ensure we have the correct field names
    const normalizedSavings = {
      ...savings,
      savings_type: savings.savings_type || savings.saving_type // Handle both field names
    };
    setCurrentSavings(normalizedSavings);
    setEditOpen(true);
  };
  // Update savings function
  const updatesavings = async () => {
    try {
      const {savings_id, amount, savings_type} = currentsavings;
      // Validate required fields
      if (!savings_id) {
        toast.error("Savings ID is missing");
        return;
      }
      if (!amount || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
      if (!savings_type) {
        toast.error("Please select a savings type");
        return;
      }
      await savingServices.updateSavings(savings_id, amount, savings_type);
      toast.success("Savings updated successfully");
      fetchSavings(); // Refresh the table
      setEditOpen(false);
    } catch (err) {
      // More specific error handling
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.message) {
        toast.error(err.message);
      } else {
        toast.error("Update failed. Please try again.");
      }
    }
  };
   const handleDelete = async (savings_id) => {
    try {
      await savingServices.deleteSavings(savings_id);
      toast.success("Savings deleted successfully");
      fetchSavings(); // Refresh the table
    } catch (err) {
      toast.error("Failed to delete savings");
    }
  };

    const [savings, setSavings] = useState([]);
    const [filteredSavings, setFilteredSavings] = useState([]);
    const [member, setMember] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [isSearching, setIsSearching] = useState(false);
  const [newSavings, setNewSavings] = useState({
    user_id:"",
    amount: "",
    month_paid: "",
    payment_type: "",
    savings_type: "",
  });
  const fetchAllMember = async () => {
    const data = await memberServices.Allmembers();
    setmembers(data);
  };
   useEffect(() => {
    fetchAllMember();
  }, []);
  const fetchSavings = async () => {
    try {
      const res = await savingServices.getAllSavings();
      const data = await savingServices.getTotalSavings();
      setTotalSavings(data || 0);
      setSavings(res); // Make sure your backend returns an array
      setFilteredSavings(res); // Initialize filtered savings
    } catch (error) {
      toast.error("Failed to fetch savings data");
    }
  };
  // Search functionality
  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsSearching(true);
    try {
      if (query.trim() === "") {
        setFilteredSavings(savings);
      } else {
        const searchResults = await savingServices.searchSavings(query);
        setFilteredSavings(searchResults);
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };
  // Filter functionality
  const handleFilter = async (filter) => {
    setTypeFilter(filter);
    try {
      if (filter === "all") {
        setFilteredSavings(savings);
      } else if (filter === "this_month") {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const thisMonthSavings = savings.filter(saving =>
          saving.month_paid === currentMonth
        );
        setFilteredSavings(thisMonthSavings);
      } else {
        const filterResults = await savingServices.filterSavings({
          savings_type: filter === "monthly" ? "monthly" :
                       filter === "voluntary" ? "voluntary" : filter
        });
        setFilteredSavings(filterResults);
      }
    } catch (error) {
      toast.error("Filter failed");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await savingServices.addSavings(newSavings.user_id, newSavings.amount, newSavings.month_paid, newSavings.payment_type, newSavings.savings_type);
      setNewSavings({
        user_id: "",
        amount: "",
        month_paid: "",
        payment_type: "",
        savings_type: "",
      });
      fetchSavings();
    } catch (error) {
      toast.error("Failed to add savings");
    }
  };
  useEffect(() => {
    fetchSavings();
  }, []);
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <Fade direction="left" delay={300}>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">💰 Savings Management</h1>
            <p className="text-gray-600">Track and manage member savings contributions</p>
          </Fade>
        </div>
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-green-100">Total Savings</span>}
                value={totalSavings ? totalSavings.total : 0}
                prefix={<MdOutlineSavings className="text-green-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-blue-100">Total Records</span>}
                value={savings.length || 0}
                prefix={<MdAccountBalance className="text-blue-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-purple-100">This Month</span>}
                value={savings.filter(s => s.month_paid === new Date().toLocaleString('default', { month: 'long' })).length || 0}
                prefix={<MdCalendarToday className="text-purple-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-orange-100">Average</span>}
                value={savings.length > 0 ? (totalSavings ? totalSavings.total : 0) / savings.length : 0}
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
              <h2 className="text-xl font-semibold text-gray-800">Savings Records</h2>
              <Tag color="green">{savings.length} Total Records</Tag>
            </div>
            <Space size="middle">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setOPen(true)}
                className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                size="large"
              >
                Add New Savings
              </Button>
            </Space>
          </div>
        </Card>
        {/* Search and Filter Section */}
        <Card className="mb-6 shadow-md">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Search Savings</label>
                <Input
                  placeholder="Search by member name, amount, or type..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  size="large"
                  className="rounded-lg"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  loading={isSearching}
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
                  value={typeFilter}
                  onChange={handleFilter}
                  options={[
                    { value: "all", label: "All Savings" },
                    { value: "monthly", label: "Monthly Savings" },
                    { value: "voluntary", label: "Voluntary Savings" },
                    { value: "this_month", label: "This Month" },
                  ]}
                />
              </div>
            </Col>
          </Row>
        </Card>
        {/* Enhanced Add Savings Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MdOutlineSavings className="text-green-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Add New Savings</h2>
                <p className="text-sm text-gray-600">Record a member's savings contribution</p>
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
                    }))}
                    onChange={(value) => {
                      setMember(value.split(" ")[1])
                      setNewSavings({
                        ...newSavings,
                        user_id: value.split(" ")[0],
                      })
                    }}
                    filterOption={(inputValue, option) =>
                      option.value.toLowerCase().includes(inputValue.toLowerCase())
                    }
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdAttachMoney className="text-gray-500" />
                    Amount *
                  </label>
                  <Input
                    size="large"
                    type="number"
                    placeholder="Enter amount"
                    prefix="₦"
                    value={newSavings.amount}
                    onChange={(e) => setNewSavings({...newSavings, amount: e.target.value})}
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
                    onChange={(value) => setNewSavings({ ...newSavings, month_paid: value })}
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
                    onChange={(value) => setNewSavings({...newSavings, payment_type: value})}
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
                  <label className="text-sm font-medium text-gray-700">Savings Type</label>
                  <Select
                    size="large"
                    placeholder="Select savings type"
                    value={newSavings.savings_type}
                    onChange={(value) => setNewSavings({...newSavings, savings_type: value})}
                    options={[
                      { value: "savings", label: "Regular Savings" },
                      { value: "shares", label: "Share Contributions" },
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
                Add Savings
              </Button>
            </div>
          </form>
        </Modal>
        {/* Edit Savings Modal */}
        <Modal
          title="Edit Savings"
          open={editOpen}
          onCancel={() => setEditOpen(false)}
          footer={null}
          width={600}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updatesavings();
            }}
            className="mt-4"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdAttachMoney className="text-gray-500" />
                    Amount
                  </label>
                  <Input
                    size="large"
                    type="number"
                    placeholder="Enter amount"
                    value={currentsavings?.amount}
                    onChange={(e) =>
                      setCurrentSavings({
                        ...currentsavings,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>
              </Col>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Savings Type</label>
                  <Select
                    size="large"
                    placeholder="Select savings type"
                    value={currentsavings?.savings_type}
                    onChange={(value) =>
                      setCurrentSavings({ ...currentsavings, savings_type: value })
                    }
                    options={[
                      { value: "savings", label: "Regular Savings" },
                      { value: "shares", label: "Share Contributions" },
                      { value: "building", label: "Building Fund" },
                      { value: "development", label: "Development Fund" },
                    ]}
                  />
                </div>
              </Col>
            </Row>
            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
              <Button size="large" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update Savings
              </Button>
            </div>
          </form>
        </Modal>
        {/* Enhanced Savings Table */}
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
                title: "Member",
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
                title: "Amount",
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
                title: "Savings Type",
                dataIndex: "saving_type",
                key: "saving_type",
                render: (type) => (
                  <Tag
                    color="orange"
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
                    <Tooltip title="Edit Savings">
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => openEditModal(record)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Popconfirm
                      title="Delete Savings"
                      description="Are you sure you want to delete this savings record?"
                      onConfirm={() => handleDelete(record.savings_id)}
                      okText="Yes, Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Tooltip title="Delete Savings">
                        <Button danger size="small">
                          Delete
                        </Button>
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
            dataSource={filteredSavings.map((saving, i) => ({
              key: saving.savings_id,
              savings_id: saving.savings_id,
              no: i + 1,
              fullname: saving.fullname,
              gender: saving.gender,
              phonenumber: saving.mobile,
              amount: saving.amount,
              month: saving.month_paid,
              payment_type: saving.payment_type,
              saving_type: saving.savings_type,
            }))}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} savings records`,
            }}
            scroll={{ x: 800 }}
            className="custom-table"
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
export default Savings;
