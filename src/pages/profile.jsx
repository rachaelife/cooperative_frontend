import React, { useEffect } from "react";
import DashboardLayout from "../components/_layout";
import { useState } from "react";
import { BiEdit, BiUserPin } from "react-icons/bi";
import { AutoComplete, Button, Input, Modal, Select, Table, Tabs } from "antd";
import Savings from "../components/savings";
import Loan from "../components/loans";
import { useParams } from "react-router-dom";
import { memberServices, savingServices } from "../services/api";
import { toast } from "sonner";
import { BsCash } from "react-icons/bs";
import { MdOutlineSavings } from "react-icons/md";

function Profile() {
  const [open, setOpen] = useState(false);
  const [savings, setSavings] = useState([])

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
  function getImagePreview(e) {
    const file = e.target.files[0];
    setpreviewUrl(file);

    // const columns = [

    // ]
  }

  const getUserProfile = async () => {
    const res = await memberServices.getUser(id);
    const data = await savingServices.getUserSavings(id)
   setTotalSavings(data.total)
   console.log(data.total)
    setSavings(data.data)
    setmember({
      fullname: res[0].fullname,
      gender: res[0].gender,
      mobile: res[0].mobile,
      email: res[0].email,
      address: res[0].address,  
      referral: res[0].referral,
    });
  };

  useEffect(() => {
    getUserProfile();
  }, []);


   const handleupdate = async (e) =>{
    e.preventDefault()
    try {
      const res = await memberServices.updateuser(id, member.fullname, member.gender, member.mobile,member.email,member.address,member.referral)
      toast.success(res)
    } catch (error) {
    
      console.log(error)
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
      children: <Loan />,
    },
  ];

  return (
    <DashboardLayout>
      <nav className=" mb-5 w-[100%] h-[60px] flex items-center justify-center ">
        <h1 className="font-bold text-3xl ">Member's profile</h1>
      </nav>

      <div className="flex justify-between items-center flex-wrap">
        <div className="flex gap-10 items-center mb-10">
          {previewUrl ? (
            <div className="flex flex-col justify-center items-center w-[150px] h-[150px] gap-3 cursor-pointer">
              <img src={URL.createObjectURL(previewUrl)} alt="" />
            </div>
          ) : (
            <div className="flex flex-col gap-2 ">
              <label
                htmlFor="file"
                className="flex flex-col justify-center items-center w-[150px] h-[150px] gap-3 cursor-pointer rounded-full bg-slate-300 overflow-hidden"
              >
                <BiUserPin />
                <span>upload image</span>
              </label>
              <input
                type="file"
                id="file"
                className="hidden rounded-full "
                onChange={getImagePreview}
              />
            </div>
          )}

          <div className="">
            <form action="">
              <label
                htmlFor="upload"
                className="border border-slate-300 p-2 rounded-md cursor-pointer"
              >
                <span>Upload new Passport</span>
              </label>
              <Input
                type="file"
                className="hidden"
                id="upload"
                onChange={(e) => setpreviewUrl(e.target.files[0])}
              />
            </form>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="w-[250px] h-[150px] rounded-md border border-gray-300 p-5 ">
              <div className="flex flex-col gap-4">
                <MdOutlineSavings size={50} className="text-gray-400"/>
                <h1>Total Savings</h1>
              </div>

              <h1 className="text-2xl font-bold">&#8358;{Intl.NumberFormat().format(totalSavings.total_savings)}</h1>
            </div>
        </div>  

      </div>

      {/* PROFILE INFORMATION */}
      <div className="border border-slate-200 rounded-md shadow-lg p-5">
        <div className="flex justify-between px-5 mt-5 font-bold">
          <h1>Personal Information</h1>
          <Button
            className="cursor-pointer rounded-md"
            onClick={() => setOpen(true)} >
            <BiEdit />
            <span>Edit</span>
            </Button>

            <Modal footer={null}
          open={open}
          onCancel={() => {
            setOpen(false);
          }}>
              <div className="mb-10">
                <h1 className="text-2xl text-slate-300">Edit user info</h1>
              </div>
              <form className="" onSubmit={handleupdate}>
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">member fullname</label>
                  <Input type="text"  className="w-[100%]" name="fullname" value={member.fullname} onChange={(e)=>setmember({...member, fullname:e.target.value})}/>
                </div>

                {/* <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">gender</label>
                  <Input type="" className="w-[100%]"   name="gender" value={member.gender} onChange={(e)=>setmember({...member, gender:e.target.value})}/>
                </div> */}


                  <div className=" gap-2 my-4 mt-5 flex flex-col">
              <label htmlFor="">Gender</label>
              <Select 
              placeholder="Select Gender"
              options={[
                  {value: "male", label: "Male"},
                  {value: "female", label: "Female"},
                ]} 

                value={member.gender} onChange={(value) => setmember({ ...member, gender:value})}
              
              />
            </div>

                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">E-mail</label>
                  <Input type="email" className="w-[100%]"   name="email" value={member.email} onChange={(e)=>setmember({...member, email:e.target.value})}/>
                </div>
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">regitration date</label>
                  <Input type="date" className="w-[100%]"   name="createdAt" value={member.createdAt} onChange={(e)=>setmember({...member, createdAt:e.target.value})}/>
                </div>
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">phone</label>
                  <Input type="number" className="w-[100%]" name="mobile" value={member.mobile} onChange={(e)=>setmember({...member, mobile:e.target.value})}/>
                </div>
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">Address</label>
                  <Input type="text" className="w-[100%]"   name="address" value={member.address} onChange={(e)=>setmember({...member, address:e.target.value})}/>
                </div>
                <div className="flex flex-col gap-2 my-4">
                  <label htmlFor="">referral</label>
                  <Input type="text" className="w-[100%]" name="referral" value={member.referral} onChange={(e)=>setmember({...member, referral:e.target.value})}/>
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
                  <input
                    type="submit" 
                    placeholder="Login"
                    className="cursor-pointer h-[50px] rounded-md border border-slate-300 px-3 bg-blue-800 text-white "
                    value={"Submit Form"}
                  />
                </div>
              </form>
            </Modal>
          
        </div>

        

        <div className="flex justify-between items-center m-5 flex-wrap">
          <div>
            <h1 className="text-slate-400">Full Name</h1>
            <p>{member.fullname}</p>
          </div>

          <div>
            <h1 className="text-slate-400">registration date</h1>
            <p>{new Date(member.createdAt).toDateString(2)}</p>
          </div>

          <div>
            <h1 className="text-slate-400">Address</h1>
            <p>{member.address}</p>
          </div>

          <div>
            <h1 className="text-slate-400">E-mail</h1>
            <p>{member.email}</p>
          </div>

          <div>
            <h1 className="text-slate-400">Phone</h1>
            <p>{member.mobile}</p>
          </div>

          <div>
            <h1 className="text-slate-400">gender</h1>
            <p>{member.gender}</p>
          </div>

          <div>
            <h1 className="text-slate-400">Referral</h1>
            <p>{member.referral}</p>
          </div>
        </div>
      </div>

      <div>
        <h1 className="font-bold text-3xl my-5">Transaction Summary</h1>
      </div>

      <Tabs defaultActiveKey="1" items={items} />
    </DashboardLayout>
  );
}

export default Profile;
