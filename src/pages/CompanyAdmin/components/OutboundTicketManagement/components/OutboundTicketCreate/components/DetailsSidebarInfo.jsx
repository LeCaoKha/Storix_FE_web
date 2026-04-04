import React, { useState, useEffect } from "react";
import { Card, Typography, Select, message, Spin } from "antd";
import { Warehouse, MapPin, User, CalendarClock, UserPlus } from "lucide-react";
import api from "../../../../../../../api/axios"; // Lưu ý: Điều chỉnh đường dẫn api/axios cho khớp với thư mục của bạn

const { Text } = Typography;
const { Option } = Select;

const DetailsSidebarInfo = ({ data, selectedStaffId, onStaffChange }) => {
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Lấy warehouseId từ data (hỗ trợ cả 2 chuẩn JSON của Inbound và Outbound)
  const warehouseId = data?.warehouseId || data?.warehouse?.id;

  useEffect(() => {
    const fetchStaffByWarehouse = async () => {
      if (!warehouseId) return;

      try {
        setLoadingStaff(true);
        const res = await api.get(
          `/Users/get-users-by-warehouse/${warehouseId}`,
        );

        // LỌC CHỈ LẤY USER CÓ ROLE LÀ 4 (STAFF)
        const filteredStaff = res.data.filter((user) => user.roleId === 4);
        setStaffList(filteredStaff);
      } catch (error) {
        console.error("Fetch staff error:", error);
        message.error("Failed to load warehouse staff list.");
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaffByWarehouse();
  }, [warehouseId]);

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
    <div className="mb-4 last:mb-0">
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

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
        <InfoRow
          icon={<Warehouse size={14} />}
          label="Origin Warehouse"
          value={data?.warehouse?.name || data?.warehouseName}
        />
        <InfoRow
          icon={<MapPin size={14} />}
          label="Destination"
          value={data?.destination || "Warehouse Dispatch"}
        />
        <InfoRow
          icon={<User size={14} />}
          label="Requested By"
          value={data?.requestedByUser?.fullName}
        />
        <InfoRow
          icon={<CalendarClock size={14} />}
          label="Created At"
          value={formatDate(data?.createdAt)}
        />
      </div>

      {/* KHU VỰC GIAO VIỆC CHO NHÂN VIÊN */}
      <div className="pt-6 border-t border-slate-100">
        <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
          <UserPlus size={14} className="text-[#39c6c6]" /> Assign Staff
        </Text>
        <Select
          showSearch
          placeholder="Search and select staff..."
          className="w-full !h-12 custom-staff-select"
          value={selectedStaffId}
          onChange={onStaffChange}
          optionFilterProp="children"
          notFoundContent={
            loadingStaff ? (
              <Spin size="small" />
            ) : (
              "No staff found in this warehouse."
            )
          }
        >
          {staffList.map((u) => (
            <Option key={u.id} value={u.id}>
              {u.fullName || u.email} -{" "}
              <span className="text-slate-400 text-xs">({u.roleName})</span>
            </Option>
          ))}
        </Select>
      </div>

      <style jsx global>{`
        .custom-staff-select .ant-select-selector {
          border-radius: 12px !important;
          background-color: #f8fafc !important;
          border: 1px solid #f1f5f9 !important;
          display: flex;
          align-items: center;
        }
        .custom-staff-select.ant-select-focused .ant-select-selector {
          border-color: #39c6c6 !important;
          box-shadow: 0 0 0 2px rgba(57, 198, 198, 0.2) !important;
        }
      `}</style>
    </Card>
  );
};

export default DetailsSidebarInfo;
