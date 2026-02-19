import React from "react";
import { Button, Space, Typography } from "antd";
import { ArrowLeft, PlusCircle, CheckCircle2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const { Title } = Typography;

const DetailsHeader = ({ data, onApprove, isApproving }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra xem có đang ở trang tạo Ticket hay không
  const isCreatePage = location.pathname.includes("/create");

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
                ? `Create Inbound Ticket From: ${data?.code || "N/A"}`
                : `Inbound Request: ${data?.code || "N/A"}`}
            </Title>
          </div>
        </div>
      </div>

      <Space size="middle">
        {/* Nút Create Ticket: Hiển thị khi ở trang Create HOẶC khi Request đã Approved */}
        {(isCreatePage || data?.status === "Approved") && (
          <Button
            type="primary"
            icon={<PlusCircle size={18} />}
            onClick={onApprove} // Ở trang Create, hàm này sẽ gọi API tạo Ticket
            loading={isApproving}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !bg-[#39c6c6] hover:!bg-[#2eb1b1] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20 transition-all"
          >
            Create Ticket
          </Button>
        )}

        {/* Nút Approve Request: Chỉ hiển thị ở trang Details và status là Pending */}
        {!isCreatePage && data?.status === "Pending" && (
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
