import React, { useState, useEffect } from 'react';
import DashboardLayout from "../components/_layout";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Button,
  Select,
  Space,
  Table,
  Statistic,
  Typography,
  Divider,
  Tag,
  Alert,
  Spin
} from "antd";
import {
  FileTextOutlined,
  DownloadOutlined,
  PrinterOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  BankOutlined
} from '@ant-design/icons';
import { reportsServices } from "../services/api";
import { Fade } from "react-awesome-reveal";
import moment from 'moment';
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;
function Reports() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('financial');
  const [dateRange, setDateRange] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  // Generate financial summary report
  const generateFinancialReport = async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : null;
      const endDate = dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : null;
      const data = await reportsServices.getFinancialSummary(startDate, endDate);
      setReportData(data);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  // Generate member activity report
  const generateMemberReport = async () => {
    if (!selectedMember) {
      alert('Please select a member');
      return;
    }
    setLoading(true);
    try {
      const startDate = dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : null;
      const endDate = dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : null;
      const data = await reportsServices.getMemberActivityReport(selectedMember, startDate, endDate);
      setReportData(data);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  // Generate loan performance report
  const generateLoanReport = async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : null;
      const endDate = dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : null;
      const data = await reportsServices.getLoanPerformanceReport(startDate, endDate);
      setReportData(data);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  const handleGenerateReport = () => {
    switch (reportType) {
      case 'financial':
        generateFinancialReport();
        break;
      case 'member':
        generateMemberReport();
        break;
      case 'loan':
        generateLoanReport();
        break;
      default:
        break;
    }
  };
  const handlePrint = () => {
    window.print();
  };
  const handleDownload = () => {
    // Convert report data to CSV or PDF
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}_report_${moment().format('YYYY-MM-DD')}.json`;
    link.click();
  };
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <Fade direction="left" delay={300}>
            <Title level={2} className="text-gray-800 mb-2">
              📊 Reports & Analytics
            </Title>
            <Text className="text-gray-600">
              Generate comprehensive reports for financial analysis and member management
            </Text>
          </Fade>
        </div>
        {/* Report Configuration */}
        <Card className="mb-6 shadow-md">
          <Title level={4} className="mb-4">Report Configuration</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div className="flex flex-col gap-2">
                <Text strong>Report Type</Text>
                <Select
                  size="large"
                  value={reportType}
                  onChange={setReportType}
                  className="w-full"
                >
                  <Option value="financial">Financial Summary</Option>
                  <Option value="member">Member Activity</Option>
                  <Option value="loan">Loan Performance</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="flex flex-col gap-2">
                <Text strong>Date Range</Text>
                <RangePicker
                  size="large"
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-full"
                  format="YYYY-MM-DD"
                />
              </div>
            </Col>
            {reportType === 'member' && (
              <Col xs={24} md={8}>
                <div className="flex flex-col gap-2">
                  <Text strong>Select Member</Text>
                  <Select
                    size="large"
                    placeholder="Choose a member"
                    value={selectedMember}
                    onChange={setSelectedMember}
                    className="w-full"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {/* This would be populated with actual member data */}
                    <Option value="1">John Doe</Option>
                    <Option value="2">Jane Smith</Option>
                    <Option value="3">Mike Johnson</Option>
                  </Select>
                </div>
              </Col>
            )}
          </Row>
          <Divider />
          <Space>
            <Button
              type="primary"
              size="large"
              icon={<FileTextOutlined />}
              onClick={handleGenerateReport}
              loading={loading}
            >
              Generate Report
            </Button>
            {reportData && (
              <>
                <Button
                  size="large"
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                >
                  Print
                </Button>
                <Button
                  size="large"
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                >
                  Download
                </Button>
              </>
            )}
          </Space>
        </Card>
        {/* Report Results */}
        {loading && (
          <Card className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4">
              <Text>Generating report...</Text>
            </div>
          </Card>
        )}
        {reportData && !loading && (
          <div className="space-y-6">
            {/* Financial Summary Report */}
            {reportType === 'financial' && (
              <Card title="Financial Summary Report" className="shadow-lg">
                <Row gutter={[16, 16]} className="mb-6">
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Total Savings"
                      value={reportData.summary?.totalSavings || 0}
                      prefix={<DollarOutlined />}
                      formatter={(value) => `₦${Number(value).toLocaleString()}`}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Total Loans"
                      value={reportData.summary?.totalLoans || 0}
                      prefix={<BankOutlined />}
                      formatter={(value) => `₦${Number(value).toLocaleString()}`}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Total Repayments"
                      value={reportData.summary?.totalRepayments || 0}
                      prefix={<DollarOutlined />}
                      formatter={(value) => `₦${Number(value).toLocaleString()}`}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Net Position"
                      value={reportData.summary?.netPosition || 0}
                      prefix={<DollarOutlined />}
                      formatter={(value) => `₦${Number(value).toLocaleString()}`}
                      valueStyle={{ 
                        color: (reportData.summary?.netPosition || 0) >= 0 ? '#3f8600' : '#cf1322' 
                      }}
                    />
                  </Col>
                </Row>
                {reportData.savingsByType && reportData.savingsByType.length > 0 && (
                  <div className="mb-6">
                    <Title level={5}>Savings by Type</Title>
                    <Table
                      dataSource={reportData.savingsByType}
                      columns={[
                        {
                          title: 'Savings Type',
                          dataIndex: 'savings_type',
                          key: 'savings_type',
                          render: (type) => <Tag color="blue">{type}</Tag>
                        },
                        {
                          title: 'Total Amount',
                          dataIndex: 'total',
                          key: 'total',
                          render: (amount) => `₦${Number(amount).toLocaleString()}`
                        },
                        {
                          title: 'Count',
                          dataIndex: 'count',
                          key: 'count'
                        }
                      ]}
                      pagination={false}
                      size="small"
                    />
                  </div>
                )}
              </Card>
            )}
            {/* Member Activity Report */}
            {reportType === 'member' && reportData.member && (
              <Card title={`Member Activity Report - ${reportData.member.fullname}`} className="shadow-lg">
                <Row gutter={[16, 16]} className="mb-6">
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Total Savings"
                      value={reportData.summary?.totalSavings || 0}
                      prefix={<DollarOutlined />}
                      formatter={(value) => `₦${Number(value).toLocaleString()}`}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Total Loans"
                      value={reportData.summary?.totalLoans || 0}
                      prefix={<BankOutlined />}
                      formatter={(value) => `₦${Number(value).toLocaleString()}`}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Savings Count"
                      value={reportData.summary?.savingsCount || 0}
                      prefix={<UserOutlined />}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Loans Count"
                      value={reportData.summary?.loansCount || 0}
                      prefix={<BankOutlined />}
                    />
                  </Col>
                </Row>
                <Alert
                  message="Member Information"
                  description={
                    <div>
                      <p><strong>Email:</strong> {reportData.member.email}</p>
                      <p><strong>Phone:</strong> {reportData.member.mobile}</p>
                      <p><strong>Gender:</strong> {reportData.member.gender}</p>
                      <p><strong>Address:</strong> {reportData.member.address}</p>
                    </div>
                  }
                  type="info"
                  showIcon
                />
              </Card>
            )}
            {/* Loan Performance Report */}
            {reportType === 'loan' && (
              <Card title="Loan Performance Report" className="shadow-lg">
                <Row gutter={[16, 16]} className="mb-6">
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Total Loans"
                      value={reportData.summary?.total_loans || 0}
                      prefix={<BankOutlined />}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Total Disbursed"
                      value={reportData.summary?.total_disbursed || 0}
                      prefix={<DollarOutlined />}
                      formatter={(value) => `₦${Number(value).toLocaleString()}`}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Total Repaid"
                      value={reportData.summary?.total_repaid || 0}
                      prefix={<DollarOutlined />}
                      formatter={(value) => `₦${Number(value).toLocaleString()}`}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Outstanding"
                      value={reportData.summary?.total_outstanding || 0}
                      prefix={<DollarOutlined />}
                      formatter={(value) => `₦${Number(value).toLocaleString()}`}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                </Row>
              </Card>
            )}
            {/* Report Metadata */}
            <Card size="small" className="bg-gray-50">
              <Text className="text-sm text-gray-600">
                Report generated on: {moment(reportData.generatedAt).format('YYYY-MM-DD HH:mm:ss')} | 
                Period: {reportData.period?.start_date && reportData.period?.end_date 
                  ? `${reportData.period.start_date} to ${reportData.period.end_date}` 
                  : 'All time'}
              </Text>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
export default Reports;
