import React from "react";
import { Card, Select, DatePicker, Row, Col, Space, Button } from "antd";
import { Filter, RefreshCw } from "lucide-react";
import { REPORT_TYPES } from "./ReportUtils";

const { RangePicker } = DatePicker;

const ReportFilters = ({ filters, onFilterChange, onRefresh, loading, warehouses }) => {
    const handleTypeChange = (value) => onFilterChange({ ...filters, type: value });
    const handleWarehouseChange = (value) => onFilterChange({ ...filters, warehouseId: value });
    const handleDateChange = (dates) => onFilterChange({ ...filters, dateRange: dates });

    return (
        <Card className="shadow-sm border-slate-200 mb-6">
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={24} md={18} lg={20}>
                    <Space wrap size="middle">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            <span className="text-sm font-semibold text-slate-600">Filters:</span>
                        </div>

                        <Select
                            placeholder="Report Type"
                            allowClear
                            className="w-48"
                            value={filters.type}
                            onChange={handleTypeChange}
                            options={REPORT_TYPES}
                        />

                        <Select
                            placeholder="All Warehouses"
                            allowClear
                            className="w-48"
                            value={filters.warehouseId}
                            onChange={handleWarehouseChange}
                            options={warehouses.map(w => ({ value: w.id, label: w.name }))}
                        />

                        <RangePicker
                            value={filters.dateRange}
                            onChange={handleDateChange}
                            className="border-slate-300"
                        />
                    </Space>
                </Col>

                <Col xs={24} sm={24} md={6} lg={4} className="text-right">
                    <Button
                        icon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
                        onClick={onRefresh}
                        loading={loading}
                        className="flex items-center gap-2 font-medium"
                    >
                        Refresh List
                    </Button>
                </Col>
            </Row>
        </Card>
    );
};

export default ReportFilters;
