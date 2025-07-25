import { Link, useNavigate } from "react-router-dom"
import { MdSpaceDashboard } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { MdSavings } from "react-icons/md";
import { FaArrowsDownToPeople } from "react-icons/fa6";
import { MdPropaneTank } from "react-icons/md";
import { RiAdminFill } from "react-icons/ri";
import { HiDocumentReport } from "react-icons/hi";
import { useEffect } from "react";
import { useAuth } from "../utils/auth";


function DashboardLayout({ children }) {

const navigate = useNavigate()
    const {authUser} = useAuth()
    useEffect(()=>{
        authUser()
    },[])

    
    return (
        <section className="layoutSection min-h-screen">
            <aside className="h-screen overflow-y-scroll px-5 bg-blue-950">
                <div className="flex items-center rounded-md mt-5 gap-0">
                <div>
                <img src="/logo1.png" alt="" width={100}/>
                </div>
                <h1 className="my-10 text-3xl text-black">OMCS</h1>
                </div>
                <div className="flex flex-col gap-5">
                    <Link to={"/"} className="flex items-center gap-5 text-xl text-white py-2 px-5 rounded-xl hover:bg-slate-700 hover:text-white"><MdSpaceDashboard /> <span>Dashboard</span></Link>
                    <Link to={"/members"} className="flex items-center gap-5 text-xl text-white py-2 px-5 rounded-xl hover:bg-slate-700 hover:text-white"><FaUsers /> <span>Members</span></Link>
                    <Link to={"/savings"} className="flex items-center gap-5 text-xl text-white py-2 px-5 rounded-xl hover:bg-slate-700 hover:text-white"><MdSavings /> <span>Savings</span></Link>
                    <Link to={"/loan"} className="flex items-center gap-5 text-xl text-white py-2 px-5 rounded-xl hover:bg-slate-300 hover:text-white"><MdSavings /> <span>Loan</span></Link>
                    <Link to={"/shares"} className="flex items-center gap-5 text-xl text-white py-2 px-5 rounded-xl hover:bg-slate-700 hover:text-white"><FaArrowsDownToPeople /> <span>Shares</span></Link>
                    <Link to={"/building"} className="flex items-center gap-5 text-xl text-white py-2 px-5 rounded-xl hover:bg-slate-700 hover:text-white"><MdPropaneTank /> <span>Building</span></Link>
                    <Link to={"/development"} className="flex items-center gap-5 text-xl text-white py-2 px-5 rounded-xl hover:bg-slate-700 hover:text-white"><MdPropaneTank /> <span>Development</span></Link>
                    <Link to={"/reports"} className="flex items-center gap-5 text-xl text-white py-2 px-5 rounded-xl hover:bg-slate-700 hover:text-white"><HiDocumentReport /> <span>Reports</span></Link>
                    <Link to={"/admin"} className="flex items-center gap-5 text-xl text-white py-2 px-5 rounded-xl hover:bg-slate-700 hover:text-white"><RiAdminFill /> <span>Admins</span></Link>
                </div>
            </aside>
            <main className="p-5 h-screen overflow-y-scroll">
                {children}
            </main>
        </section>
    )
}
export default DashboardLayout