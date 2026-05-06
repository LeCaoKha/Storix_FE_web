import React from "react";
import { Button, Space, Typography, Tag } from "antd";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Map,
  MapPinned,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const { Title } = Typography;

const DetailsHeader = ({
  data,
  onApprove,
  isApproving,
  onExportPDF,
  onCreatePath,
  isCreatingPath,
  onViewPath, // Prop mới mở Modal xem Path
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isTicketManagement = location.pathname.includes(
    "outbound-ticket-management",
  );
  const isDetailsPage = location.pathname.includes("/details/");

  const getHeaderTitle = () => {
    if (isTicketManagement) {
      return `Outbound Ticket: ${data?.code || "N/A"}`;
    }
    return `Outbound Request: ${data?.code || "N/A"}`;
  };

  return (
    <div className="flex justify-between items-start mb-10">
      <div className="flex items-start gap-4">
        <Button
          type="text"
          icon={<ArrowLeft size={24} />}
          onClick={() => navigate(-1)}
          className="!flex !items-center !justify-center !h-12 !w-12 !rounded-full hover:!bg-white hover:!shadow-md transition-all text-slate-600 mt-1"
        />
        <div className="flex flex-col items-start gap-2">
          <Title
            level={2}
            className="!mb-0 !font-extrabold !tracking-tight !text-slate-800"
          >
            {getHeaderTitle()}
          </Title>
          {data?.status && (
            <div>
              <Tag
                color={
                  data.status === "Completed"
                    ? "green"
                    : data.status === "Created"
                      ? "cyan"
                      : "orange"
                }
                className="!rounded-md !px-3 !py-1 !border-none !font-bold !m-0 !text-xs uppercase tracking-wider"
              >
                {data.status}
              </Tag>
            </div>
          )}
        </div>
      </div>

      <Space size="middle" className="mt-1">
        {/* NÚT XEM PATH ĐÃ TẠO */}
        {isTicketManagement && isDetailsPage && (
          <Button
            icon={<MapPinned size={18} />}
            onClick={onViewPath}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-indigo-600 !bg-indigo-50 !border-indigo-200 !rounded-xl shadow-sm hover:!border-indigo-500 hover:!text-indigo-700 hover:!bg-indigo-100 transition-all"
          >
            View Path
          </Button>
        )}

        {/* NÚT CREATE PATH: Ẩn nếu trạng thái đã Completed */}
        {isTicketManagement &&
          isDetailsPage &&
          data?.status !== "Completed" && (
            <Button
              icon={<Map size={18} />}
              onClick={onCreatePath}
              loading={isCreatingPath}
              className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-[#EC4899] !bg-[#EC4899]/5 !border-[#EC4899]/20 !rounded-xl shadow-sm hover:!border-[#EC4899] hover:!text-[#EC4899] hover:!bg-[#EC4899]/10 transition-all"
            >
              Create Path
            </Button>
          )}

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
