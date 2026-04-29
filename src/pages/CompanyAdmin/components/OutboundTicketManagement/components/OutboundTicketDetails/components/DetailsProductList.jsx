import React from "react";
import { Card, Avatar, Typography, Space, Tooltip } from "antd";
import { Package, Search } from "lucide-react";

const { Text } = Typography;

const DetailsProductList = ({ items }) => {
  return (
    <Card
      title={
        <Space className="!text-slate-700 !uppercase !text-xs !tracking-wider !font-bold !py-2">
          <Search size={16} className="text-[#38c6c6]" /> Product Information
        </Space>
      }
      className="!rounded-2xl !shadow-sm !border-slate-100 !overflow-hidden"
    >
      <div className="mt-2">
        {items && items.length > 0 ? (
          <div>
            {/* Header của danh sách */}
            <div className="flex items-center px-4 text-[10px] !uppercase !font-bold text-slate-400 !tracking-widest mb-3">
              <span className="flex-1">Product</span>
              <div className="flex items-center text-right">
                <span className="w-24 text-center">Qty / Picked</span>
                <span className="w-32 pr-4">Unit Price</span>
                <span className="w-32 pr-4 text-right">Total Price</span>
              </div>
            </div>

            {/* Vùng danh sách */}
            <div className="space-y-3 max-h-[280px] overflow-y-auto overflow-x-hidden">
              {items.map((item) => {
                const totalPrice = (item.price || 0) * (item.quantity || 1);

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl transition-all hover:border-[#38c6c6]/20 mr-1"
                  >
                    {/* Thông tin sản phẩm & Avatar */}
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar
                        shape="square"
                        size={48}
                        src={item.productImageUrl || null} // Thêm hình ảnh nếu API có
                        icon={<Package />}
                        className="!bg-slate-50 !text-slate-300 !shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <Tooltip title={item.productName} placement="topLeft">
                          <Text className="!font-bold !text-slate-800">
                            {item.productName?.length > 20
                              ? `${item.productName.substring(0, 20)}...`
                              : item.productName || "Unknown Product"}
                          </Text>
                        </Tooltip>
                        <Text className="!text-xs !text-slate-400 !font-mono !italic">
                          {item.productSku || "No SKU"}
                        </Text>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {/* Số lượng */}
                      <div className="w-24 flex justify-center">
                        <div className="h-10 px-4 flex flex-col items-center justify-center rounded-lg bg-slate-50 text-slate-700 min-w-[40px]">
                          <span className="font-bold text-sm leading-tight">
                            {item.quantity}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium leading-tight">
                            {item.receivedQuantity || 0} picked
                          </span>
                        </div>
                      </div>

                      {/* Đơn giá */}
                      <div className="w-32 text-right pr-4">
                        <Text className="!font-bold !text-[#38c6c6] !block">
                          {(item.price || 0).toLocaleString()} ₫
                        </Text>
                      </div>

                      {/* Thành tiền */}
                      <Text className="!w-32 !text-right !pr-4 !font-black !text-slate-700">
                        {Math.floor(totalPrice).toLocaleString()} ₫
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-48 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
            <Package size={40} className="mb-2 opacity-10" />
            <p className="font-medium text-sm">No product items found</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DetailsProductList;
