import DashboardLayout from "../components/_layout";
import { Input, Modal, Select, Table, AutoComplete, Button, Tabs } from 'antd';
import { CgAdd } from "react-icons/cg";
import { useState } from "react";
import { months } from "../months";
// import Savings from "../components/savings";
import Loans from "../components/loans";
import Loanapp from "../components/loanapp";





function Loan() {


  const [open, setOPen] = useState(false)


  const items = [
    {
      key: '1',
      label: 'Repayment history',
      children: <Loans />
    },
    {
      key: '2',
      label: 'Loan applications',
      children: <Loanapp/>
    }

  ];

    // const columns = [
    //     {
    //       title: "Member",
    //       dataIndex: "member",
    //       key: "member",
    //     },

    //     {
    //         title: "Loan Disbursed",
    //         dataIndex: "loan",
    //         key: "loan",
    //       },

    //       {
    //         title: "Loan repayment",
    //         dataIndex: "repayments",
    //         key: "repayment",
    //       },

    //       {
    //         title: "Loan Balance",
    //         dataIndex: "balance",
    //         key: "balance",
    //       },

    //     ];

    //     const data = [
    //         {
    //             member: "Rachael ojo",
    //             loan: "$300,000",
    //             repayments: "$200,000",
    //             balance: "100,000"
                
    //           },

    //           {
    //             member: "Rachael ojo",
    //             loan: "$300,000",
    //             repayments: "$200,000",
    //             balance: "100,000"
                
    //           },
    //     ];



    return (
       <DashboardLayout>


        <div className="flex justify-between items-center">
            <h1 className="my-5 text-3xl font-bold">Loan</h1>
            <Button onClick={()=>setOPen(true)}><CgAdd />Loan</Button>
            <Modal open={open} footer={null} onCancel={()=>setOPen(false)}>
          <div className="mb-10">
              <h1 className="text-2xl text-slate-300">Loan update</h1>
          </div>
            <form className="">
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">member fullname</label>
                  <AutoComplete className="w-[100%]"/>  
                </div>  
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Loan disburded</label>
                  <Input type="number" className="w-[100%]"/>  
                </div>
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">date</label>
                  <Input type="date" className="w-[100%]"/>  
                </div> 
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">loan repayment</label>
                  <Input type="number" className="w-[100%]"/>  
                </div>  
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Total interest</label>
                  <Select 
                  placeholder="Select saving month"
                  options={months.map((m)=>(
                    {label: m.label, value: m.value}
                  ))}  />
                </div>  

              <div className=" flex flex-col gap-1 my-3">
                <input type="submit" placeholder="Login" className="cursor-pointer h-[50px] rounded-md border border-slate-300 px-3 bg-green-800 text-white " value={"Submit Form"}/>
            </div>
            </form>          
            </Modal>


            {/* <div className="flex gap-3"> */}
          
      
              

            <Button onClick={()=>setOPen(true)}><CgAdd />Loan Application</Button>
            <Modal open={open} footer={null} onCancel={()=>setOPen(false)}>
          <div className="mb-10">
              <h1 className="text-2xl text-slate-400">Loan Application form</h1>
          </div>
            <form className="">
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Applicant fullname</label>
                  <AutoComplete className="w-[100%]"/>  
                </div>  
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Application id</label>
                  <Input type="number" className="w-[100%]"/>  
                </div>
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Application date</label>
                  <Input type="date" className="w-[100%]"/>  
                </div> 
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">loan amount</label>
                  <Input type="number" className="w-[100%]"/>  
                </div>  
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">loan term</label>
                  <Input type="text" className="w-[100%]"/>  
                </div>  
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">loan purpose</label>
                  <Input type="text" className="w-[100%]"/>  
                </div>    
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">loan status</label>
                  <Input type="text" className="w-[100%]"/>  
                </div>  
                {/* <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Total interest</label>
                  <Select 
                  placeholder="Select saving month"
                  options={months.map((m)=>(
                    {label: m.label, value: m.value}
                  ))}  />
                </div>   */}

              <div className=" flex flex-col gap-1 my-3">
                <input type="submit" placeholder="Login" className="cursor-pointer h-[50px] rounded-md border border-slate-300 px-3 bg-green-800 text-white " value={"Submit Form"}/>
            </div>
            </form>          
            </Modal>
            {/* </div> */}

            
        </div>


        <div className="flex justify-between items-center my-5">
        <form className="flex items-center gap-2">
          <Select
            className="w-[400px]"
            placeholder="Filter by:"
            options={[
              { value: "fullname", label: "Full Name" },
              { value: "Amount", label: "Loan Amount" },
              { value: "Mobile NO.", label: "Mobile NO." },
              { value: "Month", label: "Month" },
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
        {/* <Table columns={columns} dataSource={data} /> */}
        
        <Tabs defaultActiveKey="1" items={items} />
       </DashboardLayout> 
    )
}

export default  Loan;