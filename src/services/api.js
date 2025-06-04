import axios from "axios";
import { TbBatteryCharging } from "react-icons/tb";
import { toast } from "sonner";

const token = localStorage.getItem("token") || null;
const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const memberServices = {
  Newmember: async (fullname, gender, mobile, email, address, referral) => {
    try {
      const res = await api.post("/new/user", {
        fullname,
        gender,
        mobile,
        email,
        address,
        referral,
      });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  Allmembers: async () => {
    try {
      const res = await api.get("/get/users");
      return res.data.message;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  getUser: async (id) => {
    try {
      const res = await api.get(`/single/user/${id}`);
      return res.data.message;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

   getTotalusers: async(id)=>{
    try {

      const res = await api.get(`/all/users`)
      return res.data.totalusers;
      
    } catch (error) {
      toast.error(error.response.data.message)
    }
  },

  updateuser: async (
    id,
    fullname,
    gender,
    mobile,
    email,
    address,
    referral
  ) => {
    try {
      const res = await api.patch(`/update/user/${id}`, {
        fullname,
        gender,
        mobile,
        email,
        address,
        referral,
      });
      return res.data.message;
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  },

  deleteuser: async (id) => {
  try {
    const res = await api.delete(`/delete/${id}`);
    toast.success("user deleted successfully");
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete user");
    throw error;
  }
},

};

export const adminServices = {
  login: async (email_username, pass_word) => {
    try {
      const res = await api.post("/admin/login", { email_username, pass_word });
      localStorage.setItem("token", res.data.token);
      toast.success(res.data.message);
    } catch (error) {
      // console.log(error)
      toast.error(error.response.data.message);
    }
  },

  Newadmin: async (username,email, admin_role, mobile,pass_word) => {
    try {
      const res = await api.post("/new/admin", { username,email, admin_role, mobile,pass_word });
      toast.success(res.data.message);
       return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  Alladmin: async () => {
    try {
      const res = await api.get("/get/admin");
      return res.data.message;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  Updateadmin: async (admin) => {
    
  try {
    const res = await api.patch(`/update/admin/${admin.admin_id}`, admin);
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Update failed");
    throw error;
  }
},


 Deleteadmin: async (admin_id) => {
  try {
    const res = await api.delete(`/delete/admin/${admin_id}`);
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error deleting admin");
    throw error;
  }
}


};


export const loanapplicationservices = {
  Newloanapplication: async (
    user_id,
    loan_amount,
    loan_term,
    loan_purpose,
    loan_status
  ) => {
    try {
      const res = await api.post("/new/loan_application", {
        user_id,
        loan_amount,
        loan_term,
        loan_purpose,
        loan_status,
      });
     
      toast.success(res.data.message);
    } catch (error) {
        console.log(error)
      toast.error(error.response.data.message);
    }
  },

  Allapplication: async () => {
    try {
      const res = await api.get("/application");
      return res.data.message;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateapplication: async (id,data)=>{
    try {
        const res = await api.patch(`/update/loan_application/${id}`, data);
          return res.data;

    } catch (error) {
        toast.error(error.response.data.message)
    }
  },

};

export const savingServices = {

   addsavings: async (user_id, amount, month_paid, payment_type, savings_type) => {
    try {
      const res = await api.post("/new/savings", { user_id, amount, month_paid, payment_type, savings_type });
      toast.success(res.data.message);
      //  return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

    getAllsavings: async () => {
    try {
      const res = await api.get("/savings");
      return res.data.message;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },


  getUserSavings: async(id)=>{
    try {

      const res = await api.get(`/user/savings/${id}`)
      return {data: res.data.message, total:res.data.total}
      
    } catch (error) {
      toast.error(error.response.data.message)
    }
  },

   getUserDev: async(id)=>{
    try {

      const res = await api.get(`/user/dev`)
      return res.data.message
      
    } catch (error) {
      toast.error(error.response.data.message)
    }
  },

  getTotalsavings: async(id)=>{
    try {

      const res = await api.get(`/user/savings`)
      return res.data.message
      
    } catch (error) {
      toast.error(error.response.data.message)
    }
  },

  getTotalbuilding: async(id)=>{
    try {

      const res = await api.get(`/user/building`)
      return res.data.message
      
    } catch (error) {
      toast.error(error.response.data.message)
    }
  },

   getTotalshares: async(id)=>{
    try {

      const res = await api.get(`/user/shares`)
      return res.data.message
      
    } catch (error) {
      toast.error(error.response.data.message)
    }
  },

 


   getAllshares: async () => {
    try {
      const res = await api.get("/shares");
      return res.data.message;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  getAllbuilding: async () => {
    try {
      const res = await api.get("/building");
      return res.data.message;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  

   getAlldevelopment: async () => {
    try {
      const res = await api.get("/development");
      return res.data.message;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  
  Updatesavings: async (savings_id, amount, savings_type) => {
    
  try {
    const res = await api.patch(`/update/savings/${savings_id}`, {
      amount, savings_type
    });
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Update failed");
    throw error;
  }
},


 Deletesavings: async (savings_id) => {
  try {
    const res = await api.delete(`/delete/savings/${savings_id}`);
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error deleting admin");
    throw error;
  }
}

  
};
