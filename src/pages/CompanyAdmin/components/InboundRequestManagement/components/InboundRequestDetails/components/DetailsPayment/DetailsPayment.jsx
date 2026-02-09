import { FileTextOutlined } from "@ant-design/icons";
import React from "react";

// DetailsPayment.jsx
const DetailsPayment = ({ data }) => (
  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
    <h3 className="text-xl font-bold text-[#1a3353] mb-6">Payment</h3>
    <div className="space-y-4">
      <div className="flex justify-between text-gray-500 font-medium">
        <span>Total Amount</span>
        <span className="text-[#1a3353]">
          {data?.totalPrice.toLocaleString()} đ
        </span>
      </div>
      <div className="flex justify-between text-[#4fd1c5] font-medium border-b border-dashed pb-4">
        <span>Order Discount</span>
        <span>{data?.orderDiscount.toLocaleString()} đ</span>
      </div>
      <div className="flex justify-between items-center pt-2">
        <span className="text-lg font-bold text-[#1a3353]">
          Amount to Pay Supplier
        </span>
        <span className="text-2xl font-bold text-[#4fd1c5] underline">
          {data?.finalPrice.toLocaleString()} đ
        </span>
      </div>
    </div>
  </div>
);

// DetailsNotes.jsx
const DetailsNotes = ({ note }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center gap-2 mb-4 text-[#1a3353] font-bold uppercase text-xs tracking-wider">
      <FileTextOutlined className="text-[#4fd1c5]" /> Internal Notes
    </div>
    <div className="p-4 bg-gray-50 rounded-xl text-gray-500 min-h-[120px]">
      {note || "No instructions provided."}
    </div>
  </div>
);

export default DetailsPayment;
