import React from "react";
import { Card, Avatar, Typography, Select } from "antd";
import { Users } from "lucide-react";

const { Text } = Typography;

const DetailsSidebarInfo = ({ users, selectedStaffId, onStaffChange }) => {
  return (
    <Card className="!rounded-2xl !shadow-sm !border-slate-100">
      <Text className="block !font-bold !text-slate-700 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">
        <Users size={14} className="text-[#38c6c6]" /> Assign To (Staff) *
      </Text>
      <Select
        placeholder="Select staff member..."
        className="w-full !h-12 custom-sidebar-select"
        value={selectedStaffId}
        onChange={onStaffChange}
        variant="borderless"
      >
        {users
          .filter((user) => user.roleId === 4) // Chỉ hiện nhân viên kho
          .map((user) => (
            <Select.Option key={user.id} value={user.id}>
              <div className="flex items-center gap-2">
                <Avatar
                  size="small"
                  className="!bg-[#38c6c6]/10 !text-[#38c6c6]"
                >
                  {user.fullName?.charAt(0).toUpperCase()}
                </Avatar>
                <span className="font-medium text-slate-700">
                  {user.fullName}
                </span>
              </div>
            </Select.Option>
          ))}
      </Select>
      <style jsx global>{`
        .custom-sidebar-select .ant-select-selector {
          background-color: #f8fafc !important;
          border-radius: 12px !important;
          height: 48px !important;
          display: flex;
          align-items: center;
        }
      `}</style>
    </Card>
  );
};

export default DetailsSidebarInfo;
