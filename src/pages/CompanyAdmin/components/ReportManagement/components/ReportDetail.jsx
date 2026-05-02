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
  Modal,
  InputNumber,
} from "antd";
import {
  ArrowLeft,
  Download,
  Calendar,
  Package,
  Activity,
  Box,
  Clock,
  FileText,
  List,
  Scale,
  Camera,
  Sparkles,
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

  // States for Storage Forecast
  const [isForecastModalVisible, setIsForecastModalVisible] = useState(false);
  const [forecastDays, setForecastDays] = useState(7);
  const [isForecasting, setIsForecasting] = useState(false);

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
  // 3. STORAGE FORECAST
  // ==========================================
  const handleStorageForecast = async () => {
    if (!forecastDays || forecastDays <= 0) {
      message.warning("Please enter a valid number of forecast days");
      return;
    }

    setIsForecasting(true);

    try {
      const productIds =
        reportData.result?.data?.items?.map((item) => item.productId) || [];

      const payload = {
        productIds: productIds.map(Number),
        dateFrom: reportData.timeFrom,
        dateTo: reportData.timeTo,
        warehouseId: Number(reportData.warehouseId),
        forecastDays: Number(forecastDays),
        reportId: Number(reportData.id),
        companyId: Number(companyId),
      };

      await api.post("http://localhost:5678/webhook/storage-forecast", payload);

      message.success("Forecast request sent successfully!");
      setIsForecastModalVisible(false);
    } catch (error) {
      console.error("Forecast Error:", error);
      message.error("Failed to send forecast request. Please try again later.");
    } finally {
      setIsForecasting(false);
    }
  };

  // ==========================================
  // 4. RENDER HELPERS
  // ==========================================
  const getStatusColor = (status) => {
    switch (status) {
      case "Succeeded":
        return "green";
      case "Processing":
      case "Running":
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
    const types = {
      InventorySnapshot: "Inventory Snapshot",
      InventoryLedger: "Inventory Ledger",
      InventoryInOutBalance: "Inventory In/Out Balance",
      InventoryTracking: "Inventory Tracking (Stocktake)",
    };
    return types[type] || type?.replace(/([A-Z])/g, " $1").trim();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
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
  // 5. DYNAMIC TABLES CONFIGURATION
  // ==========================================
  const getTableColumns = () => {
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

    switch (reportType) {
      case "InventoryLedger":
        return [
          {
            title: "Date & Time",
            dataIndex: "day",
            key: "day",
            render: (text) => (
              <span className="font-bold text-slate-700">
                {dayjs(text).format("DD/MM/YYYY HH:mm")}
              </span>
            ),
          },
          {
            title: "Transaction Type",
            dataIndex: "transactionType",
            key: "transactionType",
            render: (val) => (
              <Tag color="blue" className="!rounded-md !m-0 !font-bold">
                {val}
              </Tag>
            ),
          },
          ...baseProductCols,
          {
            title: "In (+)",
            dataIndex: "quantityIn",
            key: "quantityIn",
            align: "right",
            render: (val) =>
              val > 0 ? (
                <span className="font-bold text-emerald-500">+{val}</span>
              ) : (
                <span className="text-slate-300">-</span>
              ),
          },
          {
            title: "Out (-)",
            dataIndex: "quantityOut",
            key: "quantityOut",
            align: "right",
            render: (val) =>
              val > 0 ? (
                <span className="font-bold text-rose-500">-{val}</span>
              ) : (
                <span className="text-slate-300">-</span>
              ),
          },
          {
            title: "Running Balance",
            dataIndex: "runningQuantity",
            key: "runningQuantity",
            align: "right",
            render: (val) => (
              <span className="font-black text-slate-700">{val}</span>
            ),
          },
        ];

      case "InventoryInOutBalance":
        return [
          ...baseProductCols,
          {
            title: "Opening Qty",
            dataIndex: "openingQty",
            key: "openingQty",
            align: "right",
            render: (val) => (
              <span className="font-bold text-slate-500">{val || 0}</span>
            ),
          },
          {
            title: "Inbound",
            dataIndex: "inboundQty",
            key: "inboundQty",
            align: "right",
            render: (val) => (
              <span className="font-bold text-emerald-500">+{val || 0}</span>
            ),
          },
          {
            title: "Outbound",
            dataIndex: "outboundQty",
            key: "outboundQty",
            align: "right",
            render: (val) => (
              <span className="font-bold text-rose-500">-{val || 0}</span>
            ),
          },
          {
            title: "Closing Qty",
            dataIndex: "closingQty",
            key: "closingQty",
            align: "right",
            render: (val) => (
              <span className="font-black text-slate-700">{val || 0}</span>
            ),
          },
        ];

      case "InventoryTracking":
        return [
          ...baseProductCols,
          {
            title: "System Qty",
            dataIndex: "systemQty",
            key: "systemQty",
            align: "right",
            render: (val) => (
              <span className="font-bold text-slate-500">{val || 0}</span>
            ),
          },
          {
            title: "Counted Qty",
            dataIndex: "countedQty",
            key: "countedQty",
            align: "right",
            render: (val) => (
              <span className="font-bold text-[#38c6c6]">{val ?? "-"}</span>
            ),
          },
          {
            title: "Variance Qty",
            dataIndex: "varianceQty",
            key: "varianceQty",
            align: "right",
            render: (val) => (
              <Tag
                color={val > 0 ? "success" : val < 0 ? "error" : "default"}
                className="!rounded-md !m-0 !font-bold"
              >
                {val > 0 ? `+${val}` : val || 0}
              </Tag>
            ),
          },
          {
            title: "Variance Value",
            dataIndex: "varianceValue",
            key: "varianceValue",
            align: "right",
            render: (val) => (
              <span
                className={`font-bold ${
                  val > 0
                    ? "text-emerald-500"
                    : val < 0
                      ? "text-rose-500"
                      : "text-slate-500"
                }`}
              >
                {formatCurrency(val)}
              </span>
            ),
          },
        ];

      case "InventorySnapshot":
      default:
        return [
          ...baseProductCols,
          {
            title: "Unit Cost",
            dataIndex: "unitCost",
            key: "unitCost",
            align: "right",
            render: (val) => (
              <span className="text-slate-500 font-medium">
                {formatCurrency(val)}
              </span>
            ),
          },
          {
            title: "Current Stock",
            dataIndex: "quantity",
            key: "quantity",
            align: "right",
            render: (val) => (
              <span className="font-black text-[#38c6c6]">{val || 0}</span>
            ),
          },
          {
            title: "Inventory Value",
            dataIndex: "inventoryValue",
            key: "inventoryValue",
            align: "right",
            render: (val) => (
              <span className="font-bold text-slate-700">
                {formatCurrency(val)}
              </span>
            ),
          },
        ];
    }
  };

  const getTableData = () => {
    if (!result || !result.data) return [];
    if (reportType === "InventoryLedger") return result.data.rows || [];
    return result.data.items || result.data.byProduct || result.data || [];
  };

  const getTableIconAndTitle = () => {
    switch (reportType) {
      case "InventoryLedger":
        return {
          icon: <List size={18} className="text-[#38c6c6]" />,
          title: "Transaction History (Ledger)",
        };
      case "InventoryInOutBalance":
        return {
          icon: <Scale size={18} className="text-[#38c6c6]" />,
          title: "In/Out Balance Detail",
        };
      case "InventoryTracking":
        return {
          icon: <Activity size={18} className="text-[#38c6c6]" />,
          title: "Stocktake Variance Detail",
        };
      case "InventorySnapshot":
        return {
          icon: <Camera size={18} className="text-[#38c6c6]" />,
          title: "Current Stock Snapshot",
        };
      default:
        return {
          icon: <Package size={18} className="text-[#38c6c6]" />,
          title: "Report Data",
        };
    }
  };

  // ==========================================
  // 6. DYNAMIC SUMMARY CARDS
  // ==========================================
  const renderSummaryCards = () => {
    const summary = result?.summary || {};

    if (reportType === "InventoryLedger") {
      return (
        <Row gutter={24}>
          <Col span={8}>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <div className="flex flex-col">
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  Opening Balance
                </Text>
                <Text className="font-black text-2xl text-slate-800 mt-1">
                  {summary.openingQuantity || 0}
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100 !bg-gradient-to-br from-white to-cyan-50/30">
              <div className="flex flex-col">
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  Closing Balance
                </Text>
                <Text className="font-black text-2xl text-[#38c6c6] mt-1">
                  {summary.closingQuantity || 0}
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <div className="flex flex-col">
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  Total Transactions (Entries)
                </Text>
                <Text className="font-black text-2xl text-slate-800 mt-1">
                  {summary.entries || 0}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      );
    }

    if (reportType === "InventoryInOutBalance") {
      return (
        <Row gutter={24}>
          <Col span={6}>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <div className="flex flex-col">
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  Opening Qty
                </Text>
                <Text className="font-black text-2xl text-slate-800">
                  {summary.totalOpeningQty || 0}
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="!rounded-2xl !shadow-sm !border-emerald-100 !bg-emerald-50/30">
              <div className="flex flex-col">
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  Total Inbound (+)
                </Text>
                <Text className="font-black text-2xl text-emerald-600">
                  {summary.totalInboundQty || 0}
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="!rounded-2xl !shadow-sm !border-rose-100 !bg-rose-50/30">
              <div className="flex flex-col">
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  Total Outbound (-)
                </Text>
                <Text className="font-black text-2xl text-rose-500">
                  {summary.totalOutboundQty || 0}
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="!rounded-2xl !shadow-sm !border-[#38c6c6]/20 !bg-cyan-50/30">
              <div className="flex flex-col">
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  Closing Qty
                </Text>
                <Text className="font-black text-2xl text-[#38c6c6]">
                  {summary.totalClosingQty || 0}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      );
    }

    if (reportType === "InventoryTracking") {
      return (
        <Row gutter={24}>
          <Col span={8}>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <div className="flex flex-col">
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  Total Items Checked
                </Text>
                <Text className="font-black text-2xl text-slate-800">
                  {summary.totalItems || 0}
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              className={`!rounded-2xl !shadow-sm ${
                (summary.totalVarianceQty || 0) < 0
                  ? "!border-rose-100 !bg-rose-50/30"
                  : (summary.totalVarianceQty || 0) > 0
                    ? "!border-emerald-100 !bg-emerald-50/30"
                    : "!border-slate-100"
              }`}
            >
              <div className="flex flex-col">
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  Total Variance Qty
                </Text>
                <Text
                  className={`font-black text-2xl ${
                    (summary.totalVarianceQty || 0) < 0
                      ? "text-rose-500"
                      : (summary.totalVarianceQty || 0) > 0
                        ? "text-emerald-500"
                        : "text-slate-700"
                  }`}
                >
                  {(summary.totalVarianceQty || 0) > 0 ? "+" : ""}
                  {summary.totalVarianceQty || 0}
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <div className="flex flex-col">
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  Total Variance Value
                </Text>
                <Text
                  className={`font-black text-2xl truncate ${
                    (summary.totalVarianceValue || 0) < 0
                      ? "text-rose-500"
                      : (summary.totalVarianceValue || 0) > 0
                        ? "text-emerald-500"
                        : "text-slate-700"
                  }`}
                >
                  {formatCurrency(summary.totalVarianceValue)}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      );
    }

    // Snapshot Report Summary
    const totalSkus = summary.totalSkus ?? result.data?.totalSkus ?? 0;
    const totalQuantity =
      summary.totalQuantity ?? result.data?.totalQuantity ?? 0;
    const totalValue = summary.totalValue ?? result.data?.totalValue ?? 0;

    return (
      <Row gutter={24}>
        <Col span={8}>
          <Card className="!rounded-2xl !shadow-sm !border-slate-100">
            <div className="flex flex-col">
              <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                Total Unique Products (SKUs)
              </Text>
              <Text className="font-black text-2xl text-slate-800">
                {totalSkus}
              </Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="!rounded-2xl !shadow-sm !border-slate-100">
            <div className="flex flex-col">
              <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                Total Stock Quantity
              </Text>
              <Text className="font-black text-2xl text-[#38c6c6]">
                {totalQuantity}
              </Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="!rounded-2xl !shadow-sm !border-[#38c6c6]/20 !bg-cyan-50/30">
            <div className="flex flex-col">
              <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                Total Inventory Value
              </Text>
              <Text className="font-black text-2xl text-slate-800 truncate">
                {formatCurrency(totalValue)}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    );
  };

  // ==========================================
  // 7. AI RECOMMENDATIONS TABLE
  // ==========================================
  const renderAiRecommendations = () => {
    const aiData = result?.data?.aiRecommendation;
    if (!aiData || !aiData.items || aiData.items.length === 0) return null;

    const aiColumns = [
      {
        title: "Product",
        dataIndex: "productName",
        key: "productName",
        render: (text) => (
          <Text className="font-bold text-slate-800">{text}</Text>
        ),
      },
      {
        title: "Forecasted Outflow",
        dataIndex: "forecastedQuantity",
        key: "forecastedQuantity",
        align: "right",
        render: (val) => (
          <Text className="font-bold text-slate-600">{val || 0}</Text>
        ),
      },
      {
        title: "Suggested Restock",
        dataIndex: "suggestedRestockQuantity",
        key: "suggestedRestockQuantity",
        align: "right",
        render: (val, record) => (
          <Text
            className={`font-bold ${record.needsRestock ? "text-[#7C3AED]" : "text-slate-500"}`}
          >
            {val > 0 ? `+${val}` : val}
          </Text>
        ),
      },
      {
        title: "Needs Restock?",
        dataIndex: "needsRestock",
        key: "needsRestock",
        align: "center",
        render: (val) => (
          <Tag color={val ? "purple" : "default"} className="!m-0 !font-bold">
            {val ? "YES" : "NO"}
          </Tag>
        ),
      },
      {
        title: "Slow Moving?",
        dataIndex: "isSlowMoving",
        key: "isSlowMoving",
        align: "center",
        render: (val) => (
          <Tag color={val ? "orange" : "default"} className="!m-0 !font-bold">
            {val ? "YES" : "NO"}
          </Tag>
        ),
      },
      {
        title: "Warning",
        dataIndex: "slowMovingWarning",
        key: "slowMovingWarning",
        render: (text) => (
          <Text
            className={
              text ? "text-orange-500 font-medium" : "text-slate-400 italic"
            }
          >
            {text || "None"}
          </Text>
        ),
      },
      {
        title: "AI Analysis",
        dataIndex: "reason",
        key: "reason",
        render: (text) => (
          <Text className="text-sm text-slate-500 italic leading-tight block">
            {text}
          </Text>
        ),
      },
    ];

    return (
      <Row gutter={24} className="mt-6">
        <Col span={24}>
          <Card
            title={
              <Space className="!text-[#7C3AED] !uppercase !text-xs !tracking-wider !font-bold !py-2">
                <Sparkles size={16} /> AI Storage Forecast & Actionable Insights
              </Space>
            }
            className="!rounded-2xl !shadow-sm !border-purple-100 !bg-purple-50/30"
          >
            <Table
              columns={aiColumns}
              dataSource={aiData.items}
              rowKey="productId"
              pagination={false}
              className="custom-details-table"
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const { icon: tableIcon, title: tableTitle } = getTableIconAndTitle();

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
          {/* Nút Storage Forecast - Cập nhật giao diện tím chuẩn AI */}
          {isSucceeded && reportType === "InventorySnapshot" && (
            <Button
              icon={<Sparkles size={18} />}
              onClick={() => setIsForecastModalVisible(true)}
              className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-[#7C3AED] !bg-[#7C3AED]/5 !border-[#7C3AED]/20 !rounded-xl shadow-sm hover:!border-[#7C3AED] hover:!text-[#7C3AED] hover:!bg-[#7C3AED]/10 transition-all"
            >
              Storage Forecast
            </Button>
          )}

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

            {/* MAIN DATA TABLE */}
            <Row gutter={24}>
              <Col span={24}>
                <Card
                  title={
                    <Space className="!text-slate-700 !uppercase !text-xs !tracking-wider !font-bold !py-2">
                      {tableIcon} {tableTitle}
                    </Space>
                  }
                  className="!rounded-2xl !shadow-sm !border-slate-100"
                >
                  <Table
                    columns={getTableColumns()}
                    dataSource={getTableData()}
                    rowKey={(record, index) =>
                      record.productId || record.sku || index
                    }
                    pagination={{ pageSize: 10 }}
                    className="custom-details-table"
                    locale={{
                      emptyText: (
                        <div className="py-12 flex flex-col items-center text-slate-400">
                          <Package size={40} className="opacity-20 mb-3" />
                          <p>No data found for this report.</p>
                        </div>
                      ),
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* AI RECOMMENDATIONS TABLE */}
            {renderAiRecommendations()}
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

      {/* STORAGE FORECAST MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <Sparkles className="text-[#7C3AED]" size={20} />
            <span className="font-bold">Storage Forecast</span>
          </div>
        }
        open={isForecastModalVisible}
        onOk={handleStorageForecast}
        onCancel={() => setIsForecastModalVisible(false)}
        confirmLoading={isForecasting}
        okText="Start Forecast"
        cancelText="Cancel"
        okButtonProps={{
          className: "!bg-[#7C3AED] hover:!bg-[#6D28D9] !border-none",
        }}
        centered
      >
        <div className="space-y-4 py-4">
          <p className="text-slate-600">
            This function will analyze inventory data to:
          </p>
          <ul className="list-disc pl-5 text-slate-600 space-y-1">
            <li>Suggest the quantity to restock for the upcoming period.</li>
            <li>Alert on slow-moving or obsolete inventory.</li>
            <li>Detect low-stock items and request replenishment.</li>
          </ul>

          <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg mt-4">
            <Text className="text-[#7C3AED] text-sm font-medium">
              ⚠️ Note: The analysis process may take some time to complete.
            </Text>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Text className="font-medium text-slate-700">
              Enter the number of days to forecast (e.g., 7 days):
            </Text>
            <InputNumber
              min={1}
              value={forecastDays}
              onChange={(value) => setForecastDays(value)}
              className="w-full"
              size="large"
              placeholder="Enter number of days..."
            />
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-details-table .ant-table-thead > tr > th {
          background-color: transparent !important;
          color: #94a3b8 !important;
          font-size: 10px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          padding: 12px 16px !important;
          border-bottom: 1px solid #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default ReportDetail;
