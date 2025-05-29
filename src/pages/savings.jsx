import { Link } from "react-router-dom";
import DashboardLayout from "../components/_layout";
import { AutoComplete, Button, Input, InputNumber, Modal, Select, Table } from "antd";
import { CgAdd } from "react-icons/cg";
import { useEffect, useState } from "react";
import {months} from "../months"
import { memberServices, savingServices } from "../services/api";
import { toast } from "sonner";


function Savings() {


  const [open, setOPen] = useState(false)
   const [members, setmembers] = useState([]);

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
      title: "payment_type",
      dataIndex: "payment type",
      key: "payment type",
    },

     {
      title: "saving_type",
      dataIndex: "saving type",
      key: "saving type",
    },
    // {
    //   title: "Action",
    //   dataIndex: "action",
    //   key: "action",
    // },
  ];
 
    const [savings, setSavings] = useState([]);

  const [newSavings, setNewSavings] = useState({
    user_id: "",
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
      const res = await memberServices.getAllsavings();
      setSavings(res); // Make sure your backend returns an array
    } catch (error) {
      toast.error("Error fetching savings");
    }
  };


  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await savingServices.addsavings(newSavings);
      toast.success("Savings added!");
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
      <div className="flex justify-between items-center ">
        <h1 className="my-5 text-3xl font-bold">Savings</h1>

        <Button onClick={()=>setOPen(true)}><CgAdd /> New Savings</Button>
        <Modal open={open} footer={null} onCancel={()=>setOPen(false)}>
          <div className="mb-10">
              <h1 className="text-2xl text-slate-300">Saving Form</h1>
          </div>

            <form className="" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Select User</label>
                     <AutoComplete className="w-[100%]" 
                      value={newSavings.user_id}
                  options={members.map((member) => ({
                    label: member.fullname,
                    value: member.user_id,
                  }))}
                  onChange={(value) =>
                    setNewSavings({
                      ...newSavings,
                      user_id: value,
                    })
                  } />   
                </div> 

                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Saving Amount</label>
                  <Input type="number" className="w-[100%]"
                  value={newSavings.amount} onChange={(e) =>setNewSavings({...newSavings,amount: e.target.value})}
                  />  
                </div> 

                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Saving Month</label>
                  <Select 
                  placeholder="Select saving month"
                  options={months.map((m)=>(
                    {label: m.label, value: m.value}
                  ))}
                    onChange={(value) =>
                   setNewSavings({ ...newSavings, month_paid: value })
                     }

                  />
                </div>  

                   <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">payment type</label>
                  <Input type="text" className="w-[100%]"
                  value={newSavings.payment_type} onChange={(e) =>setNewSavings({...newSavings,payment_type: e.target.value})}
                  />  
                </div> 

                   <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Saving type</label>
                  <Input type="text" className="w-[100%]"
                  value={newSavings.savings_type} onChange={(e) =>setNewSavings({...newSavings,savings_type: e.target.value})}
                  />  
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

      <Table columns={columns}   dataSource={savings.map((item, index) => ( {
    ...item,
    
    no: index + 1,
    fullname:item.fullname,
    gender: item.gender,
    phonenumber: item.mobile,
    amount: item.amount,
    month: item.month_paid,
    "payment type": item.payment_type,
    "saving type": item.savings_type,

    
  }))}
 />
    </DashboardLayout>
  );
}

export default Savings;
