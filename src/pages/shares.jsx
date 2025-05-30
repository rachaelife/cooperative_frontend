import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/_layout';
import { AutoComplete, Button, Input, Modal, Select, Table } from 'antd';
import { CgAdd } from 'react-icons/cg';
import { months } from '../months';
import { memberServices } from '../services/api';
import { toast } from 'sonner';

const Shares = () => {


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
      title: "payment type",
      dataIndex: "payment_type",
      key: "payment_type",
    },

     {
      title: "saving type",
      dataIndex: "saving_type",
      key: "saving_type",
    },
    // {
    //   title: "Action",
    //   dataIndex: "action",
    //   key: "action",
    // },
  ];
 
    const [shares, setShares] = useState([]);
    const [member, setMember] = useState("")

  const [newShares, setNewShares] = useState({
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


  const fetchShares = async () => {
    try {
      const res = await savingServices.getAllshares();
      setShares(res); // Make sure your backend returns an array
      console.log(res)
    } catch (error) {
      toast.error("Error fetching savings");
    }
  };


  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await savingServices.addshares(newShares.user_id, newShares.amount, newShares.month_paid, newShares.payment_type, newShares.savings_type );
   
      setNewShares({
        user_id: "",
        amount: "",
        month_paid: "",
        payment_type: "",
        savings_type: "",
      });
      fetchShares();
    } catch (error) {
      toast.error("Failed to add shares");
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);


    return(

    <>
    <DashboardLayout>

        
      <div className="flex justify-between items-center ">
        <h1 className="my-5 text-3xl font-bold">Shares</h1>

        <Button onClick={()=>setOPen(true)}><CgAdd /> New Shares</Button>
        <Modal open={open} footer={null} onCancel={()=>setOPen(false)}>
          <div className="mb-10">
              <h1 className="text-2xl text-slate-300">Shares Form</h1>
          </div>

            <form className="" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Select User</label>
                     <AutoComplete className="w-[100%]" 
                      value={member}
                  options={members.map((member) => ({
                    label: member.fullname,
                    value: `${member.user_id} ${member.fullname}`,
                  }))}
                  onChange={(value) =>{
                    setMember(value.split(" ")[1])
                    setNewShares({  ...newShares, user_id: value.split(" ")[0],})
                  }
                    
                  } />   
                </div> 

                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor=""> Amount</label>
                  <Input type="number" className="w-[100%]"
                  value={newShares.amount} onChange={(e) =>setNewShares({...newShares,amount: e.target.value})}
                  />  
                </div> 

                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor=""> Month</label>
                  <Select 
                  placeholder="Select saving month"
                  options={months.map((m)=>(
                    {label: m.label, value: m.value}
                  ))}
                    onChange={(value) => setNewShares({ ...newShares, month_paid: value })}

                  />
                </div>  

                   <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">payment type</label>
                  <Input type="text" className="w-[100%]"
                  value={newShares.payment_type} onChange={(e) =>setNewShares({...newShares,payment_type: e.target.value})}
                  />  
                </div> 

                   <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Saving type</label>
                  <Input type="text" className="w-[100%]"
                  value={newShares.savings_type} onChange={(e) =>setNewShares({...newShares,savings_type: e.target.value})}
                  />  
                </div> 

              <div className=" flex flex-col gap-1 my-3">
                <input type="submit" placeholder="Login" className="cursor-pointer h-[50px] rounded-md border border-slate-300 px-3 bg-blue-800 text-white " value={"Add new shares"}/>
            </div>
            </form>          
        </Modal>
      </div>

      

      <Table columns={columns}   dataSource={shares.map((shares, i)=>(
        {
          no: i + 1,
          fullname:shares.fullname,
          gender:shares.gender,
          phonenumber:shares.mobile,
          amount:shares.amount,
          month: shares.month_paid,
          payment_type:shares.payment_type,
          saving_type:shares.savings_type
          
        }
      ))}/>

    </DashboardLayout>
    </>
    )
}

export default Shares