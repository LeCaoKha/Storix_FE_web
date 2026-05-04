import React, { useState, useEffect, useRef, useMemo } from "react";
import api from "../../../../../../api/axios";
import { message } from "antd";
import InboundHeader from "./components/InboundHeader/InboundHeader";
import ProductSearchSection from "./components/ProductSearchSection/ProductSearchSection";
import InboundSidebar from "./components/InboundSidebar/InboundSidebar";
import { useNavigate } from "react-router-dom";

const InboundRequestCreate = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Quản lý thông tin Sidebar và chiết khấu tổng
  const [orderDiscount, setOrderDiscount] = useState(0); // Chiết khấu % tổng đơn
  const [inboundData, setInboundData] = useState({
    supplierId: null,
    warehouseId: null,
    reference: "",
    notes: "",
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const userId = localStorage.getItem("userId");
  const companyId = localStorage.getItem("companyId");

  // ==========================================
  // 1. LOGIC TÍNH TOÁN THANH TOÁN (DERIVED STATE)
  // ==========================================
  const paymentSummary = useMemo(() => {
    // Tổng số lượng sản phẩm
    const totalQuantity = selectedProducts.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );

    // Tổng tiền trước khi giảm giá đơn hàng
    const totalAmount = selectedProducts.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0,
    );

    // Giá trị giảm giá từ % đơn hàng
    const discountValue = (totalAmount * orderDiscount) / 100;
    const amountToPay = totalAmount - discountValue;

    return {
      totalQuantity,
      totalAmount,
      orderDiscount,
      amountToPay,
      supplierId: inboundData.supplierId,
    };
  }, [selectedProducts, orderDiscount, inboundData.supplierId]);

  // ==========================================
  // 2. LOGIC QUẢN LÝ DANH SÁCH SẢN PHẨM CHỌN
  // ==========================================

  const handleSelectProduct = (product) => {
    const isExist = selectedProducts.find((p) => p.id === product.id);
    if (isExist) {
      message.info("This product is already in the list");
      return;
    }

    // Tìm giá gần nhất với hiện tại
    const priceEntries = product.productPrices || [];
    let latestPrice = 0;

    if (priceEntries.length > 0) {
      const sortedPrices = [...priceEntries].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );
      latestPrice = sortedPrices[0].price || 0;
    }

    setSelectedProducts([
      ...selectedProducts,
      {
        ...product,
        quantity: 1,
        lineDiscount: 0,
        price: latestPrice, // Giá thực tế sau điều chỉnh
        originalPrice: latestPrice, // Giá gốc để so sánh gạch ngang
      },
    ]);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const handleUpdateQuantity = (productId, quantity) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity } : p)),
    );
  };

  const handleUpdatePrice = (
    productId,
    newPrice,
    originalPriceInput,
    lineDiscount,
  ) => {
    setSelectedProducts((prevList) =>
      prevList.map((p) =>
        p.id === productId
          ? {
              ...p,
              price: newPrice,
              originalPrice:
                originalPriceInput !== undefined
                  ? originalPriceInput
                  : p.originalPrice,
              lineDiscount:
                lineDiscount !== undefined ? lineDiscount : p.lineDiscount,
            }
          : p,
      ),
    );
  };

  // ==========================================
  // 3. LOGIC FETCH DỮ LIỆU & TÌM KIẾM
  // ==========================================

  const handleSidebarChange = (key, value) => {
    if (key === "orderDiscount") {
      setOrderDiscount(value);
    } else {
      setInboundData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const fetchData = async () => {
    if (!userId) return;
    setLoadingProducts(true);
    try {
      const [prodRes, warehouseRes] = await Promise.all([
        api.get(`/Products/get-all/${userId}`),
        // Gọi API lấy danh sách kho của công ty
        api.get(`/company-warehouses/${companyId}/warehouses`),
      ]);

      setProducts(prodRes.data);
      setFilteredProducts(prodRes.data);

      console.log("warehouseRes ne: ", warehouseRes.data);

      // Tự động chọn kho đầu tiên nếu có dữ liệu trả về
      if (warehouseRes.data && warehouseRes.data.length > 0) {
        const localWarehouseId = localStorage.getItem("warehouseId");

        // Tìm kho khớp với local storage
        const matchedWarehouse = warehouseRes.data.find(
          (w) => String(w.id) === String(localWarehouseId),
        );

        // Nếu tìm thấy thì ưu tiên lấy nó, không thì mới lấy kho đầu tiên
        const targetWarehouseId = matchedWarehouse
          ? matchedWarehouse.id
          : warehouseRes.data[0].id;

        setInboundData((prev) => ({
          ...prev,
          warehouseId: targetWarehouseId,
        }));
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      message.error("Failed to load data");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setIsSearching(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleCreateInboundRequest = async (shouldApprove = false) => {
    const supplierId = inboundData.supplierId;
    const warehouseId = inboundData.warehouseId;
    const reqBy = Number(userId);
    const items = selectedProducts.map((p) => ({
      productId: p.id,
      expectedQuantity: p.quantity || 0,
      price: p.originalPrice || 0,
      lineDiscount: p.lineDiscount || 0,
    }));

    if (!supplierId) return message.warning("Please select a supplier");
    if (items.length === 0)
      return message.warning("Please add at least one product");

    setIsSubmitting(true);
    try {
      const createPayload = {
        warehouseId: warehouseId,
        supplierId: supplierId,
        requestedBy: reqBy,
        items: items,
        note: inboundData.notes || "",
        expectedArrivalDate: inboundData.expectedDate || null,
        orderDiscount: orderDiscount || 0,
      };

      const res = await api.post(
        "/InventoryInbound/create-inbound-request",
        createPayload,
      );

      if (res.status === 200 || res.status === 201) {
        const newId = res.data?.id || res.data;

        if (shouldApprove && newId) {
          try {
            const approvePayload = {
              approverId: reqBy,
              status: "Approved",
            };

            await api.put(
              `/InventoryInbound/update-inbound-request/${newId}/status`,
              approvePayload,
            );

            message.success(
              "Inbound request created and approved successfully!",
            );
          } catch (approveError) {
            console.error("Approve Error:", approveError);
            message.warning(
              "PO created successfully, but failed to auto-approve.",
            );
          }
        } else {
          message.success("Inbound request created successfully!");
        }

        navigate(-1);
      }
    } catch (error) {
      console.error("Submission Error:", error.response);
      message.error(
        error.response?.data?.message || "Failed to create inbound request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans">
      <InboundHeader
        onCreate={handleCreateInboundRequest}
        loading={isSubmitting}
      />
      <div className="flex justify-center gap-x-6 pb-20">
        {/* Cột trái: Tìm kiếm, Danh sách sản phẩm & Thanh toán */}
        <div className="w-[60%] space-y-6">
          <ProductSearchSection
            searchRef={searchRef}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            handleSearch={handleSearch}
            loadingProducts={loadingProducts}
            filteredProducts={filteredProducts}
            selectedProducts={selectedProducts}
            onSelectProduct={handleSelectProduct}
            onRemoveProduct={handleRemoveProduct}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdatePrice={handleUpdatePrice}
            onDiscountChange={(value) =>
              handleSidebarChange("orderDiscount", value)
            }
            paymentSummary={paymentSummary}
          />
        </div>

        {/* Cột phải: Sidebar (Supplier, Warehouse, Notes) */}
        <div className="w-[30%]">
          <InboundSidebar
            inboundData={inboundData}
            onDataChange={handleSidebarChange}
            summary={paymentSummary}
          />
        </div>
      </div>
    </div>
  );
};

export default InboundRequestCreate;
