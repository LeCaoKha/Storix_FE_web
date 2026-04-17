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

  const [countConfig, setCountConfig] = useState({
    name: "",
    description: "",
    plannedAt: null,
    scopeType: "Product", // Mặc định là Product vì đang chọn theo danh sách SP
    storageZoneIds: [],
    assignedTo: null,
  });

  const userId = localStorage.getItem("userId");
  const warehouseId = localStorage.getItem("warehouseId");
  const companyId = localStorage.getItem("companyId");

  // ==========================================
  // 1. LOGIC FETCH DỮ LIỆU
  // ==========================================
  const fetchData = async () => {
    if (!userId || !warehouseId || !companyId) {
      message.error("Missing credentials in local storage");
      return;
    }
    setLoading(true);
    try {
      const [inventoryRes, usersRes] = await Promise.all([
        api.get(
          `/company-warehouses/${companyId}/warehouses/${warehouseId}/inventory`,
        ),
        api.get(`/Users/get-users-by-warehouse/${warehouseId}`),
      ]);

      const mappedProducts = (inventoryRes.data || []).map((item) => ({
        id: item.productId,
        productId: item.productId,
        name: item.productName,
        sku: item.productSku,
        quantity: item.quantity,
        locations: item.locations, // Quan trọng: Giữ lại thông tin locations để lấy zoneId
      }));

      setAllProducts(mappedProducts);
      setFilteredProducts(mappedProducts);
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
    const isExist = selectedProducts.find(
      (p) => p.productId === product.productId,
    );
    if (isExist) {
      message.info("This product is already in the list");
      return;
    }
    setSelectedProducts([...selectedProducts, product]);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(
      selectedProducts.filter((p) => p.productId !== productId),
    );
  };

  const handleConfigChange = (key, value) => {
    setCountConfig((prev) => ({ ...prev, [key]: value }));
  };

  // ==========================================
  // 3. LOGIC GỬI API (PAYLOAD CHUẨN)
  // ==========================================
  const handleCreateCountTicket = async () => {
    // 1. Kiểm tra tính hợp lệ của dữ liệu (Validation)
    if (!countConfig.name) {
      return message.warning("Please enter a Count Name");
    }
    if (!countConfig.assignedTo) {
      return message.warning("Please assign a staff member");
    }
    if (!countConfig.plannedAt) {
      return message.warning("Please select a planned date");
    }
    if (selectedProducts.length === 0) {
      return message.warning("Please select at least one product to count");
    }

    setIsSubmitting(true);

    try {
      // 2. Logic trích xuất Storage Zone IDs duy nhất
      // flatMap sẽ duyệt qua các sản phẩm, lấy mảng locations và trải phẳng tất cả zoneId ra 1 mảng
      const allZoneIds = selectedProducts.flatMap((p) =>
        p.locations ? p.locations.map((loc) => loc.zoneId) : [],
      );

      // Sử dụng Set để loại bỏ các zoneId trùng lặp và chuyển về mảng số nguyên
      const uniqueZoneIds = [...new Set(allZoneIds)].map((id) => Number(id));

      // 3. Định dạng lại thời gian (Xóa chữ Z ở cuối chuỗi ISO)
      // Chuyển "2026-04-17T09:19:09.654Z" thành "2026-04-17T09:19:09.654"
      const formattedPlannedAt = countConfig.plannedAt
        .toISOString()
        .split("Z")[0];

      // 4. Xây dựng Payload đúng cấu trúc JSON yêu cầu
      const payload = {
        warehouseId: Number(warehouseId),
        performedBy: Number(userId),
        assignedTo: Number(countConfig.assignedTo),
        name: countConfig.name,
        description: countConfig.description || "",
        scopeType: countConfig.scopeType,
        storageZoneIds: uniqueZoneIds, // Mảng ID của các khu vực chứa sản phẩm
        plannedAt: formattedPlannedAt, // Thời gian đã bỏ ký tự Z
        items: selectedProducts.map((p) => ({
          productId: Number(p.productId), // Chỉ gửi productId theo yêu cầu
        })),
      };

      // Log payload để kiểm tra lần cuối trước khi gửi
      console.log("Final Payload to API:", payload);

      // 5. Gọi API POST
      const res = await api.post("/InventoryCount/create-ticket", payload);

      // 6. Xử lý phản hồi từ server
      if (res.status === 200 || res.status === 201) {
        message.success("Inventory Count created successfully!");

        // Chuyển hướng người dùng sau khi thành công
        const roleId = Number(localStorage.getItem("roleId"));
        const basePath = roleId === 2 ? "/company-admin" : "/manager";
        navigate(`${basePath}/inventory-count`);
      }
    } catch (error) {
      // Xử lý lỗi (Lỗi 400, 500, v.v.)
      console.error("Submission Error:", error);
      const errorMsg =
        error.response?.data?.message ||
        "An error occurred while creating the count ticket.";
      message.error(errorMsg);
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
            isInventoryCountMode={true}
          />
        </div>

        <div className="w-[30%] space-y-6">
          <div>
            <DetailsSidebarInfo
              users={users}
              selectedStaffId={countConfig.assignedTo}
              onStaffChange={(val) => handleConfigChange("assignedTo", val)}
            />
          </div>
          <div>
            <DetailsCountConfig
              config={countConfig}
              onDataChange={handleConfigChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryCountCreate;
