import { Button, Divider, Modal, Select, Table } from "antd";
import React, { useEffect, useState } from "react";
import { loanapplicationservices } from "../services/api";
import { BiTrash } from "react-icons/bi";
import { toast } from "sonner";

function Loanapp() {



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
      title: "Email ",
      dataIndex: "email",
      key: "email",
    },

    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },

    {
      title: "Loan Term",
      dataIndex: "loan_term",
      key: "loan_term",
    },

    {
      title: "loan purpose",
      dataIndex: "loan_purpose",
      key: "loan_purpose",
    },

    {
      title: "Loan Status",
      dataIndex: "loan_status",
      key: "loan_status",
    },

    {
      title: "appli.date",
      dataIndex: "createdAt",
      key: "createdAt",
    },

      {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
  ];

  const [applications, setapplication] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
  const [loan_application, setloan_application] = useState(null);
  const [newStatus, setNewStatus] = useState("");


  const getAllapplication = async () => {
    const res = await loanapplicationservices.Allapplication();
    setapplication(res);
    console.log(res);
  };

  

  useEffect(() => {
    getAllapplication();
  }, []);

  

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
    toast.success("Loan status updated");
    getAllapplication(); // Refresh table
    setIsModalOpen(false);
  } catch (error) {
    console.error(error);
    toast.error("Failed to update loan status");
  }
  // getAllapplication(); 
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
  <Select
    className="w-full"
    value={newStatus}
    onChange={(value) => setNewStatus(value)}
    options={[
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
       { value: "completed", label: "completed" }
    ]}
  />
</Modal>

      <Table
        columns={columns}
        dataSource={applications.map((loan_application, i) => ({
          no: i + 1,
          fullname: loan_application.fullname,
          email: loan_application.email,
          mobile: loan_application.mobile,
          loan_amount: loan_application.loan_amount,
          loan_term: loan_application.loan_term,
          loan_purpose: loan_application.loan_purpose,
          loan_status: loan_application.loan_status,
          action: (
            <div className="flex gap-2">
          <Button><BiTrash /></Button>
          <Button onClick={() => openEditModal(loan_application)}>Edit</Button>
          </div>
        )
        }))}
      />
    </>
  );
}

export default Loanapp;
