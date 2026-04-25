import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Spin,
  message,
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Table,
} from "antd";
import {
  ArrowLeft,
  Download,
  Calendar,
  Package,
  TrendingUp,
  TrendingDown,
  Activity,
  Box,
  Clock,
  FileText,
  Truck,
  CheckCircle,
} from "lucide-react";
import dayjs from "dayjs";
import api from "../../../../../api/axios";

const { Title, Text } = Typography;

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyId = localStorage.getItem("companyId");

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [exporting, setExporting] = useState(false);

  // ==========================================
  // 1. FETCH DATA
  // ==========================================
  const fetchReportDetail = useCallback(async () => {
    if (!companyId) {
      message.error("Company ID not found.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/Reports/${id}?companyId=${companyId}`);
      setReportData(res.data);
    } catch (error) {
      console.error("Fetch report error:", error);
      message.error("Failed to load report details.");
    } finally {
      setLoading(false);
    }
  }, [id, companyId]);

  useEffect(() => {
    fetchReportDetail();
  }, [fetchReportDetail]);

  // ==========================================
  // 2. EXPORT PDF
  // ==========================================
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const res = await api.post(
        `/Reports/${id}/export/pdf?companyId=${companyId}`,
      );
      if (res.data?.url) {
        window.open(res.data.url, "_blank");
        message.success("PDF exported successfully!");
      } else {
        message.warning("PDF is still being processed or not available.");
      }
    } catch (err) {
      console.error("Export PDF Error:", err);
      message.error("Failed to export PDF report");
    } finally {
      setExporting(false);
    }
  };

  // ==========================================
  // 3. RENDER HELPERS
  // ==========================================
  const getStatusColor = (status) => {
    switch (status) {
      case "Succeeded":
        return "green";
      case "Processing":
        return "blue";
      case "Failed":
        return "red";
      case "Pending":
        return "gold";
      default:
        return "default";
    }
  };

  const formatReportType = (type) => {
    return type?.replace(/([A-Z])/g, " $1").trim() || "Unknown Report";
  };

  if (loading || !reportData) {
    return (
      <div className="h-screen flex justify-center items-center bg-[#F8FAFC]">
        <Spin size="large" tip="Loading report details..." />
      </div>
    );
  }

  const { result, reportType } = reportData;
  const isSucceeded = reportData.status === "Succeeded";

  // ==========================================
  // 4. DYNAMIC TABLES CONFIGURATION
  // ==========================================
  const getDailyColumns = () => {
    const baseCol = {
      title: "Date",
      dataIndex: "day",
      key: "day",
      render: (text) => (
        <span className="font-bold text-slate-700">
          {dayjs(text).format("MMM DD, YYYY")}
        </span>
      ),
    };

    if (reportType === "InboundKpiBasic") {
      return [
        baseCol,
        {
          title: "Received Quantity",
          dataIndex: "receivedQty",
          key: "receivedQty",
          align: "right",
          render: (val) => (
            <span className="font-bold text-[#38c6c6]">+{val}</span>
          ),
        },
        {
          title: "Orders Completed",
          dataIndex: "count",
          key: "count",
          align: "center",
          render: (val) => (
            <Tag color="cyan" className="!rounded-md !m-0 font-bold">
              {val}
            </Tag>
          ),
        },
      ];
    }

    if (reportType === "InventoryInOutBalance") {
      return [
        baseCol,
        {
          title: "Inbound Quantity",
          dataIndex: "inboundQty",
          key: "inboundQty",
          align: "right",
          render: (val) => (
            <span className="font-bold text-[#38c6c6]">+{val}</span>
          ),
        },
        {
          title: "Outbound Quantity",
          dataIndex: "outboundQty",
          key: "outboundQty",
          align: "right",
          render: (val) => (
            <span className="font-bold text-rose-500">-{val}</span>
          ),
        },
      ];
    }

    // Default for InventoryTracking
    return [
      baseCol,
      {
        title: "Inbound Quantity",
        dataIndex: "inboundQty",
        key: "inboundQty",
        align: "right",
        render: (val) => (
          <span className="font-bold text-[#38c6c6]">+{val}</span>
        ),
      },
      {
        title: "Outbound Quantity",
        dataIndex: "outboundQty",
        key: "outboundQty",
        align: "right",
        render: (val) => (
          <span className="font-bold text-rose-500">-{val}</span>
        ),
      },
      {
        title: "Inbound Orders",
        dataIndex: "inboundCount",
        key: "inboundCount",
        align: "center",
        render: (val) => (
          <Tag color="cyan" className="!rounded-md !m-0 font-bold">
            {val}
          </Tag>
        ),
      },
      {
        title: "Outbound Orders",
        dataIndex: "outboundCount",
        key: "outboundCount",
        align: "center",
        render: (val) => (
          <Tag color="volcano" className="!rounded-md !m-0 font-bold">
            {val}
          </Tag>
        ),
      },
    ];
  };

  const getSecondaryColumns = () => {
    if (reportType === "InboundKpiBasic") {
      return [
        {
          title: "Supplier Name",
          dataIndex: "supplierName",
          key: "supplierName",
          render: (text) => (
            <span className="font-bold text-slate-800">{text}</span>
          ),
        },
        {
          title: "Received Quantity",
          dataIndex: "receivedQty",
          key: "receivedQty",
          align: "right",
          render: (val) => (
            <span className="font-bold text-[#38c6c6]">+{val}</span>
          ),
        },
        {
          title: "Completed Orders",
          dataIndex: "completedCount",
          key: "completedCount",
          align: "center",
          render: (val) => (
            <span className="font-black text-slate-700">{val}</span>
          ),
        },
      ];
    }

    const baseProductCols = [
      {
        title: "Product Name",
        dataIndex: "productName",
        key: "productName",
        render: (text, record) => (
          <div className="flex flex-col">
            <Text className="font-bold text-slate-800 line-clamp-2">
              {text}
            </Text>
            <Text className="text-[10px] text-slate-400 font-mono tracking-tight">
              {record.sku}
            </Text>
          </div>
        ),
      },
    ];

    if (reportType === "InventoryInOutBalance") {
      return [
        ...baseProductCols,
        {
          title: "Opening Quantity",
          dataIndex: "openingQty",
          key: "openingQty",
          align: "right",
          render: (val) => (
            <span className="font-bold text-slate-500">{val}</span>
          ),
        },
        {
          title: "Inbound Quantity",
          dataIndex: "inboundQty",
          key: "inboundQty",
          align: "right",
          render: (val) => (
            <span className="font-bold text-[#38c6c6]">+{val}</span>
          ),
        },
        {
          title: "Outbound Quantity",
          dataIndex: "outboundQty",
          key: "outboundQty",
          align: "right",
          render: (val) => (
            <span className="font-bold text-rose-500">-{val}</span>
          ),
        },
        {
          title: "Closing Quantity",
          dataIndex: "closingQty",
          key: "closingQty",
          align: "right",
          render: (val) => (
            <span className="font-black text-slate-700">{val}</span>
          ),
        },
      ];
    }

    // Default for InventoryTracking
    return [
      ...baseProductCols,
      {
        title: "Inbound Quantity",
        dataIndex: "inboundQty",
        key: "inboundQty",
        align: "right",
        render: (val) => (
          <span className="font-bold text-[#38c6c6]">+{val}</span>
        ),
      },
      {
        title: "Outbound Quantity",
        dataIndex: "outboundQty",
        key: "outboundQty",
        align: "right",
        render: (val) => (
          <span className="font-bold text-rose-500">-{val}</span>
        ),
      },
      {
        title: "Net Change",
        dataIndex: "netChange",
        key: "netChange",
        align: "center",
        render: (val) => (
          <Tag
            color={val > 0 ? "green" : val < 0 ? "red" : "default"}
            className="!rounded-md !font-bold !m-0"
          >
            {val > 0 ? `+${val}` : val}
          </Tag>
        ),
      },
      {
        title: "Current Stock",
        dataIndex: "currentStock",
        key: "currentStock",
        align: "right",
        render: (val) => (
          <span className="font-black text-slate-700">{val}</span>
        ),
      },
    ];
  };

  const getSecondaryData = () => {
    if (reportType === "InboundKpiBasic") return result?.data?.bySupplier || [];
    if (reportType === "InventoryInOutBalance")
      return result?.data?.byProduct || [];
    return result?.data?.topProducts || [];
  };

  const getSecondaryTitle = () => {
    if (reportType === "InboundKpiBasic") return "Supplier Performance";
    if (reportType === "InventoryInOutBalance")
      return "Inventory Balance by Product";
    return "Top Products Movement";
  };

  const getSecondaryIcon = () => {
    if (reportType === "InboundKpiBasic")
      return <Truck size={16} className="text-[#38c6c6]" />;
    return <Package size={16} className="text-[#38c6c6]" />;
  };

  // ==========================================
  // 5. DYNAMIC SUMMARY CARDS
  // ==========================================
  const renderSummaryCards = () => {
    if (reportType === "InboundKpiBasic") {
      return (
        <Row gutter={24}>
          <Col span={12}>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100 !bg-gradient-to-br from-white to-cyan-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-100/50 flex items-center justify-center text-[#38c6c6]">
                  <TrendingUp size={24} />
                </div>
                <div className="flex flex-col">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    Total Received Quantity
                  </Text>
                  <Text className="font-black text-2xl text-slate-800">
                    +{result.summary?.totalReceivedQty || 0}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100 !bg-gradient-to-br from-white to-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <CheckCircle size={24} />
                </div>
                <div className="flex flex-col">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    Total Completed Orders
                  </Text>
                  <Text className="font-black text-2xl text-slate-800">
                    {result.summary?.totalCompleted || 0}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      );
    }

    return (
      <Row gutter={24}>
        <Col span={6}>
          <Card className="!rounded-2xl !shadow-sm !border-slate-100 !bg-gradient-to-br from-white to-cyan-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-100/50 flex items-center justify-center text-[#38c6c6]">
                <TrendingUp size={24} />
              </div>
              <div className="flex flex-col">
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  Total Inbound Quantity
                </Text>
                <Text className="font-black text-2xl text-slate-800">
                  +{result.summary?.totalInboundQty || 0}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="!rounded-2xl !shadow-sm !border-slate-100 !bg-gradient-to-br from-white to-rose-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100/50 flex items-center justify-center text-rose-500">
                <TrendingDown size={24} />
              </div>
              <div className="flex flex-col">
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  Total Outbound Quantity
                </Text>
                <Text className="font-black text-2xl text-slate-800">
                  -{result.summary?.totalOutboundQty || 0}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {reportType === "InventoryInOutBalance" ? (
          <>
            <Col span={6}>
              <Card className="!rounded-2xl !shadow-sm !border-slate-100">
                <div className="flex flex-col">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    Total Opening Quantity
                  </Text>
                  <Text className="font-black text-2xl text-slate-800">
                    {result.summary?.totalOpeningQty || 0}
                  </Text>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className="!rounded-2xl !shadow-sm !border-slate-100">
                <div className="flex flex-col">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    Total Closing Quantity
                  </Text>
                  <Text className="font-black text-2xl text-slate-800">
                    {result.summary?.totalClosingQty || 0}
                  </Text>
                </div>
              </Card>
            </Col>
          </>
        ) : (
          <>
            <Col span={6}>
              <Card className="!rounded-2xl !shadow-sm !border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <Package size={24} />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                      Inbound Transactions
                    </Text>
                    <Text className="font-black text-2xl text-slate-800">
                      {result.summary?.totalInboundTransactions || 0}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className="!rounded-2xl !shadow-sm !border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <Package size={24} />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                      Outbound Transactions
                    </Text>
                    <Text className="font-black text-2xl text-slate-800">
                      {result.summary?.totalOutboundTransactions || 0}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          </>
        )}
      </Row>
    );
  };

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeft size={24} />}
            onClick={() => navigate(-1)}
            className="!flex !items-center !justify-center !h-12 !w-12 !rounded-full hover:!bg-white hover:!shadow-md transition-all text-slate-600"
          />
          <div>
            <div className="flex items-center gap-3">
              <Title
                level={2}
                className="!mb-0 !font-extrabold !tracking-tight !text-slate-800"
              >
                Report #{reportData.id}
              </Title>
              <Tag
                color={getStatusColor(reportData.status)}
                className="!rounded-full !px-3 !py-0.5 !font-bold !uppercase !border-none"
              >
                {reportData.status}
              </Tag>
            </div>
            <Text className="text-slate-400 font-medium">
              {formatReportType(reportType)} details and analytics
            </Text>
          </div>
        </div>

        <Space size="middle">
          <Button
            type="primary"
            icon={<Download size={18} />}
            onClick={handleExportPDF}
            loading={exporting}
            disabled={!isSucceeded}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-white !bg-[#39c6c6] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20 hover:!bg-[#2eb1b1]"
          >
            Export PDF
          </Button>
        </Space>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* META INFO ROW */}
        <Row gutter={24}>
          <Col span={24}>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                    <FileText size={12} /> Report Type
                  </Text>
                  <Text className="font-bold text-slate-700 text-base">
                    {formatReportType(reportType)}
                  </Text>
                </div>
                <div className="flex flex-col">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                    <Box size={12} /> Warehouse
                  </Text>
                  <Text className="font-bold text-slate-700 text-base">
                    {reportData.warehouseId
                      ? `Warehouse #${reportData.warehouseId}`
                      : "All Warehouses"}
                  </Text>
                </div>
                <div className="flex flex-col">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                    <Calendar size={12} /> Date Range
                  </Text>
                  <Text className="font-bold text-slate-700 text-base">
                    {dayjs(reportData.timeFrom).format("DD/MM/YYYY")} -{" "}
                    {dayjs(reportData.timeTo).format("DD/MM/YYYY")}
                  </Text>
                </div>
                <div className="flex flex-col">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                    <Clock size={12} /> Generated At
                  </Text>
                  <Text className="font-bold text-slate-700 text-base">
                    {dayjs(
                      reportData.completedAt || reportData.createdAt,
                    ).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {isSucceeded && result ? (
          <>
            {/* RENDER DYNAMIC SUMMARY CARDS */}
            {renderSummaryCards()}

            {/* DAILY TRENDS */}
            {result.data?.byDay && result.data.byDay.length > 0 && (
              <Row gutter={24}>
                <Col span={24}>
                  <Card
                    title={
                      <Space className="!text-slate-700 !uppercase !text-xs !tracking-wider !font-bold !py-2">
                        <Activity size={16} className="text-[#38c6c6]" /> Daily
                        Activity Trends
                      </Space>
                    }
                    className="!rounded-2xl !shadow-sm !border-slate-100"
                  >
                    <Table
                      columns={getDailyColumns()}
                      dataSource={result.data.byDay}
                      rowKey="day"
                      pagination={false}
                      className="custom-details-table"
                    />
                  </Card>
                </Col>
              </Row>
            )}

            {/* SECONDARY TABLE (PRODUCTS OR SUPPLIERS) */}
            <Row gutter={24}>
              <Col span={24}>
                <Card
                  title={
                    <Space className="!text-slate-700 !uppercase !text-xs !tracking-wider !font-bold !py-2">
                      {getSecondaryIcon()} {getSecondaryTitle()}
                    </Space>
                  }
                  className="!rounded-2xl !shadow-sm !border-slate-100"
                >
                  <Table
                    columns={getSecondaryColumns()}
                    dataSource={getSecondaryData()}
                    rowKey={(record) =>
                      record.productId || record.supplierId || Math.random()
                    }
                    pagination={{ pageSize: 5 }}
                    className="custom-details-table"
                  />
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <Card className="!rounded-2xl !shadow-sm !border-slate-100">
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <FileText size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-500">
                Report data is unavailable or failed to process.
              </p>
              {reportData.errorMessage && (
                <p className="text-rose-500 mt-2 text-sm bg-rose-50 px-4 py-2 rounded-lg">
                  Error: {reportData.errorMessage}
                </p>
              )}
            </div>
          </Card>
        )}
      </div>

      <style jsx global>{`
        .custom-details-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #94a3b8 !important;
          font-size: 10px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          padding: 12px 16px !important;
        }
      `}</style>
    </div>
  );
};

export default ReportDetail;
