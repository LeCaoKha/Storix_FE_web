import React, { useState, useEffect } from "react";
import api from "../../../../api/axios";
import {
  Table,
  Tag,
  Space,
  Input,
  Button,
  message,
  Typography,
  Select,
  Tooltip,
} from "antd";
import {
  Plus,
  Search,
  RefreshCw,
  ArrowLeftRight,
  Filter,
  Truck,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

const WarehouseTransferManagement = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();
  const roleId = Number(localStorage.getItem("roleId")); // 3 = Manager

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      // API này thường trả về danh sách dựa trên companyId được scope trong token
      const response = await api.get("/warehouse-transfers");
      setTransfers(response.data || []);
    } catch (error) {
      console.error("Fetch Transfers Error:", error);
      message.error("Failed to load warehouse transfer orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const columns = [
    {
      title: "Transfer ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      fixed: "left",
      render: (id) => (
        <span className="font-bold text-[#39C6C6]">
          #TRF-{String(id).padStart(4, "0")}
        </span>
      ),
    },
    {
      title: "Route",
      key: "route",
      width: 300,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <Text className="!font-bold !text-slate-700">
              {record.sourceWarehouseName ||
                `Warehouse ${record.sourceWarehouseId}`}
            </Text>
            <Text className="!text-[10px] !text-slate-400 uppercase tracking-tighter">
              Source
            </Text>
          </div>
          <ChevronRight size={16} className="text-slate-300" />
          <div className="flex flex-col">
            <Text className="!font-bold !text-[#39C6C6]">
              {record.destinationWarehouseName ||
                `Warehouse ${record.destinationWarehouseId}`}
            </Text>
            <Text className="!text-[10px] !text-slate-400 uppercase tracking-tighter">
              Destination
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let label = status;

        switch (status) {
          case "Draft":
            color = "gold";
            break;
          case "Submitted":
            color = "blue";
            break;
          case "Approved":
            color = "green";
            break;
          case "Rejected":
            color = "red";
            break;
          case "Completed":
            color = "cyan";
            break;
          default:
            color = "default";
        }

        return (
          <Tag
            color={color}
            className="!rounded-md !px-3 !py-0.5 !font-bold uppercase text-[10px]"
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: "Carrier",
      dataIndex: "carrierName",
      key: "carrier",
      render: (text) => (
        <div className="flex items-center gap-2 text-slate-600">
          <Truck size={14} className="text-slate-400" />
          <span className="font-medium">{text || "Not Assigned"}</span>
        </div>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <span className="text-slate-400 text-xs">
          {new Date(date).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      fixed: "right",
      render: () => (
        <Button
          type="text"
          icon={<MoreHorizontal size={18} />}
          className="hover:!bg-slate-100"
        />
      ),
    },
  ];

  const filteredData = transfers.filter((item) => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      item.id.toString().includes(searchLower) ||
      item.sourceWarehouseName?.toLowerCase().includes(searchLower) ||
      item.destinationWarehouseName?.toLowerCase().includes(searchLower);

    const matchesStatus =
      filterStatus === "All" || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <section className="md:px-16 lg:px-12 pt-7 pb-10">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8">
          <div>
            <Title level={2} className="!mb-0 !font-bold !tracking-tight">
              Warehouse Transfer{" "}
              <ArrowLeftRight
                className="inline-block ml-2 text-[#39C6C6]"
                size={32}
              />
            </Title>
            <Text className="text-slate-400">
              Inventory movement between facility nodes
            </Text>
          </div>

          <Space size="middle" className="w-full md:w-auto">
            <Button
              icon={
                <RefreshCw
                  size={16}
                  className={loading ? "!animate-spin" : ""}
                />
              }
              onClick={fetchTransfers}
              className="!h-12 !px-6 !rounded-2xl !border-slate-200 !font-bold !text-slate-600 hover:!text-[#39C6C6]"
            >
              Sync
            </Button>
            {roleId === 3 && (
              <Button
                type="primary"
                onClick={() => navigate("create")}
                icon={<Plus size={20} />}
                className="!h-12 !px-8 !bg-[#39C6C6] !border-none !rounded-2xl !font-bold hover:!bg-[#2eb1b1] !shadow-lg !shadow-[#39C6C6]/20 !flex !items-center"
              >
                Create Transfer
              </Button>
            )}
          </Space>
        </div>

        {/* FILTER SECTION */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by ID or Warehouse name..."
              prefix={<Search size={20} className="text-slate-300 mr-3" />}
              className="!h-12 !bg-white !rounded-full !text-base !transition-all !border-slate-300 hover:!border-[#39C6C6] focus-within:!border-[#39C6C6]"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Select
              defaultValue="All"
              className="!w-48 !h-12 !pl-5 !rounded-full !border !border-slate-300 hover:!border-[#39C6C6] transition-all"
              onChange={(value) => setFilterStatus(value)}
              suffixIcon={<Filter size={16} className="text-slate-400" />}
            >
              <Option value="All">All Status</Option>
              <Option value="Draft">Draft</Option>
              <Option value="Submitted">Submitted</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Completed">Completed</Option>
            </Select>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[1rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden p-6">
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 5, className: "px-6" }}
            scroll={{ x: 1000 }}
            className="storix-table"
            onRow={(record) => ({
              onClick: (event) => {
                // Nếu click vào vùng trắng của row thì mới navigate
                if (event.target.closest("button")) return;
                navigate(`details/${record.id}`);
              },
              className: "cursor-pointer",
            })}
          />
        </div>
      </section>
    </div>
  );
};

export default WarehouseTransferManagement;
