import React from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import { Card, Avatar, Typography, Select } from "antd";
import { Truck, Warehouse, Calendar, User, Users } from "lucide-react";

const { Text } = Typography;

const DetailsSidebarInfo = ({
  data,
  users,
  selectedStaffId,
  onStaffChange,
}) => {
  const location = useLocation();

  // CHỈ KHÓA (ReadOnly) khi đường dẫn chứa "management" VÀ đồng thời là trang "details"
  // Nếu là trang "create" thì isReadOnly sẽ là false -> Vẫn cho phép chọn staff
  const isReadOnly =
    location.pathname.includes("inbound-ticket-management") &&
    location.pathname.includes("/details/");

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
                <Text className="!font-medium !text-slate-700 truncate">
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
            // VÔ HIỆU HÓA NẾU LÀ TRANG DETAILS, MỞ NẾU LÀ TRANG CREATE
            disabled={isReadOnly}
            style={{
              backgroundColor: isReadOnly ? "#f1f5f9" : "#f8fafc",
              borderRadius: "12px",
              cursor: isReadOnly ? "not-allowed" : "pointer",
            }}
          >
            {users
              .filter((user) => user.roleId === 4)
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
                      <span className="text-[10px] text-slate-400 uppercase tracking-tighter">
                        {user.roleName}
                      </span>
                    </div>
                  </div>
                </Select.Option>
              ))}
          </Select>
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
