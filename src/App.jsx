import { BrowserRouter, Route, Routes } from "react-router-dom"
import Homepage from "./pages/homepage"
// import ContactPage from "./pages/contact"
import Savings from "./pages/savings"
import Member from "./pages/member"
import Loan from "./pages/loan"
import Login from "./pages/login"
import Profile from "./pages/profile"
import Building from "./pages/building"
import Adminpage from "./pages/admin"
import { Navigate } from "react-router-dom"
import DashboardLayout from "./components/_layout"
import Shares from "./pages/shares"



function App() {


  return (
    <BrowserRouter>
      <Routes>
      
        <Route index element={<Homepage />} />
        <Route path="savings" element={<Savings />} />
        <Route path="members"  element={<Member />} />
        <Route path="loan" element={<Loan />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route path="building" element={<Building />} />
        <Route path="/shares" element={<Shares/>}/>
        <Route path="admin" element={<Adminpage/>}/>


        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
