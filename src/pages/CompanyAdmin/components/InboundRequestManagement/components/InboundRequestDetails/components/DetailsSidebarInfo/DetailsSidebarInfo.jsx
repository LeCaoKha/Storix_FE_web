import React from "react";
import { Card, Typography, Avatar } from "antd";
import { Truck, Warehouse, Calendar, User } from "lucide-react";

const { Text } = Typography;

const DetailsSidebarInfo = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* SECTION: SOURCE & DESTINATION */}
      <div>
        <Card className="!rounded-2xl !shadow-sm !border-slate-100 !overflow-visible">
          <div className="space-y-6">
            {/* Supplier Information */}
            <div>
              <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                <Truck size={14} className="text-[#38c6c6]" /> Supplier
              </Text>
              <div className="!h-12 !flex !items-center !px-4 !rounded-xl !bg-slate-50 !border-none !font-medium !text-slate-700">
                <Avatar
                  size="small"
                  icon={<User size={14} />}
                  className="!bg-slate-100 !text-slate-400 !mr-3"
                />
                <Text className="!font-medium !text-slate-700">
                  {data?.supplier?.name || "N/A"}
                </Text>
              </div>
            </div>

            {/* Destination Warehouse */}
            <div>
              <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                <Warehouse size={14} className="text-[#38c6c6]" /> Destination
              </Text>
              <div className="!h-12 !flex !items-center !px-4 !rounded-xl !bg-slate-100 !border-none !font-medium !text-slate-400">
                <Warehouse size={18} className="text-slate-400 mr-3" />
                {data?.warehouse?.name || "My warehouse"}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION: EXPECTED DELIVERY DATE */}
      <div>
        <Card className="!rounded-2xl !shadow-sm !border-slate-100">
          <Text className="block !font-bold !text-slate-700 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">
            <Calendar size={14} className="text-[#38c6c6]" /> Expected Delivery
            Date
          </Text>
          <div className="!h-12 !flex !items-center !px-4 !rounded-xl !bg-slate-50 !border-none !font-medium !text-slate-700">
            <Calendar size={18} className="text-slate-300 mr-3" />
            {data?.expectedArrivalDate || "YYYY-MM-DD"}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DetailsSidebarInfo;
