import axios from "axios";
import { TbBatteryCharging } from "react-icons/tb";
import { toast } from "sonner";


const token = localStorage.getItem("token") || null
const api = axios.create({
    baseURL: "http://localhost:5000",
    headers:{
        "Authorization": `Bearer ${token}`
    }
})



export const memberServices  = {
Newmember: async(fullname,gender,mobile,email,address,referral) =>{

    try {
        const res = await api.post("/new/user",{fullname,gender,mobile,email,address,referral})
        toast.success(res.data.message)
    } catch (error) {
        toast.error(error.response.data.message) 
    }
},

Allmembers: async() =>{

    try {
        const res = await api.get("/get/users")
        return  res.data.message
    } catch (error) {
         toast.error(error.response.data.message) 
    }
},

getUser: async(id)=>{
    try {
        const res = await api.get(`/single/user/${id}`)
        return res.data.message
    } catch (error) {
        toast.error(error.response.data.message)
    }
},

updateuser: async(id,fullname,gender,mobile,email,address,referral) =>{
    try {
        const res = await api.patch(`/update/user/${id}`,{fullname,gender,mobile,email,address,referral})
          return res.data.message
    } catch (error) {
        toast.error(error.response.data.message)
        console.log(error)
    }
}

           
}




export const adminServices = {
    login: async(email_username, pass_word)=>{
        try {
            const res = await api.post("/admin/login", {email_username, pass_word})
            localStorage.setItem("token", res.data.token)
            toast.success(res.data.message)
        } catch (error) {
            // console.log(error)
            toast.error(error.response.data.message)
        }
    },


    Newadmin: async(email, admin_role, mobile) =>{

    try {
        const res = await api.post("/new/admin",{email, admin_role, mobile})
        toast.success(res.data.message)
    } catch (error) {
        toast.error(error.response.data.message) 
    }
    },


            Alladmin: async() =>{

    try {
        const res = await api.get("/get/admin")
        return  res.data.message
    } catch (error) {
         toast.error(error.response.data.message) 
    }
    },
}