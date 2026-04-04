import React, { useState } from "react";
import { Modal, Form, Select, DatePicker, Button, Alert, Space } from "antd";
import { FileText, Calendar, Box, Loader2 } from "lucide-react";
import { REPORT_TYPES } from "./ReportUtils";

const { RangePicker } = DatePicker;

const ReportGeneratorModal = ({ visible, onCancel, onGenerate, loading, warehouses }) => {
    const [form] = Form.useForm();

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            onGenerate(values);
        });
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 text-slate-800">
                    <FileText size={20} className="text-[#39C6C6]" />
                    <span className="text-xl font-bold">Generate New Report</span>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            centered
            width={560}
            styles={{ body: { paddingTop: 12 } }}
            footer={[
                <Button key="back" onClick={onCancel} className="!h-11 !px-6 !rounded-xl !font-medium">
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                    loading={loading}
                    onClick={handleSubmit}
                    className="!h-11 !px-6 !bg-[#39C6C6] !border-none !rounded-xl !font-bold hover:!bg-[#2eb1b1] !shadow-lg !shadow-[#39C6C6]/20"
                >
                    Generate Report
                </Button>,
            ]}
            maskClosable={!loading}
        >
            <div className="py-2">
                <Form form={form} layout="vertical" className="!mt-1">
                    <Form.Item
                        name="reportType"
                        label={<span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">Report Type</span>}
                        rules={[{ required: true, message: "Please select a report type" }]}
                    >
                        <Select
                            placeholder="Select report type"
                            options={REPORT_TYPES}
                            className="!w-full report-generate-select"
                        />
                    </Form.Item>

                    <Form.Item
                        name="warehouseId"
                        label={<span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">Warehouse (Optional)</span>}
                    >
                        <Select
                            placeholder="Select warehouse (empty for all)"
                            allowClear
                            options={warehouses.map(w => ({ value: w.id, label: w.name }))}
                            suffixIcon={<Box size={14} />}
                            className="!w-full report-generate-select"
                        />
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label={<span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">Time Range</span>}
                        rules={[{ required: true, message: "Please select a time range" }]}
                    >
                        <RangePicker
                            className="!w-full report-generate-range"
                            suffixIcon={<Calendar size={14} />}
                        />
                    </Form.Item>

                    <Alert
                        message="Reports may take a moment to generate depending on the data volume."
                        type="info"
                        showIcon
                        className="!mt-4 !rounded-xl !border-[#39C6C6]/30 !bg-[#39C6C6]/10 !text-slate-600 text-xs"
                    />
                </Form>
            </div>

            <style jsx global>{`
                .report-generate-select .ant-select-selector {
                    height: 44px !important;
                    border-radius: 12px !important;
                    background: #f8fafc !important;
                    border-color: #e2e8f0 !important;
                    display: flex !important;
                    align-items: center !important;
                }

                .report-generate-select.ant-select-focused .ant-select-selector {
                    border-color: #39c6c6 !important;
                    box-shadow: 0 0 0 2px rgba(57, 198, 198, 0.18) !important;
                }

                .report-generate-range {
                    height: 44px !important;
                    border-radius: 12px !important;
                    background: #f8fafc !important;
                    border-color: #e2e8f0 !important;
                }

                .report-generate-range .ant-picker-input > input {
                    height: 42px !important;
                }
            `}</style>
        </Modal>
    );
};

export default ReportGeneratorModal;
