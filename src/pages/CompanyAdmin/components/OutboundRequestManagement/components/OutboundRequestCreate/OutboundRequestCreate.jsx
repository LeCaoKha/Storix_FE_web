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
    destination: "", // <-- TRẢ VỀ RỖNG ĐỂ NGƯỜI DÙNG NHẬP
  });

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const userId = localStorage.getItem("userId");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/Products/get-all/${userId}`);
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
      message.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hàm xử lý thay đổi dữ liệu từ Sidebar
  const handleSidebarChange = (key, value) => {
    setOutboundData((prev) => ({
      ...prev,
      [key]: value,
    }));
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
    if (selectedProducts.find((p) => p.id === product.id)) {
      message.info("Product already in list");
      return;
    }
    setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
  };

  const handleUpdateQuantity = (productId, qty) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: qty } : p)),
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
      // Mapping đúng cấu trúc JSON bạn yêu cầu
      const payload = {
        warehouseId: Number(outboundData.warehouseId),
        destination: outboundData.destination,
        requestedBy: Number(userId),
        items: selectedProducts.map((p) => ({
          productId: p.id,
          quantity: p.quantity,
        })),
        reason: outboundData.notes, // Map notes -> reason
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
            // Nếu bạn muốn chỉnh giá ở Outbound, hãy truyền thêm onUpdatePrice ở đây
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
