import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Typography,
  Button,
  Space,
  Skeleton,
  message,
  Divider,
  Empty,
} from "antd";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  PackageSearch,
} from "lucide-react";
import api from "../../../../../../api/axios";

const { Title, Text } = Typography;

const InventoryCountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyId = localStorage.getItem("companyId");

  const [loading, setLoading] = useState(true);
  const [ticketData, setTicketData] = useState(null);

  const fetchTicketDetails = async () => {
    if (!companyId || !id) return;
    setLoading(true);
    try {
      const res = await api.get(`/InventoryCount/tickets/${companyId}/${id}`);
      setTicketData(res.data);
    } catch (error) {
      console.error("Fetch Details Error:", error);
      message.error("Failed to load inventory count details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id, companyId]);

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      render: (text) => (
        <Text className="!font-bold !text-slate-700">{text}</Text>
      ),
    },
    {
      title: "System Qty",
      dataIndex: "systemQuantity",
      key: "systemQuantity",
      align: "center",
      render: (val) => (
        <span className="font-mono font-bold text-slate-500">{val}</span>
      ),
    },
    {
      title: "Counted Qty",
      dataIndex: "countedQuantity",
      key: "countedQuantity",
      align: "center",
      render: (val) => (
        <span
          className={`font-mono font-bold ${val === null ? "text-slate-300 italic" : "text-[#39c6c6]"}`}
        >
          {val !== null ? val : "Not counted"}
        </span>
      ),
    },
    {
      title: "Discrepancy",
      dataIndex: "discrepancy",
      key: "discrepancy",
      align: "right",
      render: (val) => {
        if (val === null) return <span className="text-slate-300">---</span>;
        const color = val === 0 ? "text-emerald-500" : "text-rose-500";
        return (
          <span className={`font-mono font-black ${color}`}>
            {val > 0 ? `+${val}` : val}
          </span>
        );
      },
    },
  ];

  if (loading)
    return (
      <div className="p-12">
        <Skeleton active avatar paragraph={{ rows: 10 }} />
      </div>
    );

  if (!ticketData)
    return <Empty className="mt-20" description="Ticket not found" />;

  const isCompleted = !!ticketData.executedDay;

  return (
    <div className="!bg-slate-50 !min-h-screen !pb-20">
      {/* HEADER */}
      <div className="!bg-slate-50 !px-12 !py-6 !sticky !top-0 !z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeft size={20} />}
              onClick={() => navigate(-1)}
              className="hover:!bg-slate-100 !rounded-full !w-10 !h-10 !flex !items-center !justify-center"
            />
            <div>
              <div className="flex items-center gap-3">
                <Title level={3} className="!m-0 !font-black !tracking-tight">
                  Count Ticket #{String(ticketData.id).padStart(3, "0")}
                </Title>
                <Tag
                  color={isCompleted ? "green" : "gold"}
                  className="!rounded-full !px-4 !py-0.5 !font-bold !border-none"
                >
                  {isCompleted ? "COMPLETED" : "PENDING"}
                </Tag>
              </div>
              <Text className="!text-slate-400 !text-sm">
                Created on {formatDate(ticketData.createdAt)}
              </Text>
            </div>
          </div>

          <Space>
            <Button
              icon={<Calendar size={16} />}
              className="!h-10 !rounded-xl !font-bold"
              disabled={!isCompleted}
            >
              Export Report
            </Button>
            {!isCompleted && (
              <Button
                type="primary"
                className="!h-10 !bg-[#39c6c6] !border-none !rounded-xl !font-bold !px-6"
                onClick={() =>
                  message.info("Counting process feature coming soon")
                }
              >
                Execute Count
              </Button>
            )}
          </Space>
        </div>
      </div>

      <div className="!px-12 !mt-8 flex gap-6">
        {/* LEFT COLUMN: ITEMS TABLE */}
        <div className="flex-[2] space-y-6">
          <Card className="!rounded-3xl !shadow-sm !border-none">
            <div className="flex items-center gap-2 mb-6">
              <PackageSearch className="text-[#39c6c6]" size={20} />
              <h3 className="!text-lg !font-bold !text-slate-800 !m-0">
                Products List
              </h3>
            </div>
            <Table
              columns={columns}
              dataSource={ticketData.items}
              rowKey="productId"
              pagination={false}
              className="storix-table"
            />
          </Card>
        </div>

        {/* RIGHT COLUMN: SIDEBAR INFO */}
        <div className="flex-1 space-y-6">
          {/* General Info */}
          <div>
            <Card
              title="Session Details"
              className="!rounded-3xl !shadow-sm !border-none custom-card-header"
            >
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Text className="text-slate-400">Scope Type</Text>
                  <Tag color="blue" className="!m-0 !font-bold">
                    {ticketData.scopeType}
                  </Tag>
                </div>
                <div className="flex justify-between">
                  <Text className="text-slate-400">Staff Assigned</Text>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <Text className="font-bold">
                      ID: {ticketData.assignedTo}
                    </Text>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Text className="text-slate-400">Warehouse ID</Text>
                  <Text className="font-bold">{ticketData.warehouseId}</Text>
                </div>
                <Divider className="!my-2" />
                <div>
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <FileText size={14} />
                    <Text className="!text-xs !font-bold !uppercase !tracking-widest">
                      Description
                    </Text>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <Text className="text-slate-600 italic">
                      {ticketData.description || "No description provided."}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Statistics Card (Optional but cool) */}
          <div>
            <Card className="!rounded-3xl !shadow-sm !border-none !bg-[#39c6c6]">
              <div className="flex flex-col items-center py-2">
                <ClipboardCheck
                  size={32}
                  className="text-white opacity-80 mb-2"
                />
                <Title level={2} className="!text-white !m-0">
                  {ticketData.items?.length || 0}
                </Title>
                <Text className="text-white/80 font-medium uppercase tracking-widest text-[10px]">
                  Total SKUs to Count
                </Text>
              </div>
            </Card>
          </div>

          {isCompleted && (
            <div>
              <Card className="!rounded-3xl !shadow-sm !border-none !bg-emerald-50 !border-emerald-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" size={24} />
                  <div>
                    <div className="text-emerald-700 font-bold">
                      Execution Finished
                    </div>
                    <div className="text-emerald-600 text-xs">
                      {formatDate(ticketData.executedDay)}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      <style jsx="true">{`
        .custom-card-header .ant-card-head {
          border-bottom: none !important;
          padding-top: 24px;
        }
        .custom-card-header .ant-card-head-title {
          font-weight: 800 !important;
          color: #1e293b !important;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default InventoryCountDetails;
