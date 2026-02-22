import React, { useState, useEffect } from "react";
import api from "../../../../api/axios";
import {
  Table,
  Tag,
  Space,
  Input,
  Button,
  message,
  Tooltip,
  Typography,
  Popconfirm,
  Select,
} from "antd";
import {
  Plus,
  Search,
  RefreshCw,
  Users,
  UserX,
  UserCheck,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("Active");

  const navigate = useNavigate();

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/Users");
      setAccounts(response.data);
    } catch (error) {
      message.error("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleToggleStatus = async (record) => {
    const newStatus = record.status === "Active" ? "Inactive" : "Active";
    try {
      await api.put(`/Users/${record.id}`, { status: newStatus });
      message.success(
        `Account ${newStatus === "Active" ? "unbanned" : "banned"} successfully`,
      );
      fetchAccounts();
    } catch (error) {
      message.error(error.response?.data?.message || "Operation failed");
    }
  };

  // --- CHỈ THAY ĐỔI LOGIC RENDER ROLE TẠI ĐÂY ---
  const renderRoleTag = (roleId) => {
    const roles = {
      1: { name: "System Admin", color: "red" },
      2: { name: "Company Admin", color: "purple" },
      3: { name: "Manager", color: "blue" },
      4: { name: "Staff", color: "green" },
    };

    const role = roles[roleId];

    if (!role)
      return (
        <Tag className="!rounded-full !px-4 !border-none !font-bold">N/A</Tag>
      );

    return (
      <Tag
        color={role.color}
        className="!rounded-full !px-4 !border-none !font-bold !text-[11px]"
      >
        {role.name}
      </Tag>
    );
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      fixed: "left",
      render: (t, r, i) => (
        <span className="text-slate-400 font-mono">{i + 1}</span>
      ),
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      fixed: "left",
      render: (text) => (
        <span className="font-bold text-slate-800 text-base">{text}</span>
      ),
    },
    {
      title: "Email Address",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <span className="text-slate-600 font-medium">{email}</span>
      ),
    },
    {
      title: "Role",
      dataIndex: "roleId", // Thay đổi dataIndex để lấy roleId trực tiếp
      key: "role",
      render: (roleId) => renderRoleTag(roleId),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "Active" ? "green" : "red"}
          className="!rounded-md !px-3 !py-0.5 !font-bold"
        >
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Operations",
      key: "actions",
      fixed: "right",
      width: 190,
      render: (_, record) => {
        const isActive = record.status === "Active";
        const isSystemAdmin = record.roleId === 1; // Kiểm tra roleId thay vì role name
        return (
          <Space size="middle">
            {!isSystemAdmin ? (
              <div>
                {isActive ? (
                  <Tooltip title="Ban Account">
                    <Popconfirm
                      title="Ban this user?"
                      description="User will no longer be able to log in."
                      onConfirm={() => handleToggleStatus(record)}
                      okText="Yes, Ban"
                      cancelText="No"
                      okButtonProps={{ danger: true, className: "!rounded-lg" }}
                    >
                      <button className="cursor-pointer flex px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl items-center">
                        <span className="mr-2">Ban</span> <UserX size={18} />
                      </button>
                    </Popconfirm>
                  </Tooltip>
                ) : (
                  <Tooltip title="Restore Account">
                    <button
                      onClick={() => handleToggleStatus(record)}
                      className="cursor-pointer flex px-3 py-1 bg-green-400 hover:bg-green-500 text-white font-bold rounded-xl items-center"
                    >
                      <span className="mr-2">Unban</span>
                      <UserCheck size={18} />
                    </button>
                  </Tooltip>
                )}
              </div>
            ) : (
              <div className="bg-slate-100 px-3 py-2 rounded-xl">
                <span className="flex items-center text-slate-500 italic text-xs">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="#62748e"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-miterlimit="10"
                      stroke-width="1.5"
                    >
                      <path d="M12.113 21.98a.33.33 0 0 1-.226 0C10.917 21.64 4 18.94 4 11.252V4.304a.4.4 0 0 1 .303-.389l7.6-1.903a.4.4 0 0 1 .194 0l7.6 1.903a.4.4 0 0 1 .303.389v6.948c0 7.765-6.916 10.397-7.887 10.729" />
                      <path d="m11.43 10.284l.376-1.508c.05-.202.338-.202.388 0l.377 1.508a.2.2 0 0 0 .145.145l1.508.377c.202.05.202.337 0 .388l-1.508.377a.2.2 0 0 0-.145.145l-.377 1.508c-.05.202-.338.202-.388 0l-.377-1.508a.2.2 0 0 0-.145-.145l-1.508-.377c-.202-.05-.202-.338 0-.388l1.508-.377a.2.2 0 0 0 .145-.146" />
                    </g>
                  </svg>
                  <p className="ml-1">System Protected</p>
                </span>
              </div>
            )}
          </Space>
        );
      },
    },
  ];

  const filteredData = accounts.filter((a) => {
    const matchesSearch =
      a.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchText.toLowerCase());

    // Cập nhật logic lọc theo ID dạng string từ Select
    const matchesRole = filterRole === "All" || String(a.roleId) === filterRole;
    const matchesStatus = filterStatus === "All" || a.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="md:px-16 lg:px-12 pt-7 pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8">
          <div>
            <Title level={2} className="!mb-0 !font-bold !tracking-tight">
              Account Management{" "}
              <Users className="inline-block ml-2 text-[#39C6C6]" />
            </Title>
          </div>

          <Space size="middle" className="w-full md:w-auto">
            <Button
              icon={
                <RefreshCw
                  size={16}
                  className={loading ? "!animate-spin" : ""}
                />
              }
              onClick={fetchAccounts}
              className="!h-12 !px-6 !rounded-2xl !border-slate-200 !font-bold !text-slate-600 hover:!text-[#39C6C6] hover:!border-[#39C6C6]"
            >
              Sync Data
            </Button>
            <Button
              type="primary"
              onClick={() => navigate("create")}
              icon={<Plus size={20} />}
              className="!h-12 !px-8 !bg-[#39C6C6] !border-none !rounded-2xl !font-bold hover:!bg-[#2eb1b1] !shadow-lg !shadow-[#39C6C6]/20 !flex !items-center"
            >
              Add New User
            </Button>
          </Space>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Quick search by name or email..."
              prefix={<Search size={20} className="text-slate-300 mr-3" />}
              className="!h-12 !bg-white !rounded-full !text-base !transition-all !border-slate-300 hover:!border-[#39C6C6] focus-within:!border-[#39C6C6]"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Select
              defaultValue="All"
              className="!w-48 !h-12 !pl-5 !rounded-full !border !border-slate-300 hover:!border-[#39C6C6] focus-within:!border-[#39C6C6] overflow-hidden transition-all"
              onChange={(value) => setFilterRole(value)}
              suffixIcon={
                <Filter
                  size={16}
                  className="text-slate-400 group-hover:text-[#39c6c6]"
                />
              }
            >
              <Option value="All">All Roles</Option>
              {/* Thay đổi Option value thành ID tương ứng */}
              <Option value="1">System Admin</Option>
              <Option value="2">Company Admin</Option>
              <Option value="3">Manager</Option>
              <Option value="4">Staff</Option>
            </Select>

            <Select
              defaultValue="All"
              className="!w-40 !h-12 !pl-5 !rounded-full !border !border-slate-300 hover:!border-[#39C6C6] focus-within:!border-[#39C6C6] overflow-hidden transition-all"
              onChange={(value) => setFilterStatus(value)}
            >
              <Option value="All">All Status</Option>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-[1rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden p-6">
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 8, className: "px-6" }}
            scroll={{ x: 1000 }}
            className="storix-table"
            onRow={(record) => ({
              onClick: (event) => {
                if (
                  event.target.closest("button") ||
                  event.target.closest(".ant-popover") ||
                  event.target.closest(".ant-popconfirm")
                )
                  return;
                navigate(`details/${record.id}`);
              },
            })}
          />
        </div>
      </section>
    </div>
  );
};

export default AccountManagement;
