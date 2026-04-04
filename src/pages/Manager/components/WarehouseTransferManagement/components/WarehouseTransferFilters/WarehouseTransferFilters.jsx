import React from "react";
import { Col, Input, Row, Select } from "antd";
import { Filter, Search } from "lucide-react";

const statusOptions = [
  { value: "ALL", label: "All status" },
  { value: "DRAFT", label: "DRAFT" },
  { value: "PENDING_APPROVAL", label: "PENDING_APPROVAL" },
  { value: "APPROVED", label: "APPROVED" },
  { value: "PICKING", label: "PICKING" },
  { value: "PACKED", label: "PACKED" },
  { value: "IN_TRANSIT", label: "IN_TRANSIT" },
  { value: "RECEIVED_FULL", label: "RECEIVED_FULL" },
  { value: "RECEIVED_PARTIAL", label: "RECEIVED_PARTIAL" },
  { value: "QUALITY_CHECKED", label: "QUALITY_CHECKED" },
  { value: "QUALITY_ISSUE", label: "QUALITY_ISSUE" },
  { value: "REJECTED", label: "REJECTED" },
  { value: "CANCELLED", label: "CANCELLED" },
  { value: "COMPLETED", label: "COMPLETED" },
];

const WarehouseTransferFilters = ({
  searchText,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sourceFilter,
  onSourceChange,
  destinationFilter,
  onDestinationChange,
  warehouseOptions,
}) => {
  return (
    <Row gutter={[16, 16]} className="!mb-6">
      <Col xs={24} md={10}>
        <Input
          allowClear
          prefix={<Search size={16} className="!text-slate-400" />}
          placeholder="Search by transfer id, warehouse, creator..."
          value={searchText}
          onChange={onSearchChange}
          className="!h-12 !bg-white !rounded-full !text-base !transition-all !border-slate-300 hover:!border-[#39C6C6] focus-within:!border-[#39C6C6]"
        />
      </Col>
      <Col xs={24} md={5}>
        <Select
          className="!w-full !h-12 !rounded-full"
          value={statusFilter}
          onChange={onStatusChange}
          options={statusOptions}
          suffixIcon={<Filter size={16} className="text-slate-400" />}
        />
      </Col>
      <Col xs={24} md={4}>
        <Select
          className="!w-full !h-12 !rounded-full"
          value={sourceFilter}
          onChange={onSourceChange}
          options={[{ value: "ALL", label: "All source" }, ...warehouseOptions]}
          placeholder="Source warehouse"
        />
      </Col>
      <Col xs={24} md={5}>
        <Select
          className="!w-full !h-12 !rounded-full"
          value={destinationFilter}
          onChange={onDestinationChange}
          options={[
            { value: "ALL", label: "All destination" },
            ...warehouseOptions,
          ]}
          placeholder="Destination warehouse"
        />
      </Col>
    </Row>
  );
};

export default WarehouseTransferFilters;
