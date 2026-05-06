import React, { useState, useEffect, useRef } from "react";
import { Spin, message } from "antd";
import api from "../../../../../../api/axios";
import { useNavigate } from "react-router-dom";
import OutboundHeader from "./components/OutboundHeader/OutboundHeader";
import ProductSelectionOutbound from "./components/ProductSelectionOutbound/ProductSelectionOutbound";
import OutboundSidebar from "./components/OutboundSidebar/OutboundSidebar";

const OutboundRequestCreate = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // State quản lý dữ liệu Sidebar (Kho, Lý do)
  const [outboundData, setOutboundData] = useState({
    warehouseId: null,
    notes: "",
    destination: "",
  });

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const userId = localStorage.getItem("userId");
  const companyId = localStorage.getItem("companyId");

  // --- LẤY INVENTORY KHI WAREHOUSE ID THAY ĐỔI ---
  useEffect(() => {
    if (outboundData.warehouseId && companyId) {
      fetchInventory(outboundData.warehouseId);
    } else {
      // Nếu chưa chọn kho, reset list
      setProducts([]);
      setFilteredProducts([]);
    }
  }, [outboundData.warehouseId, companyId]);

  const fetchInventory = async (warehouseId) => {
    try {
      setLoading(true);
      const res = await api.get(
        `/company-warehouses/${companyId}/warehouses/${warehouseId}/inventory`,
      );

      // Map dữ liệu từ Inventory API về format chung của Component
      const inventoryItems = res.data.map((item) => ({
        id: item.productId,
        name: item.productName,
        sku: item.productSku,
        image: item.productImage,
        availableQuantity: item.availableQuantity, // Lưu lại số tồn để validate
      }));

      setProducts(inventoryItems);
      setFilteredProducts(inventoryItems);
    } catch (error) {
      console.error("Lỗi khi tải inventory:", error);
      message.error("Failed to load inventory for this warehouse");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý thay đổi dữ liệu từ Sidebar
  const handleSidebarChange = (key, value) => {
    setOutboundData((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Nếu người dùng đổi kho khác -> Xóa danh sách sản phẩm đã chọn để tránh sai lệch
    if (key === "warehouseId") {
      setSelectedProducts([]);
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setFilteredProducts(
      products.filter(
        (p) =>
          p.name?.toLowerCase().includes(value) ||
          p.sku?.toLowerCase().includes(value),
      ),
    );
    setIsSearching(true);
  };

  const handleSelectProduct = (product) => {
    if (product.availableQuantity <= 0) {
      message.warning("This product is out of stock in the selected warehouse");
      return;
    }

    if (selectedProducts.find((p) => p.id === product.id)) {
      message.info("Product already in list");
      return;
    }
    setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
  };

  const handleUpdateQuantity = (productId, qty) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          // Validate không cho xuất quá số lượng tồn kho
          const validQty =
            qty > p.availableQuantity ? p.availableQuantity : qty;
          if (qty > p.availableQuantity) {
            message.warning(
              `Maximum available quantity is ${p.availableQuantity}`,
            );
          }
          return { ...p, quantity: validQty };
        }
        return p;
      }),
    );
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  // --- GỬI API TẠO REQUEST ---
  const handleCreateRequest = async () => {
    if (selectedProducts.length === 0)
      return message.warning("Please select at least one product");
    if (!outboundData.warehouseId)
      return message.warning("Please select an origin warehouse");

    setIsSubmitting(true);
    try {
      const payload = {
        warehouseId: Number(outboundData.warehouseId),
        destination: outboundData.destination,
        requestedBy: Number(userId),
        items: selectedProducts.map((p) => ({
          productId: p.id,
          quantity: p.quantity,
        })),
        reason: outboundData.notes,
      };

      console.log("payload: ", payload);

      await api.post("InventoryOutbound/create-outbound-request", payload);
      message.success("Outbound request created successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Submit Error:", error);
      message.error(
        error.response?.data?.message || "Failed to create request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen">
      <OutboundHeader onCreate={handleCreateRequest} loading={isSubmitting} />

      <div className="flex justify-center gap-x-6 pb-20 mt-6">
        {/* Bên trái: Chọn sản phẩm */}
        <div className="w-[65%]">
          <ProductSelectionOutbound
            searchRef={searchRef}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            handleSearch={handleSearch}
            filteredProducts={filteredProducts}
            selectedProducts={selectedProducts}
            onSelectProduct={handleSelectProduct}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveProduct={handleRemoveProduct}
            loading={loading}
            warehouseSelected={!!outboundData.warehouseId}
          />
        </div>

        {/* Bên phải: Thông tin kho & Ghi chú */}
        <div className="w-[30%]">
          <OutboundSidebar
            outboundData={outboundData}
            onDataChange={handleSidebarChange}
          />
        </div>
      </div>
    </div>
  );
};

export default OutboundRequestCreate;
