import { useEffect, useState } from "react";
import DashboardLayout from "../components/_layout";
import { memberServices, savingServices } from "../services/api";
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
import { toast } from "sonner";
import { CgAdd } from "react-icons/cg";
import { months } from "../months";
import {
  MdOutlineSavings,
  MdBusiness,
  MdBuild,
  MdHome,
  MdPerson,
  MdAttachMoney,
  MdCalendarToday,
  MdPayment,
  MdTrendingUp
} from "react-icons/md";
import {
  PlusOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  DollarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Fade } from "react-awesome-reveal";
import SimpleBuildingForm from "../components/SimpleBuildingForm";

function Building() {
  const [open, setOPen] = useState(false);
  const [simpleFormOpen, setSimpleFormOpen] = useState(false);
  const [members, setmembers] = useState([]);
  const [totalbuilding, setTotalbuilding] = useState(0)

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
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
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
    // {
    //   title: "Action",
    //   dataIndex: "action",
    //   key: "action",
    // },
  ];

  const [building, setbuilding] = useState([]);
  const [member, setMember] = useState("");

  const [newSavings, setNewSavings] = useState({
    user_id: "",
    amount: "",
    month_paid: "",
    payment_type: "",
    savings_type: "building",
  });

  const fetchAllMember = async () => {
    const data = await memberServices.Allmembers();
    setmembers(data);
  };

  useEffect(() => {
    fetchAllMember();
  }, []);

  const fetchbuildings = async () => {
    try {
      const res = await savingServices.getAllbuilding();
      const data = await savingServices.getTotalbuilding()
      setTotalbuilding(data[0] || 0)
      setbuilding(res); // Make sure your backend returns an array
      console.log(res);
    } catch (error) {
      toast.error("Error fetching savings");
    }
  };





  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      // Basic validation
      if (!newSavings.user_id || !newSavings.amount || !newSavings.month_paid || !newSavings.payment_type) {
        toast.error("Please fill in all required fields");
        return;
      }

      const result = await savingServices.addSavings(
        newSavings.user_id,
        newSavings.amount,
        newSavings.month_paid,
        newSavings.payment_type,
        newSavings.savings_type
      );

      setNewSavings({
        user_id: "",
        amount: "",
        month_paid: "",
        payment_type: "",
        savings_type: "building",
      });
      setOPen(false);
      fetchbuildings();
      toast.success("Building savings added successfully!");
    } catch (error) {
      console.error("Error adding building savings:", error);
      toast.error("Failed to add building savings");
    }
  };

  useEffect(() => {
    fetchbuildings();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <Fade direction="left" delay={300}>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🏗️ Building Fund Management</h1>
            <p className="text-gray-600">Manage building fund contributions and construction projects</p>
          </Fade>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-orange-100">Total Building Fund</span>}
                value={totalbuilding ? totalbuilding.total : 0}
                prefix={<MdBusiness className="text-orange-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-blue-100">Total Contributors</span>}
                value={building.length || 0}
                prefix={<MdPerson className="text-blue-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-green-100">This Month</span>}
                value={building.filter(b => b.month_paid === new Date().toLocaleString('default', { month: 'long' })).length || 0}
                prefix={<MdCalendarToday className="text-green-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-purple-100">Average Contribution</span>}
                value={building.length > 0 ? (totalbuilding ? totalbuilding.total : 0) / building.length : 0}
                prefix={<MdTrendingUp className="text-purple-200" />}
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
              <h2 className="text-xl font-semibold text-gray-800">Building Fund Records</h2>
              <Tag color="orange">{building.length} Total Contributions</Tag>
            </div>

            <Space size="middle">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setOPen(true)}
                className="bg-orange-600 hover:bg-orange-700 border-orange-600 hover:border-orange-700"
                size="large"
              >
                Add Building Contribution
              </Button>
              <Button
                onClick={() => setSimpleFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="large"
              >
                🧪 Simple Test Form
              </Button>


            </Space>
          </div>
        </Card>

        {/* Search and Filter Section */}
        <Card className="mb-6 shadow-md">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Search Building Fund</label>
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
                    { value: "all", label: "All Contributions" },
                    { value: "this_month", label: "This Month" },
                    { value: "last_month", label: "Last Month" },
                    { value: "high_amount", label: "High Amount (>₦50,000)" },
                  ]}
                />
              </div>
            </Col>
          </Row>
        </Card>
        {/* Enhanced Add Building Fund Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <MdBuild className="text-orange-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Add Building Fund Contribution</h2>
                <p className="text-sm text-gray-600">Record a member's building fund contribution</p>
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
                      value: member.user_id,
                      searchText: member.fullname, // Add searchable text
                    }))}
                    onSelect={(value, option) => {
                      setMember(option.searchText);
                      setNewSavings({ ...newSavings, user_id: value });
                    }}
                    onChange={(value) => {
                      setMember(value);
                      const matchingMember = members.find(m => m.fullname === value);
                      if (matchingMember) {
                        setNewSavings({ ...newSavings, user_id: matchingMember.user_id });
                      }
                    }}
                    filterOption={(inputValue, option) =>
                      option.searchText?.toLowerCase().includes(inputValue.toLowerCase())
                    }
                  />
                </div>
              </Col>

              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdAttachMoney className="text-gray-500" />
                    Contribution Amount *
                  </label>
                  <Input
                    size="large"
                    type="number"
                    placeholder="Enter contribution amount"
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
                      setNewSavings({ ...newSavings, payment_type: value })
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
                  <label className="text-sm font-medium text-gray-700">Fund Type</label>
                  <Select
                    size="large"
                    placeholder="Select fund type"
                    value={newSavings.savings_type}
                    onChange={(value) =>
                      setNewSavings({ ...newSavings, savings_type: value })
                    }
                    options={[
                      { value: "building", label: "Building Fund" },
                      { value: "savings", label: "Regular Savings" },
                      { value: "shares", label: "Share Contributions" },
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
                className="bg-orange-600 hover:bg-orange-700"
              >
                Add Contribution
              </Button>
            </div>
          </form>
        </Modal>
        {/* Enhanced Building Fund Table */}
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
                      className="bg-orange-100 text-orange-600"
                    />
                    <div>
                      <div className="font-medium text-gray-800">{text}</div>
                      <div className="text-sm text-gray-500">{record.gender}</div>
                    </div>
                  </div>
                ),
              },
              {
                title: "Contribution Amount",
                dataIndex: "amount",
                key: "amount",
                render: (amount) => (
                  <div className="flex items-center gap-2">
                    <DollarOutlined className="text-orange-500" />
                    <span className="font-semibold text-orange-600">
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
                title: "Fund Type",
                dataIndex: "savings_type",
                key: "savings_type",
                render: (type) => (
                  <Tag
                    color="orange"
                    icon={<HomeOutlined />}
                    className="capitalize"
                  >
                    {type?.replace('_', ' ')}
                  </Tag>
                ),
              },
              {
                title: "Contact",
                dataIndex: "mobile",
                key: "mobile",
                render: (mobile) => (
                  <span className="text-gray-600">{mobile}</span>
                ),
              },
              {
                title: "Actions",
                key: "action",
                width: 150,
                render: (_, record) => (
                  <Space size="small">
                    <Tooltip title="Edit Contribution">
                      <Button
                        type="primary"
                        size="small"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Popconfirm
                      title="Delete Contribution"
                      description="Are you sure you want to delete this building fund contribution?"
                      okText="Yes, Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Tooltip title="Delete Contribution">
                        <Button danger size="small">
                          Delete
                        </Button>
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
            dataSource={building.map((building, i) => ({
              key: i,
              no: i + 1,
              fullname: building.fullname,
              gender: building.gender,
              mobile: building.mobile,
              amount: building.amount,
              month: building.month_paid,
              payment_type: building.payment_type,
              savings_type: building.savings_type,
            }))}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} building fund contributions`,
            }}
            scroll={{ x: 800 }}
            className="custom-table"
          />
        </Card>

        {/* Simple Test Form */}
        <SimpleBuildingForm
          visible={simpleFormOpen}
          onClose={() => setSimpleFormOpen(false)}
          onSuccess={() => fetchbuildings()}
        />
      </div>
    </DashboardLayout>
  );
}

export default Building;
