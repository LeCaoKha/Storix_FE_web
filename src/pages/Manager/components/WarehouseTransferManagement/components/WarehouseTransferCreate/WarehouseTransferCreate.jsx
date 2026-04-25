import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Spin,
  message,
  Card,
  Typography,
  Input,
  Button,
  Space,
  List,
  Avatar,
  Tooltip,
  Select,
} from "antd";
import {
  ArrowLeft,
  Save,
  X,
  Search,
  Package,
  Trash2,
  MapPin,
  ArrowRight,
  Users, // Bổ sung icon Users
} from "lucide-react";
import api from "../../../../../../api/axios";

const { Title, Text } = Typography;
const { Option } = Select;

const WarehouseTransferCreate = () => {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const companyId = localStorage.getItem("companyId");
  // Lấy warehouseId hiện tại của user từ localStorage
  const currentWarehouseId = localStorage.getItem("warehouseId");

  // ==========================================
  // 1. STATES
  // ==========================================
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // States: Form Setup
  const [warehouses, setWarehouses] = useState([]);
  const [sourceId, setSourceId] = useState(Number(currentWarehouseId) || null);
  const [destId, setDestId] = useState(null);

  // States: Staff
  const [sourceStaffList, setSourceStaffList] = useState([]);
  const [originWarehouseStaffId, setOriginWarehouseStaffId] = useState(null);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // States: Products
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // ==========================================
  // 2. FETCH DATA
  // ==========================================
  // Lấy danh sách kho và danh sách nhân viên
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setLoadingStaff(true);
      try {
        const [warehouseRes, staffRes] = await Promise.all([
          api.get(`/company-warehouses/${companyId}/warehouses`),
          api.get(`/Users/get-users-by-warehouse/${currentWarehouseId}`),
        ]);

        setWarehouses(warehouseRes.data || []);

        // Lọc danh sách nhân viên chỉ lấy Role Staff (Role ID = 4)
        const staffOnly = (staffRes.data || []).filter((u) => u.roleId === 4);
        setSourceStaffList(staffOnly);
      } catch (error) {
        message.error("Failed to load initial data");
      } finally {
        setLoading(false);
        setLoadingStaff(false);
      }
    };
    if (companyId && currentWarehouseId) {
      fetchInitialData();
    }
  }, [companyId, currentWarehouseId]);

  // Lấy danh sách sản phẩm (tồn kho) dựa trên trạng thái chọn kho
  useEffect(() => {
    const fetchInventory = async () => {
      setLoadingProducts(true);
      try {
        const endpoint = sourceId
          ? `/company-warehouses/${companyId}/warehouses/${sourceId}/inventory`
          : `/inventory`;

        const res = await api.get(endpoint);
        const mappedProducts = (res.data || []).map((item) => ({
          id: item.productId || item.id,
          name: item.productName || item.name,
          sku: item.productSku || item.sku,
          availableQuantity: sourceId
            ? item.availableQuantity || item.quantity || 0
            : "N/A",
          image: item.productImage || item.image,
        }));

        setAllProducts(mappedProducts);
        setFilteredProducts(mappedProducts);

        setSelectedProducts((prev) =>
          prev.map((p) => {
            const foundInStock = mappedProducts.find((inv) => inv.id === p.id);
            const realStock = foundInStock ? foundInStock.availableQuantity : 0;

            let adjustedQty = p.transferQty;
            if (sourceId && realStock !== "N/A") {
              if (realStock > 0 && p.transferQty > realStock)
                adjustedQty = realStock;
              else if (realStock === 0) adjustedQty = 0;
            }

            return {
              ...p,
              availableQuantity: sourceId ? realStock : "N/A",
              transferQty: adjustedQty,
            };
          }),
        );
      } catch (error) {
        console.warn("Notice: Inventory fallback fetching", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchInventory();
  }, [sourceId, companyId]);

  // Xử lý click ra ngoài thanh search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearching(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==========================================
  // 3. PRODUCT HANDLERS
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
      return message.info("This product is already in the list");
    }
    if (product.availableQuantity !== "N/A" && product.availableQuantity <= 0) {
      return message.warning("Product is out of stock in source warehouse");
    }

    setSelectedProducts([...selectedProducts, { ...product, transferQty: 1 }]);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const handleUpdateQuantity = (productId, newQty) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          let validQty = newQty;
          if (p.availableQuantity !== "N/A" && newQty > p.availableQuantity) {
            validQty = p.availableQuantity;
            message.warning("Quantity cannot exceed available stock");
          }
          return { ...p, transferQty: validQty };
        }
        return p;
      }),
    );
  };

  // ==========================================
  // 4. SUBMIT HANDLER
  // ==========================================
  const handleCreateTransfer = async () => {
    if (!sourceId || !destId) {
      return message.warning("Please select Source and Destination warehouses");
    }
    if (sourceId === destId) {
      return message.warning("Source and Destination cannot be the same");
    }
    if (!originWarehouseStaffId) {
      return message.warning(
        "Please assign a staff member from the source warehouse",
      );
    }
    if (selectedProducts.length === 0) {
      return message.warning("Please add at least one product");
    }

    const hasInvalidStock = selectedProducts.some(
      (p) =>
        p.availableQuantity !== "N/A" &&
        (p.availableQuantity <= 0 || p.transferQty <= 0),
    );
    if (hasInvalidStock) {
      return message.error(
        "Please remove out-of-stock items or adjust transfer quantity",
      );
    }

    setIsSubmitting(true);
    try {
      const payload = {
        sourceWarehouseId: Number(sourceId),
        destinationWarehouseId: Number(destId),
        originWarehouseStaffId: Number(originWarehouseStaffId),
        items: selectedProducts.map((p) => ({
          productId: Number(p.id),
          quantity: Number(p.transferQty || 1),
        })),
        submitAfterCreate: true,
      };

      const res = await api.post("/warehouse-transfers", payload);

      if (res.status === 200 || res.status === 201) {
        message.success(
          "Warehouse transfer created and submitted successfully!",
        );
        navigate(-1);
      }
    } catch (error) {
      console.error("Create Transfer Error:", error);
      message.error(
        error.response?.data?.message || "Failed to create transfer",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lọc danh sách kho đích: Loại bỏ kho nguồn
  const destinationWarehouses = warehouses.filter(
    (wh) => wh.id !== Number(sourceId),
  );

  // Tính toán tổng cho Summary
  const totalItems = selectedProducts.length;
  const totalQuantity = selectedProducts.reduce(
    (sum, item) => sum + (item.transferQty || 0),
    0,
  );

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-[#F8FAFC]">
        <Spin size="large" tip="Loading data..." />
      </div>
    );
  }

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans pb-20">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeft size={24} />}
            onClick={() => navigate(-1)}
            className="!flex !items-center !justify-center !h-12 !w-12 !rounded-full hover:!bg-white hover:!shadow-md transition-all text-slate-600"
          />
          <div>
            <Title
              level={2}
              className="!mb-0 !font-extrabold !tracking-tight !text-slate-800"
            >
              Create Warehouse Transfer
            </Title>
            <Text className="text-slate-400 font-medium">
              Create and submit a new inventory transfer
            </Text>
          </div>
        </div>
        <Space size="middle">
          <Button
            type="text"
            icon={<X size={18} />}
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="!flex !items-center !gap-2 !h-11 !px-5 !font-bold !bg-rose-500 !text-white hover:!bg-rose-600 !rounded-xl transition-all"
          >
            Cancel
          </Button>
          <Button
            icon={<Save size={18} />}
            onClick={handleCreateTransfer}
            loading={isSubmitting}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-white !bg-[#39c6c6] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20 hover:!bg-[#2eb1b1]"
          >
            Create Transfer
          </Button>
        </Space>
      </div>

      <div className="flex justify-center gap-x-6">
        {/* CỘT TRÁI (60%): SẢN PHẨM */}
        <div className="w-[60%] space-y-6">
          <Card
            title={
              <Space className="!text-slate-700 !uppercase !text-xs !tracking-wider !font-bold !py-2">
                <Search size={16} className="text-[#38c6c6]" /> Product
                Selection
              </Space>
            }
            className="!rounded-2xl !shadow-sm !border-slate-100 !overflow-visible"
          >
            {/* SEARCH BAR */}
            <div className="relative" ref={searchRef}>
              <Input
                placeholder={
                  sourceId
                    ? "Search products by name or SKU..."
                    : "Please select Source Warehouse first..."
                }
                disabled={!sourceId}
                prefix={<Search size={20} className="text-slate-300 mr-2" />}
                className="!h-12 !rounded-2xl !bg-slate-50 !border-none focus:!bg-white focus:!ring-2 focus:!ring-[#38c6c6]/20 !text-base !transition-all"
                onFocus={() => setIsSearching(true)}
                onChange={handleSearch}
              />

              {/* SEARCH RESULTS DROPDOWN */}
              {isSearching && sourceId && (
                <div className="!absolute !top-14 !left-0 !w-full !bg-white !z-[100] !rounded-2xl !shadow-2xl !border !border-slate-100 !max-h-[305px] !overflow-y-auto !p-2 !transition-all">
                  <Spin spinning={loadingProducts}>
                    {filteredProducts.length > 0 ? (
                      <List
                        dataSource={filteredProducts}
                        renderItem={(item) => (
                          <div
                            className="!flex !items-center !justify-between !p-3 hover:!bg-slate-50 !rounded-xl !cursor-pointer !group !mb-1 !border !border-transparent hover:!border-slate-100"
                            onClick={() => {
                              handleSelectProduct(item);
                              setIsSearching(false);
                            }}
                          >
                            <div className="!flex !items-center !gap-4">
                              <Avatar
                                shape="square"
                                size={48}
                                icon={<Package size={24} />}
                                className="!bg-slate-100 !text-slate-400 !shrink-0"
                                src={item.image}
                              />
                              <div className="!flex !flex-col !min-w-0">
                                <Text className="!text-md !text-slate-800 !font-bold">
                                  {item.name}
                                </Text>
                                <Text className="!text-[10px] !text-slate-500 !uppercase !font-bold">
                                  SKU: {item.sku || "N/A"}
                                </Text>
                              </div>
                            </div>
                            <div className="text-right">
                              <Text className="!text-[10px] !text-slate-400 !uppercase !block">
                                In Stock
                              </Text>
                              <Text className="!font-black !text-[#38c6c6]">
                                {item.availableQuantity}
                              </Text>
                            </div>
                          </div>
                        )}
                      />
                    ) : (
                      <div className="text-center py-6 text-slate-400">
                        No products found in this warehouse
                      </div>
                    )}
                  </Spin>
                </div>
              )}
            </div>

            {/* SELECTED PRODUCTS LIST */}
            <div className="mt-8">
              {selectedProducts.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  <div className="flex items-center px-4 text-[10px] !uppercase !font-bold text-slate-400 !tracking-widest mb-1">
                    <span className="flex-1">Product</span>
                    <div className="flex items-center text-right">
                      <span className="w-24 text-center">Stock</span>
                      <span className="w-32 pr-4 text-center">
                        Transfer Qty
                      </span>
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
                          src={item.image}
                          icon={<Package />}
                          className="!bg-slate-50 !text-slate-300 !shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <Tooltip title={item.name} placement="topLeft">
                            <Text className="!font-bold !text-slate-800">
                              {item.name.length > 25
                                ? `${item.name.substring(0, 25)}...`
                                : item.name}
                            </Text>
                          </Tooltip>
                          <Text className="!text-xs !text-slate-400 !font-mono !italic">
                            {item.sku}
                          </Text>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-24 text-center">
                          <Text className="!font-bold !text-slate-500">
                            {item.availableQuantity}
                          </Text>
                        </div>

                        <div className="w-32 flex justify-center pr-4">
                          <Input
                            value={item.transferQty}
                            className="!h-10 !rounded-lg !bg-slate-50 !border-none !w-20 !font-bold !text-center focus:!ring-1 focus:!ring-[#39c6c6]"
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              handleUpdateQuantity(item.id, Number(val) || 1);
                            }}
                          />
                        </div>

                        <div className="w-10 flex justify-end">
                          <Button
                            type="text"
                            danger
                            icon={<Trash2 size={18} />}
                            onClick={() => handleRemoveProduct(item.id)}
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
                    Search and select products to transfer
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* CỘT PHẢI (30%): ROUTE, STAFF & SUMMARY */}
        <div className="w-[30%] space-y-6">
          {/* ASSIGN STAFF CARD */}
          <Card className="!rounded-2xl !shadow-sm !border-slate-100">
            <Text className="block !font-bold !text-slate-700 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Users size={14} className="text-[#38c6c6]" /> Assign To (Staff)
            </Text>
            <Select
              placeholder="Select staff member..."
              className="w-full !h-12 custom-staff-select"
              value={originWarehouseStaffId}
              onChange={setOriginWarehouseStaffId}
              loading={loadingStaff}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {sourceStaffList.map((user) => (
                <Option key={user.id} value={user.id} label={user.fullName}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Avatar
                        size="small"
                        className="!bg-[#38c6c6]/10 !text-[#38c6c6]"
                      >
                        {user.fullName?.charAt(0).toUpperCase()}
                      </Avatar>
                      <span className="font-medium text-slate-700">
                        {user.fullName}
                      </span>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Card>

          {/* ROUTE INFO */}
          <div>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <div className="space-y-5">
                <div>
                  <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <MapPin size={14} className="text-[#38c6c6]" /> From
                    Warehouse
                  </Text>
                  <Select
                    placeholder="Select Source..."
                    className="w-full custom-warehouse-select"
                    value={sourceId || undefined}
                    onChange={(val) => setSourceId(val)}
                    disabled={true}
                    suffixIcon={<MapPin size={16} className="text-slate-400" />}
                  >
                    {warehouses.map((wh) => (
                      <Option key={wh.id} value={wh.id}>
                        {wh.name}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <MapPin size={14} className="text-rose-400" /> To Warehouse
                  </Text>
                  <Select
                    placeholder="Select Destination..."
                    className="w-full custom-warehouse-select"
                    value={destId || undefined}
                    onChange={(val) => setDestId(val)}
                    suffixIcon={<MapPin size={16} className="text-slate-400" />}
                  >
                    {destinationWarehouses.map((wh) => (
                      <Option key={wh.id} value={wh.id}>
                        {wh.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          {/* TRANSFER SUMMARY CARD */}
          <div>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <Text className="!text-lg !font-bold !text-slate-800 !block !mb-5">
                Transfer Summary
              </Text>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                  <Text className="!text-slate-500">Unique SKUs</Text>
                  <Text className="!font-bold !text-slate-700">
                    {totalItems}
                  </Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text className="!text-slate-500">Total Quantity</Text>
                  <Text className="!font-black !text-xl !text-[#38c6c6]">
                    {totalQuantity}
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Global CSS */}
      <style jsx global>{`
        .custom-warehouse-select .ant-select-selector,
        .custom-staff-select .ant-select-selector {
          height: 48px !important;
          border-radius: 12px !important;
          background-color: #f8fafc !important; /* bg-slate-50 */
          border: none !important;
          display: flex;
          align-items: center;
        }
        .custom-staff-select .ant-select-selector {
          border: 1px solid #f1f5f9 !important;
        }
        .custom-warehouse-select .ant-select-selection-item,
        .custom-staff-select .ant-select-selection-item {
          font-weight: 500;
          color: #334155; /* text-slate-700 */
        }
        .custom-warehouse-select .ant-select-selection-placeholder,
        .custom-staff-select .ant-select-selection-placeholder {
          color: #94a3b8 !important; /* text-slate-400 */
          font-weight: 500;
        }
        .custom-warehouse-select.ant-select-focused .ant-select-selector,
        .custom-staff-select.ant-select-focused .ant-select-selector {
          box-shadow: 0 0 0 2px rgba(57, 198, 198, 0.2) !important;
        }
        .custom-warehouse-select.ant-select-disabled .ant-select-selector,
        .custom-staff-select.ant-select-disabled .ant-select-selector {
          background-color: #f1f5f9 !important; /* bg-slate-100 khi bị disabled */
          color: #64748b !important;
        }
      `}</style>
    </div>
  );
};

export default WarehouseTransferCreate;
