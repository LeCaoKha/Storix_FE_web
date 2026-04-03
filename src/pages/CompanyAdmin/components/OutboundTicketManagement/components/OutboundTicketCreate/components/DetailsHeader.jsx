import React from "react";
import { Button, Tag, Typography, Space } from "antd";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const DetailsHeader = ({ data, onApprove, isApproving }) => {
  const navigate = useNavigate();

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
            Create Outbound Ticket
          </Title>
          <Space size="middle" className="mt-1">
            <Text className="text-slate-400 font-medium">
              From Request:{" "}
              <span className="font-bold text-slate-600">OUT-{data?.id}</span>
            </Text>
            <Tag
              color="blue"
              className="!rounded-md !px-2 !font-bold uppercase text-[10px]"
            >
              Ready for Ticket
            </Tag>
          </Space>
        </div>
      </div>

      <Space size="middle">
        <Button
          type="primary"
          icon={<CheckCircle size={18} />}
          onClick={onApprove}
          loading={isApproving}
          className="!flex !items-center !gap-2 !h-11 !px-8 !font-bold !bg-[#39c6c6] hover:!bg-[#2eb1b1] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20"
        >
          CONFIRM & CREATE TICKET
        </Button>
      </Space>
    </div>
  );
};

export default DetailsHeader;
