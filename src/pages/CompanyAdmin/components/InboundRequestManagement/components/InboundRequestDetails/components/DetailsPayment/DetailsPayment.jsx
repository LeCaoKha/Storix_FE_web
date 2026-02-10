import React from "react";
import { Card, Typography } from "antd";

const { Text } = Typography;

const DetailsPayment = ({ data }) => {
  // Lấy dữ liệu từ API
  const totalLineItems = data?.inboundOrderItems?.length || 0;
  const totalAmount = data?.totalPrice || 0;
  const orderDiscountPercent = data?.orderDiscount || 0;

  // Tính số tiền giảm giá
  const orderDiscountAmount = (totalAmount * orderDiscountPercent) / 100;
  const finalPayable = data?.finalPrice || 0;

  return (
    <Card className="!rounded-2xl !shadow-sm !border-slate-100">
      <div className="px-2">
        <Text className="!text-lg !font-bold !text-slate-800 !block !mb-6">
          Payment
        </Text>

        <div className="space-y-5">
          {/* Hàng 1: Total Amount */}
          <div className="flex items-center justify-between">
            <Text className="!text-slate-600 !w-40">Total Amount</Text>
            <Text className="!text-slate-400 !text-sm flex-1 text-center">
              {totalLineItems} product{totalLineItems !== 1 ? "s" : ""}
            </Text>
            <Text className="!font-bold !text-slate-800 !w-40 text-right">
              {totalAmount.toLocaleString()} ₫
            </Text>
          </div>

          {/* Hàng 2: Order Discount */}
          <div className="flex items-center justify-between">
            <Text className="!text-[#38c6c6] !font-medium !w-40">
              Order Discount ({orderDiscountPercent}%)
            </Text>
            <Text className="!text-slate-300 flex-1 text-center">------</Text>
            <Text className="!font-bold !text-slate-800 !w-40 text-right">
              {orderDiscountAmount.toLocaleString()} ₫
            </Text>
          </div>

          {/* Hàng 3: Final Payable */}
          <div className="flex items-center justify-between !pt-2">
            <Text className="!font-bold !text-slate-800 !w-40">
              Amount to Pay Supplier
            </Text>
            <div className="flex-1"></div>
            <Text className="!text-2xl !font-black !text-[#38c6c6] !w-40 text-right">
              {finalPayable.toLocaleString()} ₫
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DetailsPayment;
