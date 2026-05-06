import React, { useEffect } from "react";
import {
  Card,
  Input,
  Space,
  List,
  Avatar,
  Typography,
  Empty,
  Button,
  Skeleton,
  Tooltip,
} from "antd";
import { Search, Package, Trash2 } from "lucide-react";

const { Text } = Typography;

const ProductSelectionOutbound = ({
  searchRef,
  isSearching,
  setIsSearching,
  handleSearch,
  filteredProducts,
  selectedProducts,
  onSelectProduct,
  onUpdateQuantity,
  onRemoveProduct,
  loading,
  warehouseSelected,
}) => {
  // --- Logic click outside để đóng dropdown ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef, setIsSearching]);

  return (
    <div className="space-y-6">
      <Card
        title={
          <Space className="!text-slate-700 !uppercase !text-xs !tracking-wider !font-bold !py-2">
            <Search size={16} className="text-[#38c6c6]" /> Select Inventory
            Items
          </Space>
        }
        className="!rounded-2xl !shadow-sm !border-slate-100 !overflow-visible"
      >
        {/* 1. THANH TÌM KIẾM */}
        <div className="relative" ref={searchRef}>
          <Input
            placeholder={
              warehouseSelected
                ? "Search available stock in selected warehouse..."
                : "Please select an Origin Warehouse first..."
            }
            prefix={<Search size={20} className="text-slate-300 mr-2" />}
            disabled={!warehouseSelected}
            className={`!h-12 !rounded-2xl !border-none !transition-all ${
              warehouseSelected
                ? "!bg-slate-50 focus:!bg-white focus:!ring-2 focus:!ring-[#38c6c6]/20"
                : "!bg-slate-100 !cursor-not-allowed"
            }`}
            onFocus={() => {
              if (warehouseSelected) setIsSearching(true);
            }}
            onChange={handleSearch}
          />

          {/* 2. DROPDOWN KẾT QUẢ TÌM KIẾM */}
          {isSearching && warehouseSelected && (
            <div className="absolute top-14 left-0 w-full bg-white z-[100] rounded-2xl shadow-2xl border border-slate-100 max-h-72 overflow-y-auto p-2">
              <Skeleton loading={loading} active className="!p-2">
                {filteredProducts.length > 0 ? (
                  <List
                    dataSource={filteredProducts}
                    className="!m-0"
                    renderItem={(item) => (
                      <div
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all group border mb-1 ${
                          item.availableQuantity > 0
                            ? "hover:bg-slate-50 border-transparent hover:border-slate-100"
                            : "opacity-50 cursor-not-allowed bg-slate-50 border-transparent"
                        }`}
                        onClick={() => {
                          if (item.availableQuantity > 0) {
                            onSelectProduct(item);
                            setIsSearching(false);
                          }
                        }}
                      >
                        <Space className="!flex-1 !overflow-hidden" size={12}>
                          <Avatar
                            shape="square"
                            size={40}
                            src={item.imageUrl || item.image}
                            icon={<Package />}
                            className="!bg-slate-100 !text-slate-400 !shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <Tooltip title={item.name} mouseEnterDelay={0.5}>
                              <Text
                                className="!block !font-bold !text-slate-800 !truncate"
                                style={{ maxWidth: "280px" }}
                              >
                                {item.name}
                              </Text>
                            </Tooltip>
                            <Text className="!text-[10px] !text-slate-400 !uppercase !font-bold !tracking-tight !mt-0.5">
                              SKU: {item.sku}
                            </Text>
                          </div>
                        </Space>

                        {/* Hiển thị Available bên góc phải */}
                        <div className="flex flex-col items-end pl-2 shrink-0">
                          <Text
                            className={`!text-[11px] !uppercase !tracking-tight ${
                              item.availableQuantity > 0
                                ? "!text-[#38c6c6]"
                                : "!text-red-400"
                            }`}
                          >
                            Available: {item.availableQuantity}
                          </Text>
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <Empty className="!py-4" description="No inventory found" />
                )}
              </Skeleton>
            </div>
          )}
        </div>

        {/* 3. DANH SÁCH SẢN PHẨM ĐÃ CHỌN XUẤT KHO */}
        <div className="mt-8">
          {selectedProducts.length > 0 ? (
            <div className="space-y-3">
              <div className="flex px-4 text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                <span className="flex-1">Product</span>
                <span className="w-24 text-center">Qty</span>
                <div className="w-10"></div>
              </div>

              {selectedProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:border-[#38c6c6]/20 transition-all"
                >
                  <Space className="!flex-1 !min-w-0" size={12}>
                    <Avatar
                      shape="square"
                      size={48}
                      src={item.imageUrl || item.image}
                      icon={<Package />}
                      className="!bg-slate-50 !text-slate-300"
                    />
                    <div className="flex flex-col min-w-0">
                      <Tooltip title={item.name} placement="topLeft">
                        <Text className="!font-bold !block !text-slate-800 !truncate">
                          {item.name.length > 30
                            ? `${item.name.substring(0, 30)}...`
                            : item.name}
                        </Text>
                      </Tooltip>
                      <Space size="middle">
                        <Text className="!text-xs !text-slate-400 !font-mono !italic">
                          {item.sku}
                        </Text>
                        <Text className="!text-[10px] !bg-slate-100 !px-2 !py-0.5 !rounded !text-slate-500 !font-bold">
                          Max: {item.availableQuantity}
                        </Text>
                      </Space>
                    </div>
                  </Space>

                  <div className="w-24 flex justify-center">
                    <Input
                      type="number"
                      min={1}
                      max={item.availableQuantity}
                      value={item.quantity}
                      className="!h-10 !rounded-lg !bg-slate-50 !border-none !w-16 !font-bold !text-center"
                      onChange={(e) =>
                        onUpdateQuantity(item.id, Number(e.target.value))
                      }
                    />
                  </div>

                  <div className="w-10 flex justify-end">
                    <Button
                      type="text"
                      danger
                      icon={<Trash2 size={18} />}
                      onClick={() => onRemoveProduct(item.id)}
                      className="!flex !items-center !justify-center hover:!bg-rose-50 !rounded-xl"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 text-slate-400 mt-4">
              <Package size={32} className="mb-2 opacity-20" />
              <Text className="!text-xs">
                No products selected for outbound
              </Text>
            </div>
          )}
        </div>
      </Card>

      <style jsx global>{`
        .ant-card-head {
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .ant-input-number-handler-wrap {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default ProductSelectionOutbound;
