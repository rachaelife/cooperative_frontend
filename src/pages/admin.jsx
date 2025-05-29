import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/_layout";
import { AutoComplete, Button, Input, Modal, Select, Table, Popconfirm } from "antd";
import { CgAdd } from "react-icons/cg";
import { adminServices } from "../services/api";
import { toast } from "sonner";


function Adminpage() {
  const [open, setOPen] = useState(false);
  const [admins, setAdmins] = useState([]);

  //editbutton
   const [editOpen, setEditOpen] = useState(false);
const [currentAdmin, setCurrentAdmin] = useState(null);

const openEditModal = (admin) => {
  setCurrentAdmin(admin); // this sets the admin to be edited
  setEditOpen(true);      // show the modal
};

  const updateAdmin = async () => {
  try {
    await adminServices.Updateadmin(currentAdmin);
    toast.success("Admin updated");
    getAlladmin(); // Refresh the table
    setEditOpen(false);
  } catch (err) {
    toast.error("Failed to update admin");
  }
};




  //colunm for table
  const columns = [
    {
      title: "S/NO",
      dataIndex: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "username",
      dataIndex: "username",
      key: "username",
    },

    {
      title: "E-mail ",
      dataIndex: "email",
      key: "email",
    },

    // {
    //   title: "Gender",
    //   dataIndex: "gender",
    //   key: "gender",
    // },

    {
      title: "Admin_Role",
      dataIndex: "admin_role",
      key: "admin_role",
    },

    {
      title: "mobile",
      dataIndex: "mobile",
      key: "mobile",
    },

    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type="primary" onClick={() => openEditModal(record)}>
            Edit
          </Button>
                <Popconfirm
        title="Are you sure you want to delete this admin?"
        onConfirm={() => handleDelete(record.admin_id)}
        okText="Yes"
        cancelText="No"
      >

          <Button danger ={() => handleDelete(record.admin_id)}>
            Delete
          </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  //handledelete button
  const handleDelete = async (admin_id) => {
    try {
      await adminServices.Deleteadmin(admin_id);
      toast.success("Admin deleted");
      getAlladmin(); // Refresh the table
    } catch (err) {
      toast.error("Failed to delete admin");
    }
  };

  const [admin, setAdmin] = useState({
    username: "",
    email: "",
    admin_role: "",
    mobile: "",
    pass_word: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await adminServices.Newadmin(
      admin.username,
      admin.email,
      admin.admin_role,
      admin.mobile,
      admin.pass_word
    );

    if (data) {
      toast.success("Admin added!");
      setOPen(false);
      setAdmin({
        username: "",
        email: "",
        admin_role: "",
        mobile: "",
        pass_word: "",
      });
      getAlladmin(); // <== Refresh the list
    }
  };

  const getAlladmin = async () => {
    const res = await adminServices.Alladmin();
    // console.log("Fetched admins: ", res);
    setAdmins(res);
    // console.log(res)
  };

  useEffect(() => {
    getAlladmin();
  }, []);

  return (
    <>
      <DashboardLayout>
        <div className="flex justify-between items-center py-2">
          <h1 className="my-5 text-3xl font-bold">Admins</h1>

          <Button onClick={() => setOPen(true)}>
            <CgAdd /> Register New Admin
          </Button>
          <Modal open={open} footer={null} onCancel={() => setOPen(false)}>
            <div className="mb-10">
              <h1 className="text-2xl text-slate-600">NEW ADMINISTRATOR</h1>
            </div>
            <form className="" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2 my-4">
                <label htmlFor="">username</label>
                <AutoComplete
                  className="w-[100%]"
                  value={admin.username}
                  onChange={(value) => setAdmin({ ...admin, username: value })}
                />
              </div>

              <div className="flex flex-col gap-2 my-4">
                <label htmlFor="">Email Address</label>
                <Input
                  type="email"
                  className="w-[100%]"
                  value={admin.email}
                  onChange={(e) =>
                    setAdmin({ ...admin, email: e.target.value })
                  }
                />
              </div>

              {/* <div className=" gap-1 my-3 mt-5 flex flex-col">
              <label htmlFor="">Gender</label>
              <Select 
              placeholder="Select Gender"
              options={[
                  {value: "male", label: "Male"},
                  {value: "female", label: "Female"},
                ]} 
              
              />
               </div> */}

              <div className=" gap-1 my-3 mt-5 flex flex-col">
                <label htmlFor="">Role</label>
                <Select
                  placeholder="Select Gender"
                  options={[
                    { value: "super Admin", label: "Super Admin" },
                    { value: "Admin", label: "Admin" },
                  ]}
                  value={admin.admin_role}
                  onChange={(value) =>
                    setAdmin({ ...admin, admin_role: value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2 my-4">
                <label htmlFor="">Phone number</label>
                <Input
                  type="number"
                  className="w-[100%]"
                  value={admin.mobile}
                  onChange={(e) =>
                    setAdmin({ ...admin, mobile: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2 my-4">
                <label htmlFor="">Password</label>
                <Input
                  type="password"
                  className="w-[100%]"
                  value={admin.pass_word}
                  onChange={(e) =>
                    setAdmin({ ...admin, pass_word: e.target.value })
                  }
                />
              </div>

              {/* <div className="flex flex-col gap-2 my-4">
                  <label htmlFor=""> post held</label>
                  <Input type="text" className="w-[100%]"/>  
                </div>  */}

              {/* <div className="flex flex-col gap-2 my-4">
                  <label htmlFor=""> Month</label>
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
                  className="cursor-pointer h-[50px] rounded-md border border-slate-300 px-3 bg-green-800 text-white "
                  value={"Add new admin"}
                />
              </div>
            </form>
          </Modal>
        </div>


        
        <Modal
  open={editOpen}
  footer={null}
  onCancel={() => setEditOpen(false)}
  title="Edit Admin"
>
  <form
    onSubmit={(e) => {
      e.preventDefault();
      updateAdmin();
    }}
  >
    <div className="flex flex-col gap-2 my-4">
      <label>Username</label>
      <Input
        value={currentAdmin?.username}
        onChange={(e) =>
          setCurrentAdmin({ ...currentAdmin, username: e.target.value })
        }
      />
    </div>

    <div className="flex flex-col gap-2 my-4">
      <label>Email</label>
      <Input
        type="email"
        value={currentAdmin?.email}
        onChange={(e) =>
          setCurrentAdmin({ ...currentAdmin, email: e.target.value })
        }
      />
    </div>

    <div className="flex flex-col gap-2 my-4">
      <label>Role</label>
      <Select
        value={currentAdmin?.admin_role}
        onChange={(value) =>
          setCurrentAdmin({ ...currentAdmin, admin_role: value })
        }
        options={[
          { value: "Admin", label: "Admin" },
          { value: "Super Admin", label: "Super Admin" },
        ]}
      />
    </div>

    <div className="flex flex-col gap-2 my-4">
      <label>Phone Number</label>
      <Input
        type="text"
        value={currentAdmin?.mobile}
        onChange={(e) =>
          setCurrentAdmin({ ...currentAdmin, mobile: e.target.value })
        }
      />
    </div>

    <div className="flex justify-end">
      <Button type="primary" htmlType="submit">
        Save Changes
      </Button>
    </div>
  </form>
</Modal>


        <Table columns={columns} dataSource={admins}  rowKey="admin_id" />
      </DashboardLayout>
    </>
  );
}

export default Adminpage;
