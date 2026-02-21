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

const InboundTicketManagement = () => {
  const [inboundTickets, setInboundTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();
  const companyId = localStorage.getItem("companyId");

  const fetchInboundTickets = async () => {
    if (!companyId) {
      message.error("Company ID not found in storage");
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/InventoryInbound/tickets/${companyId}`);
      setInboundTickets(response.data);
    } catch (error) {
      message.error("Failed to fetch inbound tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInboundTickets();
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
      title: "Ticket Code",
      dataIndex: "referenceCode",
      key: "referenceCode",
      fixed: "left",
      // whitespace-nowrap giúp cột này tự giãn theo mã code mà không bị xuống dòng
      className: "whitespace-nowrap font-bold text-[#39C6C6]",
      render: (text) => text || "N/A",
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
        <span className="font-bold text-slate-800">{text}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      className: "whitespace-nowrap", // Đảm bảo cột Status không bị bóp méo
      render: (status) => {
        let color = "blue";
        if (status === "Created") color = "cyan";
        if (status === "Completed") color = "green";
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
      title: "Supplier",
      dataIndex: ["supplier", "name"],
      key: "supplierName",
      className: "whitespace-nowrap",
    },
    {
      title: "Created By",
      dataIndex: ["createdByUser", "fullName"],
      key: "createdBy",
      className: "whitespace-nowrap",
      render: (text) => (
        <Text className="font-medium text-slate-600">{text}</Text>
      ),
    },
    {
      title: "Items",
      key: "itemsCount",
      align: "center",
      className: "whitespace-nowrap",
      render: (_, record) => (
        <span className="font-bold text-slate-700">
          {record.inboundOrderItems?.reduce(
            (sum, item) => sum + (item.expectedQuantity || 0),
            0,
          )}
        </span>
      ),
    },
    {
      title: "Final Price",
      dataIndex: "finalPrice",
      key: "finalPrice",
      className: "whitespace-nowrap",
      render: (price) => (
        <span className="text-[#39C6C6] font-black">
          {formatCurrency(price)}
        </span>
      ),
    },
  ];

  const filteredData = inboundTickets.filter((item) => {
    const matchesSearch =
      item.referenceCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.warehouse?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.supplier?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.createdByUser?.fullName
        ?.toLowerCase()
        .includes(searchText.toLowerCase());

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
              Inbound Ticket Management{" "}
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
              onClick={fetchInboundTickets}
              className="!h-12 !px-6 !rounded-2xl !font-bold !text-slate-600 hover:!text-[#39C6C6]"
            >
              Sync Data
            </Button>
          </Space>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search by code, warehouse, supplier..."
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
            <Option value="Completed">Completed</Option>
          </Select>
        </div>

        <div className="bg-white rounded-[1rem] shadow-2xl shadow-slate-200/60 overflow-hidden p-6">
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            // Giải pháp cốt lõi: dùng max-content để các cột tự giãn theo nội dung
            scroll={{ x: "max-content" }}
            className="inbound-custom-table"
            onRow={(record) => ({
              onClick: () => navigate(`details/${record.id}`),
            })}
          />
        </div>
      </section>

      <style jsx global>{`
        .inbound-custom-table .ant-table-tbody > tr {
          cursor: pointer;
        }
        /* Giữ cho header không bị xuống dòng và căn giữa nội dung */
        .inbound-custom-table .ant-table-thead > tr > th {
          background: #f4f7fa !important;
          font-weight: 1000 !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          letter-spacing: 0.05em !important;
          padding: 16px !important;
          white-space: nowrap !important;
        }
        .ant-pagination-item-active {
          border-color: #39c6c6 !important;
        }
        .ant-pagination-item-active a {
          color: #39c6c6 !important;
        }
      `}</style>
    </div>
  );
};

export default InboundTicketManagement;
