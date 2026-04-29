import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import { Card, Typography, Modal, Input, Button, message } from "antd";

const { Text } = Typography;

const DetailsPayment = ({ data, onDiscountChange }) => {
  const location = useLocation();

  // Kiểm tra chế độ chỉ xem dựa trên URL
  const isReadOnly = location.pathname.includes("/details/");

  // --- LOGIC TỪ PRODUCT SEARCH SECTION ---
  const [isOrderDiscountModalOpen, setIsOrderDiscountModalOpen] =
    useState(false);
  const [localDiscountPercent, setLocalDiscountPercent] = useState(0);

  // Cập nhật giá trị local khi data thay đổi
  useEffect(() => {
    if (data?.orderDiscount !== undefined) {
      setLocalDiscountPercent(data.orderDiscount);
    }
  }, [data?.orderDiscount]);

  // Keyboard shortcut F6
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Nếu là ReadOnly thì không cho phép dùng phím tắt mở Modal
      if (isReadOnly) return;

      if (e.key === "F6") {
        e.preventDefault();
        setIsOrderDiscountModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReadOnly]); // Thêm isReadOnly vào dependency

  // Lấy dữ liệu từ API/Props
  const totalLineItems = data?.inboundOrderItems?.length || 0;
  const totalAmount = data?.totalPrice || 0;
  const orderDiscountPercent = data?.orderDiscount || 0;

  // Tính số tiền giảm giá hiển thị
  const orderDiscountAmount = (totalAmount * orderDiscountPercent) / 100;
  const finalPayable = data?.finalPrice || 0;

  // Tính số tiền giảm giá trong Modal (Real-time)
  const previewDiscountAmount = (totalAmount * localDiscountPercent) / 100;

  const handleApplyDiscount = () => {
    if (onDiscountChange) {
      onDiscountChange(localDiscountPercent);
    }
    setIsOrderDiscountModalOpen(false);
    message.success(`Order discount of ${localDiscountPercent}% applied`);
  };

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

          {/* Hàng 2: Order Discount - Chặn click nếu là ReadOnly */}
          <div className="flex items-center justify-between">
            <Text
              className={`!text-[#38c6c6] !font-medium !w-40 ${
                !isReadOnly ? "!cursor-pointer hover:!underline" : ""
              }`}
              onClick={() =>
                !isReadOnly ? setIsOrderDiscountModalOpen(true) : null
              }
            >
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

      {/* Modal giữ nguyên nhưng chỉ được gọi khi không phải ReadOnly */}
      <Modal
        title={
          <div className="!flex !items-center !gap-2 !pb-3 !border-b !border-slate-100">
            <span className="!text-lg !font-bold !text-slate-800">
              Apply Order Discount
            </span>
          </div>
        }
        open={isOrderDiscountModalOpen}
        onCancel={() => setIsOrderDiscountModalOpen(false)}
        centered
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsOrderDiscountModalOpen(false)}
            className="!rounded-xl !h-11 !px-8 !font-bold"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleApplyDiscount}
            className="!rounded-xl !h-11 !px-10 !bg-[#38c6c6] !border-none !font-bold"
          >
            Apply Discount
          </Button>,
        ]}
        width={400}
      >
        <div className="!mt-6 space-y-4">
          <div>
            <Text className="!font-bold !text-slate-600 !block !mb-2">
              Discount Percentage (%)
            </Text>
            <Input
              maxLength={3}
              placeholder="Enter percentage"
              value={localDiscountPercent}
              className="!h-12 !rounded-xl !bg-slate-50 !border-none !font-bold !text-lg"
              suffix={<span className="!font-bold !text-slate-400">%</span>}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                const formatted = Number(value) > 100 ? 100 : Number(value);
                setLocalDiscountPercent(formatted);
              }}
            />
          </div>

          <div className="!p-4 !bg-[#38c6c6]/5 !rounded-xl !border !border-dashed !border-[#38c6c6]/20 flex justify-between">
            <Text className="!text-slate-500 !font-medium">
              Reduced Amount:
            </Text>
            <Text className="!font-black !text-[#38c6c6]">
              {previewDiscountAmount.toLocaleString()} ₫
            </Text>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default DetailsPayment;
