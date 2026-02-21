import React from "react";
import { Card, Input, Typography } from "antd";
import { Warehouse, MapPin } from "lucide-react";

// SỬA TẠI ĐÂY: Tách đúng nguồn của từng component
const { Text } = Typography;
const { TextArea } = Input;

const OutboundSidebar = ({ destination, setDestination }) => {
  return (
    <div className="space-y-6">
      <Card className="!rounded-2xl !shadow-sm !border-slate-100">
        <div className="space-y-6">
          {/* Warehouse Info - Thông tin kho xuất */}
          <div>
            <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Warehouse size={14} className="text-[#38c6c6]" /> Origin
              Warehouse
            </Text>
            <Input
              value="My Warehouse"
              disabled
              className="!h-12 !rounded-xl !bg-slate-100 !border-none !font-medium"
              prefix={<Warehouse size={18} className="text-slate-400 mr-1" />}
            />
          </div>

          {/* Destination Input - Địa điểm đến */}
          <div>
            <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <MapPin size={14} className="text-[#38c6c6]" /> Destination
              Address
            </Text>
            <TextArea
              rows={3}
              placeholder="Enter where the goods are going..."
              className="!rounded-xl !bg-slate-50 !border-none !p-4 transition-all !font-sans"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OutboundSidebar;
