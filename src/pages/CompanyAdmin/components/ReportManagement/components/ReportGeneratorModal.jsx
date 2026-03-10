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
                    <span>Generate New Report</span>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                    loading={loading}
                    onClick={handleSubmit}
                    className="bg-[#39C6C6] hover:bg-[#2eb1b1] border-none font-bold"
                >
                    Generate Report
                </Button>,
            ]}
            width={500}
            centered
            maskClosable={!loading}
        >
            <div className="py-4">
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="reportType"
                        label={<span className="font-semibold text-slate-600">Report Type</span>}
                        rules={[{ required: true, message: "Please select a report type" }]}
                    >
                        <Select
                            placeholder="Select report type"
                            options={REPORT_TYPES}
                            className="h-10"
                        />
                    </Form.Item>

                    <Form.Item
                        name="warehouseId"
                        label={<span className="font-semibold text-slate-600">Warehouse (Optional)</span>}
                    >
                        <Select
                            placeholder="Select warehouse (empty for all)"
                            allowClear
                            options={warehouses.map(w => ({ value: w.id, label: w.name }))}
                            suffixIcon={<Box size={14} />}
                            className="h-10"
                        />
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label={<span className="font-semibold text-slate-600">Time Range</span>}
                        rules={[{ required: true, message: "Please select a time range" }]}
                    >
                        <RangePicker
                            className="w-full h-10 border-slate-200"
                            suffixIcon={<Calendar size={14} />}
                        />
                    </Form.Item>

                    <Alert
                        message="Reports may take a moment to generate depending on the data volume."
                        type="info"
                        showIcon
                        className="mt-4 bg-slate-50 border-slate-200 text-slate-500 text-xs"
                    />
                </Form>
            </div>
        </Modal>
    );
};

export default ReportGeneratorModal;
