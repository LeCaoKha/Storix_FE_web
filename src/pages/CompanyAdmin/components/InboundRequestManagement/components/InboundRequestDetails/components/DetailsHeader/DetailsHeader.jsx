import React from "react";
import { Button, Space, Typography, Tag } from "antd";
import { ArrowLeft, CheckCircle2, FileText, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const DetailsHeader = ({ data, onApprove, isApproving, onExportPDF }) => {
  const navigate = useNavigate();

  // ===== FIX START =====
  // Lấy role ID từ localStorage (localStorage luôn trả về chuỗi, ví dụ: "4")
  const userRole = localStorage.getItem("roleId");
  // ===== FIX END =====

  return (
    <div className="flex justify-between items-center mb-10">
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <Button
          type="text"
          icon={<ArrowLeft size={24} />}
          onClick={() => navigate(-1)}
          className="!flex !items-center !justify-center !h-12 !w-12 !rounded-full hover:!bg-white hover:!shadow-md transition-all text-slate-600"
        />
        <div>
          <div className="flex items-center gap-3">
            <Title
              level={2}
              className="!mb-0 !font-extrabold !tracking-tight !text-slate-800"
            >
              Inbound Request: {data?.code || "N/A"}
            </Title>
            {/* Status Tag */}
            <Tag
              color={data?.status === "Approved" ? "green" : "orange"}
              className="!rounded-full !text-lg !px-3 !border-none !font-bold !m-0"
            >
              {data?.status?.toUpperCase()}
            </Tag>
          </div>
        </div>
      </div>

      <Space size="middle">
        {/* Receive Goods Button (Nhập hàng) - Blue-ish Cyan Theme */}
        {data?.status === "Approved" && (
          <Button
            type="primary"
            icon={<Truck size={18} />}
            onClick={() =>
              navigate(
                `/company-admin/inbound-ticket-management/create/${data?.id}`,
              )
            }
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !bg-[#39c6c6] hover:!bg-[#2eb1b1] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20 transition-all"
          >
            Receive Goods
          </Button>
        )}

        {/* Export PDF Button */}
        <Button
          icon={<FileText size={18} />}
          onClick={onExportPDF}
          className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-slate-600 !bg-white !border-slate-200 !rounded-xl shadow-sm hover:!border-[#39c6c6] hover:!text-[#39c6c6] transition-all"
        >
          Export PDF
        </Button>

        {/* ===== FIX START ===== */}
        {/* Approve Request Button - Only shown when status is Pending AND role ID is NOT "4" */}
        {data?.status === "Pending" && userRole !== "4" && (
          <Button
            type="primary"
            icon={<CheckCircle2 size={18} />}
            onClick={onApprove}
            loading={isApproving}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !bg-[#39c6c6] hover:!bg-[#2eb1b1] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20 transition-all"
          >
            Approve Request
          </Button>
        )}
        {/* ===== FIX END ===== */}
      </Space>
    </div>
  );
};

export default DetailsHeader;
