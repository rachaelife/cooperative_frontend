import axios from "axios";
import { toast } from "sonner";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 30000, // 30 second timeout to prevent timeout errors
});
// Add a request interceptor to include the token dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      } else if (error.code === 'ECONNREFUSED') {
      }
    return Promise.reject(error);
  }
);
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
      // Ensure we always return an array
      const members = res.data.message || [];
      if (members.length === 0) {
        toast.info("No members found. Please add some members first.");
      }
      return members;
    } catch (error) {
      let errorMessage = "Failed to fetch members";
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check if the server is running.";
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check if the backend is running on port 5000.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please check if the database is properly configured.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
      return []; // Return empty array on error so the dropdown still works
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
   getTotalusers: async()=>{
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
      }
  },
  // Alias for updateuser to match component usage
  updateMember: async (id, userData) => {
    try {
      const res = await api.patch(`/update/user/${id}`, userData);
      return res.data.message;
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
      throw error;
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
  // Search members
  searchMembers: async (query) => {
    try {
      const res = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
      return res.data.message || [];
    } catch (error) {
      toast.error("Search failed");
      return [];
    }
  },
  // Filter members
  filterMembers: async (filters) => {
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/users/filter?${params}`);
      return res.data.message || [];
    } catch (error) {
      toast.error("Filter failed");
      return [];
    }
  },
  // Upload profile image
  uploadProfileImage: async (userId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);
      formData.append('user_id', userId);
      const res = await api.post('/upload/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
      throw error;
    }
  },
  // Get profile image
  getProfileImage: async (userId) => {
    try {
      const res = await api.get(`/profile-image/${userId}`);
      return res.data.imageUrl;
    } catch (error) {
      return null;
    }
  },
  // Delete profile image
  deleteProfileImage: async (userId) => {
    try {
      const res = await api.delete(`/profile-image/${userId}`);
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
      throw error;
    }
  },
  // Check if user needs to set password
  checkUserStatus: async (email_mobile) => {
    try {
      const res = await api.post("/check-user-status", { email_mobile });
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  // Set password for first-time users
  setUserPassword: async (user_id, password, confirm_password) => {
    try {
      const res = await api.post("/set-password", {
        user_id,
        password,
        confirm_password,
      });
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to set password");
      throw error;
    }
  },
  // User login
  loginUser: async (email_mobile, password) => {
    try {
      const res = await api.post("/login", { email_mobile, password });
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
export const adminServices = {
  login: async (email_username, pass_word) => {
    try {
      if(!email_username || !pass_word){
        toast.error("Please enter both username/email and password");
        return false;
      }
      const res = await api.post("/admin/login", { email_username, pass_word });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        toast.success(res.data.message || "Login successful!");
        return true;
      } else {
        toast.error("Login failed: No token received");
        return false;
      }
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check if the server is running.";
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check if the backend is running on port 5000.";
      } else if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      }
      toast.error(errorMessage);
      return false;
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
      if(!user_id || !loan_amount || !loan_term || !loan_purpose || !loan_status){
          toast.error("All the fields are required")
          return false;
      }
      const res = await api.post("/new/loan_application", {
        user_id,
        loan_amount,
        loan_term,
        loan_purpose,
        loan_status,
      });
      toast.success(res.data.message);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply for loan");
      return false;
    }
  },
  // Get user-specific loan applications
  getUserLoanApplications: async (userId) => {
    try {
      const res = await api.get(`/application/user/${userId}`);
      return res.data.message || [];
    } catch (error) {
      toast.error("Failed to fetch loan applications");
      return [];
    }
  },
  Allapplication: async () => {
    try {
      const res = await api.get("/application");
      const applications = res.data.message || [];
      if (applications.length === 0) {
        // Don't show error toast for empty data - this is normal
      } else {
        }
      return applications;
    } catch (error) {
      let errorMessage = "Failed to fetch loan applications";
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check if the server is running.";
        } else if (error.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please ensure the backend is running on port 5000.";
        } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please check the database connection.";
        } else if (error.response?.status === 404) {
        errorMessage = "Endpoint not found. Please check the API configuration.";
        } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
      return []; // Always return empty array so components don't crash
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
  deleteApplication: async (loan_application_id) => {
    try {
      const res = await api.delete(`/delete/application/${loan_application_id}`);
      toast.success("Loan application deleted successfully");
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete loan application";
      toast.error(errorMessage);
      throw error;
    }
  },
};
// Dashboard services
export const dashboardServices = {
  getDashboardStats: async () => {
    try {
      const res = await api.get("/dashboard/stats");
      return res.data.data;
    } catch (error) {
      return {
        totalMembers: 0,
        totalSavings: 0,
        totalLoans: 0,
        totalLoanAmount: 0,
        pendingApplications: 0,
        totalShares: 0,
        totalBuilding: 0,
        totalDevelopment: 0,
        recentMembers: 0,
        recentLoans: 0
      };
    }
  },
  getMonthlySavingsTrend: async () => {
    try {
      const res = await api.get("/dashboard/savings-trend");
      return res.data.message;
    } catch (error) {
      return [];
    }
  },
  getSavingsByType: async () => {
    try {
      const res = await api.get("/dashboard/savings-by-type");
      return res.data.message;
    } catch (error) {
      return [];
    }
  },
  getRecentActivities: async (limit = 10) => {
    try {
      const res = await api.get(`/dashboard/recent-activities?limit=${limit}`);
      return res.data.message;
    } catch (error) {
      return [];
    }
  }
};
export const loanServices = {
  // Get user-specific loans
  getUserLoans: async (userId) => {
    try {
      const res = await api.get(`/loans/user/${userId}`);
      return res.data.message || [];
    } catch (error) {
      toast.error("Failed to fetch loans");
      return [];
    }
  },
  // Get total loans count
  getTotalLoans: async () => {
    try {
      const res = await api.get("/loans/total");
      return res.data.message;
    } catch (error) {
      return 0;
    }
  },
  // Get total loan amount
  getTotalLoanAmount: async () => {
    try {
      const res = await api.get("/loans/total-amount");
      return res.data.message;
    } catch (error) {
      return 0;
    }
  },
  // Get total loan applications count
  getTotalLoanApplications: async () => {
    try {
      const res = await api.get("/loan-applications/total");
      return res.data.message;
    } catch (error) {
      return 0;
    }
  },
  disburseLoan: async (user_id, amount_disbursed, date, loan_repayment, total_interest) => {
    try {
      if(!user_id || !amount_disbursed || !date || !loan_repayment || !total_interest) {
        toast.error("All fields are required")
        return false;
      }
      const res = await api.post("/disburse/loan", {
        user_id,
        amount_disbursed,
        date,
        loan_repayment,
        total_interest
      });
      toast.success(res.data.message);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to disburse loan");
      return false;
    }
  },
  getAllLoans: async () => {
    try {
      const res = await api.get("/loans");
      return res.data.message || [];
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch loans";
      toast.error(errorMessage);
      return [];
    }
  },

  deleteLoan: async (loan_id) => {
    try {
      const res = await api.delete(`/delete/loan/${loan_id}`);
      toast.success("Loan deleted successfully");
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete loan";
      toast.error(errorMessage);
      throw error;
    }
  },
  updateLoan: async (loan_id, amount_disbursed, loan_repayment, status) => {
    try {
      const res = await api.patch(`/update/loans/${loan_id}`, {
        amount_disbursed,
        loan_repayment,
        status
      });
      toast.success("Loan updated successfully");
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update loan";
      toast.error(errorMessage);
      throw error;
    }
  },
  getLoanInstallments: async (loan_id) => {
    try {
      const res = await api.get(`/loan/installments/${loan_id}`);
      return res.data.message;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch loan installments");
      return [];
    }
  },
  recordLoanRepayment: async (loan_id, amount, payment_date, payment_method, installment_number = null) => {
    try {
      if(!loan_id || !amount || !payment_date || !payment_method) {
        toast.error("Required fields are missing");
        return false;
      }
      const paymentData = {
        loan_id,
        amount,
        payment_date,
        payment_method
      };
      if (installment_number) {
        paymentData.installment_number = installment_number;
      }
      const res = await api.post("/repay/loan", paymentData);
      toast.success(res.data.message);
      return {
        success: true,
        remainingBalance: res.data.remainingBalance,
        status: res.data.status
      };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to record loan repayment");
      return { success: false };
    }
  }
};
export const loanRepaymentServices = {
  recordRepayment: async (loan_id, user_id, amount, payment_date, payment_method, installment_number = null, notes = "") => {
    try {
      if(!loan_id || !user_id || !amount || !payment_date || !payment_method) {
        toast.error("Required fields are missing");
        return { success: false };
      }
      const repaymentData = {
        loan_id,
        user_id,
        amount,
        payment_date,
        payment_method,
        notes
      };
      if (installment_number) {
        repaymentData.installment_number = installment_number;
      }
      const res = await api.post("/repayment/record", repaymentData);
      toast.success(res.data.message);
      return {
        success: true,
        repayment_id: res.data.repayment_id,
        remaining_balance: res.data.remaining_balance,
        status: res.data.status
      };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to record repayment");
      return { success: false };
    }
  },
  getLoanRepayments: async (loan_id) => {
    try {
      const res = await api.get(`/repayment/loan/${loan_id}`);
      return res.data.message;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch loan repayments");
      return [];
    }
  },
  getUserRepayments: async (user_id) => {
    try {
      const res = await api.get(`/repayment/user/${user_id}`);
      return res.data.message;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch user repayments");
      return [];
    }
  },
  getAllRepayments: async () => {
    try {
      const res = await api.get("/repayment/all");
      const repayments = res.data.message || [];
      return repayments;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch repayments");
      return [];
    }
  },

  // Get pending payments for a user
  getPendingPayments: async (user_id) => {
    try {
      const res = await api.get(`/repayment/pending/${user_id}`);
      return res.data.message || [];
    } catch (error) {
      return [];
    }
  },

  // Get next payment due for a user
  getNextPayment: async (user_id) => {
    try {
      const res = await api.get(`/repayment/next/${user_id}`);
      return res.data.message;
    } catch (error) {
      return null;
    }
  },

  // Update repayment status
  updateRepaymentStatus: async (repayment_id, status, notes = '') => {
    try {
      const res = await api.patch(`/repayment/update/${repayment_id}`, {
        status,
        notes
      });
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update repayment");
      throw error;
    }
  },

  // Delete repayment record
  deleteRepayment: async (repayment_id) => {
    try {
      const res = await api.delete(`/repayment/delete/${repayment_id}`);
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete repayment");
      throw error;
    }
  }
};
export const savingServices = {
  // Add new savings
  addSavings: async (user_id, amount, month_paid, payment_type, savings_type) => {
    try {
      const res = await api.post("/new/savings", { user_id, amount, month_paid, payment_type, savings_type });
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add savings");
      throw error;
    }
  },

  // Get all savings
  getAllSavings: async () => {
    try {
      const res = await api.get("/savings");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch savings");
      return [];
    }
  },

  // Get user-specific savings
  getUserSavings: async (id) => {
    try {
      const res = await api.get(`/user/savings/${id}`);
      const savingsData = res.data.message || [];
      const totalSavings = res.data.total?.total_savings || 0;
      return { data: savingsData, total: totalSavings };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch user savings");
      return { data: [], total: 0 };
    }
  },

  // Get user development savings
  getUserDevelopment: async (id) => {
    try {
      const res = await api.get(`/user/development/${id}`);
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch development savings");
      return [];
    }
  },

  // Get total savings
  getTotalSavings: async () => {
    try {
      const res = await api.get("/savings/total");
      return res.data.message || 0;
    } catch (error) {
      return 0;
    }
  },

  // Get total building savings
  getTotalBuilding: async () => {
    try {
      const res = await api.get("/building/total");
      return res.data.message || 0;
    } catch (error) {
      return 0;
    }
  },

  // Get total shares
  getTotalShares: async () => {
    try {
      const res = await api.get("/shares/total");
      return res.data.message || 0;
    } catch (error) {
      return 0;
    }
  },
  // Get all shares
  getAllShares: async () => {
    try {
      const res = await api.get("/shares");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch shares");
      return [];
    }
  },

  // Legacy method names for backward compatibility
  getAllshares: async () => {
    try {
      const res = await api.get("/shares");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch shares");
      return [];
    }
  },

  getTotalshares: async () => {
    try {
      const res = await api.get("/user/shares");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch total shares");
      return [];
    }
  },

  getbuilding: async () => {
    try {
      const res = await api.get("/building");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch building savings");
      return [];
    }
  },

  getTotalbuilding: async () => {
    try {
      const res = await api.get("/user/building");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch total building savings");
      return [];
    }
  },

  getdevelopment: async () => {
    try {
      const res = await api.get("/development");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch development savings");
      return [];
    }
  },

  getTotaldevelopment: async () => {
    try {
      const res = await api.get("/user/dev");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch total development savings");
      return [];
    }
  },

  getsavings: async () => {
    try {
      const res = await api.get("/savings");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch regular savings");
      return [];
    }
  },

  getTotalsavings: async () => {
    try {
      const res = await api.get("/user/savings");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch total regular savings");
      return [];
    }
  },

  // Additional legacy methods for building and development pages
  getAllbuilding: async () => {
    try {
      const res = await api.get("/building");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch building savings");
      return [];
    }
  },

  getAlldevelopment: async () => {
    try {
      const res = await api.get("/development");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch development savings");
      return [];
    }
  },

  getUserDev: async () => {
    try {
      const res = await api.get("/user/dev");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch development total");
      return [];
    }
  },

  getTotalbuilding: async () => {
    try {
      const res = await api.get("/user/building");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch building total");
      return [];
    }
  },

  // Get all building savings
  getAllBuilding: async () => {
    try {
      const res = await api.get("/building");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch building savings");
      return [];
    }
  },

  // Get all development savings
  getAllDevelopment: async () => {
    try {
      const res = await api.get("/development");
      return res.data.message || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch development savings");
      return [];
    }
  },

  // Update savings
  updateSavings: async (savings_id, amount, savings_type) => {
    try {
      const res = await api.patch(`/update/savings/${savings_id}`, {
        amount,
        savings_type
      });
      toast.success(res.data.message || "Savings updated successfully");
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Update failed";
      toast.error(errorMessage);
      throw error;
    }
  },

  // Delete savings
  deleteSavings: async (savings_id) => {
    try {
      const res = await api.delete(`/delete/savings/${savings_id}`);
      toast.success(res.data.message || "Savings deleted successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting savings");
      throw error;
    }
  },
  // Search savings
  searchSavings: async (query) => {
    try {
      const res = await api.get(`/savings/search?query=${encodeURIComponent(query)}`);
      return res.data.message || [];
    } catch (error) {
      toast.error("Search failed");
      return [];
    }
  },
  // Filter savings
  filterSavings: async (filters) => {
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/savings/filter?${params}`);
      return res.data.message || [];
    } catch (error) {
      toast.error("Filter failed");
      return [];
    }
  },
};
// Reports services
export const reportsServices = {
  getFinancialSummary: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const res = await api.get(`/reports/financial-summary?${params}`);
      return res.data.data;
    } catch (error) {
      toast.error("Failed to generate financial summary");
      return null;
    }
  },
  getMemberActivityReport: async (userId, startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const res = await api.get(`/reports/member-activity/${userId}?${params}`);
      return res.data.data;
    } catch (error) {
      toast.error("Failed to generate member activity report");
      return null;
    }
  },
  getLoanPerformanceReport: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const res = await api.get(`/reports/loan-performance?${params}`);
      return res.data.data;
    } catch (error) {
      toast.error("Failed to generate loan performance report");
      return null;
    }
  }
};
