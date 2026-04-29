import React from "react";
import { Card, Avatar, Typography, Space, Empty, Tooltip } from "antd";
import { Package, Search } from "lucide-react";

const { Text } = Typography;

const DetailsProductList = ({ items }) => {
  console.log("item", items);
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
            {/* Header của danh sách - Giữ cố định ở trên */}
            <div className="flex items-center px-4 text-[10px] !uppercase !font-bold text-slate-400 !tracking-widest mb-3">
              <span className="flex-1">Product</span>
              <div className="flex items-center text-right">
                <span className="w-24 text-center">Quantity</span>
                <span className="w-32 pr-4">Unit Price</span>
                <span className="w-32 pr-4 text-right">Total Price</span>
              </div>
            </div>

            {/* Vùng danh sách: Giới hạn 3 sản phẩm (~320px), cuộn từ sản phẩm thứ 4 */}
            <div className="space-y-3 max-h-[280px] overflow-y-auto overflow-x-hidden">
              {items.map((item) => {
                // Giữ nguyên logic tính toán giá và chiết khấu
                const hasDiscount = item.lineDiscount > 0;
                const finalUnitPrice = hasDiscount
                  ? item.price - (item.price * item.lineDiscount) / 100
                  : item.price;
                const totalPrice =
                  finalUnitPrice * (item.expectedQuantity || 1);

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
                        src={item.image || item.imageUrl}
                        icon={<Package />}
                        className="!bg-slate-50 !text-slate-300 !shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <Tooltip title={item.name} placement="topLeft">
                          <Text className="!font-bold !text-slate-800">
                            {item.name.length > 20
                              ? `${item.name.substring(0, 20)}...`
                              : item.name}
                          </Text>
                        </Tooltip>
                        <Text className="!text-xs !text-slate-400 !font-mono !italic">
                          {item.sku}
                        </Text>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {/* Số lượng */}
                      <div className="w-24 flex justify-center">
                        <div className="h-10 px-4 flex items-center justify-center rounded-lg bg-slate-50 text-slate-700 font-bold min-w-[40px]">
                          {item.expectedQuantity}
                        </div>
                      </div>

                      {/* Đơn giá */}
                      <div className="w-32 text-right pr-4">
                        {hasDiscount ? (
                          <div className="flex flex-col items-end">
                            <Text className="!font-bold !text-[#38c6c6] !block !leading-tight">
                              {Math.floor(finalUnitPrice).toLocaleString()} ₫
                            </Text>
                            <Text className="!text-[11px] !text-slate-400 !line-through !block !leading-tight !opacity-70">
                              {item.price.toLocaleString()} ₫
                            </Text>
                          </div>
                        ) : (
                          <Text className="!font-bold !text-[#38c6c6] !block">
                            {(item.price || 0).toLocaleString()} ₫
                          </Text>
                        )}
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
