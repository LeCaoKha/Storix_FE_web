import React from "react";
import { Button, Tag, Typography, Space } from "antd";
import { ArrowLeft, CheckCircle, Printer, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const DetailsHeader = ({ data, onApprove, isApproving, onExportPDF }) => {
  const navigate = useNavigate();

  // Lấy roleId từ localStorage để phân quyền hiển thị nút
  const roleId = Number(localStorage.getItem("roleId"));

  // Xác định base path dựa trên roleId để điều hướng cho chuẩn
  const getBasePath = () => {
    if (roleId === 2) return "/company-admin";
    if (roleId === 4) return "/staff";
    return "/manager"; // Mặc định cho Role 3 (Manager)
  };

  const getStatusColor = (status) => {
    if (status === "Approved") return "green";
    if (status === "Rejected") return "red";
    return "gold"; // Pending
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<ArrowLeft size={24} />}
          onClick={() => navigate(-1)}
          className="!flex !items-center !justify-center !h-12 !w-12 !rounded-full hover:!bg-white text-slate-600"
        />
        <div>
          <Title level={2} className="!mb-0 !font-extrabold !text-slate-800">
            Outbound #{data.id}
          </Title>
          <Space size="middle" className="mt-1">
            <Tag
              color={getStatusColor(data.status)}
              className="!rounded-md !px-3 !py-0.5 !font-bold uppercase text-[10px]"
            >
              {data.status || "Pending"}
            </Tag>
            <Text className="text-slate-400 font-medium">
              Ref: {data.referenceCode || "N/A"}
            </Text>
          </Space>
        </div>
      </div>

      <Space size="middle">
        <Button
          icon={<Printer size={18} />}
          onClick={onExportPDF}
          className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-slate-600 !rounded-xl"
        >
          Print PDF
        </Button>

        {/* NÚT DUYỆT: Trạng thái Pending VÀ Role KHÔNG PHẢI là 4 (Staff) */}
        {data.status === "Pending" && roleId !== 4 && (
          <Button
            type="primary"
            icon={<CheckCircle size={18} />}
            onClick={onApprove}
            loading={isApproving}
            className="!flex !items-center !gap-2 !h-11 !px-8 !font-bold !bg-[#39c6c6] hover:!bg-[#2eb1b1] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20"
          >
            APPROVE REQUEST
          </Button>
        )}

        {/* NÚT TẠO TICKET: Trạng thái đã Approved VÀ Role KHÔNG PHẢI là 4 (Staff) */}
        {data.status === "Approved" && roleId !== 4 && (
          <Button
            type="primary"
            icon={<FileText size={18} />}
            onClick={() =>
              navigate(
                `${getBasePath()}/outbound-ticket-management/create/${data.id}`,
              )
            }
            className="!flex !items-center !gap-2 !h-11 !px-8 !font-bold !bg-[#39c6c6] hover:!bg-[#2eb1b1] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20"
          >
            CREATE TICKET
          </Button>
        )}
      </Space>
    </div>
  );
};

export default DetailsHeader;
