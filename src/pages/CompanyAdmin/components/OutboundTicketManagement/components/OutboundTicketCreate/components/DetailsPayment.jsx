import React from "react";
import { Card, Typography, Divider, Tag } from "antd";

const { Text } = Typography;

const DetailsPayment = ({ data }) => {
  const totalItems = data?.items?.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );

  const totalSKUs = data?.items?.length || 0;

  return (
    <Card className="!rounded-2xl !shadow-sm !border-slate-100">
      <Text className="font-bold text-lg text-slate-800 mb-6 block">
        Dispatch Summary
      </Text>
      <div className="space-y-4">
        <div className="flex justify-between items-center text-slate-600">
          <span>Picking Strategy</span>
          <Tag color="cyan" className="!rounded-md !border-none !font-bold">
            Specific Identification
          </Tag>
        </div>

        <div className="flex justify-between items-center text-slate-600">
          <span>Unique SKUs</span>
          <span className="font-bold text-slate-800">{totalSKUs}</span>
        </div>

        <Divider className="!my-4 border-slate-100" />

        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-800 text-base">
            Total Units
          </span>
          <span className="font-black text-2xl text-[#39c6c6]">
            {totalItems || 0}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default DetailsPayment;
