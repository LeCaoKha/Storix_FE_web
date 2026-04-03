import React from "react";
import { Card, Typography, Divider } from "antd";

const { Text } = Typography;

const DetailsPayment = ({ data }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const totalItems = data.items?.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );

  return (
    <Card className="!rounded-2xl !shadow-sm !border-slate-100">
      <Text className="font-bold text-lg text-slate-800 mb-6 block">
        Outbound Summary
      </Text>
      <div className="space-y-4">
        <div className="flex justify-between items-center text-slate-600">
          <span>Total Items</span>
          <span className="font-bold text-slate-800">
            {totalItems || 0} pcs
          </span>
        </div>
        <Divider className="!my-4 border-slate-100" />
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-800 text-base">
            Total Value
          </span>
          <span className="font-black text-2xl text-[#39c6c6]">
            {formatCurrency(data.totalPrice)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default DetailsPayment;
