import DashboardLayout from "../components/_layout";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Modal, Select, Table, Popconfirm, Card, Row, Col, Statistic, Space, Tag, Avatar, Tooltip } from "antd";
import { FiSearch, FiFilter, FiUserPlus, FiUsers } from "react-icons/fi";
import { BiUserPin } from "react-icons/bi";
import { Fade, Zoom } from "react-awesome-reveal";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { memberServices, savingServices } from "../services/api";
import {
  MdOutlineSavings,
  MdPeople,
  MdGroupAdd,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdPerson,
  MdMale,
  MdFemale
} from "react-icons/md";
import { UserOutlined, PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
function Member() {
  const [open, setOpen] = useState(false);
  const [ members, setmembers] = useState([])
  const [filteredMembers, setFilteredMembers] = useState([])
  const [totalusers, setTotalusers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [member, setmember] = useState({
    fullname: "",
    gender: "",
    mobile: "",
    email: "",
    address: "",
    referral: "",
    registration_number: ""
  })
  const [passportFile, setPassportFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // First create the member
      const memberData = await memberServices.Newmember(
        member.fullname,
        member.gender,
        member.mobile,
        member.email,
        member.address,
        member.referral,
        member.registration_number
      );

      // If member creation was successful and there's a passport file, upload it
      if (memberData && memberData.user_id && passportFile) {
        try {
          await memberServices.uploadProfileImage(memberData.user_id, passportFile);
          toast.success("Member created with passport photo!");
        } catch (uploadError) {
          toast.warning("Member created but passport photo upload failed");
        }
      }

      // Reset form and close modal
      setmember({
        fullname: "",
        gender: "",
        mobile: "",
        email: "",
        address: "",
        referral: "",
        registration_number: ""
      });
      setPassportFile(null);
      setpreviewUrl("");
      setOpen(false);
      getAllmembers(); // Refresh the members list

    } catch (error) {
      toast.error("Failed to create member");
    } finally {
      setUploading(false);
    }
  }
  const getAllmembers = async () =>{
    try {
      const res = await memberServices.Allmembers()
      const data = await memberServices.getTotalusers();
      setTotalusers(data);
      setmembers(res)
      setFilteredMembers(res) // Initialize filtered members
    } catch (error) {
      console.error('❌ Error fetching members:', error);
      toast.error('Failed to fetch members');
    }
  };

  // Enhanced search functionality
  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsSearching(true);

    try {
      if (query.trim() === "") {
        setFilteredMembers(members);
      } else {
        // Client-side search for name, phone, email, and registration number
        const searchResults = members.filter(member => {
          const searchTerm = query.toLowerCase();
          return (
            member.fullname?.toLowerCase().includes(searchTerm) ||
            member.mobile?.toLowerCase().includes(searchTerm) ||
            member.email?.toLowerCase().includes(searchTerm) ||
            member.registration_number?.toLowerCase().includes(searchTerm)
          );
        });
        setFilteredMembers(searchResults);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };
  // Filter functionality
  const handleFilter = async (filter) => {
    setGenderFilter(filter);
    try {
      if (filter === "all") {
        setFilteredMembers(members);
      } else if (filter === "male" || filter === "female") {
        const filterResults = await memberServices.filterMembers({ gender: filter });
        setFilteredMembers(filterResults);
      } else if (filter === "recent") {
        // Filter members added in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentMembers = members.filter(member => {
          const memberDate = new Date(member.created_at || member.createdAt);
          return memberDate >= thirtyDaysAgo;
        });
        setFilteredMembers(recentMembers);
      }
    } catch (error) {
      }
  };
   useEffect(()=>{
    getAllmembers()
  },[])
  const navigate = useNavigate()
  const gotoProfile =(id)=>{
    navigate(`/profile/${id}`)
  }
  //   useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const users = await savingServices.getTotalusers();
  //       // Confirm this logs the array
  //       setTotalusers(users.length);
  //     } catch (error) {
  //       //     }
  //   };
  //   fetchUsers();
  // }, []);
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
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Referral",
      dataIndex: "referral",
      key: "referral",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
  ];
  const openModal = () => {
    setOpen(true);
  };
  const [previewUrl, setpreviewUrl] = useState("");

  function getImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        toast.error('Please select an image file for the passport photo');
        return;
      }

      // Validate file size (5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        toast.error('Passport photo must be smaller than 5MB');
        return;
      }

      setPassportFile(file);
      setpreviewUrl(file);
    }
  }
  const handleDelete = async (id) => {
  try {
    await memberServices.deleteuser(id); 
    toast.success("Member deleted successfully");
    getAllmembers(); // Refresh the table
  } catch (error) {
    toast.error("Failed to delete member");
  }
};
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <Fade direction="left" delay={300}>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">👥 Members Management</h1>
            <p className="text-gray-600">Manage your cooperative members and their information</p>
          </Fade>
        </div>
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-blue-100">Total Members</span>}
                value={members.length || 0}
                prefix={<FiUsers className="text-blue-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-green-100">Active Members</span>}
                value={members.length || 0}
                prefix={<MdPeople className="text-green-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-purple-100">Male Members</span>}
                value={members.filter(m => m.gender === 'male').length || 0}
                prefix={<MdMale className="text-purple-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-pink-100">Female Members</span>}
                value={members.filter(m => m.gender === 'female').length || 0}
                prefix={<MdFemale className="text-pink-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>
        {/* Action Bar */}
        <Card className="mb-6 shadow-md">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Members Directory</h2>
              <Tag color="blue">{filteredMembers.length} Showing</Tag>
              {searchQuery && <Tag color="orange">Search: "{searchQuery}"</Tag>}
              {genderFilter !== "all" && <Tag color="green">Filter: {genderFilter}</Tag>}
            </div>
            <Space size="middle">
              <Button
                type="default"
                onClick={async () => {
                  try {
                    await memberServices.resetRegistrationNumbers();
                    getAllmembers(); // Refresh the list
                  } catch (error) {
                    // Error already handled in service
                  }
                }}
                size="large"
                className="border-purple-500 text-purple-600 hover:border-purple-600 hover:text-purple-700"
              >
                🔄 Reset Reg. Numbers
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openModal}
                className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                size="large"
              >
                Add New Member
              </Button>
            </Space>
          </div>
        </Card>
        {/* Search and Filter Section */}
        <Card className="mb-6 shadow-md">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Search Members</label>
                <Input
                  placeholder="Search by name, email, phone, or registration number..."
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
                  value={genderFilter}
                  onChange={handleFilter}
                  options={[
                    { value: "all", label: "All Members" },
                    { value: "male", label: "Male Members" },
                    { value: "female", label: "Female Members" },
                    { value: "recent", label: "Recently Added" },
                  ]}
                />
              </div>
            </Col>
          </Row>
        </Card>
        {/* Enhanced Add Member Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MdGroupAdd className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Add New Member</h2>
                <p className="text-sm text-gray-600">Fill in the member details below</p>
              </div>
            </div>
          }
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
          width={600}
          className="top-8"
        >
          <form onSubmit={handleSubmit} className="mt-6">
            {/* Passport Photo Section */}
            <div className="flex flex-col items-center mb-6">
              <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                📷 Passport Photograph (Optional)
              </label>
              {previewUrl ? (
                <div className="relative">
                  <Avatar
                    size={120}
                    src={URL.createObjectURL(previewUrl)}
                    className="border-4 border-blue-200"
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                    onClick={() => {
                      setpreviewUrl("");
                      setPassportFile(null);
                    }}
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <label htmlFor="file" className="cursor-pointer">
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    className="bg-gray-200 hover:bg-gray-300 transition-colors border-4 border-dashed border-gray-300 hover:border-blue-400"
                  />
                  <p className="text-center text-sm text-gray-600 mt-2">Click to upload passport photo</p>
                  <p className="text-center text-xs text-gray-500">Supported: JPG, PNG (Max 5MB)</p>
                  <input
                    type="file"
                    id="file"
                    className="hidden"
                    accept="image/*"
                    onChange={getImagePreview}
                  />
                </label>
              )}
            </div>
            {/* Form Fields */}
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdPerson className="text-gray-500" />
                    Full Name *
                  </label>
                  <Input
                    size="large"
                    placeholder="Enter member's full name"
                    value={member.fullname}
                    onChange={(e) => setmember({ ...member, fullname: e.target.value })}
                    required
                  />
                </div>
              </Col>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    🆔 Registration Number (Optional)
                  </label>
                  <Input
                    size="large"
                    placeholder="Enter registration number (auto-generated if empty)"
                    value={member.registration_number}
                    onChange={(e) => setmember({ ...member, registration_number: e.target.value })}
                  />
                  <span className="text-xs text-gray-500">
                    Leave empty to auto-generate (e.g., COOP2024XXXX)
                  </span>
                </div>
              </Col>
              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Gender *</label>
                  <Select
                    size="large"
                    placeholder="Select gender"
                    value={member.gender}
                    onChange={(value) => setmember({ ...member, gender: value })}
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
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
                    value={member.mobile}
                    onChange={(e) => setmember({ ...member, mobile: e.target.value })}
                  />
                </div>
              </Col>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdEmail className="text-gray-500" />
                    Email Address
                  </label>
                  <Input
                    size="large"
                    type="email"
                    placeholder="Enter email address"
                    value={member.email}
                    onChange={(e) => setmember({ ...member, email: e.target.value })}
                  />
                </div>
              </Col>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdLocationOn className="text-gray-500" />
                    Address
                  </label>
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter member's address"
                    value={member.address}
                    onChange={(e) => setmember({ ...member, address: e.target.value })}
                  />
                </div>
              </Col>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Referral (Optional)</label>
                  <Input
                    size="large"
                    placeholder="Enter referral information"
                    value={member.referral}
                    onChange={(e) => setmember({ ...member, referral: e.target.value })}
                  />
                </div>
              </Col>
            </Row>
            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
              <Button
                size="large"
                onClick={() => {
                  setOpen(false);
                  setpreviewUrl("");
                  setPassportFile(null);
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                className="bg-blue-600 hover:bg-blue-700"
                loading={uploading}
                disabled={uploading}
              >
                {uploading ? 'Creating Member...' : 'Add Member'}
              </Button>
            </div>
          </form>
        </Modal>
        {/* Enhanced Members Table */}
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
                      src={record.profile_image ? `http://localhost:8000${record.profile_image}` : null}
                      icon={<UserOutlined />}
                      className="bg-blue-100 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-800">{text}</div>
                      <div className="text-sm text-gray-500">{record.email}</div>
                    </div>
                  </div>
                ),
              },
              {
                title: "Registration No.",
                dataIndex: "registration_number",
                key: "registration_number",
                sorter: (a, b) => {
                  if (!a.registration_number && !b.registration_number) return 0;
                  if (!a.registration_number) return 1;
                  if (!b.registration_number) return -1;

                  // Extract numeric part for sorting
                  const getNumericPart = (regNum) => {
                    const match = regNum.match(/\d+/);
                    return match ? parseInt(match[0]) : 0;
                  };

                  return getNumericPart(a.registration_number) - getNumericPart(b.registration_number);
                },
                defaultSortOrder: 'ascend',
                render: (regNumber) => (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {regNumber || 'N/A'}
                    </span>
                  </div>
                ),
              },
              {
                title: "Gender",
                dataIndex: "gender",
                key: "gender",
                render: (gender) => (
                  <Tag
                    color={gender === 'male' ? 'blue' : 'pink'}
                    icon={gender === 'male' ? <MdMale /> : <MdFemale />}
                    className="capitalize"
                  >
                    {gender}
                  </Tag>
                ),
              },
              {
                title: "Contact",
                dataIndex: "phonenumber",
                key: "phonenumber",
                render: (phone, record) => (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <MdPhone className="text-gray-400" />
                      <span>{phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MdEmail className="text-gray-400" />
                      <span>{record.email}</span>
                    </div>
                  </div>
                ),
              },
              {
                title: "Address",
                dataIndex: "address",
                key: "address",
                render: (address) => (
                  <Tooltip title={address}>
                    <div className="flex items-center gap-2">
                      <MdLocationOn className="text-gray-400" />
                      <span className="truncate max-w-[150px]">{address}</span>
                    </div>
                  </Tooltip>
                ),
              },
              {
                title: "Referral",
                dataIndex: "referral",
                key: "referral",
                render: (referral) => (
                  referral ? (
                    <Tag color="green">{referral}</Tag>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )
                ),
              },
              {
                title: "Actions",
                dataIndex: "action",
                key: "action",
                width: 200,
                render: (_, record) => (
                  <Space size="small">
                    <Tooltip title="View Profile">
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => gotoProfile(record.user_id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        View
                      </Button>
                    </Tooltip>
                    <Popconfirm
                      title="Delete Member"
                      description="Are you sure you want to delete this member? This action cannot be undone."
                      onConfirm={() => handleDelete(record.user_id)}
                      okText="Yes, Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Tooltip title="Delete Member">
                        <Button danger size="small">
                          Delete
                        </Button>
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
            dataSource={filteredMembers
              .sort((a, b) => {
                // Sort by registration number in ascending order
                if (!a.registration_number && !b.registration_number) return 0;
                if (!a.registration_number) return 1; // Put members without reg numbers at the end
                if (!b.registration_number) return -1;

                // Extract numeric part from registration number (e.g., "COOP001" -> 1)
                const getNumericPart = (regNum) => {
                  const match = regNum.match(/\d+/);
                  return match ? parseInt(match[0]) : 0;
                };

                return getNumericPart(a.registration_number) - getNumericPart(b.registration_number);
              })
              .map((member, i) => ({
                key: member.user_id,
                no: i + 1,
                fullname: member.fullname,
                gender: member.gender,
                phonenumber: member.mobile,
                email: member.email,
                address: member.address,
                referral: member.referral,
                registration_number: member.registration_number,
                profile_image: member.profile_image,
                user_id: member.user_id,
              }))}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} members`,
            }}
            scroll={{ x: 800 }}
            className="custom-table"
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
export default Member;
