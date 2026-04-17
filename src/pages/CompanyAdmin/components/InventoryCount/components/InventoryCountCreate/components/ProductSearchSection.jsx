import React, { useState, useEffect } from "react";
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
  Select,
} from "antd";
import { Search, Package, Trash2, MapPin, Plus } from "lucide-react";
import api from "../../../../../../../api/axios";

const { Text } = Typography;
const { Option } = Select;

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
  onUpdateLocation,
}) => {
  const [locations, setLocations] = useState([]);
  const warehouseId = localStorage.getItem("warehouseId");

  console.log("locations: ", locations);

  // Fetch danh sách Bin/Location của kho hiện tại
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get(`/Locations/by-warehouse/${warehouseId}`);
        setLocations(res.data || []);
      } catch (error) {
        // Fallback dữ liệu mẫu nếu API lỗi
        setLocations([{ id: 0, binCode: "General Area" }]);
      }
    };
    if (warehouseId) fetchLocations();
  }, [warehouseId]);

  return (
    <Card
      title={
        <Space className="!text-slate-700 !uppercase !text-xs !tracking-wider !font-bold !py-2">
          <Package size={16} className="text-[#38c6c6]" /> Products to Count
        </Space>
      }
      className="!rounded-2xl !shadow-sm !border-slate-100 !overflow-visible"
    >
      {/* 1. THANH TÌM KIẾM (SEARCH BAR) */}
      <div className="relative" ref={searchRef}>
        <Input
          placeholder="Search products by name or SKU to add..."
          prefix={<Search size={20} className="text-slate-300 mr-2" />}
          className="!h-12 !rounded-2xl !bg-slate-50 !border-none focus:!bg-white focus:!ring-2 focus:!ring-[#38c6c6]/20 transition-all !text-base"
          onFocus={() => setIsSearching(true)}
          onChange={handleSearch}
        />

        {/* 2. KẾT QUẢ TÌM KIẾM (DROPDOWN) */}
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
                          src={item.imageUrl || item.image}
                          icon={<Package />}
                          className="!bg-slate-100 !text-slate-400"
                        />
                        <div className="flex flex-col">
                          <Text className="!font-bold !text-slate-700">
                            {item.name}
                          </Text>
                          <Text className="!text-[10px] !text-slate-400 !uppercase !font-bold">
                            SKU: {item.sku || "N/A"}
                          </Text>
                        </div>
                      </div>
                      <Plus
                        size={16}
                        className="text-[#38c6c6] opacity-0 group-hover:opacity-100 transition-opacity"
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

      {/* 3. DANH SÁCH SẢN PHẨM ĐÃ CHỌN (SELECTED LIST) */}
      <div className="mt-8">
        {selectedProducts.length > 0 ? (
          <div className="space-y-3">
            {/* Header của bảng danh sách */}
            <div className="flex items-center px-4 text-[10px] !uppercase !font-bold text-slate-400 !tracking-widest mb-1">
              <span className="flex-1">Product Details</span>
              <span className="w-48">Count Location</span>
              <div className="w-10"></div>
            </div>

            {/* List items */}
            <div className="max-h-[400px] overflow-y-auto pr-1 space-y-3">
              {selectedProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:border-[#38c6c6]/20 transition-all"
                >
                  {/* Thông tin sản phẩm */}
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar
                      shape="square"
                      size={48}
                      src={item.imageUrl || item.image}
                      icon={<Package />}
                      className="!bg-slate-50 !text-slate-300"
                    />
                    <div className="flex flex-col min-w-0">
                      <Tooltip title={item.name} placement="topLeft">
                        <Text className="!font-bold !text-slate-800 !truncate !block !max-w-[250px]">
                          {item.name}
                        </Text>
                      </Tooltip>
                      <Text className="!text-xs !text-slate-400 !font-mono !italic">
                        {item.sku}
                      </Text>
                    </div>
                  </div>

                  {/* Chọn Vị trí kiểm kê (Location/Bin) */}
                  <div className="flex items-center gap-4">
                    <div className="w-48">
                      <Select
                        placeholder="Select Bin"
                        className="w-full !h-10 custom-select-small"
                        value={item.locationId || 0}
                        onChange={(val) => onUpdateLocation(item.id, val)}
                        suffixIcon={
                          <MapPin size={14} className="text-slate-400" />
                        }
                        variant="borderless"
                      >
                        {locations.map((loc) => (
                          <Option key={loc.id} value={loc.id}>
                            {loc.binCode}
                          </Option>
                        ))}
                      </Select>
                    </div>

                    {/* Nút xóa khỏi danh sách */}
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
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-40 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300 bg-slate-50/50">
            <Package size={40} className="mb-2 opacity-10" />
            <p className="font-medium text-sm text-slate-400">
              Search and add products to start counting
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-select-small .ant-select-selector {
          height: 40px !important;
          border-radius: 10px !important;
          background-color: #f8fafc !important;
          border: none !important;
          display: flex;
          align-items: center;
        }
        .custom-select-small.ant-select-focused .ant-select-selector {
          background-color: white !important;
          box-shadow: 0 0 0 2px rgba(56, 198, 198, 0.1) !important;
        }
      `}</style>
    </Card>
  );
};

export default ProductSearchSection;
