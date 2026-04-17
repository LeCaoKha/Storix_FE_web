import React, { useState, useEffect } from "react";
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
  Modal,
  Form,
  Row,
  Col,
  message,
  Tooltip, // Thêm Tooltip từ antd
} from "antd";
import { Search, Package, Trash2, Plus } from "lucide-react";

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
  onUpdatePrice,
  onOpenCreateModal,
  loading,
}) => {
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [priceForm] = Form.useForm();

  // --- FIX: Logic click outside để đóng dropdown ---
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

  const originalPriceRaw = Form.useWatch("price", priceForm) || "0";
  const lineDiscountValueRaw = Form.useWatch("discountValue", priceForm) || "0";

  const calculateFinalPrice = () => {
    const price = Number(originalPriceRaw);
    const discount = Number(lineDiscountValueRaw);
    const finalPrice = price - (price * discount) / 100;
    return Math.max(0, Math.floor(finalPrice));
  };

  const handleOpenPriceModal = (product) => {
    setEditingProduct(product);
    priceForm.setFieldsValue({
      price: String(product.price || 0),
      discountValue: String(product.lineDiscount || 0),
    });
    setIsPriceModalOpen(true);
  };

  const handleApplyPrice = () => {
    const finalPrice = calculateFinalPrice();
    if (onUpdatePrice) {
      onUpdatePrice(
        editingProduct.id,
        finalPrice,
        originalPriceRaw,
        lineDiscountValueRaw,
      );
    }
    setIsPriceModalOpen(false);
    message.success("Unit price updated");
  };

  return (
    <div className="space-y-6">
      <Card
        title={
          <Space className="!text-slate-700 !uppercase !text-xs !tracking-wider !font-bold !py-2">
            <Search size={16} className="text-[#38c6c6]" /> Product Selection
          </Space>
        }
        className="!rounded-2xl !shadow-sm !border-slate-100 !overflow-visible"
      >
        {/* 1. THANH TÌM KIẾM */}
        <div className="relative" ref={searchRef}>
          <Input
            placeholder="Search products to ship (Name or SKU)..."
            prefix={<Search size={20} className="text-slate-300 mr-2" />}
            className="!h-12 !rounded-2xl !bg-slate-50 !border-none focus:!bg-white focus:!ring-2 focus:!ring-[#38c6c6]/20 !transition-all"
            onFocus={() => setIsSearching(true)}
            onChange={handleSearch}
          />

          {/* 2. DROPDOWN KẾT QUẢ TÌM KIẾM */}
          {isSearching && (
            <div className="absolute top-14 left-0 w-full bg-white z-[100] rounded-2xl shadow-2xl border border-slate-100 max-h-72 overflow-y-auto p-2">
              <div
                onClick={() => {
                  setIsSearching(false);
                  if (onOpenCreateModal) onOpenCreateModal();
                }}
                className="flex items-center gap-2 p-3 mb-2 bg-[#38c6c6]/5 hover:bg-[#38c6c6]/10 text-[#38c6c6] rounded-xl cursor-pointer transition-all border border-dashed border-[#38c6c6]/30"
              >
                <Plus size={16} />
                <Text className="!font-bold !text-[#38c6c6]">
                  Add Custom Product
                </Text>
              </div>

              <Skeleton loading={loading} active className="p-2">
                {filteredProducts.length > 0 ? (
                  <List
                    dataSource={filteredProducts}
                    renderItem={(item) => (
                      <div
                        className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-all group border border-transparent hover:border-slate-100 mb-1"
                        onClick={() => {
                          onSelectProduct(item);
                          setIsSearching(false);
                        }}
                      >
                        <Space size={12}>
                          <Avatar
                            shape="square"
                            size={40}
                            src={item.imageUrl || item.image}
                            icon={<Package />}
                            className="!bg-slate-100 !text-slate-400"
                          />
                          <div className="flex flex-col">
                            <Tooltip title={item.name} mouseEnterDelay={0.5}>
                              <Text className="block font-bold text-slate-800">
                                {item.name.length > 20
                                  ? `${item.name.substring(0, 20)}...`
                                  : item.name}
                              </Text>
                            </Tooltip>
                            <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                              SKU: {item.sku}
                            </Text>
                          </div>
                        </Space>
                        <Text className="!font-black !text-[#38c6c6]">
                          {(item.price || 0).toLocaleString()} ₫
                        </Text>
                      </div>
                    )}
                  />
                ) : (
                  <Empty className="py-4" description="No products found" />
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
                <span className="w-32 text-right pr-4">Unit Price</span>
                <span className="w-32 text-right pr-4">Total</span>
                <div className="w-10"></div>
              </div>

              {selectedProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:border-[#38c6c6]/20 transition-all"
                >
                  <Space className="flex-1 min-w-0" size={12}>
                    <Avatar
                      shape="square"
                      size={48}
                      src={item.imageUrl || item.image}
                      icon={<Package />}
                      className="!bg-slate-50 !text-slate-300"
                    />
                    <div className="flex flex-col min-w-0">
                      <Tooltip title={item.name} placement="topLeft">
                        <Text className="!font-bold block text-slate-800 truncate">
                          {item.name.length > 20
                            ? `${item.name.substring(0, 20)}...`
                            : item.name}
                        </Text>
                      </Tooltip>
                      <Text className="text-xs text-slate-400 font-mono italic">
                        {item.sku}
                      </Text>
                    </div>
                  </Space>

                  <div className="w-24 flex justify-center">
                    <Input
                      type="number"
                      value={item.quantity}
                      className="!h-10 !rounded-lg !bg-slate-50 !border-none !w-16 !font-bold !text-center"
                      onChange={(e) =>
                        onUpdateQuantity(item.id, Number(e.target.value) || 1)
                      }
                    />
                  </div>

                  <div className="w-32 text-right pr-4">
                    <div
                      className="cursor-pointer"
                      onClick={() => handleOpenPriceModal(item)}
                    >
                      <Text className="!font-bold !text-[#38c6c6] block hover:underline">
                        {(item.price || 0).toLocaleString()} ₫
                      </Text>
                    </div>
                  </div>

                  <div className="w-32 text-right pr-4">
                    <Text className="!font-black !text-slate-700">
                      {(
                        (item.price || 0) * (item.quantity || 1)
                      ).toLocaleString()}{" "}
                      ₫
                    </Text>
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

      {/* 4. MODAL ĐIỀU CHỈNH GIÁ SẢN PHẨM */}
      <Modal
        title={<span className="font-bold text-lg">Adjust Item Price</span>}
        open={isPriceModalOpen}
        onCancel={() => setIsPriceModalOpen(false)}
        centered
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsPriceModalOpen(false)}
            className="!rounded-xl"
          >
            Cancel
          </Button>,
          <Button
            key="apply"
            type="primary"
            onClick={handleApplyPrice}
            className="!bg-[#38c6c6] !border-none !rounded-xl !font-bold"
          >
            Apply
          </Button>,
        ]}
      >
        <Form form={priceForm} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                label={<span className="font-bold">Unit Price</span>}
                name="price"
              >
                <Input
                  className="!h-11 !rounded-xl !bg-slate-50 !border-none !font-bold"
                  suffix="₫"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={<span className="font-bold">Disc %</span>}
                name="discountValue"
              >
                <Input
                  className="!h-11 !rounded-xl !bg-slate-50 !border-none !font-bold !text-center"
                  suffix="%"
                />
              </Form.Item>
            </Col>
          </Row>
          <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">
              Final Price
            </p>
            <Text className="text-3xl font-black text-[#38c6c6]">
              {calculateFinalPrice().toLocaleString()} ₫
            </Text>
          </div>
        </Form>
      </Modal>

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
