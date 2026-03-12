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
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  Warehouse,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // --- FETCH WAREHOUSES LOGIC ---
  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        message.warning("Company ID not found. Please log in again.");
        return;
      }
      const response = await api.get(
        `/company-warehouses/${companyId}/warehouses`,
      );
      setWarehouses(response.data);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to load warehouses";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // --- CẬP NHẬT DELETE LOGIC THEO API MỚI ---
  const handleDelete = async (warehouseId) => {
    try {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        message.error("Company ID not found.");
        return;
      }

      // API MỚI: /delete-company-warehouses/{companyId}/warehouse/{warehouseId}
      await api.delete(
        `/delete-company-warehouses/${companyId}/warehouse/${warehouseId}`,
      );

      message.success("Warehouse deleted successfully");
      fetchWarehouses(); // Refresh data after successful delete
    } catch (error) {
      console.error("Delete warehouse error:", error);
      message.error(
        error.response?.data?.message || "Failed to delete warehouse",
      );
    }
  };

  // --- ANTD TABLE COLUMNS ---
  const columns = [
    {
      title: "#",
      key: "index",
      width: 80,
      render: (text, record, index) => (
        <span className="text-slate-400 font-mono">{index + 1}</span>
      ),
    },
    {
      title: "Warehouse Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800 text-base">{text}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "Active" ? "cyan" : "red"}
          className="rounded-full px-4 border-none font-bold uppercase text-[10px]"
        >
          {status || "Unknown"}
        </Tag>
      ),
    },
    {
      title: "Operations",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          {/* CONFIG/EDIT BUTTON */}
          <Tooltip title="Configure Map">
            <button
              onClick={() => navigate(`config/${record.id}`)}
              className="p-2 hover:bg-[#39C6C6]/10 rounded-xl text-slate-400 hover:text-[#39C6C6] transition-all"
            >
              <MapPin size={18} />
            </button>
          </Tooltip>

          <Tooltip title="Edit Info">
            <button
              onClick={() => navigate(`edit/${record.id}`)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
            >
              <Edit3 size={18} />
            </button>
          </Tooltip>

          {/* DELETE BUTTON */}
          <Tooltip title="Remove">
            <Popconfirm
              title="Delete Warehouse"
              description="Are you sure you want to remove this warehouse?"
              onConfirm={() => handleDelete(record.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
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

  // Search Filter
  const filteredData = warehouses.filter((w) =>
    w.name?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="bg-slate-50 font-sans text-slate-900">
      <section className="md:px-16 lg:px-12 pt-7 pb-0">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8">
          <div>
            <Title level={2} className="!mb-0 !font-bold tracking-tight">
              Warehouse Network{" "}
              <Warehouse className="inline-block ml-2 text-[#39C6C6]" />
            </Title>
          </div>

          <Space size="middle" className="w-full md:w-auto">
            <Button
              icon={
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              }
              onClick={fetchWarehouses}
              className="!h-12 !px-6 !rounded-2xl !border-slate-200 !font-bold !text-slate-600 hover:!text-[#39C6C6] hover:!border-[#39C6C6]"
            >
              Sync List
            </Button>
            <Button
              type="primary"
              onClick={() => navigate("create")}
              icon={<Plus size={20} />}
              className="!h-12 !px-8 !bg-[#39C6C6] !border-none !rounded-2xl !font-bold hover:!bg-[#2eb1b1] !shadow-lg !shadow-[#39C6C6]/20 !flex !items-center"
            >
              Register Warehouse
            </Button>
          </Space>
        </div>

        {/* SEARCH FILTER */}
        <div>
          <Input
            placeholder="Search by warehouse name..."
            prefix={<Search size={20} className="text-slate-300 mr-3" />}
            className="!mb-5 !bg-white !h-12 !rounded-full !text-base !transition-all hover:!border-[#39C6C6] focus-within:!border-[#39C6C6]"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[1rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden p-6">
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 5, className: "px-6" }}
            onRow={(record) => ({
              onClick: (event) => {
                if (
                  event.target.closest("button") ||
                  event.target.closest(".ant-popover")
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

export default WarehouseManagement;
