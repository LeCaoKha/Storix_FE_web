import React, { useEffect, useState } from "react";
import {
  Form,
  Select,
  DatePicker,
  Button,
  message,
  Typography,
  Card,
  Space,
  Avatar,
  // ===== ADDED CODE START =====
  InputNumber,
  Switch,
  // ===== ADDED CODE END =====
} from "antd";
import {
  FileText,
  Calendar,
  Box,
  Loader2,
  Package,
  Ticket,
  ArrowLeft,
  Info,
  Settings2,
  X,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { REPORT_TYPES } from "./ReportUtils";
import api from "../../../../../api/axios";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

const CreateReport = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const companyId = localStorage.getItem("companyId");
  const userId = localStorage.getItem("userId");

  // ==========================================
  // 1. STATES
  // ==========================================
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown states
  const [warehouses, setWarehouses] = useState([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Theo dõi loại báo cáo đang chọn
  const selectedReportType = Form.useWatch("reportType", form);

  // ==========================================
  // 2. FETCH DATA
  // ==========================================

  // Lấy danh sách kho khi load trang
  useEffect(() => {
    const fetchWarehouses = async () => {
      if (!companyId) return;
      setLoadingWarehouses(true);
      try {
        const res = await api.get(
          `/company-warehouses/${companyId}/warehouses`,
        );
        setWarehouses(res.data || []);
      } catch (error) {
        console.error("Fetch Warehouses Error:", error);
        message.error("Failed to load warehouses");
      } finally {
        setLoadingWarehouses(false);
      }
    };
    fetchWarehouses();
  }, [companyId]);

  // Gọi API lấy danh sách sản phẩm khi chọn InventoryLedger
  useEffect(() => {
    const fetchProducts = async () => {
      if (!userId) return;
      setLoadingProducts(true);
      try {
        const res = await api.get(`/Products/get-all/${userId}`);
        setProducts(res.data || []);
      } catch (error) {
        console.error("Fetch products error:", error);
        message.error("Failed to load products list");
      } finally {
        setLoadingProducts(false);
      }
    };

    if (selectedReportType === "InventoryLedger") {
      fetchProducts();
    }
  }, [selectedReportType, userId]);

  // Gọi API lấy danh sách phiếu kiểm kê khi chọn InventoryTracking
  useEffect(() => {
    const fetchTickets = async () => {
      if (!companyId) return;
      setLoadingTickets(true);
      try {
        const res = await api.get(`/InventoryCount/tickets/${companyId}`);
        setTickets(res.data || []);
      } catch (error) {
        console.error("Fetch tickets error:", error);
        message.error("Failed to load inventory count tickets");
      } finally {
        setLoadingTickets(false);
      }
    };

    if (selectedReportType === "InventoryTracking") {
      fetchTickets();
    }
  }, [selectedReportType, companyId]);

  // ==========================================
  // 3. HANDLERS
  // ==========================================

  const handleReportTypeChange = () => {
    // Reset lại các trường đặc thù khi đổi loại báo cáo
    form.setFieldsValue({
      productId: null,
      inventoryCountTicketId: null,
      // ===== ADDED CODE START =====
      forecastHorizonDays: null,
      defaultLeadTimeDays: null,
      serviceLevel: null,
      useAiExplanation: false,
      // ===== ADDED CODE END =====
    });
  };

  const handleGenerate = async (values) => {
    setIsSubmitting(true);

    try {
      // ===== ADDED CODE START =====
      // DYNAMIC PAYLOAD CONSTRUCTION
      const payload = {
        reportType: values.reportType,
        companyId: parseInt(companyId),
        warehouseId: values.warehouseId || null,
        timeFrom: values.dateRange[0].format("YYYY-MM-DDTHH:mm:ss"),
        timeTo: values.dateRange[1].format("YYYY-MM-DDTHH:mm:ss"),
      };

      if (values.reportType === "InventoryLedger") {
        payload.productId = values.productId;
      } else if (values.reportType === "InventoryTracking") {
        payload.inventoryCountTicketId = values.inventoryCountTicketId;
      } else if (values.reportType === "ReplenishmentRecommendation") {
        payload.forecastHorizonDays = values.forecastHorizonDays || 30;
        payload.defaultLeadTimeDays = values.defaultLeadTimeDays || 7;
        payload.serviceLevel = values.serviceLevel || 95;
        payload.useAiExplanation = values.useAiExplanation || false;
      }
      // ===== ADDED CODE END =====

      await api.post("/Reports", payload);
      message.success("Report generation started successfully!");

      // Trở về trang trước đó như luồng cũ
      navigate(-1);
    } catch (err) {
      console.error("Generate Report Error:", err);
      message.error(
        err.response?.data?.message || "Failed to start report generation",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = () => {
    form.validateFields().then((values) => {
      handleGenerate(values);
    });
  };

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans pb-20">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeft size={24} />}
            onClick={() => navigate(-1)}
            className="!flex !items-center !justify-center !h-12 !w-12 !rounded-full hover:!bg-white hover:!shadow-md transition-all text-slate-600"
          />
          <div>
            <Title
              level={2}
              className="!mb-0 !font-extrabold !tracking-tight !text-slate-800"
            >
              Generate Analytics Report
            </Title>
            <Text className="text-slate-400 font-medium">
              Configure parameters to generate a new inventory report
            </Text>
          </div>
        </div>
        <Space size="middle">
          <Button
            type="text"
            icon={<X size={18} />}
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="!flex !items-center !gap-2 !h-11 !px-5 !font-bold !bg-rose-500 !text-white hover:!bg-rose-600 !rounded-xl transition-all"
          >
            Cancel
          </Button>
          <Button
            icon={
              isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )
            }
            loading={isSubmitting}
            onClick={onSubmit}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-white !bg-[#39c6c6] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20 hover:!bg-[#2eb1b1]"
          >
            Create Report
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical">
        <div className="flex justify-center gap-x-6">
          {/* CỘT TRÁI (60%): THÔNG SỐ CHÍNH */}
          <div className="w-[60%] space-y-6">
            <Card
              title={
                <Space className="!text-slate-700 !uppercase !text-xs !tracking-wider !font-bold !py-2">
                  <FileText size={16} className="text-[#38c6c6]" /> Report
                  Parameters
                </Space>
              }
              className="!rounded-2xl !shadow-sm !border-slate-100 !overflow-visible"
            >
              <div className="space-y-2">
                {/* 1. REPORT TYPE */}
                <Form.Item
                  name="reportType"
                  label={
                    <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                      Report Type
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please select a report type" },
                  ]}
                >
                  <Select
                    placeholder="Select report type..."
                    options={REPORT_TYPES}
                    onChange={handleReportTypeChange}
                    className="w-full custom-report-select"
                  />
                </Form.Item>

                {/* 2. TIME RANGE */}
                <Form.Item
                  name="dateRange"
                  label={
                    <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                      Time Range
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please select a time range" },
                  ]}
                >
                  <RangePicker
                    className="w-full custom-report-range"
                    suffixIcon={
                      <Calendar size={18} className="text-slate-400" />
                    }
                  />
                </Form.Item>

                {/* 3. CONDITIONAL: PRODUCT ID */}
                {selectedReportType === "InventoryLedger" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <Form.Item
                      name="productId"
                      label={
                        <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                          Target Product (Required)
                        </span>
                      }
                      rules={[
                        { required: true, message: "Please select a product" },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Search and select a product..."
                        loading={loadingProducts}
                        optionFilterProp="searchString"
                        filterOption={(input, option) =>
                          (option?.searchString ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={products.map((p) => ({
                          value: p.id,
                          searchString: `${p.name} ${p.sku}`,
                          label: (
                            <div className="flex items-center gap-3">
                              <Avatar
                                shape="square"
                                size={32}
                                src={p.image || p.imageUrl}
                                icon={<Package size={16} />}
                                className="shrink-0 bg-slate-100 text-slate-400 border border-slate-200"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-slate-700 truncate leading-tight">
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono tracking-tight leading-tight">
                                  SKU: {p.sku || "N/A"}
                                </span>
                              </div>
                            </div>
                          ),
                        }))}
                        className="w-full custom-report-select custom-product-dropdown"
                        dropdownStyle={{ minWidth: 400 }}
                      />
                    </Form.Item>
                  </motion.div>
                )}

                {/* 4. CONDITIONAL: TICKET ID */}
                {selectedReportType === "InventoryTracking" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <Form.Item
                      name="inventoryCountTicketId"
                      label={
                        <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                          Stocktake Ticket (Required)
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Please select a ticket",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Search and select a ticket..."
                        loading={loadingTickets}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={tickets.map((t) => {
                          const dateStr = new Date(
                            t.createdAt,
                          ).toLocaleDateString("en-GB");
                          const displayDesc = t.description
                            ? ` - ${t.description}`
                            : "";
                          return {
                            value: t.id,
                            label: `Ticket #${String(t.id).padStart(3, "0")} (${dateStr})${displayDesc}`,
                          };
                        })}
                        suffixIcon={
                          <Ticket size={18} className="text-slate-400" />
                        }
                        className="w-full custom-report-select"
                      />
                    </Form.Item>
                  </motion.div>
                )}

                {/* ===== ADDED CODE START ===== */}
                {/* 5. CONDITIONAL: REPLENISHMENT RECOMMENDATION */}
                {selectedReportType === "ReplenishmentRecommendation" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Form.Item
                      name="forecastHorizonDays"
                      label={
                        <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                          Forecast Horizon (Days)
                        </span>
                      }
                      initialValue={30}
                    >
                      <InputNumber
                        className="w-full custom-report-range"
                        min={1}
                        max={365}
                        placeholder="e.g., 30"
                      />
                    </Form.Item>

                    <Form.Item
                      name="defaultLeadTimeDays"
                      label={
                        <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                          Default Lead Time (Days)
                        </span>
                      }
                      initialValue={7}
                    >
                      <InputNumber
                        className="w-full custom-report-range"
                        min={1}
                        max={100}
                        placeholder="e.g., 7"
                      />
                    </Form.Item>

                    <Form.Item
                      name="serviceLevel"
                      label={
                        <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                          Service Level (%)
                        </span>
                      }
                      initialValue={95}
                    >
                      <InputNumber
                        className="w-full custom-report-range"
                        min={1}
                        max={100}
                        placeholder="e.g., 95"
                      />
                    </Form.Item>

                    <Form.Item
                      name="useAiExplanation"
                      valuePropName="checked"
                      label={
                        <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                          Include AI Explanation
                        </span>
                      }
                    >
                      <Switch className="mt-2" />
                    </Form.Item>
                  </motion.div>
                )}
                {/* ===== ADDED CODE END ===== */}
              </div>
            </Card>
          </div>

          {/* CỘT PHẢI (30%): CẤU HÌNH & THÔNG TIN CHUNG */}
          <div className="w-[30%] space-y-6">
            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <Text className="block !font-bold !text-slate-700 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
                <Settings2 size={14} className="text-[#38c6c6]" /> Filter
                Settings
              </Text>

              <Form.Item
                name="warehouseId"
                className="!mb-0"
                label={
                  <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest flex items-center gap-1">
                    <Box size={12} /> Target Warehouse
                  </span>
                }
              >
                <Select
                  placeholder="All Warehouses (Default)"
                  allowClear
                  loading={loadingWarehouses}
                  className="w-full custom-report-select"
                >
                  {warehouses.map((wh) => (
                    <Option key={wh.id} value={wh.id}>
                      {wh.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Text className="!text-[10px] !text-slate-400 !mt-2 !block italic">
                Leave empty to generate a company-wide report.
              </Text>
            </Card>

            <Card className="!rounded-2xl !shadow-sm !border-slate-100 !bg-gradient-to-br from-cyan-50/50 to-white">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-100/50 flex items-center justify-center text-[#38c6c6]">
                  <Info size={20} />
                </div>
                <Text className="!font-bold !text-slate-700 !text-sm">
                  Report Generation Note
                </Text>
                <Text className="!text-xs !text-slate-500 !leading-relaxed">
                  Reports may take a few moments to process depending on the
                  selected date range and data volume. Once initiated, the
                  report will be queued and you can monitor its status from the
                  main dashboard.
                </Text>
              </div>
            </Card>
          </div>
        </div>
      </Form>

      {/* Global CSS để bo cong, chỉnh background */}
      <style jsx global>{`
        .custom-report-select .ant-select-selector,
        .custom-report-range {
          height: 48px !important;
          border-radius: 12px !important;
          background-color: #f8fafc !important; /* bg-slate-50 */
          border: 1px solid #f1f5f9 !important;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .custom-report-range .ant-picker-input > input {
          height: 44px !important;
          font-weight: 500;
          color: #334155;
        }

        .custom-report-select .ant-select-selection-item {
          font-weight: 500;
          color: #334155; /* text-slate-700 */
        }

        .custom-report-select .ant-select-selection-placeholder,
        .custom-report-range .ant-picker-input > input::placeholder {
          color: #94a3b8 !important; /* text-slate-400 */
          font-weight: 500;
        }

        .custom-report-select.ant-select-focused .ant-select-selector,
        .custom-report-range.ant-picker-focused {
          box-shadow: 0 0 0 2px rgba(57, 198, 198, 0.2) !important;
          border-color: #39c6c6 !important;
          background-color: #ffffff !important;
        }

        .custom-product-dropdown .ant-select-selection-item {
          display: flex;
          align-items: center;
          padding-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default CreateReport;
