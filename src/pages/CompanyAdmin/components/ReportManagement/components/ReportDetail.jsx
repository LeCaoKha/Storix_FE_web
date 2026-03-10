import React from "react";
import { Modal, Descriptions, Empty, Tag, Card, Row, Col, Statistic, Table, Button } from "antd";
import { FileText, Download, Layout, Package, Info } from "lucide-react";
import { formatReportType, getStatusColor, REPORT_STATUS } from "./ReportUtils";

const ReportDetail = ({ visible, report, onCancel, onExport, exporting }) => {
    if (!report) return null;

    let summaryData = {};
    let listData = [];
    try {
        summaryData = typeof report.summaryJson === 'string' ? JSON.parse(report.summaryJson) : report.summaryJson || {};
        listData = typeof report.dataJson === 'string' ? JSON.parse(report.dataJson) : report.dataJson || [];
    } catch (e) {
        console.error("Failed to parse report JSON", e);
    }

    const isInventoryTracking = report.reportType === "InventoryTracking";

    const columns = isInventoryTracking ? [
        { title: "Mã vật tư", dataIndex: "sku", key: "sku", fixed: 'left', width: 100 },
        { title: "Tên vật tư", dataIndex: "name", key: "name", fixed: 'left', width: 200 },
        { title: "ĐVT", dataIndex: "unit", key: "unit", width: 80 },
        {
            title: "Tồn đầu kỳ",
            children: [
                { title: "Số lượng", dataIndex: "initialQty", key: "initialQty", align: 'right' },
                { title: "Thành tiền", dataIndex: "initialValue", key: "initialValue", align: 'right', render: (val) => val?.toLocaleString() },
            ]
        },
        {
            title: "Nhập trong kỳ",
            children: [
                { title: "Số lượng", dataIndex: "inQty", key: "inQty", align: 'right' },
                { title: "Thành tiền", dataIndex: "inValue", key: "inValue", align: 'right', render: (val) => val?.toLocaleString() },
            ]
        },
        {
            title: "Xuất trong kỳ",
            children: [
                { title: "Đơn giá", dataIndex: "outPrice", key: "outPrice", align: 'right', render: (val) => val?.toLocaleString() },
                { title: "Số lượng", dataIndex: "outQty", key: "outQty", align: 'right' },
                { title: "Thành tiền", dataIndex: "outValue", key: "outValue", align: 'right', render: (val) => val?.toLocaleString() },
            ]
        },
        {
            title: "Tồn cuối kỳ",
            children: [
                { title: "Số lượng", dataIndex: "finalQty", key: "finalQty", align: 'right' },
                { title: "Thành tiền", dataIndex: "finalValue", key: "finalValue", align: 'right', render: (val) => val?.toLocaleString() },
            ]
        }
    ] : Object.keys(listData[0] || {}).map(key => ({
        title: key.replace(/([A-Z])/g, ' $1').trim(),
        dataIndex: key,
        key: key,
        render: (val) => typeof val === 'object' ? JSON.stringify(val) : String(val)
    }));

    return (
        <Modal
            title={
                <div className="flex items-center justify-between pr-8 border-b pb-4">
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-800 uppercase tracking-tight">
                            {isInventoryTracking ? "Báo cáo Nhập - Xuất - Tồn Kho" : `Report: ${formatReportType(report.reportType)}`}
                        </span>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-[0.1em]">
                            Kỳ báo cáo: {new Date(report.timeFrom).toLocaleDateString("vi-VN")} - {new Date(report.timeTo).toLocaleDateString("vi-VN")}
                        </span>
                    </div>
                    <Tag color={getStatusColor(report.status)} className="rounded-full px-4 py-1 m-0 font-black shadow-sm uppercase text-[10px]">
                        {report.status}
                    </Tag>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel} className="rounded-xl px-6 h-10 font-bold">Đóng</Button>,
                <Button
                    key="export"
                    type="primary"
                    icon={<Download size={16} />}
                    onClick={() => onExport(report)}
                    loading={exporting}
                    className="bg-[#39C6C6] hover:bg-[#2eb1b1] border-none font-bold rounded-xl px-6 h-10 shadow-lg shadow-[#39C6C6]/20"
                >
                    Xuất PDF
                </Button>
            ]}
            width={1200}
            centered
            className="report-detail-modal"
        >
            <div className="py-6 max-h-[75vh] overflow-y-auto custom-scrollbar px-2">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-800 mb-1 uppercase tracking-widest">
                        BÁO CÁO NHẬP - XUẤT - TỒN KHO HÀNG HÓA
                    </h2>
                    <p className="italic text-slate-500">Tháng {new Date(report.timeFrom).getMonth() + 1} năm {new Date(report.timeFrom).getFullYear()}</p>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <Table
                        dataSource={listData}
                        columns={columns}
                        pagination={false}
                        bordered
                        size="small"
                        scroll={{ x: isInventoryTracking ? 1200 : undefined }}
                        summary={(pageData) => {
                            if (!isInventoryTracking) return null;
                            let totalInit = 0, totalIn = 0, totalOut = 0, totalFinal = 0;
                            pageData.forEach(({ initialValue, inValue, outValue, finalValue }) => {
                                totalInit += initialValue || 0;
                                totalIn += inValue || 0;
                                totalOut += outValue || 0;
                                totalFinal += finalValue || 0;
                            });

                            return (
                                <Table.Summary fixed>
                                    <Table.Summary.Row className="bg-slate-50 font-black text-[11px] uppercase tracking-wider">
                                        <Table.Summary.Cell index={0} colSpan={3} align="center">Tổng cộng</Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} align="right">—</Table.Summary.Cell>
                                        <Table.Summary.Cell index={2} align="right" className="text-[#39C6C6]">{totalInit.toLocaleString()}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={3} align="right">—</Table.Summary.Cell>
                                        <Table.Summary.Cell index={4} align="right" className="text-[#39C6C6]">{totalIn.toLocaleString()}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={5} align="right">—</Table.Summary.Cell>
                                        <Table.Summary.Cell index={6} align="right">—</Table.Summary.Cell>
                                        <Table.Summary.Cell index={7} align="right" className="text-[#39C6C6]">{totalOut.toLocaleString()}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={8} align="right">—</Table.Summary.Cell>
                                        <Table.Summary.Cell index={9} align="right" className="text-[#39C6C6]">{totalFinal.toLocaleString()}</Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </Table.Summary>
                            );
                        }}
                    />
                </div>

                <Row gutter={24} className="mt-12 text-center">
                    <Col span={8}>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-800">Người lập biểu</span>
                            <span className="text-xs text-slate-400 italic">(Ký, họ tên)</span>
                            <div className="h-20"></div>
                            <span className="font-bold text-slate-600">Admin</span>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-800">Kế toán trưởng</span>
                            <span className="text-xs text-slate-400 italic">(Ký, họ tên)</span>
                            <div className="h-20"></div>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="flex flex-col">
                            <p className="text-xs text-slate-500 italic mb-1">Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                            <span className="font-black text-slate-800">Người phê duyệt</span>
                            <span className="text-xs text-slate-400 italic">(Ký, họ tên, đóng dấu)</span>
                            <div className="h-20"></div>
                        </div>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};

export default ReportDetail;
