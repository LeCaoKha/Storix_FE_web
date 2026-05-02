import React from "react";
import { Card, Avatar, Typography, Space, Tooltip, Tag } from "antd";
import { Package, Search, MapPin } from "lucide-react"; // Import thêm MapPin

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
                    className="p-4 bg-white border border-slate-100 rounded-2xl transition-all hover:border-[#38c6c6]/20 mr-1"
                  >
                    {/* HÀNG 1: THÔNG TIN SẢN PHẨM CHÍNH */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar
                          shape="square"
                          size={48}
                          src={item.productImage || null}
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

                        <div className="w-32 text-right pr-4">
                          <Text className="!font-bold !text-[#38c6c6] !block">
                            {(item.price || 0).toLocaleString()} ₫
                          </Text>
                        </div>

                        <Text className="!w-32 !text-right !pr-4 !font-black !text-slate-700">
                          {Math.floor(totalPrice).toLocaleString()} ₫
                        </Text>
                      </div>
                    </div>

                    {/* HÀNG 2: THÔNG TIN VỊ TRÍ LẤY HÀNG (PICK LOCATIONS) */}
                    {item.selectedPickLocations &&
                      item.selectedPickLocations.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
                          <Text className="!text-[10px] !uppercase !font-bold text-slate-400 !tracking-widest mb-2 block">
                            Selected Pick Locations
                          </Text>
                          <div className="flex flex-col gap-2">
                            {item.selectedPickLocations.map((loc, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin
                                    size={14}
                                    className="text-[#38c6c6]"
                                  />
                                  <Text className="!text-xs !font-medium !text-slate-500">
                                    <span className="font-bold text-slate-700">
                                      {loc.zoneCode}
                                    </span>
                                    <span className="mx-2 text-slate-300">
                                      /
                                    </span>
                                    Shelf:{" "}
                                    <span className="font-bold text-slate-700">
                                      {loc.shelfCode}
                                    </span>
                                    <span className="mx-2 text-slate-300">
                                      /
                                    </span>
                                    Bin:{" "}
                                    <span className="font-bold text-slate-700">
                                      {loc.binCode}
                                    </span>
                                  </Text>
                                </div>
                                <Tag
                                  color="cyan"
                                  className="!m-0 !font-bold !border-none !rounded-md"
                                >
                                  Qty: {loc.quantity}
                                </Tag>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
