import React, { useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import {
  Card,
  Avatar,
  Typography,
  Space,
  Empty,
  Modal,
  Form,
  Row,
  Col,
  Input,
  Button,
  message,
  Tooltip,
} from "antd";
import { Package, Search } from "lucide-react";

const { Text } = Typography;

const DetailsProductList = ({ items, onUpdatePrice }) => {
  const location = useLocation(); // Lấy thông tin URL hiện tại

  // Kiểm tra nếu URL chứa "/details/" thì là chế độ chỉ xem
  const isReadOnly = location.pathname.includes("/details/");

  // --- LOGIC TỪ PRODUCT SEARCH SECTION ---
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [priceForm] = Form.useForm();

  const originalPriceRaw = Form.useWatch("price", priceForm) || "0";
  const lineDiscountValueRaw = Form.useWatch("discountValue", priceForm) || "0";

  const calculateFinalPrice = () => {
    const price = Number(originalPriceRaw);
    const discount = Number(lineDiscountValueRaw);
    const finalPrice = price - (price * discount) / 100;
    return Math.max(0, Math.floor(finalPrice));
  };

  const handleOpenPriceModal = (product) => {
    // Nếu là ReadOnly thì không làm gì cả
    if (isReadOnly) return;

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
    message.success("Unit price updated successfully");
  };

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
          <div className="space-y-3">
            <div className="flex items-center px-4 text-[10px] !uppercase !font-bold text-slate-400 !tracking-widest mb-1">
              <span className="flex-1">Product</span>
              <div className="flex items-center text-right">
                <span className="w-24 text-center">Quantity</span>
                <span className="w-32 pr-4">Unit Price</span>
                <span className="w-32 pr-4 text-right">Total Price</span>
              </div>
            </div>

            {items.map((item) => {
              const hasDiscount = item.lineDiscount > 0;
              const finalUnitPrice = hasDiscount
                ? item.price - (item.price * item.lineDiscount) / 100
                : item.price;
              const totalPrice = finalUnitPrice * (item.expectedQuantity || 1);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar
                      shape="square"
                      size={48}
                      src={item.imageURL || item.imageUrl}
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
                    <div className="w-24 flex justify-center">
                      <div className="h-10 px-4 flex items-center justify-center rounded-lg bg-slate-50 text-slate-700 font-bold min-w-[40px]">
                        {item.expectedQuantity}
                      </div>
                    </div>

                    {/* CỘT ĐƠN GIÁ - Chặn click và bỏ style hover nếu là ReadOnly */}
                    <div
                      className={`w-32 text-right pr-4 ${!isReadOnly ? "cursor-pointer group" : ""}`}
                      onClick={() => handleOpenPriceModal(item)}
                    >
                      {hasDiscount ? (
                        <div className="flex flex-col items-end">
                          <Text
                            className={`!font-bold !text-[#38c6c6] !block !leading-tight ${!isReadOnly ? "group-hover:!underline" : ""}`}
                          >
                            {Math.floor(finalUnitPrice).toLocaleString()} ₫
                          </Text>
                          <Text className="!text-[11px] !text-slate-400 !line-through !block !leading-tight !opacity-70">
                            {item.price.toLocaleString()} ₫
                          </Text>
                        </div>
                      ) : (
                        <Text
                          className={`!font-bold !text-[#38c6c6] !block ${!isReadOnly ? "group-hover:!underline" : ""}`}
                        >
                          {(item.price || 0).toLocaleString()} ₫
                        </Text>
                      )}
                    </div>

                    <Text className="!w-32 !text-right !pr-4 !font-black !text-slate-700">
                      {Math.floor(totalPrice).toLocaleString()} ₫
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
            <Package size={40} className="mb-2 opacity-10" />
            <p className="font-medium text-sm">No product items found</p>
          </div>
        )}
      </div>

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
                  <span className="!font-bold !text-slate-600">Unit Price</span>
                }
                name="price"
              >
                <Input
                  className="!h-12 !rounded-xl !bg-slate-50 !border-none !font-bold"
                  suffix={<span className="!font-bold !text-slate-400">₫</span>}
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
                  suffix={<span className="!font-bold !text-slate-400">%</span>}
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
  );
};

export default DetailsProductList;
