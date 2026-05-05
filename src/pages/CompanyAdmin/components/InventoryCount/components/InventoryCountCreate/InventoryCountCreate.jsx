import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// ===== ADDED CODE START =====
import { message, Spin, Steps, Card, Select, Typography } from "antd";
// ===== ADDED CODE END =====
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

  // ===== ADDED CODE START =====
  const [currentStep, setCurrentStep] = useState(0);
  const [zones, setZones] = useState([]);
  const [selectedZoneIds, setSelectedZoneIds] = useState([]);
  const [productsByZones, setProductsByZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingProductsByZones, setLoadingProductsByZones] = useState(false);
  // ===== ADDED CODE END =====

  const [countConfig, setCountConfig] = useState({
    name: "",
    description: "",
    plannedAt: null,
    scopeType: "Product", // Mặc định là Product
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
      // ===== ADDED CODE START =====
      // REMOVED inventory fetch from initial load to respect Step 2 logic
      const usersRes = await api.get(
        `/Users/get-users-by-warehouse/${warehouseId}`,
      );
      setUsers(usersRes.data || []);
      // ===== ADDED CODE END =====
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

  // ===== ADDED CODE START =====
  // 1.1 FETCH INVENTORY (ALL / SPECIFIC PRODUCTS)
  const fetchInventory = async () => {
    setLoadingProducts(true);
    try {
      const inventoryRes = await api.get(
        `/company-warehouses/${companyId}/warehouses/${warehouseId}/inventory`,
      );

      const mappedProducts = (inventoryRes.data || []).map((item) => ({
        id: item.productId,
        productId: item.productId,
        name: item.productName,
        sku: item.productSku,
        quantity: item.quantity,
        productImage: item.productImage,
        locations: item.locations,
      }));

      setAllProducts(mappedProducts);
      setFilteredProducts(mappedProducts);

      if (countConfig.scopeType === "All") {
        setSelectedProducts([...mappedProducts]);
      }
    } catch (error) {
      message.error("Failed to load inventory");
    } finally {
      setLoadingProducts(false);
    }
  };

  // 1.2 FETCH ZONES (SPECIFIC LOCATION)
  const fetchZones = async () => {
    setLoadingZones(true);
    try {
      const res = await api.get(`/get-zone-ids/${warehouseId}/zones`);
      setZones(res.data || []);
    } catch (error) {
      message.error("Failed to load zones");
    } finally {
      setLoadingZones(false);
    }
  };

  // 1.3 FETCH PRODUCTS BY ZONES
  const handleZoneChange = async (zoneIds) => {
    setSelectedZoneIds(zoneIds);
    if (!zoneIds || zoneIds.length === 0) {
      setProductsByZones([]);
      setFilteredProducts([]);
      return;
    }

    setLoadingProductsByZones(true);
    try {
      const res = await api.post(`/Products/get-by-zones/${userId}`, zoneIds);
      const mappedProducts = (res.data || []).map((item) => ({
        id: item.id,
        productId: item.id,
        name: item.name,
        sku: item.sku || "N/A",
        quantity: item.quantity || 0, // Fallback if not returned by new API
        productImage: item.image,
        locations: [],
      }));

      setProductsByZones(mappedProducts);
      setFilteredProducts(mappedProducts);
    } catch (error) {
      message.error("Failed to load products for selected zones");
    } finally {
      setLoadingProductsByZones(false);
    }
  };

  // 1.4 HANDLE STEP NAVIGATION
  const handleNextStep = () => {
    if (!countConfig.name) return message.warning("Please enter a Count Name");
    if (!countConfig.assignedTo)
      return message.warning("Please assign a staff member");
    if (!countConfig.plannedAt)
      return message.warning("Please select a planned date");

    setCurrentStep(1);

    if (
      countConfig.scopeType === "All" ||
      countConfig.scopeType === "Product"
    ) {
      if (allProducts.length === 0) fetchInventory();
      else if (countConfig.scopeType === "All")
        setSelectedProducts([...allProducts]);
    } else if (countConfig.scopeType === "Location") {
      if (zones.length === 0) fetchZones();
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(0);
  };
  // ===== ADDED CODE END =====

  // ==========================================
  // 2. LOGIC TÌM KIẾM & CHỌN SẢN PHẨM
  // ==========================================
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();

    // ===== ADDED CODE START =====
    const sourceData =
      countConfig.scopeType === "Location" ? productsByZones : allProducts;
    // ===== ADDED CODE END =====

    setFilteredProducts(
      sourceData.filter(
        (p) =>
          p.name?.toLowerCase().includes(value) ||
          p.sku?.toLowerCase().includes(value),
      ),
    );
    setIsSearching(true);
  };

  const handleSelectProduct = (product) => {
    if (countConfig.scopeType === "All") {
      message.warning(
        "You cannot manually modify products when scope is 'All Warehouse'",
      );
      return;
    }

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
    if (countConfig.scopeType === "All") {
      message.warning(
        "You cannot manually remove products when scope is 'All Warehouse'",
      );
      return;
    }

    setSelectedProducts(
      selectedProducts.filter((p) => p.productId !== productId),
    );
  };

  // ===== UPDATE: XỬ LÝ KHI THAY ĐỔI CONFIG =====
  const handleConfigChange = (key, value) => {
    setCountConfig((prev) => ({ ...prev, [key]: value }));

    if (key === "scopeType") {
      if (value === "All") {
        if (allProducts.length > 0) {
          setSelectedProducts([...allProducts]);
          message.success("All products have been automatically selected.");
        }
      } else if (value === "Product" || value === "Location") {
        setSelectedProducts([]);

        // ===== ADDED CODE START =====
        if (value === "Location") {
          setSelectedZoneIds([]);
          setProductsByZones([]);
          setFilteredProducts([]);
        }
        // ===== ADDED CODE END =====

        message.info(
          `Switched to ${value === "Location" ? "Location" : "manual"} selection.`,
        );
      }
    }
  };

  // ==========================================
  // 3. LOGIC GỬI API (PAYLOAD CHUẨN)
  // ==========================================
  const handleCreateCountTicket = async () => {
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
      // ===== ADDED CODE START =====
      let finalZoneIds = [];
      if (countConfig.scopeType === "Location") {
        finalZoneIds = selectedZoneIds;
      } else {
        const allZoneIds = selectedProducts.flatMap((p) =>
          p.locations ? p.locations.map((loc) => loc.zoneId) : [],
        );
        finalZoneIds = [...new Set(allZoneIds)].map((id) => Number(id));
      }
      // ===== ADDED CODE END =====

      const formattedPlannedAt = countConfig.plannedAt
        .toISOString()
        .split("Z")[0];

      const payload = {
        warehouseId: Number(warehouseId),
        performedBy: Number(userId),
        assignedTo: Number(countConfig.assignedTo),
        name: countConfig.name,
        description: countConfig.description || "",
        scopeType: countConfig.scopeType,
        storageZoneIds: finalZoneIds, // ===== MODIFIED =====
        plannedAt: formattedPlannedAt,
        items: selectedProducts.map((p) => ({
          productId: Number(p.productId),
        })),
      };

      console.log("Final Payload to API:", payload);

      const res = await api.post("/InventoryCount/create-ticket", payload);

      if (res.status === 200 || res.status === 201) {
        message.success("Inventory Count created successfully!");
        const roleId = Number(localStorage.getItem("roleId"));
        const basePath = roleId === 2 ? "/company-admin" : "/manager";
        navigate(`${basePath}/inventory-count`);
      }
    } catch (error) {
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
        // ===== ADDED CODE START =====
        currentStep={currentStep}
        onNext={handleNextStep}
        onPrev={handlePrevStep}
        // ===== ADDED CODE END =====
      />

      <div className="flex flex-col items-center pb-20 w-full">
        {/* ===== ADDED CODE START ===== */}
        <div className="w-full max-w-3xl mb-12">
          <Steps
            current={currentStep}
            items={[
              { title: "Configuration & Scope" },
              { title: "Select Products" },
            ]}
          />
        </div>

        {currentStep === 0 && (
          <div className="w-[60%] flex flex-col gap-6">
            <DetailsCountConfig
              config={countConfig}
              onDataChange={handleConfigChange}
            />
            <DetailsSidebarInfo
              users={users}
              selectedStaffId={countConfig.assignedTo}
              onStaffChange={(val) => handleConfigChange("assignedTo", val)}
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className="w-[60%] space-y-6">
            {countConfig.scopeType === "Location" && (
              <Card className="!rounded-2xl !shadow-sm !border-slate-100">
                <Typography.Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest">
                  Select Storage Zones
                </Typography.Text>
                <Select
                  mode="multiple"
                  placeholder="Select zones to count..."
                  className="w-full"
                  loading={loadingZones}
                  value={selectedZoneIds}
                  onChange={handleZoneChange}
                  options={zones.map((z) => ({ label: z.code, value: z.id }))}
                />
              </Card>
            )}

            <div
              className={
                countConfig.scopeType === "All"
                  ? "opacity-60 pointer-events-none"
                  : ""
              }
            >
              <ProductSearchSection
                searchRef={searchRef}
                isSearching={isSearching}
                setIsSearching={setIsSearching}
                handleSearch={handleSearch}
                loadingProducts={
                  countConfig.scopeType === "Location"
                    ? loadingProductsByZones
                    : loadingProducts
                }
                filteredProducts={filteredProducts}
                selectedProducts={selectedProducts}
                onSelectProduct={handleSelectProduct}
                onRemoveProduct={handleRemoveProduct}
                isInventoryCountMode={true}
              />
            </div>
          </div>
        )}
        {/* ===== ADDED CODE END ===== */}
      </div>
    </div>
  );
};

export default InventoryCountCreate;
