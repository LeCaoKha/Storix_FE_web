import React from "react";
import { Button, Space, Typography } from "antd";
import { ArrowRightLeft, Plus, RefreshCw } from "lucide-react";

const { Title, Text } = Typography;

const WarehouseTransferHeader = ({
  loading,
  onSync,
  onOpenCreate,
  canCreate = true,
  subtitle,
}) => {
  return (
    <div className="!flex !flex-col md:!flex-row !justify-between !items-start md:!items-center !mb-10 !gap-8">
      <div>
        <Title level={2} className="!mb-0 !font-bold !tracking-tight">
          Warehouse Transfer Management{" "}
          <ArrowRightLeft className="inline-block !ml-2 text-[#39C6C6]" size={24} />
        </Title>
        <Text className="!text-slate-500 !text-sm !font-medium !mt-1 !block">
          {subtitle ||
            "Manager can create, submit, approve, reject and cancel transfer orders."}
        </Text>
      </div>

      <Space size="middle" className="w-full md:w-auto">
        <Button
          className="!h-12 !px-6 !rounded-2xl !border-slate-200 !font-bold !text-slate-600 hover:!text-[#39C6C6] hover:!border-[#39C6C6]"
          icon={<RefreshCw size={16} className={loading ? "!animate-spin" : ""} />}
          onClick={onSync}
        >
          Sync
        </Button>

        <Button
          className="!h-12 !px-8 !bg-[#39C6C6] !border-none !rounded-2xl !font-bold hover:!bg-[#2eb1b1] !shadow-lg !shadow-[#39C6C6]/20"
          type="primary"
          icon={<Plus size={16} />}
          onClick={onOpenCreate}
          disabled={!canCreate}
        >
          New Transfer Draft
        </Button>
      </Space>
    </div>
  );
};

export default WarehouseTransferHeader;
