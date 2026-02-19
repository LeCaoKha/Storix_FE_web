import React from "react";
import { Button, Space, Typography } from "antd";
import { ArrowLeft, Save, CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const InboundHeader = ({ onCreate, loading }) => {
  const navigate = useNavigate();
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

        {/* Nút Create PO: Kích hoạt gọi API */}
        <Button
          icon={<Save size={18} />}
          onClick={() => onCreate(false)}
          loading={loading}
          className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-slate-600 !bg-white !border-slate-200 !rounded-xl shadow-sm hover:!border-[#39c6c6] hover:!text-[#39c6c6]"
        >
          Create PO
        </Button>

        {/* Nút Create & Approve: Kích hoạt gọi API */}
        <Button
          type="primary"
          icon={<CheckCircle2 size={18} />}
          onClick={() => onCreate(true)}
          loading={loading}
          className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !bg-[#39c6c6] hover:!bg-[#2eb1b1] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20"
        >
          Create & Approve
        </Button>
      </Space>
    </div>
  );
};

export default InboundHeader;
