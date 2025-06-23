import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/_layout";
import {
  AutoComplete,
  Button,
  Input,
  Modal,
  Select,
  Table,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Tag,
  Avatar,
  Tooltip
} from "antd";
// import { CgAdd } from "react-icons/cg";
import { adminServices } from "../services/api";
import { toast } from "sonner";
import {
  MdAdminPanelSettings,
  MdSupervisorAccount,
  MdPerson,
  MdEmail,
  MdPhone,
  MdSecurity,
  MdManageAccounts,
  MdVerifiedUser
} from "react-icons/md";
import {
  PlusOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  CrownOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { Fade } from "react-awesome-reveal";
function Adminpage() {
  const [open, setOPen] = useState(false);
  const [admins, setAdmins] = useState([]);
  //editbutton
   const [editOpen, setEditOpen] = useState(false);
const [currentAdmin, setCurrentAdmin] = useState(null);
const openEditModal = (admin) => {
  setCurrentAdmin(admin); // this sets the admin to be edited
  setEditOpen(true);      // show the modal
};
  const updateAdmin = async () => {
  try {
    await adminServices.Updateadmin(currentAdmin);
    toast.success("Admin updated");
    getAlladmin(); // Refresh the table
    setEditOpen(false);
  } catch (err) {
    toast.error("Failed to update admin");
  }
};
  //colunm for table
  const columns = [
    {
      title: "S/NO",
      dataIndex: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "E-mail ",
      dataIndex: "email",
      key: "email",
    },
    // {
    //   title: "Gender",
    //   dataIndex: "gender",
    //   key: "gender",
    // },
    {
      title: "Admin_Role",
      dataIndex: "admin_role",
      key: "admin_role",
    },
    {
      title: "mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type="primary" onClick={() => openEditModal(record)}>
            Edit
          </Button>
                <Popconfirm
        title="Are you sure you want to delete this admin?"
        onConfirm={() => handleDelete(record.admin_id)}
        okText="Yes"
        cancelText="No"
      >
          <Button danger>
            Delete
          </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];
  //handledelete button
  const handleDelete = async (admin_id) => {
    try {
      await adminServices.Deleteadmin(admin_id);
      toast.success("Admin deleted");
      getAlladmin(); // Refresh the table
    } catch (err) {
      toast.error("Failed to delete admin");
    }
  };
  const [admin, setAdmin] = useState({
    username: "",
    email: "",
    admin_role: "",
    mobile: "",
    pass_word: "",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await adminServices.Newadmin(
      admin.username,
      admin.email,
      admin.admin_role,
      admin.mobile,
      admin.pass_word
    );
    if (data) {
      toast.success("Admin added!");
      setOPen(false);
      setAdmin({
        username: "",
        email: "",
        admin_role: "",
        mobile: "",
        pass_word: "",
      });
      getAlladmin(); // <== Refresh the list
    }
  };
  const getAlladmin = async () => {
    const res = await adminServices.Alladmin();
    setAdmins(res);
  };

  useEffect(() => {
    getAlladmin();
  }, []);
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <Fade direction="left" delay={300}>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">⚙️ Admin Management</h1>
            <p className="text-gray-600">Manage system administrators and their permissions</p>
          </Fade>
        </div>
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-purple-100">Total Admins</span>}
                value={admins.length || 0}
                prefix={<MdAdminPanelSettings className="text-purple-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-blue-100">Super Admins</span>}
                value={admins.filter(admin => admin.admin_role === 'super Admin').length || 0}
                prefix={<MdSupervisorAccount className="text-blue-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-green-100">Regular Admins</span>}
                value={admins.filter(admin => admin.admin_role === 'Admin').length || 0}
                prefix={<MdManageAccounts className="text-green-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-orange-100">Active Sessions</span>}
                value={admins.length || 0}
                prefix={<MdVerifiedUser className="text-orange-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>
        {/* Action Bar */}
        <Card className="mb-6 shadow-md">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">System Administrators</h2>
              <Tag color="purple">{admins.length} Total Admins</Tag>
            </div>
            <Space size="middle">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setOPen(true)}
                className="bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700"
                size="large"
              >
                Register New Admin
              </Button>
            </Space>
          </div>
        </Card>
        {/* Search and Filter Section */}
        <Card className="mb-6 shadow-md">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Search Admins</label>
                <Input
                  placeholder="Search by username, email, or role..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  size="large"
                  className="rounded-lg"
                />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Filter by Role</label>
                <Select
                  placeholder="Select admin role"
                  size="large"
                  className="w-full"
                  options={[
                    { value: "all", label: "All Roles" },
                    { value: "super Admin", label: "Super Admin" },
                    { value: "Admin", label: "Regular Admin" },
                  ]}
                />
              </div>
            </Col>
          </Row>
        </Card>
        {/* Enhanced Add Admin Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <MdAdminPanelSettings className="text-purple-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Register New Administrator</h2>
                <p className="text-sm text-gray-600">Add a new admin user to the system</p>
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
                    Username *
                  </label>
                  <Input
                    size="large"
                    placeholder="Enter username"
                    value={admin.username}
                    onChange={(e) => setAdmin({ ...admin, username: e.target.value })}
                  />
                </div>
              </Col>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdEmail className="text-gray-500" />
                    Email Address *
                  </label>
                  <Input
                    size="large"
                    type="email"
                    placeholder="Enter email address"
                    value={admin.email}
                    onChange={(e) =>
                      setAdmin({ ...admin, email: e.target.value })
                    }
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdSecurity className="text-gray-500" />
                    Admin Role *
                  </label>
                  <Select
                    size="large"
                    placeholder="Select admin role"
                    value={admin.admin_role}
                    onChange={(value) =>
                      setAdmin({ ...admin, admin_role: value })
                    }
                    options={[
                      {
                        value: "super Admin",
                        label: (
                          <span className="flex items-center gap-2">
                            <CrownOutlined className="text-yellow-500" />
                            Super Admin
                          </span>
                        )
                      },
                      {
                        value: "Admin",
                        label: (
                          <span className="flex items-center gap-2">
                            <SafetyOutlined className="text-blue-500" />
                            Regular Admin
                          </span>
                        )
                      },
                    ]}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdPhone className="text-gray-500" />
                    Phone Number *
                  </label>
                  <Input
                    size="large"
                    placeholder="Enter phone number"
                    value={admin.mobile}
                    onChange={(e) =>
                      setAdmin({ ...admin, mobile: e.target.value })
                    }
                  />
                </div>
              </Col>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdSecurity className="text-gray-500" />
                    Password *
                  </label>
                  <Input.Password
                    size="large"
                    placeholder="Enter secure password"
                    value={admin.pass_word}
                    onChange={(e) =>
                      setAdmin({ ...admin, pass_word: e.target.value })
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
                className="bg-purple-600 hover:bg-purple-700"
              >
                Register Admin
              </Button>
            </div>
          </form>
        </Modal>
        {/* Enhanced Edit Admin Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <EditOutlined className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Edit Administrator</h2>
                <p className="text-sm text-gray-600">Update admin information and permissions</p>
              </div>
            </div>
          }
          open={editOpen}
          onCancel={() => setEditOpen(false)}
          footer={null}
          width={600}
          className="top-8"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateAdmin();
            }}
            className="mt-6"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdPerson className="text-gray-500" />
                    Username *
                  </label>
                  <Input
                    size="large"
                    value={currentAdmin?.username}
                    onChange={(e) =>
                      setCurrentAdmin({ ...currentAdmin, username: e.target.value })
                    }
                  />
                </div>
              </Col>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdEmail className="text-gray-500" />
                    Email Address *
                  </label>
                  <Input
                    size="large"
                    type="email"
                    value={currentAdmin?.email}
                    onChange={(e) =>
                      setCurrentAdmin({ ...currentAdmin, email: e.target.value })
                    }
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdSecurity className="text-gray-500" />
                    Admin Role *
                  </label>
                  <Select
                    size="large"
                    value={currentAdmin?.admin_role}
                    onChange={(value) =>
                      setCurrentAdmin({ ...currentAdmin, admin_role: value })
                    }
                    options={[
                      {
                        value: "super Admin",
                        label: (
                          <span className="flex items-center gap-2">
                            <CrownOutlined className="text-yellow-500" />
                            Super Admin
                          </span>
                        )
                      },
                      {
                        value: "Admin",
                        label: (
                          <span className="flex items-center gap-2">
                            <SafetyOutlined className="text-blue-500" />
                            Regular Admin
                          </span>
                        )
                      },
                    ]}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdPhone className="text-gray-500" />
                    Phone Number *
                  </label>
                  <Input
                    size="large"
                    value={currentAdmin?.mobile}
                    onChange={(e) =>
                      setCurrentAdmin({ ...currentAdmin, mobile: e.target.value })
                    }
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
                Update Admin
              </Button>
            </div>
          </form>
        </Modal>
        {/* Enhanced Admin Table */}
        <Card className="shadow-lg">
          <Table
            columns={[
              {
                title: "S/NO",
                dataIndex: "index",
                key: "index",
                width: 70,
                render: (text, record, index) => (
                  <span className="font-medium text-gray-600">#{index + 1}</span>
                ),
              },
              {
                title: "Administrator",
                dataIndex: "username",
                key: "username",
                render: (text, record) => (
                  <div className="flex items-center gap-3">
                    <Avatar
                      size={40}
                      icon={<UserOutlined />}
                      className={`${record.admin_role === 'super Admin' ? 'bg-yellow-100 text-yellow-600' : 'bg-purple-100 text-purple-600'}`}
                    />
                    <div>
                      <div className="font-medium text-gray-800">{text}</div>
                      <div className="text-sm text-gray-500">{record.email}</div>
                    </div>
                  </div>
                ),
              },
              {
                title: "Role",
                dataIndex: "admin_role",
                key: "admin_role",
                render: (role) => (
                  <Tag
                    color={role === 'super Admin' ? 'gold' : 'purple'}
                    icon={role === 'super Admin' ? <CrownOutlined /> : <SafetyOutlined />}
                    className="capitalize"
                  >
                    {role}
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
                title: "Status",
                key: "status",
                render: () => (
                  <Tag color="green">Active</Tag>
                ),
              },
              {
                title: "Actions",
                key: "action",
                width: 150,
                render: (_, record) => (
                  <Space size="small">
                    <Tooltip title="Edit Admin">
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => openEditModal(record)}
                        className="bg-blue-600 hover:bg-blue-700"
                        icon={<EditOutlined />}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Popconfirm
                      title="Delete Administrator"
                      description="Are you sure you want to delete this administrator?"
                      onConfirm={() => handleDelete(record.admin_id)}
                      okText="Yes, Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Tooltip title="Delete Admin">
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
                ),
              },
            ]}
            dataSource={admins}
            rowKey="admin_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} administrators`,
            }}
            scroll={{ x: 800 }}
            className="custom-table"
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
export default Adminpage;
