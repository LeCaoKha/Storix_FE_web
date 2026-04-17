import React from "react";
import { Button, Space, Typography } from "antd";
import { ArrowLeft, Save, X } from "lucide-react"; // Đã xóa import CheckCircle2
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const InboundHeader = ({ onCreate, loading }) => {
  const navigate = useNavigate();

  // ===== ADDED CODE START =====
  // Lấy role từ localStorage (thêm toLowerCase để so sánh an toàn)
  const userRole = localStorage.getItem("role")?.toLowerCase();
  // ===== ADDED CODE END =====

  return (
    <div className="flex justify-between items-center mb-10">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<ArrowLeft size={24} />}
          onClick={() => navigate(-1)}
          className="!flex !items-center !justify-center !h-12 !w-12 !rounded-full hover:!bg-white hover:!shadow-md transition-all text-slate-600"
        />
        <div>
          <Title
            level={2}
            className="!mb-0 !font-extrabold !tracking-tight !text-slate-800"
          >
            Create Inbound Request
          </Title>
        </div>
      </div>
      <Space size="middle">
        <Button
          type="text"
          icon={<X size={18} />}
          onClick={() => navigate(-1)}
          disabled={loading}
          className="!flex !items-center !gap-2 !h-11 !px-5 !font-bold !bg-rose-500 !text-white !text-slate-500 hover:!text-white hover:!bg-rose-600 !rounded-xl transition-all"
        >
          Cancel
        </Button>

        {/* ===== ADDED CODE START ===== */}
        {/* Nút Create PO: Ẩn nếu role là staff */}
        {userRole !== "staff" && (
          <Button
            icon={<Save size={18} />}
            onClick={() => onCreate(false)}
            loading={loading}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-slate-600 !bg-white !border-slate-200 !rounded-xl shadow-sm hover:!border-[#39c6c6] hover:!text-[#39c6c6]"
          >
            Create PO
          </Button>
        )}
        {/* ===== ADDED CODE END ===== */}

        {/* Đã xóa hoàn toàn nút Create & Approve ở đây */}
      </Space>
    </div>
  );
};

export default InboundHeader;
