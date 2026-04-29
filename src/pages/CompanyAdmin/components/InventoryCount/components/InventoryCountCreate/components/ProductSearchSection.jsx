import React from "react";
import {
  Card,
  Input,
  Space,
  Skeleton,
  List,
  Avatar,
  Typography,
  Empty,
  Button,
  Tooltip,
  Tag,
  Popover,
} from "antd";
import {
  Search,
  Package,
  Trash2,
  MapPin,
  Plus,
  ChevronDown,
} from "lucide-react";

const { Text } = Typography;

const ProductSearchSection = ({
  searchRef,
  isSearching,
  setIsSearching,
  handleSearch,
  loadingProducts,
  filteredProducts,
  selectedProducts,
  onSelectProduct,
  onRemoveProduct,
}) => {
  console.log("selected product: ", selectedProducts);
  // Hàm render nội dung bên trong Popover
  const renderLocationList = (locations) => (
    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto p-1">
      {locations.map((loc, idx) => (
        <div
          key={`popover-loc-${idx}`}
          className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100 min-w-[200px]"
        >
          <MapPin size={14} className="text-[#38c6c6]" />
          <div className="flex flex-col">
            <Text className="!text-[11px] !font-bold !text-slate-700">
              {loc.zoneCode} › {loc.shelfCode} › {loc.binCode}
            </Text>
            <Text className="!text-[10px] !text-slate-500">
              Current Stock:{" "}
              <span className="font-bold text-[#38c6c6]">{loc.quantity}</span>
            </Text>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card
      title={
        <Space className="!text-slate-700 !uppercase !text-xs !tracking-wider !font-bold !py-2">
          <Package size={16} className="text-[#38c6c6]" /> Products to Count
        </Space>
      }
      className="!rounded-2xl !shadow-sm !border-slate-100 !overflow-visible"
    >
      {/* 1. THANH TÌM KIẾM */}
      <div className="relative" ref={searchRef}>
        <Input
          placeholder="Search inventory by name or SKU..."
          prefix={<Search size={20} className="text-slate-300 mr-2" />}
          className="!h-12 !rounded-2xl !bg-slate-50 !border-none focus:!bg-white focus:!ring-2 focus:!ring-[#38c6c6]/20 transition-all !text-base"
          onFocus={() => setIsSearching(true)}
          onChange={handleSearch}
        />

        {/* KẾT QUẢ TÌM KIẾM (DROPDOWN) */}
        {isSearching && (
          <div className="!absolute !top-14 !left-0 !w-full !bg-white !z-[100] !rounded-2xl !shadow-2xl !border !border-slate-100 !max-h-[300px] !overflow-y-auto !p-2">
            <Skeleton loading={loadingProducts} active className="!p-4">
              {filteredProducts.length > 0 ? (
                <List
                  dataSource={filteredProducts}
                  renderItem={(item) => (
                    <div
                      className="!flex !items-center !justify-between !p-3 hover:!bg-slate-50 !rounded-xl !cursor-pointer group !mb-1"
                      onClick={() => {
                        onSelectProduct(item);
                        setIsSearching(false);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar
                          shape="square"
                          size={40}
                          // ĐÃ SỬA: Thay imageUrl/image bằng productImage
                          src={item.productImage}
                          icon={<Package />}
                          className="!bg-slate-100 !text-slate-400"
                        />
                        <div className="flex flex-col">
                          <Text className="!font-bold !text-slate-700">
                            {item.name}
                          </Text>
                          <Text className="!text-[10px] !text-[#38c6c6] !font-bold">
                            SKU: {item.sku} • Stock: {item.quantity}
                          </Text>
                        </div>
                      </div>
                      <Plus
                        size={16}
                        className="text-[#38c6c6] opacity-0 group-hover:opacity-100"
                      />
                    </div>
                  )}
                />
              ) : (
                <Empty description="No products found" className="!py-4" />
              )}
            </Skeleton>
          </div>
        )}
      </div>

      {/* 2. DANH SÁCH SẢN PHẨM ĐÃ CHỌN */}
      <div className="mt-8">
        {selectedProducts.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center px-4 text-[10px] !uppercase !font-bold text-slate-400 !tracking-widest mb-1">
              <span className="flex-1">Product Details</span>
              <span className="w-48 text-center">Locations</span>
              <div className="w-10"></div>
            </div>

            <div className="max-h-[500px] overflow-y-auto pr-1 space-y-3">
              {selectedProducts.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all"
                >
                  {/* Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar
                      shape="square"
                      size={44}
                      // ĐÃ SỬA: Thay imageUrl/image bằng productImage
                      src={item.productImage}
                      icon={<Package />}
                      className="!bg-slate-50 !text-slate-400"
                    />
                    <div className="flex flex-col min-w-0">
                      <Text className="!font-bold !text-slate-800 !truncate !block !max-w-[180px]">
                        {item.name}
                      </Text>
                      <Tag
                        color="blue"
                        className="!m-0 !w-fit !border-none !bg-blue-50 !text-blue-600 !font-bold !text-[9px]"
                      >
                        TOTAL: {item.quantity}
                      </Tag>
                    </div>
                  </div>

                  {/* CỘT LOCATION GỌN GÀNG */}
                  <div className="w-48 flex justify-center">
                    {item.locations && item.locations.length > 0 ? (
                      <div className="flex flex-col items-center gap-1">
                        {/* Hiển thị vị trí đầu tiên */}
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                          <MapPin size={10} className="text-slate-400" />
                          <Text className="!text-[10px] !font-medium !text-slate-600">
                            {item.locations[0].binCode} (
                            {item.locations[0].quantity})
                          </Text>
                        </div>

                        {/* Nếu có nhiều hơn 1 vị trí, hiện Popover */}
                        {item.locations.length > 1 && (
                          <Popover
                            content={renderLocationList(item.locations)}
                            title={
                              <Text className="!text-xs !font-bold">
                                All Storage Bins
                              </Text>
                            }
                            trigger="click"
                            placement="bottom"
                          >
                            <Button
                              type="link"
                              size="small"
                              className="!text-[10px] !h-auto !p-0 !text-[#38c6c6] hover:!text-[#2ba4a4] !flex !items-center !gap-1"
                            >
                              +{item.locations.length - 1} more bins{" "}
                              <ChevronDown size={10} />
                            </Button>
                          </Popover>
                        )}
                      </div>
                    ) : (
                      <Text className="!text-[10px] !text-slate-300 !italic">
                        No bins
                      </Text>
                    )}
                  </div>

                  {/* Remove Button */}
                  <div className="w-10 flex justify-end">
                    <Button
                      type="text"
                      danger
                      icon={<Trash2 size={18} />}
                      onClick={() => onRemoveProduct(item.productId)}
                      className="hover:!bg-rose-50 !rounded-xl"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-32 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 text-slate-400">
            <Package size={32} className="mb-2 opacity-20" />
            <p className="text-xs">Search and add products to start counting</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductSearchSection;
