import React from "react";
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
}) => {
  return (
    <div className="space-y-6">
      <Card
        title={
          <Space className="!text-slate-700 !uppercase !text-xs !tracking-wider !font-bold">
            <Search size={16} /> Product Selection
          </Space>
        }
        className="!rounded-2xl !shadow-sm !border-slate-100 !overflow-visible"
      >
        <div className="relative" ref={searchRef}>
          <Input
            placeholder="Search products to ship..."
            prefix={<Search size={20} className="text-slate-300 mr-2" />}
            className="!h-12 !rounded-xl !bg-slate-50 !border-none focus:!bg-white"
            onFocus={() => setIsSearching(true)}
            onChange={handleSearch}
          />

          {isSearching && (
            <div className="absolute top-14 left-0 w-full bg-white z-[100] rounded-2xl shadow-2xl border border-slate-100 max-h-60 overflow-y-auto p-2">
              <Skeleton loading={loading} active>
                {filteredProducts.length > 0 ? (
                  <List
                    dataSource={filteredProducts}
                    renderItem={(item) => (
                      <div
                        className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer"
                        onClick={() => {
                          onSelectProduct(item);
                          setIsSearching(false);
                        }}
                      >
                        <Space>
                          <Avatar
                            shape="square"
                            src={item.imageUrl}
                            icon={<Package />}
                          />
                          <div>
                            <Text className="block font-bold">{item.name}</Text>
                            <Text className="text-[10px] text-slate-400 uppercase font-bold">
                              SKU: {item.sku}
                            </Text>
                          </div>
                        </Space>
                      </div>
                    )}
                  />
                ) : (
                  <Empty className="py-4" />
                )}
              </Skeleton>
            </div>
          )}
        </div>

        {/* Selected List */}
        <div className="mt-8">
          {selectedProducts.length > 0 ? (
            <div className="space-y-3">
              <div className="flex px-4 text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                <span className="flex-1">Product</span>
                <span className="w-32 text-center">Quantity</span>
                <div className="w-10"></div>
              </div>

              {selectedProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#38c6c6]/20 transition-all"
                >
                  <Space className="flex-1">
                    <Avatar
                      shape="square"
                      size={48}
                      src={item.imageUrl}
                      icon={<Package />}
                      className="!bg-slate-50"
                    />
                    <div>
                      <Text className="!font-bold block">{item.name}</Text>
                      <Text className="text-xs text-slate-400 font-mono italic">
                        {item.sku}
                      </Text>
                    </div>
                  </Space>

                  <div className="w-32 flex justify-center">
                    <Input
                      type="number"
                      value={item.quantity}
                      className="!h-10 !rounded-lg !bg-slate-50 !border-none !w-20 !font-bold !text-center"
                      onChange={(e) =>
                        onUpdateQuantity(item.id, Number(e.target.value) || 1)
                      }
                    />
                  </div>

                  <Button
                    type="text"
                    danger
                    icon={<Trash2 size={18} />}
                    onClick={() => onRemoveProduct(item.id)}
                    className="!flex !items-center !justify-center hover:!bg-rose-50 !rounded-xl"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
              <Package size={32} className="mb-2 opacity-20" />
              <Text className="text-xs">No products selected for outbound</Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProductSelectionOutbound;
