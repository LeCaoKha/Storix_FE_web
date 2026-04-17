import React, { useEffect, useState } from "react";
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
} from "antd";
import { Search, RefreshCw, FileText, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

const OutboundTicketManagement = () => {
  const [outboundTickets, setOutboundTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();
  const warehouseId = localStorage.getItem("warehouseId");

  const fetchOutboundTickets = async () => {
    if (!warehouseId) {
      message.error("Warehouse ID not found in storage");
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(
        `/InventoryOutbound/tickets/by-warehouse/${warehouseId}`,
      );
      setOutboundTickets(response.data);
    } catch (error) {
      console.error("Fetch Outbound Tickets Error:", error);
      message.error("Failed to fetch outbound tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutboundTickets();
  }, []);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "---";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const columns = [
    {
      title: "Ticket ID",
      dataIndex: "id",
      key: "id",
      fixed: "left",
      className: "whitespace-nowrap font-bold text-[#39C6C6]",
      render: (id) => `OUT-${id}`,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      className: "whitespace-nowrap",
      render: (date) => {
        const d = new Date(date);
        return (
          <div className="text-slate-600 font-medium">
            {d.toLocaleDateString("vi-VN")}{" "}
            {d.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        );
      },
    },
    {
      title: "Warehouse",
      dataIndex: ["warehouse", "name"],
      key: "warehouseName",
      className: "whitespace-nowrap",
      render: (text) => (
        <span className="font-bold text-slate-800">{text || "N/A"}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      className: "whitespace-nowrap",
      render: (status) => {
        let color = "blue";
        if (status === "Created") color = "cyan";
        if (status === "Completed") color = "green";
        if (status === "Packing") color = "orange";
        if (status === "Picking") color = "purple";

        return (
          <Tag
            color={color}
            className="!rounded-md !px-3 !py-0.5 !font-bold uppercase text-[10px] !m-0"
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Destination",
      dataIndex: "destination",
      key: "destination",
      className: "whitespace-nowrap",
      render: (text) => text || "N/A",
    },
    {
      title: "Created By",
      dataIndex: ["createdByUser", "fullName"],
      key: "createdBy",
      className: "whitespace-nowrap",
      render: (text) => (
        <Text className="font-medium text-slate-600">{text || "N/A"}</Text>
      ),
    },
    {
      title: "Items Count",
      key: "itemsCount",
      align: "center",
      className: "whitespace-nowrap",
      render: (_, record) => (
        <span className="font-bold text-slate-700">
          {record.items?.reduce(
            (sum, item) => sum + (item.quantity || item.expectedQuantity || 0),
            0,
          ) || 0}
        </span>
      ),
    },
    {
      title: "Est. Total Value",
      key: "totalValue",
      className: "whitespace-nowrap",
      render: (_, record) => {
        const total = record.items?.reduce(
          (sum, item) =>
            sum + item.price * (item.quantity || item.expectedQuantity || 0),
          0,
        );
        return (
          <span className="text-[#39C6C6] font-black">
            {formatCurrency(total)}
          </span>
        );
      },
    },
  ];

  const filteredData = outboundTickets.filter((item) => {
    const searchLower = searchText.toLowerCase();

    // Tìm theo ID (ví dụ gõ "out-4" hoặc "4")
    const matchesId =
      item.id?.toString().includes(searchLower) ||
      `out-${item.id}`.includes(searchLower);

    const matchesSearch =
      matchesId ||
      item.warehouse?.name?.toLowerCase().includes(searchLower) ||
      item.destination?.toLowerCase().includes(searchLower) ||
      item.createdByUser?.fullName?.toLowerCase().includes(searchLower);

    const matchesStatus =
      filterStatus === "All" || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <section className="md:px-16 lg:px-12 pt-7 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8">
          <div>
            <Title level={2} className="!mb-0 !font-bold !tracking-tight">
              Outbound Ticket Management{" "}
              <FileText className="inline-block ml-2 text-[#39C6C6]" />
            </Title>
          </div>

          <Space size="middle">
            <Button
              icon={
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              }
              onClick={fetchOutboundTickets}
              className="!h-12 !px-6 !rounded-2xl !font-bold !text-slate-600 hover:!text-[#39C6C6]"
            >
              Sync Data
            </Button>
          </Space>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search by ID, warehouse, destination..."
            prefix={<Search size={20} className="text-slate-300 mr-3" />}
            className="!h-12 !bg-white !rounded-full !border-slate-300 hover:!border-[#39C6C6]"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            defaultValue="All"
            className="!w-48 !h-12 !pl-5 !rounded-full !border !border-slate-300 hover:!border-[#39C6C6] focus-within:!border-[#39C6C6] overflow-hidden transition-all"
            onChange={(value) => setFilterStatus(value)}
            suffixIcon={<Filter size={16} />}
          >
            <Option value="All">All Status</Option>
            <Option value="Created">Created</Option>
            <Option value="Picking">Picking</Option>
            <Option value="Packing">Packing</Option>
            <Option value="Completed">Completed</Option>
          </Select>
        </div>

        <div className="bg-white rounded-[1rem] shadow-2xl shadow-slate-200/60 overflow-hidden p-6">
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
            className="storix-table"
            onRow={(record) => ({
              onClick: () => navigate(`details/${record.id}`),
              className: "cursor-pointer hover:bg-slate-50 transition-colors",
            })}
          />
        </div>
      </section>
    </div>
  );
};

export default OutboundTicketManagement;
