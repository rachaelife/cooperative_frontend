import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "../components/_layout";
import { useNavigate } from "react-router-dom";
import { adminServices } from "../services/api";





function Login  () {


  const [email_username, setemail_username] = useState("");
  const [Password, setPassword] = useState("");
  const navigate = useNavigate()
  const [loading, setlaoding] = useState(false)


  const handleSubmit =async (e) => {
    e.preventDefault()
    setlaoding(true)

      const res = await adminServices.login(email_username, Password)
      navigate("/")
      
  };

    const authUser = ()=>{
      const isAuthenticated = localStorage.getItem("token")
      if(isAuthenticated){
        navigate("/") 
    }else{
          return
      }
    }

    useEffect(()=>{
        authUser()
    },[])



  return (
    // <DashboardLayout>
    <div className="min-h-screen  flex justify-center items-center hero relative ">
      <div className="absolute top-0 left-0 w-[100%] h-[100%] heros"></div>
      <div className="flex  h-[70vh]  w-[70%] overflow-hidden rounded gap-10">
        
          <form onSubmit={handleSubmit} className="bg-white h-[100%] flex-1 p-5 flex justify-center flex-col inherit z-50 flex-wrap rounded-md">
            <div className="flex justify-center items-center">
              <img src="public/logo1.png" alt="" width={150} className=""/>
            </div>
            
            <h1 className="text-5xl text-green-900">Welcome</h1>
              <div className="flex flex-col my-3 gap-2 text-black">
                <label htmlFor="">email_username</label>
                <input type="text" placeholder="Username" className="w-90 h-10 border rounded-md outline-none flex justify-center items-center px-3 bg-white" onChange={(e)=> {setemail_username(e.target.value)}}/>
              </div>

              <div className="flex flex-col my-3 gap-2 text-black">
              <label htmlFor="">Password</label>
              <input type="password" placeholder="password" className="w-90 h-10 border rounded-md outline-none flex justify-center items-center px-3 bg-white" onChange={(e)=> {setPassword(e.target.value)}}/>
              </div>

              <div className="mt-5">
                <input type="submit" value="Login" className="py-2 px-5 rounded-md text-white bg-green-900 w-[30%]"/>
              </div>

              
          </form>
       
        <div className=" flex-1  h-[100%] text-white flex flex-col  items-center inherit z-50 ">
          <h1 className="text-5xl my-4 font-bold">Looking for a <br />place to save your money?</h1>
          <p className="my-4 text-2xl">   Oluwadarasimi multipurpose cooperative society provides secure and reliable financial solutions to help you manage and grow your savings</p>
          <button className="my-4 p-3 w-[50%] rounded-xl bg-green-900 text-white">More info</button>
          </div> 
      </div>
    </div>
    // </DashboardLayout>
  );
};

export default Login;
