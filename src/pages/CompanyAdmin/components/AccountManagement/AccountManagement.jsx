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
} from "antd";
import { Plus, Search, Edit3, Trash2, RefreshCw, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // --- FETCH ACCOUNTS LOGIC ---
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/Users");
      setAccounts(response.data);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to fetch accounts";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // --- DELETE ACCOUNT LOGIC ---
  const handleDelete = async (accountId) => {
    try {
      const adminId = localStorage.getItem("userId");
      await api.delete(`/Users/delete/${adminId}/${accountId}`);
      message.success("Account deleted successfully");
      fetchAccounts();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to delete account",
      );
    }
  };

  // --- ROLE FORMATTER & STYLER ---
  const renderRoleTag = (roleName) => {
    if (!roleName)
      return (
        <Tag className="!rounded-full !px-4 !border-none !font-bold">N/A</Tag>
      );

    // 1. Chuyển Company Admin -> Admin
    let displayName = roleName === "Company Administrator" ? "Admin" : roleName;

    // 2. Chỉ viết hoa chữ cái đầu tiên
    displayName =
      displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();

    // 3. Phân loại màu sắc
    let color = "default";
    if (displayName === "Admin") color = "purple";
    if (displayName === "Manager") color = "blue";
    if (displayName === "Staff") color = "green";

    return (
      <Tag
        color={color}
        className="!rounded-full !px-4 !border-none !font-bold !text-[11px]"
      >
        {displayName}
      </Tag>
    );
  };

  // --- ANTD TABLE COLUMNS ---
  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      fixed: "left",
      render: (text, record, index) => (
        <span className="text-slate-400 font-mono">{index + 1}</span>
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
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
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
      dataIndex: ["role", "name"],
      key: "role",
      render: (roleName) => renderRoleTag(roleName),
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
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => (
        <span className="text-slate-500 font-mono">{phone || "N/A"}</span>
      ),
    },
    {
      title: "Operations",
      key: "actions",
      fixed: "right",
      width: 130,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit Account">
            <button
              onClick={() => navigate(`edit/${record.id}`)}
              className="p-2 hover:bg-[#39C6C6]/10 rounded-xl text-slate-400 hover:text-[#39C6C6] transition-all"
            >
              <Edit3 size={18} />
            </button>
          </Tooltip>

          <Tooltip title="Remove">
            <Popconfirm
              title="Delete Account"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{
                danger: true,
                style: { background: "#ff4d4f", borderColor: "#ff4d4f" },
              }}
            >
              <button className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all">
                <Trash2 size={18} />
              </button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredData = accounts.filter(
    (a) =>
      a.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
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
              Refresh
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

        <div>
          <Input
            placeholder="Search by name or email..."
            prefix={<Search size={20} className="text-slate-300 mr-3" />}
            className="!mb-5 !h-12 !bg-white !rounded-full !text-base !transition-all hover:!border-[#39C6C6] focus-within:!border-[#39C6C6] focus-within:!shadow-[0_0_0_2px_rgba(57,198,198,0.2)]"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-[1rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden p-6">
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 8, className: "px-6" }}
            scroll={{ x: 1100 }}
            className="account-custom-table"
            onRow={(record) => ({
              onClick: (event) => {
                // Nếu click vào các nút action (Edit/Delete) thì không chuyển trang details
                if (
                  event.target.closest("button") ||
                  event.target.closest(".ant-popover")
                ) {
                  return;
                }
                navigate(`details/${record.id}`);
              },
            })}
          />
        </div>
      </section>

      <style jsx="true">{`
        .account-custom-table .ant-table-thead > tr > th {
          background: #f4f7fa !important;
          color: #4d4d4d !important;
          font-weight: 1000 !important;
          text-transform: uppercase !important;
          font-size: 12px !important;
          letter-spacing: 0.1em !important;
          border-bottom: 2px solid #f1f5f9 !important;
          padding: 20px !important;
        }
        .account-custom-table .ant-table-tbody > tr > td {
          padding: 12px 20px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .ant-pagination-item-active {
          border-color: #39c6c6 !important;
        }
        .ant-pagination-item-active a {
          color: #39c6c6 !important;
        }
        .account-custom-table .ant-table-tbody > tr {
          cursor: pointer;
          transition: all 0.2s;
        }
      `}</style>
    </div>
  );
};

export default AccountManagement;
