import React from "react";
import { Table, Tag, Button, Tooltip, Space } from "antd";
import { FileText, Download, Eye, AlertCircle, Clock } from "lucide-react";
import { formatReportType, getStatusColor, fmtDate, REPORT_STATUS } from "./ReportUtils";


const ReportTable = ({ reports, loading, onView, onExport, pagination, onTableChange, warehouses }) => {
    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            render: (_, r) => <span className="font-mono text-slate-400 text-xs">#{r.id}</span>,
            width: 80,
        },
        {
            title: "Report Type",
            dataIndex: "reportType",
            render: (_, r) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                        <FileText size={14} />
                    </div>
                    <span className="font-bold text-slate-700">{formatReportType(r.reportType)}</span>
                </div>
            ),
        },
        {
            title: "Warehouse",
            dataIndex: "warehouseId",
            render: (_, r) => {
                const w = warehouses.find(w => w.id === r.warehouseId);
                return <span className="text-slate-500">{w ? w.name : "All Warehouses"}</span>;
            },
        },
        {
            title: "Generated At",
            dataIndex: "createdAt",
            render: (_, r) => (
                <div className="flex flex-col">
                    <span className="text-slate-700 text-sm font-medium">{fmtDate(r.createdAt)}</span>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-tight">Request Time</span>
                </div>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (_, r) => (
                <Tag color={getStatusColor(r.status)} className="rounded-full px-3 py-0.5 font-bold uppercase text-[10px]">
                    {r.status}
                </Tag>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, r) => (
                <Space size="small">
                    <Tooltip title="View Summary">
                        <Button
                            type="text"
                            icon={<Eye size={16} className="text-slate-500" />}
                            onClick={() => onView(r)}
                            disabled={r.status !== REPORT_STATUS.SUCCEEDED}
                        />
                    </Tooltip>
                    <Tooltip title="Export PDF">
                        <Button
                            type="text"
                            icon={<Download size={16} className="text-[#39C6C6]" />}
                            onClick={() => onExport(r)}
                            disabled={r.status !== REPORT_STATUS.SUCCEEDED}
                        />
                    </Tooltip>
                    {r.status === REPORT_STATUS.FAILED && (
                        <Tooltip title={r.errorMessage || "Unknown error"}>
                            <AlertCircle size={16} className="text-rose-400" />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <Table
                columns={columns}
                dataSource={reports}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={onTableChange}
                className="report-table"
                locale={{
                    emptyText: (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                            <Clock size={40} className="mb-4 opacity-20" />
                            <p>No reports found in this period.</p>
                        </div>
                    )
                }}
            />
        </div>
    );
};

export default ReportTable;
