import React from "react";
// ===== ADDED CODE START =====
// Đã xóa các component không còn dùng (Button, Tooltip, Space) vì đã bỏ cột Action
import { Table, Tag } from "antd";
import { FileText, Clock } from "lucide-react"; // Đã xóa Eye, Download, AlertCircle
import { useNavigate } from "react-router-dom"; // Thêm useNavigate để chuyển trang
// ===== ADDED CODE END =====
import {
  formatReportType,
  getStatusColor,
  fmtDate,
  REPORT_STATUS,
} from "./ReportUtils";

const ReportTable = ({
  reports,
  loading,
  pagination,
  onTableChange,
  warehouses,
}) => {
  // ===== ADDED CODE START =====
  const navigate = useNavigate();

  // Hàm helper để lấy màu sắc theo từng loại Report
  const getReportTypeStyle = (type) => {
    switch (type) {
      case "InventoryTracking":
        return {
          bg: "bg-blue-50",
          text: "text-blue-600",
          icon: "text-blue-500",
        };
      case "InventoryInOutBalance":
        return {
          bg: "bg-purple-50",
          text: "text-purple-600",
          icon: "text-purple-500",
        };
      case "InboundKpiBasic":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-600",
          icon: "text-emerald-500",
        };
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-700",
          icon: "text-slate-500",
        };
    }
  };
  // ===== ADDED CODE END =====

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (_, r) => (
        <span className="font-medium text-slate-700">#{r.id}</span>
      ),
      width: 80,
    },
    {
      title: "Report Type",
      dataIndex: "reportType",
      render: (_, r) => {
        // ===== ADDED CODE START =====
        // Lấy style tương ứng với loại report
        const style = getReportTypeStyle(r.reportType);

        return (
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${style.bg} ${style.icon}`}>
              <FileText size={14} />
            </div>
            <span className={`font-medium ${style.text}`}>
              {formatReportType(r.reportType)}
            </span>
          </div>
        );
        // ===== ADDED CODE END =====
      },
    },
    {
      title: "Warehouse",
      dataIndex: "warehouseId",
      render: (_, r) => {
        const w = warehouses.find((w) => w.id === r.warehouseId);
        return (
          <span className="text-slate-600 font-medium">
            {w ? w.name : "All Warehouses"}
          </span>
        );
      },
    },
    {
      title: "Generated At",
      dataIndex: "createdAt",
      render: (_, r) => (
        <div className="flex flex-col">
          <span className="text-slate-700 text-sm font-medium">
            {fmtDate(r.createdAt)}
          </span>
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-tight">
            Request Time
          </span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_, r) => (
        <Tag
          color={getStatusColor(r.status)}
          className="!rounded-md !px-3 !py-0.5 !font-bold uppercase text-[10px]"
        >
          {r.status}
        </Tag>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-[1rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden p-6">
      <Table
        columns={columns}
        dataSource={reports}
        rowKey="id"
        loading={loading}
        // ===== ADDED CODE START =====
        // Cấu hình lại pagination để ép buộc hiển thị 5 dòng 1 trang
        pagination={{
          ...pagination,
          pageSize: 5,
        }}
        // ===== ADDED CODE END =====
        onChange={onTableChange}
        onRow={(record) => ({
          onClick: () => {
            navigate(`details/${record.id}`);
          },
        })}
        rowClassName="cursor-pointer hover:bg-slate-50 transition-colors"
        className="report-table storix-table"
        locale={{
          emptyText: (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <Clock size={40} className="mb-4 opacity-20" />
              <p>No reports found in this period.</p>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default ReportTable;
