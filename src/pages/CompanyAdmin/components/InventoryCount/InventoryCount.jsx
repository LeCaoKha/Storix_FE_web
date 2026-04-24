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
  ClipboardCheck,
  Filter,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

const InventoryCount = () => {
  const [countTickets, setCountTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();

  // Lấy IDs từ localStorage
  const companyId = localStorage.getItem("companyId");
  const warehouseId = localStorage.getItem("warehouseId");

  const fetchCountTickets = async () => {
    if (!companyId || !warehouseId) {
      message.error("Identification data missing in storage");
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(
        `/InventoryCount/get-tickets-with/${companyId}/warehouse/${warehouseId}`,
      );
      setCountTickets(response.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch inventory count tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountTickets();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Not executed yet";
    const d = new Date(dateString);
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const columns = [
    {
      title: "Ticket ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      fixed: "left",
      render: (id) => (
        <span className="font-bold text-[#39C6C6]">
          #{String(id).padStart(3, "0")}
        </span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <span className="text-slate-600 font-medium">{formatDate(date)}</span>
      ),
    },
    {
      title: "Scope",
      dataIndex: "scopeType",
      key: "scopeType",
      render: (type) => (
        <Tag className="!border-none !bg-slate-100 !text-slate-600 !font-semibold">
          {type}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const isCompleted = !!record.executedDay;
        return (
          <Tag
            color={isCompleted ? "green" : "gold"}
            icon={
              isCompleted ? (
                <CheckCircle2 size={12} className="inline mr-1" />
              ) : (
                <RefreshCw size={12} className="inline mr-1" />
              )
            }
            className="!rounded-md !px-3 !py-0.5 !font-bold uppercase text-[10px]"
          >
            {isCompleted ? "Completed" : "Pending"}
          </Tag>
        );
      },
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      align: "center",
      render: (items) => (
        <Tooltip title={items.map((i) => i.productName).join(", ")}>
          <span className="font-bold text-slate-700">
            {items?.length || 0} SKU
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Discrepancy",
      key: "discrepancy",
      render: (_, record) => {
        const hasDiscrepancy = record.items?.some(
          (i) => i.discrepancy !== 0 && i.discrepancy !== null,
        );
        return hasDiscrepancy ? (
          <div className="flex items-center gap-1 text-rose-500 font-bold">
            <AlertCircle size={14} /> <span>Detected</span>
          </div>
        ) : (
          <span className="text-slate-400">Clear</span>
        );
      },
    },
    {
      title: "Executed Day",
      dataIndex: "executedDay",
      key: "executedDay",
      render: (date) => (
        <span className="text-slate-400 text-xs italic">
          {date ? formatDate(date) : "---"}
        </span>
      ),
    },
  ];

  const filteredData = countTickets.filter((item) => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      item.id.toString().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.scopeType?.toLowerCase().includes(searchLower);

    const isCompleted = !!item.executedDay;
    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Completed" && isCompleted) ||
      (filterStatus === "Pending" && !isCompleted);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <section className="md:px-16 lg:px-12 pt-7 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8">
          <div>
            <Title level={2} className="!mb-0 !font-bold !tracking-tight">
              Inventory Counting{" "}
              <ClipboardCheck className="inline-block ml-2 text-[#39C6C6]" />
            </Title>
            <Text className="text-slate-400">
              Monitor and manage warehouse stock verification sessions
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
              onClick={fetchCountTickets}
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
              Start New Count
            </Button>
          </Space>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by Ticket ID, description or scope..."
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
              <Option value="Pending">Pending</Option>
              <Option value="Completed">Completed</Option>
            </Select>
          </div>
        </div>

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
                if (event.target.closest("button")) return;
                navigate(`details/${record.id}`);
              },
            })}
          />
        </div>
      </section>
    </div>
  );
};

export default InventoryCount;
