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
} from "antd";
import { Plus, Search, RefreshCw, ArrowDownCircle, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

const InboundManagement = () => {
  const [inboundRequests, setInboundRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();

  // Lấy companyId từ localStorage
  const companyId = localStorage.getItem("companyId");

  const fetchInboundRequests = async () => {
    if (!companyId) {
      message.error("Company ID not found in storage");
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/InventoryInbound/requests/${companyId}`);
      setInboundRequests(response.data);
    } catch (error) {
      message.error("Failed to fetch inbound requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInboundRequests();
  }, []);

  // Format tiền tệ VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 130,
      fixed: "left",
      render: (record) => <span className="font-medium">{record}</span>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => {
        const d = new Date(date);
        const datePart = d.toLocaleDateString("vi-VN"); // Lấy 05/02/2026
        const timePart = d.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }); // Lấy 11:56

        return (
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-medium">{`${datePart} ${timePart}`}</span>
          </div>
        );
      },
    },
    {
      title: "Warehouse",
      dataIndex: ["warehouse", "name"],
      key: "warehouseName",
      render: (text) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">{text}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "gold";
        if (status === "Approved") color = "green";
        if (status === "Rejected") color = "red";
        return (
          <Tag
            color={color}
            className="!rounded-md !px-3 !py-0.5 !font-bold uppercase text-[10px]"
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Supplier",
      dataIndex: ["supplier", "name"],
      key: "supplierName",
      render: (text) => (
        <div className="flex items-center gap-2 text-slate-600">
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Requested By",
      dataIndex: ["requestedByUser", "fullName"],
      key: "requestedBy",
      render: (text) => (
        <div className="flex items-center gap-2 text-slate-600">
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record) => {
        // Cộng tất cả expectedQuantity lại
        const totalAmount = record.inboundOrderItems?.reduce(
          (sum, item) => sum + (item.expectedQuantity || 0),
          0,
        );
        return (
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <span>{totalAmount}</span>
          </div>
        );
      },
    },
    {
      title: "Price",
      dataIndex: "finalPrice",
      key: "price",
      render: (price) => (
        <div className="flex items-center gap-1 text-[#39C6C6] font-black">
          <span>{formatCurrency(price)}</span>
        </div>
      ),
    },
  ];

  const filteredData = inboundRequests.filter((item) => {
    const matchesSearch =
      item.warehouse?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.supplier?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.requestedByUser?.fullName
        ?.toLowerCase()
        .includes(searchText.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="md:px-16 lg:px-12 pt-7 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8">
          <div>
            <Title level={2} className="!mb-0 !font-bold !tracking-tight">
              Inbound Management{" "}
              <ArrowDownCircle className="inline-block ml-2 text-[#39C6C6]" />
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
              onClick={fetchInboundRequests}
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
              Create Request
            </Button>
          </Space>
        </div>

        {/* --- FILTER SECTION --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by warehouse, supplier or requester..."
              prefix={<Search size={20} className="text-slate-300 mr-3" />}
              className="!h-12 !bg-white !rounded-full !text-base !transition-all !border-slate-300 hover:!border-[#39C6C6] focus-within:!border-[#39C6C6]"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Select
              defaultValue="All"
              className="!w-48 !h-12 !pl-5 !rounded-full !border !border-slate-300 hover:!border-[#39C6C6] focus-within:!border-[#39C6C6] overflow-hidden transition-all"
              onChange={(value) => setFilterStatus(value)}
              suffixIcon={<Filter size={16} className="text-slate-400" />}
            >
              <Option value="All">All Status</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-[1rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden p-6">
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 4, className: "px-6" }}
            scroll={{ x: 1100 }}
            className="storix-table"
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

export default InboundManagement;
