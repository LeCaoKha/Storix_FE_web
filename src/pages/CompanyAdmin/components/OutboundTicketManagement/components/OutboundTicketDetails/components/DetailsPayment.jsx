import React from "react";
import { Card, Typography } from "antd";

const { Text } = Typography;

const DetailsPayment = ({ data }) => {
  // Tính tổng số lượng items
  const totalLineItems = data?.items?.length || 0;

  // Tính tổng tiền dựa trên items
  const totalAmount =
    data?.items?.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
      0,
    ) || 0;

  return (
    <Card className="!rounded-2xl !shadow-sm !border-slate-100">
      <div className="px-2">
        <Text className="!text-lg !font-bold !text-slate-800 !block !mb-6">
          Payment Summary
        </Text>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Text className="!text-slate-600 !w-40">Total Items</Text>
            <Text className="!text-slate-400 !text-sm flex-1 text-center">
              {totalLineItems} product{totalLineItems !== 1 ? "s" : ""}
            </Text>
            <Text className="!font-bold !text-slate-800 !w-40 text-right">
              {totalAmount.toLocaleString()} ₫
            </Text>
          </div>

          <div className="flex items-center justify-between !pt-2 border-t border-slate-100">
            <Text className="!font-bold !text-slate-800 !w-40">
              Estimated Total Value
            </Text>
            <div className="flex-1"></div>
            <Text className="!text-2xl !font-black !text-[#38c6c6] !w-40 text-right">
              {totalAmount.toLocaleString()} ₫
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DetailsPayment;
