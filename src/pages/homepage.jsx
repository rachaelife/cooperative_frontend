// import { Link } from "react-router-dom"
import DashboardLayout from "../components/_layout"
import { MdSavings } from "react-icons/md";
// import RC2 from 'react-chartjs2'

function Homepage() {
    return (
        <DashboardLayout>
            <section className=" flex-wrap">

                <h1 className="text-center text-3xl font-bold">ADMIN PANEL</h1>

                    <div className="flex items-center gap-5 flex-wrap mt-5">
                <div className="flex flex-col w-[200px] h-[100px] bg-slate-300 p-3 rounded-xl shadow-xl">
                    <div className="flex justify-between">
                        <div>
                            <h1>Total Saving</h1>
                            <h1 className="text-2xl font-bold">{Intl.NumberFormat().format(40000)}</h1>
                        </div>
                        <MdSavings size={30} />
                    </div>
                    {/* <RC2 type /> */}
                </div>

                <div className="flex flex-col w-[200px] h-[100px] bg-slate-300 p-3 rounded-xl shadow-xl">
                    <div className="flex justify-between">
                        <div>
                            <h1>Total Loan</h1>
                            <h1 className="text-2xl font-bold">{Intl.NumberFormat().format(30000)}</h1>
                        </div>
                        <MdSavings size={30} />
                    </div>
                    {/* <RC2 type /> */}
                </div>

                <div className="flex flex-col w-[200px] h-[100px] bg-slate-300 p-3 rounded-xl shadow-xl">
                    <div className="flex justify-between">
                        <div>
                            <h1>Total Members</h1>
                            <h1 className="text-2xl font-bold">{Intl.NumberFormat().format(30000)}</h1>
                        </div>
                        <MdSavings size={30} />
                    </div>
                    {/* <RC2 type /> */}
                </div>

                <div className="flex flex-col w-[200px] h-[100px] bg-slate-300 p-3 rounded-xl shadow-xl">
                    <div className="flex justify-between">
                        <div>
                            <h1>Total Shares</h1>
                            <h1 className="text-2xl font-bold">{Intl.NumberFormat().format(30000)}</h1>
                        </div>
                        <MdSavings size={30} />
                    </div>
                    {/* <RC2 type /> */}
                </div>

                <div className="flex flex-col w-[200px] h-[100px] bg-slate-300 p-3 rounded-xl shadow-xl">
                    <div className="flex justify-between">
                        <div>
                            <h1>Total BUILDING & DEV</h1>
                            <h1 className="text-2xl font-bold">{Intl.NumberFormat().format(30000)}</h1>
                        </div>
                        <MdSavings size={30} />
                    </div>
                    {/* <RC2 type /> */}
                </div>



                </div>

            </section>
        </DashboardLayout>
    )
}

export default Homepage
