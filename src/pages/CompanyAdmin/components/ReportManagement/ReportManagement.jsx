import React, { useState, useEffect, useCallback } from "react";
import { message, Button } from "antd";
import { PlusCircle, FileText } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../../../api/axios";

// Components
import ReportFilters from "./components/ReportFilters";
import ReportTable from "./components/ReportTable";
import ReportGeneratorModal from "./components/ReportGeneratorModal";
import ReportDetail from "./components/ReportDetail";
import { REPORT_STATUS, MOCK_REPORTS, MOCK_REPORT_DETAILS } from "./components/ReportUtils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const ReportManagement = () => {
  const companyId = localStorage.getItem("companyId");

  // States
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [exportingId, setExportingId] = useState(null);

  const [filters, setFilters] = useState({
    type: undefined,
    warehouseId: undefined,
    dateRange: null,
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch Reports
  const fetchReports = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const { type, warehouseId, dateRange } = filters;
      const params = {
        companyId,
        type,
        warehouseId,
        from: dateRange ? dateRange[0].toISOString() : undefined,
        to: dateRange ? dateRange[1].toISOString() : undefined,
        skip: (pagination.current - 1) * pagination.pageSize,
        take: pagination.pageSize,
      };

      const res = await api.get("/Reports", { params });
      setReports(res.data || []);
    } catch (err) {
      console.error("Fetch Reports Error:", err);
      if (err.response?.status === 404) {
        setReports(MOCK_REPORTS);
        message.info("Backend API not found. Using mock data for demonstration.");
      } else {
        message.error("Could not load reporting history");
      }
    } finally {
      setLoading(false);
    }
  }, [companyId, filters, pagination.current, pagination.pageSize]);

  // Fetch Warehouses (for dropdowns)
  const fetchWarehouses = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await api.get(`/company-warehouses/${companyId}/warehouses`);
      setWarehouses(res.data || []);
    } catch (err) {
      console.error("Fetch Warehouses Error:", err);
      // Fallback warehouses if API fails
      if (err.response?.status === 404) {
        setWarehouses([{ id: 1, name: "Warehouse Alpha" }, { id: 2, name: "Warehouse Beta" }]);
      }
    }
  }, [companyId]);

  useEffect(() => {
    fetchWarehouses();
    fetchReports();
  }, [fetchReports, fetchWarehouses]);

  // Handlers
  const handleGenerateReport = async (values) => {
    setLoading(true);
    try {
      const payload = {
        reportType: values.reportType,
        warehouseId: values.warehouseId,
        timeFrom: values.dateRange[0].toISOString(),
        timeTo: values.dateRange[1].toISOString(),
        companyId: parseInt(companyId),
      };

      await api.post("/Reports", payload);
      message.success("Report generation started successfully!");
      setIsGeneratorOpen(false);
      fetchReports();
    } catch (err) {
      console.error("Generate Report Error:", err);
      if (err.response?.status === 404) {
        message.success("Mock: Report generation queued (Demo Mode)");
        setIsGeneratorOpen(false);
      } else {
        message.error(err.response?.data?.message || "Failed to start report generation");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (report) => {
    setExportingId(report.id);
    try {
      const res = await api.post(`/Reports/${report.id}/export/pdf?companyId=${companyId}`);
      if (res.data?.url) {
        window.open(res.data.url, "_blank");
        message.success("PDF exported successfully!");
      } else {
        message.warning("PDF is still being processed or not available.");
      }
    } catch (err) {
      console.error("Export PDF Error:", err);
      if (err.response?.status === 404) {
        message.info("Mock: PDF Export triggered (Link would open in production)");
      } else {
        message.error("Failed to export PDF report");
      }
    } finally {
      setExportingId(null);
    }
  };

  const handleViewDetails = async (report) => {
    setLoading(true);
    try {
      const res = await api.get(`/Reports/${report.id}?companyId=${companyId}`);
      setSelectedReport(res.data);
      setIsDetailOpen(true);
    } catch (err) {
      console.error("Get Report Detail Error:", err);
      if (err.response?.status === 404) {
        setSelectedReport(MOCK_REPORT_DETAILS[report.id] || report);
        setIsDetailOpen(true);
        message.info("Using mock details for demonstration.");
      } else {
        message.error("Could not load report details");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:px-16 lg:px-12 pt-7 pb-12 space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Analytics Hub</p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            Inventory <span className="text-[#39C6C6]">Reports</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">Generate and analyze warehouse performance data</p>
        </div>

        <Button
          type="primary"
          icon={<PlusCircle size={18} />}
          onClick={() => setIsGeneratorOpen(true)}
          className="h-12 px-6 rounded-2xl bg-[#39C6C6] hover:bg-[#2eb1b1] border-none font-bold shadow-lg shadow-[#39C6C6]/20 flex items-center gap-2"
        >
          Generate New Report
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <ReportFilters
          filters={filters}
          onFilterChange={setFilters}
          onRefresh={fetchReports}
          loading={loading}
          warehouses={warehouses}
        />
      </motion.div>

      {/* Table */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <ReportTable
          reports={reports}
          loading={loading}
          onView={handleViewDetails}
          onExport={handleExportPDF}
          pagination={pagination}
          onTableChange={(pag) => setPagination(pag)}
          warehouses={warehouses}
        />
      </motion.div>

      {/* Modals */}
      <ReportGeneratorModal
        visible={isGeneratorOpen}
        onCancel={() => setIsGeneratorOpen(false)}
        onGenerate={handleGenerateReport}
        loading={loading}
        warehouses={warehouses}
      />

      <ReportDetail
        visible={isDetailOpen}
        report={selectedReport}
        onCancel={() => setIsDetailOpen(false)}
        onExport={handleExportPDF}
        exporting={exportingId === selectedReport?.id}
      />
    </div>
  );
};

export default ReportManagement;
