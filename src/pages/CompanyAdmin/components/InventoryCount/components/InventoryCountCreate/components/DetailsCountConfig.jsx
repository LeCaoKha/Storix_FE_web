import React from "react";
import { Card, Input, Typography, DatePicker, Select } from "antd";
import { StickyNote, Calendar, Target } from "lucide-react";
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DetailsCountConfig = ({ config, onDataChange }) => {
  const handleChange = (key, value) => {
    if (onDataChange) onDataChange(key, value);
  };

  return (
    <div className="space-y-6">
      <Card className="!rounded-2xl !shadow-sm !border-slate-100">
        <div className="space-y-6">
          {/* 1. Count Name */}
          <div>
            <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Target size={14} className="text-[#38c6c6]" /> Count Name *
            </Text>
            <Input
              placeholder="e.g. Monthly Stock Check"
              value={config.name}
              className="!h-12 !rounded-xl !bg-slate-50 !border-none focus:!bg-white focus:!ring-2 focus:!ring-[#38c6c6]/20 transition-all"
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* 2. Planned Date */}
          <div>
            <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Calendar size={14} className="text-[#38c6c6]" /> Planned Date *
            </Text>
            <DatePicker
              format="YYYY-MM-DD"
              className="!h-12 !w-full !rounded-xl !bg-slate-50 !border-none"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
              onChange={(date) => handleChange("plannedAt", date)}
            />
          </div>

          {/* 3. Scope Type */}
          <div>
            <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest">
              Scope Type
            </Text>
            <Select
              defaultValue="All"
              value={config.scopeType}
              className="w-full !h-12 custom-config-select"
              onChange={(val) => handleChange("scopeType", val)}
              variant="borderless"
            >
              <Option value="All">All Warehouse</Option>
              <Option value="Product">Specific Products</Option>
              <Option value="Location">Specific Location</Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Description / Internal Notes */}
      <Card className="!rounded-2xl !shadow-sm !border-slate-100">
        <Text className="block !font-bold !text-slate-700 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">
          <StickyNote size={14} className="text-[#38c6c6]" /> Internal Notes
        </Text>
        <TextArea
          rows={3}
          placeholder="Instructions for staff..."
          className="!rounded-xl !bg-slate-50 !border-none !p-4"
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </Card>

      <style jsx global>{`
        .custom-config-select .ant-select-selector {
          background-color: #f8fafc !important;
          border-radius: 12px !important;
          height: 48px !important;
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default DetailsCountConfig;
