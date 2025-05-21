import DashboardLayout from "../components/_layout";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Modal, Select, Table } from "antd";
import { FiSearch } from "react-icons/fi";
import { BiUserPin } from "react-icons/bi";
import { Fade, Zoom } from "react-awesome-reveal";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { memberServices } from "../services/api";

function Member() {
  const [open, setOpen] = useState(false);
  const [ members, setmembers] = useState([])

  const [member, setmember] = useState({
    fullname: "",
    gender: "",
    mobile: "",
    email: "",
    address: "",
    referral: ""
  })

  const handleSubmit = async (e) =>{
    e.preventDefault()
    try {
      await memberServices.Newmember()
      toast.success("successful registration")
    } catch (error) {
      toast.error("failed to register new member")
      console.log(error)
    }
  }


  const getAllmembers = async () =>{
    const res = await memberServices.Allmembers()
    setmembers(res)
    console.log(res)
  }

   useEffect(()=>{
    getAllmembers()
  },[])


  const navigate = useNavigate()

  const gotoProfile =(id)=>{
    navigate(`/profile/${id}`)
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
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
      setpreviewUrl(file);

  }


 

  return (
    <DashboardLayout>

      <div className="flex justify-between items-center gap-5">
        <Fade direction="left" delay={1000}>
          <h1 className="my-5 text-3xl font-bold ">Members</h1>
        </Fade>

       
          <Button onClick={openModal}>Add new member </Button>
     

        <Modal
          footer={null}
          open={open}
          onCancel={() => {
            setOpen(false);
          }}
        >
          <form action="">
            <h1 className="text-center text-3xl font-bold text-slate-300">
              Registration Form{" "}
            </h1>

            <div className="my-5 flex justify-between items-center">
              {previewUrl ? (
                <div className="flex flex-col justify-center items-center w-[100px] h-[100px] gap-3 cursor-pointer">
                  <button className="bg-transparent" type="button" onClick={()=>setpreviewUrl("")}>X</button>
                  <img src={URL.createObjectURL(previewUrl)} alt="" className="overflow-hidden"/>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 ">
                  <label
                    htmlFor="file"
                    className="flex flex-col justify-center items-center w-[150px] h-[150px] gap-3 cursor-pointer rounded-full bg-slate-300 overflow-hidden " 
                  >
                    <BiUserPin size={25}/>
                  <span>upload image</span>
                  </label>
                  <input
                    type="file"
                    id="file"
                    className="hidden "
                    onChange={getImagePreview}
                  />
                </div>
              )}
              {/* <h1 className="font-bold">New Member Form</h1> */}
            </div>

            <div className="flex flex-col gap-1 my-3">
              <label htmlFor="">Full Name</label>
              <Input
                type="text"
                placeholder="Enter Member full name"
                required  value={member.fullname} onChange={(e) => setmember({ ...member, fullname:e.target.value})}
              />
            </div>

            <div className=" gap-1 my-3 mt-5 flex flex-col">
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

            <div className="flex flex-col gap-1 my-3">
              <label htmlFor="">phone number</label>
              <Input type="phone" placeholder="Enter Member phone number"   value={member.mobile} onChange={(e) => setmember({ ...member, mobile:e.target.value})}/>
            </div>

            <div className="flex flex-col gap-1 my-3">
              <label htmlFor="">Email</label>
              <Input type="text" placeholder="Enter Member address"   value={member.email} onChange={(e) => setmember({ ...member, email:e.target.value})}/>
            </div>

             <div className="flex flex-col gap-1 my-3">
              <label htmlFor="">Address</label>
              <Input type="text" placeholder="Enter Member address"   value={member.address} onChange={(e) => setmember({ ...member, address:e.target.value})} />
            </div>

            <div className="flex flex-col gap-1 my-3">
              <label htmlFor="">Referral</label>
              <Input type="text" placeholder="enter referral"    value={member.referral} onChange={(e) => setmember({ ...member, referral:e.target.value})}/>
            </div>

            <div className=" flex flex-col gap-1 my-3">
                
                <input type="submit" onClick={handleSubmit} placeholder="Login" className="cursor-pointer h-[50px] rounded-md border border-slate-300 px-3 bg-blue-900 text-white "  />
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
              {value: "fullname", label: "Full Name"},
              {value: "Gender", label: "Gender"},
              {value: "Mobile NO.", label: "Mobile NO."},
              {value: "Referral.", label: "Referral"},
              {value: "Date.", label: "Date"},
            ]} />
            <button className="border border-slate-300 py-1 px-4 rounded-md bg-blue-950 text-white">Filter Member</button>
          </form>
          <form className="flex items-center gap-2">
           <Input type="search" placeholder="Search member" className="w-[400px]"/>
            <button className="border border-slate-300 py-1 px-4 rounded-md bg-blue-950 text-white">Search Member</button>
          </form>
      </div>


      <Table columns={columns} dataSource={members.map((member, i)=>(
        {
      
      fullname: member.fullname,
      gender: member.gender,
      phonenumber: member.mobile,
      email:member.email,
      address: member.address,
      referral: member.referral,
      action: <Button onClick={()=>gotoProfile(member.user_id)}>View Profile</Button>
    
    }
      ))} />
    </DashboardLayout>
  );
}

export default Member;
