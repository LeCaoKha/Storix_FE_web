import React from "react";
import { Button, Space, Typography, Tag, Switch } from "antd"; // Import thêm Switch
import {
  ArrowLeft,
  PlusCircle,
  CheckCircle2,
  FileText,
  Sparkles,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const { Title } = Typography;

const DetailsHeader = ({
  data,
  onApprove,
  isApproving,
  onExportPDF,
  onCreateRecommendation,
  isCreatingRec,
  // Nhận props quản lý AI từ component cha
  useAi,
  onToggleAi,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra trạng thái trang từ URL
  const isCreatePage = location.pathname.includes("/create");
  const isDetailsPage = location.pathname.includes("/details/");

  // KIỂM TRA NẾU LÀ QUẢN LÝ TICKET
  const isTicketManagement = location.pathname.includes(
    "inbound-ticket-management",
  );

  // Logic xác định tiêu đề hiển thị
  const getHeaderTitle = () => {
    if (isCreatePage) {
      return `Create Inbound Ticket From Request: ${data?.code || "N/A"}`;
    }
    if (isTicketManagement) {
      return `Inbound Ticket: ${data?.code || "N/A"}`;
    }
    return `Inbound Request: ${data?.code || "N/A"}`;
  };

  return (
    <div className="flex justify-between items-start mb-10">
      <div className="flex items-start gap-4">
        {/* Back Button */}
        <Button
          type="text"
          icon={<ArrowLeft size={24} />}
          onClick={() => navigate(-1)}
          className="!flex !items-center !justify-center !h-12 !w-12 !rounded-full hover:!bg-white hover:!shadow-md transition-all text-slate-600 mt-1"
        />
        <div className="flex flex-col gap-2">
          {/* Title */}
          <Title
            level={2}
            className="!mb-0 !font-extrabold !tracking-tight !text-slate-800"
          >
            {getHeaderTitle()}
          </Title>

          {/* Hiển thị Tag trạng thái nằm ở dưới Title */}
          {isDetailsPage && data?.status && (
            <div>
              <Tag
                color={data.status === "Approved" ? "green" : "orange"}
                className="!rounded-md !px-3 !py-1 !border-none !font-bold !m-0 !text-xs uppercase tracking-wider"
              >
                {data.status}
              </Tag>
            </div>
          )}
        </div>
      </div>

      <Space size="middle" className="mt-1">
        {/* ===== THÊM MỚI: AI TOGGLE CHO TRANG CREATE ===== */}
        {isCreatePage && (
          <div className="flex items-center gap-2 mr-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm">
            <Sparkles
              size={16}
              className={useAi ? "text-[#7C3AED]" : "text-slate-400"}
            />
            <Typography.Text
              className={`!font-bold !text-sm ${useAi ? "!text-[#7C3AED]" : "!text-slate-500"}`}
            >
              AI Recommendation
            </Typography.Text>
            <Switch
              checked={useAi}
              onChange={onToggleAi}
              className={`${useAi ? "!bg-[#7C3AED]" : "bg-slate-300"}`}
            />
          </div>
        )}

        {/* NÚT TẠO GỢI Ý KHO (AI RECOMMENDATION): Chỉ hiển thị ở Ticket Details */}
        {isTicketManagement && isDetailsPage && (
          <Button
            icon={<Sparkles size={18} />}
            onClick={onCreateRecommendation}
            loading={isCreatingRec}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-[#7C3AED] !bg-[#7C3AED]/5 !border-[#7C3AED]/20 !rounded-xl shadow-sm hover:!border-[#7C3AED] hover:!text-[#7C3AED] hover:!bg-[#7C3AED]/10 transition-all"
          >
            Create Recommendation
          </Button>
        )}

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
