import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/_layout'
import { AutoComplete, Button, Input, Modal, Select, Table } from 'antd'
import { CgAdd } from 'react-icons/cg'
import { adminServices } from '../services/api'
import { toast } from 'sonner'

function Adminpage() {
      const [open, setOPen] = useState(false)
       const [ admins, setAdmins] = useState([])

      const columns = [
        {
          title: "username",
          dataIndex: "admin",
          key: "admin",
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
          dataIndex: "role",
          key: "role",
        },

        {
            title: "Phone number",
            dataIndex: "phone",
            key: "phone",
          },
        // {
        //   title: "Action",
        //   dataIndex: "action",
        //   key: "action",
        // },
      ];
    
      //  const data = [
      //      {
      //       email: "asdfgtrewq@gmail.com",
      //       gender: "male",
      //       role: "super admin" ,
      //      },

      //      {
      //       email: "asdfgtrewq@gmail.com",
      //       gender: "male",
      //       role: "admin" ,
      //      }
       
      // ];

      const [admin, setAdmin] = useState({
          username: "",
           email: "",
           admin_role: "",
           mobile: "",
           pass_word:"",
      })


      const handleSubmit = async (e) =>{
          e.preventDefault()
          try {
            await adminServices.Newadmin()
            toast.success("successful registration")
          } catch (error) {
            toast.error("failed to register new admin")
            console.log(error)
          }
        }


         const getAlladmin = async () =>{
            const res = await adminServices.Alladmin()
            setAdmins(res)
            // console.log(res)
          }
        
          useEffect(()=>{
            getAlladmin()
          },[])
      
      
        
  return (
    <>
    <DashboardLayout>
       
      <div className='flex justify-between items-center py-2'>
      <h1 className="my-5 text-3xl font-bold">Admins</h1>

      <Button onClick={()=>setOPen(true)}><CgAdd /> Register New Admin</Button>
        <Modal open={open} footer={null} onCancel={()=>setOPen(false)}>
          <div className="mb-10">
              <h1 className="text-2xl text-slate-600">NEW ADMINISTRATOR</h1>
          </div>
            <form className=""  onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">username</label>
                  <AutoComplete className="w-[100%]"    value={admin.username} onChange={(e) => setAdmin({ ...admin, username:e.target.value})}/>  
                </div>

                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Email Address</label>
                  <Input type="email" className="w-[100%]"   value={admin.email} onChange={(e) => setAdmin({ ...admin, email:e.target.value})}/>  
                </div>  
  
                {/* <div className=" gap-1 my-3 mt-5 flex flex-col">
              <label htmlFor="">Gender</label>
              <Select 
              placeholder="Select Gender"
              options={[
                  {value: "male", label: "Male"},
                  {value: "female", label: "Female"},
                ]} 
              
              />
               </div> */}

               <div className=" gap-1 my-3 mt-5 flex flex-col">
              <label htmlFor="">Role</label>
              <Select 
              placeholder="Select Gender"
              options={[
                  {value: "super Admin", label: "Super Admin"},
                  {value: "Admin", label: "Admin"},
                ]} 
               value={admin.admin_role} onChange={(value) => setAdmin({ ...admin, admin_role:value})}
              />
               </div>

               <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Phone number</label>
                  <Input type="number" className="w-[100%]"   value={admin.mobile} onChange={(e) => setAdmin({ ...admin, mobile:e.target.value})}/>  
                </div>

               <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Password</label>
                  <Input type="password" className="w-[100%]"  value={admin.pass_word} onChange={(e) => setAdmin({ ...admin, pass_word:e.target.value})}/>  
                </div> 

                {/* <div className="flex flex-col gap-2 my-4">
                  <label htmlFor=""> post held</label>
                  <Input type="text" className="w-[100%]"/>  
                </div>  */}

                {/* <div className="flex flex-col gap-2 my-4">
                  <label htmlFor=""> Month</label>
                  <Select 
                  placeholder="Select saving month"
                  options={months.map((m)=>(
                    {label: m.label, value: m.value}
                  ))}  />
                </div>   */}

              <div className=" flex flex-col gap-1 my-3">
                <input type="submit" placeholder="Login" className="cursor-pointer h-[50px] rounded-md border border-slate-300 px-3 bg-green-800 text-white " value={"Add new admin"}/>
            </div>
            </form>          
        </Modal>
      </div>
      
      <Table columns={columns} dataSource={admins} />

    </DashboardLayout>
    
    </>
  )
}

export default Adminpage