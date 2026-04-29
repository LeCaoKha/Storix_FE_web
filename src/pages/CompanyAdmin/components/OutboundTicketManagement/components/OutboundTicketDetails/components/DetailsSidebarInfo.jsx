import React from "react";
import { useLocation } from "react-router-dom";
import { Card, Avatar, Typography, Select } from "antd";
import { MapPin, Warehouse, Calendar, User, Users } from "lucide-react";

const { Text } = Typography;

const DetailsSidebarInfo = ({
  data,
  users,
  selectedStaffId,
  onStaffChange,
}) => {
  const location = useLocation();

  // Kiểm tra nếu là trang quản lý Ticket VÀ đang ở chi tiết thì khóa không cho sửa
  const isReadOnly =
    location.pathname.includes("outbound-ticket-management") &&
    location.pathname.includes("/details/");

  const roleId = Number(localStorage.getItem("roleId"));
  const isStaff = roleId === 4;
  const isCompleted = data?.status === "Completed";

  // Tổng hợp điều kiện khóa Select
  const disabledSelect = isReadOnly || isStaff || isCompleted;

  return (
    <div className="space-y-6">
      {/* SECTION: SOURCE & DESTINATION */}
      <div>
        <Card className="!rounded-2xl !shadow-sm !border-slate-100 !overflow-visible">
          <div className="space-y-6">
            {/* Destination Information */}
            <div>
              <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                <MapPin size={14} className="text-[#38c6c6]" /> Destination
              </Text>
              <div className="!h-12 !flex !items-center !px-4 !rounded-xl !bg-slate-50 !border-none !font-medium !text-slate-700">
                <Text className="!font-medium !text-slate-700 truncate">
                  {data?.destination || "N/A"}
                </Text>
              </div>
            </div>

            {/* Source Warehouse */}
            <div>
              <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                <Warehouse size={14} className="text-[#38c6c6]" /> Source
                Warehouse
              </Text>
              <div className="!h-12 !flex !items-center !px-4 !rounded-xl !bg-slate-100 !border-none !font-medium !text-slate-400">
                <Warehouse size={18} className="text-slate-400 mr-3" />
                {data?.warehouse?.name || "N/A"}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION: ASSIGNED STAFF */}
      <div>
        <Card className="!rounded-2xl !shadow-sm !border-slate-100">
          <Text className="block !font-bold !text-slate-700 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">
            <Users size={14} className="text-[#38c6c6]" /> Responsible Staff
          </Text>
          <Select
            placeholder="Select staff member..."
            className="w-full !h-12"
            value={selectedStaffId}
            onChange={onStaffChange}
            variant="borderless"
            disabled={disabledSelect}
            style={{
              backgroundColor: disabledSelect ? "#f1f5f9" : "#f8fafc",
              borderRadius: "12px",
              cursor: disabledSelect ? "not-allowed" : "pointer",
            }}
          >
            {users
              .filter((user) => user.roleId === 4) // Lọc nhân viên kho (Role 4)
              .map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <Avatar
                      size="small"
                      className="!bg-[#38c6c6]/10 !text-[#38c6c6]"
                    >
                      {user.fullName.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">
                        {user.fullName}
                      </span>
                    </div>
                  </div>
                </Select.Option>
              ))}
          </Select>
        </Card>
      </div>

      {/* SECTION: CREATED DATE */}
      <div>
        <Card className="!rounded-2xl !shadow-sm !border-slate-100">
          <Text className="block !font-bold !text-slate-700 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">
            <Calendar size={14} className="text-[#38c6c6]" /> Created Date
          </Text>
          <div className="!h-12 !flex !items-center !px-4 !rounded-xl !bg-slate-50 !border-none !font-medium !text-slate-700">
            <Calendar size={18} className="text-slate-300 mr-3" />
            {data?.createdAt
              ? new Date(data.createdAt).toLocaleDateString("vi-VN")
              : "YYYY-MM-DD"}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DetailsSidebarInfo;
