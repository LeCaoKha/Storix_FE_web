import React, { useState, useEffect, useCallback } from "react";
import { message, Button, Space } from "antd";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/axios";

// Components
import ReportFilters from "./components/ReportFilters";
import ReportTable from "./components/ReportTable";
import { MOCK_REPORTS } from "./components/ReportUtils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const ReportManagement = () => {
  const companyId = localStorage.getItem("companyId");
  const navigate = useNavigate();

  // States
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);

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

      // Không truyền skip và take để lấy toàn bộ dữ liệu
      const params = {
        companyId,
        type,
        warehouseId,
        from: dateRange
          ? dateRange[0].format("YYYY-MM-DDTHH:mm:ss")
          : undefined,
        to: dateRange ? dateRange[1].format("YYYY-MM-DDTHH:mm:ss") : undefined,
      };

      const res = await api.get("/Reports", { params });
      setReports(res.data || []);
    } catch (err) {
      console.error("Fetch Reports Error:", err);
      if (err.response?.status === 404) {
        setReports(MOCK_REPORTS);
        message.info(
          "Backend API not found. Using mock data for demonstration.",
        );
      } else {
        message.error("Could not load reporting history");
      }
    } finally {
      setLoading(false);
    }
  }, [companyId, filters]);

  // Fetch Warehouses (for dropdowns)
  const fetchWarehouses = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await api.get(`/company-warehouses/${companyId}/warehouses`);
      setWarehouses(res.data || []);
    } catch (err) {
      console.error("Fetch Warehouses Error:", err);
      if (err.response?.status === 404) {
        setWarehouses([
          { id: 1, name: "Warehouse Alpha" },
          { id: 2, name: "Warehouse Beta" },
        ]);
      }
    }
  }, [companyId]);

  useEffect(() => {
    fetchWarehouses();
    fetchReports();
  }, [fetchReports, fetchWarehouses]);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900">
      <section className="md:px-16 lg:px-12 pt-7 pb-10 space-y-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              Analytics Hub
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              Inventory <span className="text-[#39C6C6]">Reports</span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm font-medium">
              Generate and analyze warehouse performance data
            </p>
          </div>

          <Space size="middle" className="w-full md:w-auto">
            <Button
              type="primary"
              icon={<PlusCircle size={18} />}
              onClick={() => navigate("create")}
              className="!h-12 !px-8 !bg-[#39C6C6] !border-none !rounded-2xl !font-bold hover:!bg-[#2eb1b1] !shadow-lg !shadow-[#39C6C6]/20 !flex !items-center"
            >
              Generate New Report
            </Button>
          </Space>
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
            pagination={pagination}
            onTableChange={(pag) => setPagination(pag)}
            warehouses={warehouses}
          />
        </motion.div>
      </section>
    </div>
  );
};

export default ReportManagement;
