import React, { useEffect } from "react";
import DashboardLayout from "../components/_layout";
import { useState } from "react";
import { BiEdit, BiUserPin } from "react-icons/bi";
import {
  AutoComplete,
  Button,
  Input,
  Modal,
  Select,
  Table,
  Tabs,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Tag,
  Avatar,
  Tooltip,
  Descriptions,
  Upload
} from "antd";
import Savings from "../components/savings";
import Loan from "../components/loans";
import LoanRepaymentHistory from "../components/LoanRepaymentHistory";
import { useParams } from "react-router-dom";
import { memberServices, savingServices, loanRepaymentServices, loanServices } from "../services/api";
import { toast } from "sonner";
import { BsCash } from "react-icons/bs";
import {
  MdOutlineSavings,
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdCalendarToday,
  MdEdit,
  MdAccountBalance,
  MdTrendingUp,
  MdMale,
  MdFemale
} from "react-icons/md";
import {
  UserOutlined,
  EditOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Fade } from "react-awesome-reveal";
function Profile() {
  const [open, setOpen] = useState(false);
  const [savings, setSavings] = useState([])
  const [nextPayment, setNextPayment] = useState(null)
  const [pendingPayments, setPendingPayments] = useState([])
  const [userLoans, setUserLoans] = useState([])
  const [totalSavings, setTotalSavings] = useState(0)
  const openModal = () => {
    setOpen(true);
  };
  const [member, setmember] = useState({
    fullname: "",
    gender: "",
    mobile: "",
    email: "",
    address: "",
    referral: "",
  });
  const { id } = useParams();
  const [previewUrl, setpreviewUrl] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  function getImagePreview(e) {
    const file = e.target.files[0];
    setpreviewUrl(file);
  }

  const handleImageUpload = async (file) => {
    try {
      setImageLoading(true);
      const result = await memberServices.uploadProfileImage(id, file);
      if (result && result.imageUrl) {
        const fullImageUrl = `http://localhost:8000${result.imageUrl}`;
        setProfileImage(fullImageUrl);
        // Update member data with new image
        setmember(prev => ({ ...prev, profile_image: result.imageUrl }));
        toast.success("Profile image updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to upload profile image");
    } finally {
      setImageLoading(false);
      setpreviewUrl(""); // Clear preview
    }
  };
  const getUserProfile = async () => {
    try {
      if (!id) {
        toast.error("User ID is required");
        return;
      }

      // Fetch user profile data
      const res = await memberServices.getUser(id);
      if (res && res.length > 0) {
        const userData = res[0];
        setmember(userData); // Set the user data to member state

        // Set profile image if it exists
        if (userData.profile_image) {
          setProfileImage(`http://localhost:8000${userData.profile_image}`);
        }
      } else {
        toast.error("User not found");
      }

      // Fetch user savings data
      const data = await savingServices.getUserSavings(id);
      setTotalSavings(data.total || 0);
      setSavings(data.data || []);
    } catch (error) {
      toast.error("Failed to fetch user profile");
    }
  };
  const fetchLoanRepaymentData = async () => {
    try {
      // Fetch next payment due
      const nextPaymentData = await loanRepaymentServices.getNextPayment(id);
      setNextPayment(nextPaymentData);
      // Fetch pending payments
      const pendingPaymentsData = await loanRepaymentServices.getPendingPayments(id);
      setPendingPayments(pendingPaymentsData || []);
      // Fetch user loans for outstanding balance calculation
      const userLoansData = await loanServices.getUserLoans(id);
      setUserLoans(userLoansData || []);
    } catch (error) {
      }
  };
  // Calculate total outstanding loan balance (only for active and partial loans)
  const calculateOutstandingBalance = () => {
    return userLoans.reduce((total, loan) => {
      // Only include loans that are not completed
      if (loan.status !== 'completed') {
        return total + (parseFloat(loan.remaining_balance) || 0);
      }
      return total;
    }, 0);
  };
  useEffect(() => {
    getUserProfile();
    fetchLoanRepaymentData();
  }, []);
   const handleupdate = async (e) => {
    e.preventDefault();
    try {
      await memberServices.updateuser(id, member.fullname, member.gender, member.mobile, member.email, member.address, member.referral);
      toast.success("Profile updated successfully");
      setOpen(false);
      // Refresh the profile data
      getUserProfile();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  }
  const items = [
    {
      key: "1",
      label: "Saving",
      children: <Savings items={savings} />,
    },
    {
      key: "2",
      label: "Loans",
      children: <Loan userId={id} />,
    },
    {
      key: "3",
      label: "Loan Repayments",
      children: <LoanRepaymentHistory userId={id} />,
    },
  ];
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <Fade direction="left" delay={300}>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">👤 Member Profile</h1>
            <p className="text-gray-600">View and manage member information and transaction history</p>
          </Fade>
        </div>
        {/* Profile Header Card */}
        <Card className="mb-8 shadow-lg">
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={8} className="text-center">
              <div className="relative inline-block">
                {previewUrl ? (
                  <Avatar
                    size={150}
                    src={URL.createObjectURL(previewUrl)}
                    className="border-4 border-blue-200 shadow-lg"
                    style={{ opacity: imageLoading ? 0.6 : 1 }}
                  />
                ) : (
                  <Avatar
                    size={150}
                    src={profileImage}
                    icon={<UserOutlined />}
                    className="bg-gray-200 border-4 border-gray-300 shadow-lg"
                    style={{ opacity: imageLoading ? 0.6 : 1 }}
                  />
                )}

                {/* Loading overlay */}
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}

                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => {
                    // Validate file type
                    const isImage = file.type.startsWith('image/');
                    if (!isImage) {
                      toast.error('You can only upload image files!');
                      return false;
                    }

                    // Validate file size (5MB)
                    const isLt5M = file.size / 1024 / 1024 < 5;
                    if (!isLt5M) {
                      toast.error('Image must be smaller than 5MB!');
                      return false;
                    }

                    setpreviewUrl(file);
                    handleImageUpload(file);
                    return false; // Prevent default upload
                  }}
                  accept="image/*"
                  disabled={imageLoading}
                >
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<CameraOutlined />}
                    className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700"
                    size="large"
                    loading={imageLoading}
                    title="Upload Profile Picture"
                  />
                </Upload>
              </div>
              <div className="mt-4">
                <h2 className="text-2xl font-bold text-gray-800">{member.fullname}</h2>
                <Tag
                  color={member.gender === 'male' ? 'blue' : 'pink'}
                  icon={member.gender === 'male' ? <MdMale /> : <MdFemale />}
                  className="mt-2 capitalize"
                >
                  {member.gender}
                </Tag>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">ID</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration Number</p>
                    <p className="font-mono font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded text-sm">
                      {member.registration_number || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MailOutlined className="text-blue-500 text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneOutlined className="text-green-500 text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{member.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <HomeOutlined className="text-orange-500 text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{member.address}</p>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 mb-4">
                <Statistic
                  title={<span className="text-green-100">Total Savings</span>}
                  value={totalSavings || 0}
                  prefix={<MdOutlineSavings className="text-green-200" />}
                  valueStyle={{ color: '#fff', fontSize: '1.8rem', fontWeight: 'bold' }}
                  formatter={(value) => `₦${Number(value).toLocaleString()}`}
                />
              </Card>
              {nextPayment && (
                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 mb-4">
                  <div className="text-center">
                    <h3 className="text-orange-100 text-sm mb-2">Next Payment Due</h3>
                    <p className="text-white text-xl font-bold">₦{Number(nextPayment.amount_due || 0).toLocaleString()}</p>
                    <p className="text-orange-100 text-sm">Due: {nextPayment.due_date ? new Date(nextPayment.due_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </Card>
              )}
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="large"
              >
                Edit Profile
              </Button>
            </Col>
          </Row>
        </Card>
        {/* Enhanced Edit Profile Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <EditOutlined className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Edit Profile Information</h2>
                <p className="text-sm text-gray-600">Update member details and contact information</p>
              </div>
            </div>
          }
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
          width={600}
          className="top-8"
        >
          <form onSubmit={handleupdate} className="mt-6">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MdPerson className="text-gray-500" />
                    Full Name *
                  </label>
                  <Input
                    size="large"
                    placeholder="Enter full name"
                    value={member.fullname}
                    onChange={(e) => setmember({...member, fullname: e.target.value})}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Gender *</label>
                  <Select
                    size="large"
                    placeholder="Select gender"
                    value={member.gender}
                    onChange={(value) => setmember({...member, gender: value})}
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
                    onChange={(e) => setmember({...member, mobile: e.target.value})}
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
                    value={member.email}
                    onChange={(e) => setmember({...member, email: e.target.value})}
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
                    size="large"
                    placeholder="Enter address"
                    rows={3}
                    value={member.address}
                    onChange={(e) => setmember({...member, address: e.target.value})}
                  />
                </div>
              </Col>
              <Col span={24}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Referral</label>
                  <Input
                    size="large"
                    placeholder="Enter referral information"
                    value={member.referral}
                    onChange={(e) => setmember({...member, referral: e.target.value})}
                  />
                </div>
              </Col>
            </Row>
            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
              <Button size="large" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update Profile
              </Button>
            </div>
          </form>
        </Modal>
        {/* Financial Summary Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={8}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-green-100">Total Savings</span>}
                value={totalSavings || 0}
                prefix={<MdOutlineSavings className="text-green-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Statistic
                title={<span className="text-red-100">Outstanding Loans</span>}
                value={calculateOutstandingBalance()}
                prefix={<MdAccountBalance className="text-red-200" />}
                valueStyle={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}
                formatter={(value) => `₦${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
          {nextPayment && (
            <Col xs={24} sm={12} md={8}>
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <h3 className="text-orange-100 text-sm mb-2">Next Payment Due</h3>
                  <p className="text-white text-xl font-bold">₦{Number(nextPayment.amount_due || 0).toLocaleString()}</p>
                  <p className="text-orange-100 text-sm">Due: {nextPayment.due_date ? new Date(nextPayment.due_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </Card>
            </Col>
          )}
        </Row>
        {/* Detailed Information Card */}
        <Card className="mb-8 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Edit Profile
            </Button>
          </div>
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2, md: 3 }}
            size="middle"
            labelStyle={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}
          >
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <UserOutlined className="text-blue-500" />
                  Full Name
                </span>
              }
            >
              {member.fullname}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  {member.gender === 'male' ?
                    <MdMale className="text-blue-500" /> :
                    <MdFemale className="text-pink-500" />
                  }
                  Gender
                </span>
              }
            >
              <Tag color={member.gender === 'male' ? 'blue' : 'pink'} className="capitalize">
                {member.gender}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <CalendarOutlined className="text-green-500" />
                  Registration Date
                </span>
              }
            >
              {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <MailOutlined className="text-orange-500" />
                  Email
                </span>
              }
            >
              {member.email}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <PhoneOutlined className="text-purple-500" />
                  Phone
                </span>
              }
            >
              {member.mobile}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <HomeOutlined className="text-red-500" />
                  Address
                </span>
              }
            >
              {member.address}
            </Descriptions.Item>
            <Descriptions.Item
              label="Referral"
              span={3}
            >
              {member.referral || 'No referral information'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        {/* Transaction Summary */}
        <Card className="shadow-lg">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Transaction Summary</h2>
            <p className="text-gray-600">View member's savings and loan history</p>
          </div>
          <Tabs
            defaultActiveKey="1"
            items={items}
            className="custom-tabs"
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
export default Profile;
