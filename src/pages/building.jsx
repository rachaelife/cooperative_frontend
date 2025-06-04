import { useEffect, useState } from "react";
import DashboardLayout from "../components/_layout";
import { memberServices, savingServices } from "../services/api";
import { AutoComplete, Button, Input, Modal, Select, Table } from "antd";
import { toast } from "sonner";
import { CgAdd } from "react-icons/cg";
import { months } from "../months";
import { MdOutlineSavings } from "react-icons/md";

function Building() {
  const [open, setOPen] = useState(false);
  const [members, setmembers] = useState([]);
  const [totalbuilding, setTotalbuilding] = useState(0)

  const columns = [
    {
      title: "S/NO",
      dataIndex: "no",
      key: "no",
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
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },

    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },

    {
      title: "month",
      dataIndex: "month",
      key: "month",
    },

    {
      title: "payment type",
      dataIndex: "payment_type",
      key: "payment_type",
    },

    {
      title: "saving type",
      dataIndex: "savings_type",
      key: "savings_type",
    },
    // {
    //   title: "Action",
    //   dataIndex: "action",
    //   key: "action",
    // },
  ];

  const [building, setbuilding] = useState([]);
  const [member, setMember] = useState("");

  const [newSavings, setNewSavings] = useState({
    user_id: "",
    amount: "",
    month_paid: "",
    payment_type: "",
    savings_type: "",
  });

  const fetchAllMember = async () => {
    const data = await memberServices.Allmembers();
    setmembers(data);
  };

  useEffect(() => {
    fetchAllMember();
  }, []);

  const fetchbuildings = async () => {
    try {
      const res = await savingServices.getAllbuilding();
      const data = await savingServices.getTotalbuilding()
      setTotalbuilding(data[0] || 0)
      setbuilding(res); // Make sure your backend returns an array
      console.log(res);
    } catch (error) {
      toast.error("Error fetching savings");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting savings data:", newSavings);

    try {
      await savingServices.addsavings(
        newSavings.user_id,
        newSavings.amount,
        newSavings.month_paid,
        newSavings.payment_type,
        newSavings.savings_type
      );

      setNewSavings({
        user_id: "",
        amount: "",
        month_paid: "",
        payment_type: "",
        savings_type: "",
      });
      fetchbuildings();
    } catch (error) {
      toast.error("Failed to add savings");
    }
  };

  useEffect(() => {
    fetchbuildings();
  }, []);

  return (
    <DashboardLayout>

          <div className="">
                                <div className="w-[250px] h-[150px] rounded-md border border-gray-300 p-5 ">
                                  <div className="flex flex-col gap-4">
                                    <MdOutlineSavings size={50} className="text-gray-400"/>
                                    <h1>Total development</h1>
                                  </div>
                    
                                  <h1 className="text-2xl font-bold">&#8358;{Intl.NumberFormat().format(totalbuilding ? totalbuilding.total : 0)}</h1>
                                </div>
                            </div> 
      <div className="flex justify-between items-center ">
        <h1 className="my-5 text-3xl font-bold">Building</h1>

        <Button onClick={() => setOPen(true)}>
          <CgAdd /> New building
        </Button>
        <Modal open={open} footer={null} onCancel={() => setOPen(false)}>
          <div className="mb-10">
            <h1 className="text-2xl text-slate-300">Saving Form</h1>
          </div>

          <form className="" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 my-4">
              <label htmlFor="">Select User</label>
              {/* <AutoComplete
                className="w-[100%]"
                value={member}
                options={members.map((member) => ({
                  label: member.fullname,
                  value: member.user_id,
                }))}
                onChange={(value) => {
                  setMember(value.split(" ")[1]);
                  setNewSavings({
                    ...newSavings,
                    user_id: value.split(" ")[0],
                  });
                }}
              /> */}
              <AutoComplete
  className="w-[100%]"
  value={member}
  options={members.map((member) => ({
    label: member.fullname,
    value: member.user_id,
  }))}
  onSelect={(value, option) => {
    setMember(option.label);
    setNewSavings({ ...newSavings, user_id: value });
  }}
/>

            </div>

            <div className="flex flex-col gap-2 my-4">
              <label htmlFor=""> Amount</label>
              <Input
                type="number"
                className="w-[100%]"
                value={newSavings.amount}
                onChange={(e) =>
                  setNewSavings({ ...newSavings, amount: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-2 my-4">
              <label htmlFor=""> Month</label>
              <Select
                placeholder="Select saving month"
                options={months.map((m) => ({
                  label: m.label,
                  value: m.value,
                }))}
                onChange={(value) =>
                  setNewSavings({ ...newSavings, month_paid: value })
                }
              />
            </div>

            <div className="flex flex-col gap-2 my-4">
              <label htmlFor="">payment type</label>
              <Input
                type="text"
                className="w-[100%]"
                value={newSavings.payment_type}
                onChange={(e) =>
                  setNewSavings({ ...newSavings, payment_type: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-2 my-4">
              <label htmlFor="">Saving type</label>
              <Select
                className="w-[100%]"
                placeholder="Select savings type"
                value={newSavings.savings_type}
                options={[
                  { label: "shares", value: "shares" },
                  { label: " savings", value: "savings" },
                  { label: "building", value: "building" },
                  { label: "development", value: "development" },
                ]}
                onChange={(value) =>
                  setNewSavings({ ...newSavings, savings_type: value })
                }
              />
            </div>

            <div className=" flex flex-col gap-1 my-3">
              <input
                type="submit"
                placeholder="Login"
                className="cursor-pointer h-[50px] rounded-md border border-slate-300 px-3 bg-blue-800 text-white "
                value={"Add new savings"}
              />
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
              { value: "fullname", label: "Full Name" },
              { value: "Gender", label: "Gender" },
              { value: "Mobile NO.", label: "Mobile NO." },
              { value: "Referral.", label: "Referral" },
              { value: "Date.", label: "Date" },
            ]}
          />
          <button className="border border-slate-300 py-1 px-4 rounded-md bg-blue-950 text-white">
            Filter Member
          </button>
        </form>
        <form className="flex items-center gap-2">
          <Input
            type="search"
            placeholder="Search member"
            className="w-[400px]"
          />
          <button className="border border-slate-300 py-1 px-4 rounded-md bg-blue-950 text-white">
            Search Member
          </button>
        </form>
      </div>

      <Table
        columns={columns}
        dataSource={building.map((building, i) => ({
          no: i + 1,
          fullname: building.fullname,
          gender: building.gender,
          mobile: building.mobile,
          amount: building.amount,
          month: building.month_paid,
          payment_type: building.payment_type,
          savings_type: building.savings_type,
        }))}
      />
    </DashboardLayout>
  );
}

export default Building;
