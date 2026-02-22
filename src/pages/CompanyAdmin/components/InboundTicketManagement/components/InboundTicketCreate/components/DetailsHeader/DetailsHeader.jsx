import React from "react";
import { Button, Space, Typography, Tag } from "antd";
import { ArrowLeft, PlusCircle, CheckCircle2, FileText } from "lucide-react"; // Thêm FileText icon
import { useNavigate, useLocation } from "react-router-dom";

const { Title } = Typography;

const DetailsHeader = ({ data, onApprove, isApproving, onExportPDF }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra trạng thái trang từ URL
  const isCreatePage = location.pathname.includes("/create");
  const isDetailsPage = location.pathname.includes("/details/");

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
              {isCreatePage
                ? `Create Inbound Ticket From Request: ${data?.code || "N/A"}`
                : `Inbound Request: ${data?.code || "N/A"}`}
            </Title>

            {/* Hiển thị Tag trạng thái nếu là trang Details */}
            {isDetailsPage && data?.status && (
              <Tag
                color={data.status === "Approved" ? "green" : "orange"}
                className="!rounded-full !px-3 !border-none !font-bold !m-0"
              >
                {data.status.toUpperCase()}
              </Tag>
            )}
          </div>
        </div>
      </div>

      <Space size="middle">
        {/* NÚT EXPORT PDF: Chỉ hiển thị khi ở trang Details */}
        {isDetailsPage && (
          <Button
            icon={<FileText size={18} />}
            onClick={onExportPDF}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-slate-600 !bg-white !border-slate-200 !rounded-xl shadow-sm hover:!border-[#39c6c6] hover:!text-[#39c6c6] transition-all"
          >
            Export PDF
          </Button>
        )}

        {/* Nút Create Ticket: Giữ nguyên logic cho trang Create hoặc khi đã Approved */}
        {(isCreatePage || data?.status === "Approved") && (
          <Button
            type="primary"
            icon={<PlusCircle size={18} />}
            onClick={onApprove}
            loading={isApproving}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !bg-[#39c6c6] hover:!bg-[#2eb1b1] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20 transition-all"
          >
            {isCreatePage ? "Create Ticket" : "Receive Goods"}
          </Button>
        )}

        {/* Nút Approve: Chỉ hiện ở trang Details nếu trạng thái là Pending */}
        {isDetailsPage && data?.status === "Pending" && (
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
      </Space>
    </div>
  );
};

export default DetailsHeader;
