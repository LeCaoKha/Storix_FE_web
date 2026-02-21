import React from "react";
import { Button, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";

const { Title } = Typography;

const OutboundHeader = ({ onCreate, loading }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<ArrowLeft size={24} />}
          onClick={() => navigate(-1)}
          className="!flex !items-center !justify-center !h-12 !w-12 !rounded-full hover:!bg-white"
        />
        <Title level={2} className="!mb-0 !font-extrabold !text-slate-800">
          Create Outbound Request
        </Title>
      </div>

      <Space size="middle">
        <Button
          type="primary"
          icon={<Send size={18} />}
          onClick={onCreate}
          loading={loading}
          className="!flex !items-center !gap-2 !h-11 !px-8 !font-bold !bg-[#39c6c6] hover:!bg-[#2eb1b1] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20"
        >
          SUBMIT OUTBOUND
        </Button>
      </Space>
    </div>
  );
};

export default OutboundHeader;
