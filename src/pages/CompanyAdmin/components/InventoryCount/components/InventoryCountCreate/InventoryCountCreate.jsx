import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import api from "../../../../../../api/axios";

// Components
import DetailsHeader from "./components/DetailsHeader";
import ProductSearchSection from "./components/ProductSearchSection";
import DetailsSidebarInfo from "./components/DetailsSidebarInfo";
import DetailsCountConfig from "./components/DetailsCountConfig";

const InventoryCountCreate = () => {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // --- STATES ---
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Cập nhật cấu trúc countConfig để khớp Payload mới (storageZoneIds)
  const [countConfig, setCountConfig] = useState({
    name: "",
    description: "",
    plannedAt: null,
    scopeType: "All",
    storageZoneIds: [], // Chuyển từ scopeId sang mảng storageZoneIds
    assignedTo: null,
  });

  const userId = localStorage.getItem("userId");
  const warehouseId = localStorage.getItem("warehouseId");

  // ==========================================
  // 1. LOGIC FETCH DỮ LIỆU
  // ==========================================
  const fetchData = async () => {
    if (!userId || !warehouseId) return;
    setLoading(true);
    try {
      const [prodRes, usersRes] = await Promise.all([
        api.get(`/Products/get-all/${userId}`),
        api.get(`/Users/get-users-by-warehouse/${warehouseId}`),
      ]);

      setAllProducts(prodRes.data || []);
      setFilteredProducts(prodRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
      message.error("Failed to load resources");
    } finally {
      setLoading(false);
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

  // ==========================================
  // 2. LOGIC TÌM KIẾM & CHỌN SẢN PHẨM
  // ==========================================
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setFilteredProducts(
      allProducts.filter(
        (p) =>
          p.name?.toLowerCase().includes(value) ||
          p.sku?.toLowerCase().includes(value),
      ),
    );
    setIsSearching(true);
  };

  const handleSelectProduct = (product) => {
    const isExist = selectedProducts.find((p) => p.id === product.id);
    if (isExist) {
      message.info("This product is already in the list");
      return;
    }

    setSelectedProducts([
      ...selectedProducts,
      {
        ...product,
        productId: product.id,
        // Đã xóa locationId vì API Payload mới không yêu cầu trong items
      },
    ]);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const handleConfigChange = (key, value) => {
    setCountConfig((prev) => ({ ...prev, [key]: value }));
  };

  // ==========================================
  // 3. LOGIC GỬI API (PAYLOAD MỚI)
  // ==========================================
  const handleCreateCountTicket = async () => {
    // Validation
    if (!countConfig.name) return message.warning("Please enter a Count Name");
    if (!countConfig.assignedTo)
      return message.warning("Please assign a staff member");
    if (!countConfig.plannedAt)
      return message.warning("Please select a planned date");

    setIsSubmitting(true);
    try {
      // Mapping Payload theo cấu trúc mới
      const payload = {
        warehouseId: Number(warehouseId),
        performedBy: Number(userId),
        assignedTo: countConfig.assignedTo,
        name: countConfig.name,
        description: countConfig.description || "",
        scopeType: countConfig.scopeType,
        // Gửi mảng storageZoneIds (Nếu UI chọn 1 zone thì bọc vào mảng [id])
        storageZoneIds: Array.isArray(countConfig.storageZoneIds)
          ? countConfig.storageZoneIds
          : [countConfig.storageZoneIds],
        plannedAt: countConfig.plannedAt.toISOString(),
        items: selectedProducts.map((p) => ({
          productId: p.productId, // Chỉ còn productId
        })),
      };

      const res = await api.post("/InventoryCount/create-ticket", payload);

      if (res.status === 200 || res.status === 201) {
        message.success("Inventory Count created successfully!");
        const roleId = Number(localStorage.getItem("roleId"));
        const basePath = roleId === 2 ? "/company-admin" : "/manager";
        navigate(`${basePath}/inventory-count`);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      message.error(
        error.response?.data?.message || "Failed to create count ticket",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans">
      <DetailsHeader
        data={{ code: "New Count Session", status: "Draft" }}
        onApprove={handleCreateCountTicket}
        isApproving={isSubmitting}
      />

      <div className="flex justify-center gap-x-6 pb-20">
        {/* CỘT TRÁI: SEARCH & LIST */}
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
            // Trong mode này ProductSearchSection sẽ không hiển thị chọn Location cho từng dòng SP nữa
            isInventoryCountMode={true}
          />
        </div>

        {/* CỘT PHẢI: SIDEBAR CONFIG */}
        <div className="w-[30%] space-y-6">
          <DetailsSidebarInfo
            users={users}
            selectedStaffId={countConfig.assignedTo}
            onStaffChange={(val) => handleConfigChange("assignedTo", val)}
          />
          <DetailsCountConfig
            config={countConfig}
            onDataChange={handleConfigChange}
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryCountCreate;
