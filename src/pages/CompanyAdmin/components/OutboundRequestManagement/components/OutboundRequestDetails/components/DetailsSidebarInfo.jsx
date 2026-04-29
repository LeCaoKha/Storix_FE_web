import React from "react";
import { Card, Typography } from "antd";
import { Warehouse, MapPin, User, CalendarClock } from "lucide-react";

const { Text } = Typography;

const DetailsSidebarInfo = ({ data }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const InfoRow = ({ icon, label, value }) => (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">
          {label}
        </span>
      </div>
      <Text className="font-bold text-slate-700 block pl-6">
        {value || "N/A"}
      </Text>
    </div>
  );

  return (
    <Card className="!rounded-2xl !shadow-sm !border-slate-100">
      <Text className="font-bold text-lg text-slate-800 mb-6 block">
        Request Information
      </Text>
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <InfoRow
          icon={<Warehouse size={14} />}
          label="Origin Warehouse"
          value={data.warehouse?.name}
        />
        <InfoRow
          icon={<MapPin size={14} />}
          label="Destination"
          value={data.destination}
        />
        <InfoRow
          icon={<User size={14} />}
          label="Requested By"
          value={data.requestedByUser?.fullName}
        />
        <InfoRow
          icon={<CalendarClock size={14} />}
          label="Created At"
          value={formatDate(data.createdAt)}
        />
      </div>
    </Card>
  );
};

export default DetailsSidebarInfo;
