import React from "react";
import { Select, DatePicker, Row, Col, Button } from "antd";
import { Filter, RefreshCw } from "lucide-react";
import { REPORT_TYPES } from "./ReportUtils";

const { RangePicker } = DatePicker;

const ReportFilters = ({ filters, onFilterChange, onRefresh, loading, warehouses }) => {
    const handleTypeChange = (value) => onFilterChange({ ...filters, type: value });
    const handleWarehouseChange = (value) => onFilterChange({ ...filters, warehouseId: value });
    const handleDateChange = (dates) => onFilterChange({ ...filters, dateRange: dates });

    return (
        <div className="flex flex-col xl:flex-row gap-4 mb-6 items-stretch xl:items-center">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Select
                    placeholder="Report Type"
                    allowClear
                    className="!w-full !h-12 !rounded-full !border !border-slate-300 hover:!border-[#39C6C6] focus-within:!border-[#39C6C6] overflow-hidden transition-all"
                    value={filters.type}
                    onChange={handleTypeChange}
                    options={REPORT_TYPES}
                />

                <Select
                    placeholder="All Warehouses"
                    allowClear
                    className="!w-full !h-12 !rounded-full !border !border-slate-300 hover:!border-[#39C6C6] focus-within:!border-[#39C6C6] overflow-hidden transition-all"
                    value={filters.warehouseId}
                    onChange={handleWarehouseChange}
                    options={warehouses.map(w => ({ value: w.id, label: w.name }))}
                />

                <RangePicker
                    value={filters.dateRange}
                    onChange={handleDateChange}
                    className="!w-full !h-12 !rounded-full !border-slate-300 hover:!border-[#39C6C6] focus-within:!border-[#39C6C6]"
                />
            </div>

            <div className="flex xl:justify-end">
                <Button
                    icon={<RefreshCw size={14} className={loading ? "!animate-spin" : ""} />}
                    onClick={onRefresh}
                    loading={loading}
                    className="!h-12 !px-6 !rounded-2xl !border-slate-200 !font-bold !text-slate-600 hover:!text-[#39C6C6] hover:!border-[#39C6C6]"
                >
                    Refresh List
                </Button>
            </div>
        </div>
    );
};

export default ReportFilters;
