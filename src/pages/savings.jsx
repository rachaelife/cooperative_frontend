import { Link } from "react-router-dom";
import DashboardLayout from "../components/_layout";
import { AutoComplete, Button, Input, InputNumber, Modal, Select, Table } from "antd";
import { CgAdd } from "react-icons/cg";
import { useState } from "react";
import {months} from "../months"

function Savings() {


  const [open, setOPen] = useState(false)

  const columns = [
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
      title: "Total amount saved",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
  ];

  const data = [
    {
      fullname: "Rachael ojo",
      gender: " female",
      phonenumber: "09061767896",
      total: "300,000",
      action: <Button>View Profile</Button>,
    },
    {
      fullname: "Rachael",
      gender: " female",
      phonenumber: "09061767896",
      total: "300,000",
    },
    {
      fullname: "Rachael",
      gender: " female",
      phonenumber: "09061767896",
      total: "300,000",
    },
    {
      fullname: "Rachael",
      gender: " female",
      phonenumber: "09061767896",
      total: "300,000",
    },
    {
      fullname: "Rachael",
      gender: " female",
      phonenumber: "09061767896",
      total: "300,000",
    },
    {
      fullname: "Rachael",
      gender: " female",
      phonenumber: "09061767896",
      total: "300,000",
    },
    {
      fullname: "Rachael",
      gender: " female",
      phonenumber: "09061767896",
      total: "300,000",
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center ">
        <h1 className="my-5 text-3xl font-bold">Savings</h1>

        <Button onClick={()=>setOPen(true)}><CgAdd /> New Savings</Button>
        <Modal open={open} footer={null} onCancel={()=>setOPen(false)}>
          <div className="mb-10">
              <h1 className="text-2xl text-slate-300">Saving Form</h1>
          </div>
            <form className="">
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Select User</label>
                  <AutoComplete className="w-[100%]"/>  
                </div>  
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Saving Amount</label>
                  <Input type="number" className="w-[100%]"/>  
                </div>  
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Saving Month</label>
                  <Select 
                  placeholder="Select saving month"
                  options={months.map((m)=>(
                    {label: m.label, value: m.value}
                  ))}  />
                </div>  

              <div className=" flex flex-col gap-1 my-3">
                <input type="submit" placeholder="Login" className="cursor-pointer h-[50px] rounded-md border border-slate-300 px-3 bg-green-800 text-white " value={"Add new savings"}/>
            </div>
            </form>          
        </Modal>
      </div>

      <div className="flex justify-between items-center my-5">
        <form className="flex items-center gap-2">
          <Select
            className="w-[400px]"
            placeholder="Filter by:"
            options={[
              { value: "fullname", label: "Full Name" },
              { value: "Gender", label: "Gender" },
              { value: "Mobile NO.", label: "Mobile NO." },
              { value: "Referral.", label: "Referral" },
              { value: "Date.", label: "Date" },
            ]}
          />
          <button className="border border-slate-300 py-1 px-4 rounded-md bg-green-900 text-white">
            Filter Member
          </button>
        </form>
        <form className="flex items-center gap-2">
          <Input
            type="search"
            placeholder="Search member"
            className="w-[400px]"
          />
          <button className="border border-slate-300 py-1 px-4 rounded-md bg-green-900 text-white">
            Search Member
          </button>
        </form>
      </div>

      <Table columns={columns} dataSource={data} />
    </DashboardLayout>
  );
}

export default Savings;
