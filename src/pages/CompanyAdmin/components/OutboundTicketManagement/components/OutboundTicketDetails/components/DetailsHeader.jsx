import React from "react";
import { Button, Space, Typography, Tag } from "antd";
import { ArrowLeft, CheckCircle2, FileText, Map } from "lucide-react"; // Thêm icon Map cho tính năng tìm đường
import { useNavigate, useLocation } from "react-router-dom";

const { Title } = Typography;

const DetailsHeader = ({
  data,
  onApprove,
  isApproving,
  onExportPDF,
  onCreatePath,
  isCreatingPath,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra trạng thái trang từ URL
  const isTicketManagement = location.pathname.includes(
    "outbound-ticket-management",
  );

  // Xác định xem có đang ở trang details không
  const isDetailsPage = location.pathname.includes("/details/");

  // Logic xác định tiêu đề hiển thị
  const getHeaderTitle = () => {
    if (isTicketManagement) {
      return `Outbound Ticket: ${data?.code || "N/A"}`;
    }
    return `Outbound Request: ${data?.code || "N/A"}`;
  };

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
              {getHeaderTitle()}
            </Title>

            {/* Hiển thị Tag trạng thái */}
            {data?.status && (
              <Tag
                color={
                  data.status === "Completed"
                    ? "green"
                    : data.status === "Created"
                      ? "cyan"
                      : "orange"
                }
                className="!rounded-full !px-3 !border-none !font-bold !m-0"
              >
                {data.status.toUpperCase()}
              </Tag>
            )}
          </div>
        </div>
      </div>

      <Space size="middle">
        {/* NÚT CREATE PATH: Chỉ hiển thị ở Ticket Details */}
        {isTicketManagement && isDetailsPage && (
          <Button
            icon={<Map size={18} />}
            onClick={onCreatePath}
            loading={isCreatingPath}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-[#EC4899] !bg-[#EC4899]/5 !border-[#EC4899]/20 !rounded-xl shadow-sm hover:!border-[#EC4899] hover:!text-[#EC4899] hover:!bg-[#EC4899]/10 transition-all"
          >
            Create Path
          </Button>
        )}

        {/* NÚT EXPORT PDF */}
        <Button
          icon={<FileText size={18} />}
          onClick={onExportPDF}
          className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-slate-600 !bg-white !border-slate-200 !rounded-xl shadow-sm hover:!border-[#39c6c6] hover:!text-[#39c6c6] transition-all"
        >
          Export PDF
        </Button>

        {/* Nút Save/Update: Chỉ hiện nếu chưa Completed */}
        {data?.status !== "Completed" && (
          <Button
            type="primary"
            icon={<CheckCircle2 size={18} />}
            onClick={onApprove}
            loading={isApproving}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !bg-[#39c6c6] hover:!bg-[#2eb1b1] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20 transition-all"
          >
            Save Changes
          </Button>
        )}
      </Space>
    </div>
  );
};

export default DetailsHeader;
