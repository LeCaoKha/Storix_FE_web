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
  message,
  Button,
  Modal,
  Form,
  Row,
  Col,
} from "antd";
import { Search, Plus, Package, Trash2 } from "lucide-react";

const { Text } = Typography;

const ProductSearchSection = ({
  searchRef,
  isSearching,
  setIsSearching,
  handleSearch,
  loadingProducts,
  filteredProducts,
  onOpenCreateModal,
  selectedProducts,
  onSelectProduct,
  onRemoveProduct,
  onUpdateQuantity,
  onUpdatePrice,
  onDiscountChange,
}) => {
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [priceForm] = Form.useForm();

  // --- NEW: ORDER DISCOUNT STATES ---
  const [isOrderDiscountModalOpen, setIsOrderDiscountModalOpen] =
    useState(false);
  const [orderDiscountPercent, setOrderDiscountPercent] = useState(0);

  // Watchers to monitor Input values (string format) and calculate in real-time
  const originalPriceRaw = Form.useWatch("price", priceForm) || "0";
  const lineDiscountValueRaw = Form.useWatch("discountValue", priceForm) || "0";

  // Logic to calculate price after % discount
  const calculateFinalPrice = () => {
    const price = Number(originalPriceRaw);
    const discount = Number(lineDiscountValueRaw);

    // Calculate based on percentage
    const finalPrice = price - (price * discount) / 100;
    return Math.max(0, Math.floor(finalPrice));
  };

  const handleOpenPriceModal = (product) => {
    setEditingProduct(product);
    priceForm.setFieldsValue({
      price: String(product.originalPrice || 0),
      discountValue: String(product.lineDiscount || 0),
    });
    setIsPriceModalOpen(true);
  };

  const handleApplyPrice = () => {
    const finalPrice = calculateFinalPrice();
    onUpdatePrice(
      editingProduct.id,
      finalPrice,
      originalPriceRaw,
      lineDiscountValueRaw,
    );
    setIsPriceModalOpen(false);
    message.success("Unit price updated successfully");
  };

  // --- CALCULATIONS FOR SUMMARY CARD ---
  const totalAmount = selectedProducts.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0,
  );
  const totalLineItems = selectedProducts.length;

  // Calculate order discount amount based on percentage
  const orderDiscountAmount = (totalAmount * orderDiscountPercent) / 100;
  const finalPayable = totalAmount - orderDiscountAmount;

  // --- KEYBOARD SHORTCUT (F6) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F6") {
        e.preventDefault();
        setIsOrderDiscountModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div>
      <Card
        title={
          <Space className="!text-slate-700 !uppercase !text-xs !tracking-wider !font-bold !py-2">
            <Search size={16} /> Product Information
          </Space>
        }
        className="!rounded-2xl !shadow-sm !border-slate-100 !overflow-visible"
      >
        {/* 1. SEARCH BAR */}
        <div className="relative" ref={searchRef}>
          <Input
            placeholder="Search products by name or SKU..."
            prefix={<Search size={20} className="text-slate-300 mr-2" />}
            className="!h-12 !rounded-2xl !bg-slate-50 !border-none focus:!bg-white focus:!ring-2 focus:!ring-[#38c6c6]/20 !text-base !transition-all"
            onFocus={() => setIsSearching(true)}
            onChange={handleSearch}
          />

          {/* 2. SEARCH RESULTS DROPDOWN */}
          {isSearching && (
            <div className="!absolute !top-14 !left-0 !w-full !bg-white !z-[100] !rounded-2xl !shadow-2xl !border !border-slate-100 !max-h-[305px] !overflow-y-auto !p-2 !transition-all">
              <div
                onClick={() => {
                  setIsSearching(false);
                  onOpenCreateModal();
                }}
                className="!flex !items-center !gap-2 !p-3 !mb-2 !bg-[#38c6c6]/5 hover:!bg-[#38c6c6]/10 !text-[#38c6c6] !rounded-xl !cursor-pointer !transition-all !border !border-dashed !border-[#38c6c6]/30 !shrink-0"
              >
                <div className="!p-1 !bg-[#38c6c6] !text-white !rounded-full">
                  <Plus size={13} />
                </div>
                <Text className="!font-bold !text-[#38c6c6]">
                  Create New Product
                </Text>
              </div>

              <Skeleton loading={loadingProducts} active className="!p-4">
                {filteredProducts.length > 0 ? (
                  <List
                    dataSource={filteredProducts}
                    renderItem={(item) => (
                      <div
                        className="!flex !items-center !justify-between !p-3 hover:!bg-slate-50 !rounded-xl !cursor-pointer !group !mb-1 !border !border-transparent hover:!border-slate-100"
                        onClick={() => {
                          onSelectProduct(item);
                          setIsSearching(false);
                        }}
                      >
                        <div className="!flex !items-center !gap-4">
                          <Avatar
                            shape="square"
                            size={48}
                            icon={<Package size={24} />}
                            className="!bg-slate-100 !text-slate-400 !shrink-0"
                            src={item.image || item.imageUrl}
                          />
                          <div className="!flex !flex-col !min-w-0">
                            <Text className="!text-md !text-slate-800 !line-clamp-1 !font-bold">
                              {item.name}
                            </Text>
                            <Text className="!text-[10px] !text-slate-500 !uppercase !font-bold">
                              SKU: {item.sku || "N/A"}
                            </Text>
                          </div>
                        </div>
                        <Text className="!font-black !text-[#38c6c6]">
                          {item.price?.toLocaleString()} ₫
                        </Text>
                      </div>
                    )}
                  />
                ) : (
                  <Empty description="No products found" className="!py-5" />
                )}
              </Skeleton>
            </div>
          )}
        </div>

        {/* 3. SELECTED PRODUCTS LIST */}
        <div className="mt-8">
          {selectedProducts.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              <div className="flex items-center px-4 text-[10px] !uppercase !font-bold text-slate-400 !tracking-widest mb-1">
                <span className="flex-1">Product</span>
                <div className="flex items-center text-right">
                  <span className="w-24 text-center">Quantity</span>
                  <span className="w-32 pr-4">Unit Price</span>
                  <span className="w-32 pr-4">Total Price</span>
                  <div className="w-10"></div>
                </div>
              </div>

              {selectedProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:border-[#38c6c6]/20 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar
                      shape="square"
                      size={48}
                      src={item.image || item.imageUrl}
                      icon={<Package />}
                      className="!bg-slate-50 !text-slate-300 !shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <Text className="!font-bold !text-slate-800 !truncate">
                        {item.name}
                      </Text>
                      <Text className="!text-xs !text-slate-400 !font-mono !italic">
                        {item.sku}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-24 flex justify-center">
                      <Input
                        value={item.quantity || 1}
                        className="!h-10 !rounded-lg !bg-slate-50 !border-none !w-16 !font-bold !text-center"
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          onUpdateQuantity(item.id, Number(val) || 1);
                        }}
                      />
                    </div>

                    <div className="w-32 text-right pr-4">
                      <div
                        className="flex flex-col items-end cursor-pointer group"
                        onClick={() => handleOpenPriceModal(item)}
                      >
                        {item.originalPrice &&
                        item.price !== item.originalPrice ? (
                          <>
                            <Text className="!font-bold !text-[#38c6c6] !block !leading-tight">
                              {item.price.toLocaleString()} ₫
                            </Text>
                            <Text className="!text-[11px] !text-slate-400 !line-through !block !leading-tight !opacity-70">
                              {item.originalPrice.toLocaleString()} ₫
                            </Text>
                          </>
                        ) : (
                          <Text className="!font-bold !text-[#38c6c6] !block hover:!underline">
                            {(item.price || 0).toLocaleString()} ₫
                          </Text>
                        )}
                      </div>
                    </div>

                    <div className="w-32 text-right pr-4">
                      <Text className="!font-black !text-slate-700 !block">
                        {(
                          (item.price || 0) * (item.quantity || 1)
                        ).toLocaleString()}{" "}
                        ₫
                      </Text>
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
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
              <Package size={40} className="mb-2 opacity-10" />
              <p className="font-medium text-sm">
                Select products to start your inbound request
              </p>
            </div>
          )}
        </div>

        {/* 4. PRICE ADJUSTMENT MODAL */}
        <Modal
          title={
            <div className="!flex !items-center !gap-2 !pb-3 !border-b !border-slate-100">
              <span className="!text-lg !font-bold !text-slate-800">
                Adjust Product Price
              </span>
            </div>
          }
          open={isPriceModalOpen}
          onCancel={() => setIsPriceModalOpen(false)}
          centered
          footer={[
            <Button
              key="cancel"
              onClick={() => setIsPriceModalOpen(false)}
              className="!rounded-xl !h-11 !px-8 !font-bold !border-slate-200"
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleApplyPrice}
              className="!rounded-xl !h-11 !px-10 !bg-[#38c6c6] !border-none !font-bold shadow-lg shadow-[#38c6c6]/20"
            >
              Apply
            </Button>,
          ]}
          width={500}
          className="custom-price-modal"
        >
          <Form form={priceForm} layout="vertical" className="!mt-6">
            <Row gutter={20}>
              <Col span={16}>
                <Form.Item
                  label={
                    <span className="!font-bold !text-slate-600">
                      Unit Price
                    </span>
                  }
                  name="price"
                >
                  <Input
                    className="!h-12 !rounded-xl !bg-slate-50 !border-none !font-bold"
                    suffix={
                      <span className="!font-bold !text-slate-400">₫</span>
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      priceForm.setFieldsValue({ price: value });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="!font-bold !text-slate-600">
                      Discount (%)
                    </span>
                  }
                  name="discountValue"
                >
                  <Input
                    maxLength={3}
                    className="!h-12 !rounded-xl !bg-slate-50 !border-none !font-bold !text-center"
                    suffix={
                      <span className="!font-bold !text-slate-400">%</span>
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const formatted = Number(value) > 100 ? "100" : value;
                      priceForm.setFieldsValue({ discountValue: formatted });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <div className="!mt-2 !p-6 !bg-slate-50 !rounded-2xl !border !border-dashed !border-slate-200 !text-center">
              <p className="!text-[11px] !uppercase !font-black !text-slate-400 !tracking-widest !mb-2">
                Final Price After Discount
              </p>
              <Text className="!text-3xl !font-black !text-[#38c6c6]">
                {calculateFinalPrice().toLocaleString()} ₫
              </Text>
            </div>
          </Form>
        </Modal>

        <style jsx global>{`
          .custom-price-modal .ant-modal-content {
            border-radius: 24px !important;
            padding: 24px !important;
          }
        `}</style>
      </Card>

      {/* --- PAYMENT SUMMARY CARD --- */}
      <div className="mt-5 space-y-6">
        <Card className="!rounded-2xl !shadow-sm !border-slate-100">
          <div className="px-2">
            <Text className="!text-lg !font-bold !text-slate-800 !block !mb-6">
              Payment
            </Text>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <Text className="!text-slate-600 !w-40">Total Amount</Text>
                <Text className="!text-slate-400 !text-sm flex-1 text-center">
                  {totalLineItems} product{totalLineItems !== 1 ? "s" : ""}
                </Text>
                <Text className="!font-bold !text-slate-800 !w-40 text-right">
                  {totalAmount.toLocaleString()} ₫
                </Text>
              </div>

              <div className="flex items-center justify-between">
                <Text
                  className="!text-[#38c6c6] !font-medium !w-40 !cursor-pointer hover:!underline"
                  onClick={() => setIsOrderDiscountModalOpen(true)}
                >
                  Order Discount (F6)
                </Text>
                <Text className="!text-slate-300 flex-1 text-center">
                  ------
                </Text>
                <Text className="!font-bold !text-slate-800 !w-40 text-right">
                  {orderDiscountAmount.toLocaleString()} ₫
                </Text>
              </div>

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
        </Card>
      </div>

      {/* --- NEW: ORDER DISCOUNT MODAL --- */}
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
            onClick={() => {
              // Gửi giá trị về component cha (InboundRequestCreate)
              if (onDiscountChange) {
                onDiscountChange(orderDiscountPercent);
              }
              setIsOrderDiscountModalOpen(false);
              message.success(
                `Order discount of ${orderDiscountPercent}% applied`,
              );
            }}
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
              value={orderDiscountPercent}
              className="!h-12 !rounded-xl !bg-slate-50 !border-none !font-bold !text-lg"
              suffix={<span className="!font-bold !text-slate-400">%</span>}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                const formatted = Number(value) > 100 ? 100 : Number(value);
                setOrderDiscountPercent(formatted);
              }}
            />
          </div>

          <div className="!p-4 !bg-[#38c6c6]/5 !rounded-xl !border !border-dashed !border-[#38c6c6]/20 flex justify-between">
            <Text className="!text-slate-500 !font-medium">
              Reduced Amount:
            </Text>
            <Text className="!font-black !text-[#38c6c6]">
              {orderDiscountAmount.toLocaleString()} ₫
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductSearchSection;
