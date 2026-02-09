import React, { useState, useEffect, useRef } from "react";
import api from "../../../../../../api/axios";
import { message } from "antd";
import InboundHeader from "./components/InboundHeader/InboundHeader";
import ProductSearchSection from "./components/ProductSearchSection/ProductSearchSection";
import QuickCreateProductModal from "./components/QuickCreateProductModal/QuickCreateProductModal";
import InboundSidebar from "./components/InboundSidebar/InboundSidebar";

const InboundRequestCreate = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [productTypes, setProductTypes] = useState([]);
  const searchRef = useRef(null);

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
  // LOGIC QUẢN LÝ DANH SÁCH SẢN PHẨM CHỌN
  // ==========================================

  // 1. Thêm sản phẩm vào danh sách
  const handleSelectProduct = (product) => {
    const isExist = selectedProducts.find((p) => p.id === product.id);
    if (isExist) {
      message.info("Sản phẩm này đã có trong danh sách");
      return;
    }

    // 1. Lấy danh sách giá từ product
    const priceEntries = product.productPrices || [];
    let latestPrice = 0;

    if (priceEntries.length > 0) {
      // 2. Sắp xếp mảng productPrices theo ngày giảm dần (mới nhất lên đầu)
      const sortedPrices = [...priceEntries].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      // 3. Lấy giá của phần tử đầu tiên (ngày gần hiện tại nhất)
      latestPrice = sortedPrices[0].price;
    }

    // 4. Cập nhật vào danh sách selectedProducts
    setSelectedProducts([
      ...selectedProducts,
      {
        ...product,
        quantity: 1,
        lineDiscount: 0,
        price: latestPrice, // Gán giá mới nhất làm đơn giá hiện tại
        originalPrice: latestPrice, // Gán giá mới nhất làm giá gốc để so sánh
      },
    ]);
  };

  // 2. Xóa sản phẩm khỏi danh sách
  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  // 3. Cập nhật số lượng
  const handleUpdateQuantity = (productId, quantity) => {
    const newList = selectedProducts.map((p) =>
      p.id === productId ? { ...p, quantity } : p,
    );
    setSelectedProducts(newList);
  };

  // 4. CẬP NHẬT ĐƠN GIÁ (Dùng cho Modal điều chỉnh giá)
  const handleUpdatePrice = (
    productId,
    newPrice,
    originalPrice,
    lineDiscount,
  ) => {
    setSelectedProducts((prevList) =>
      prevList.map((p) =>
        p.id === productId
          ? {
              ...p,
              price: newPrice,
              originalPrice: originalPrice,
              lineDiscount: lineDiscount,
            }
          : p,
      ),
    );
  };

  // ==========================================
  // LOGIC FETCH DỮ LIỆU & TÌM KIẾM
  // ==========================================

  const handleSidebarChange = (key, value) => {
    setInboundData((prev) => ({ ...prev, [key]: value }));
  };

  const fetchData = async () => {
    if (!userId) return;
    setLoadingProducts(true);
    try {
      const [typeRes, prodRes] = await Promise.all([
        api.get(`/Products/get-all-product-types/${userId}`),
        api.get(`/Products/get-all/${userId}`),
      ]);
      setProductTypes(typeRes.data);
      setProducts(prodRes.data);
      setFilteredProducts(prodRes.data);
    } catch (error) {
      message.error("Không thể tải dữ liệu");
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

  const handleCreateProduct = async (formData) => {
    setSubmitting(true);
    try {
      const res = await api.post("/Products/create", formData);
      if (res.status === 200 || res.status === 201) {
        message.success("Tạo sản phẩm thành công!");
        setIsModalOpen(false);
        await fetchData();
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi tạo sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans">
      <InboundHeader />

      <div className="flex justify-center gap-x-6 pb-20">
        {/* Cột trái: Tìm kiếm và Danh sách sản phẩm */}
        <div className="w-[60%] space-y-6">
          <ProductSearchSection
            searchRef={searchRef}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            handleSearch={handleSearch}
            loadingProducts={loadingProducts}
            filteredProducts={filteredProducts}
            onOpenCreateModal={() => setIsModalOpen(true)}
            // Props quản lý sản phẩm được chọn
            selectedProducts={selectedProducts}
            onSelectProduct={handleSelectProduct}
            onRemoveProduct={handleRemoveProduct}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdatePrice={handleUpdatePrice} // Truyền hàm cập nhật giá vào đây
          />
        </div>

        {/* Cột phải: Thông tin Sidebar */}
        <div className="w-[30%]">
          <InboundSidebar onDataChange={handleSidebarChange} />
        </div>
      </div>

      {/* Modal tạo nhanh sản phẩm */}
      <QuickCreateProductModal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onFinish={handleCreateProduct}
        submitting={submitting}
        productTypes={productTypes}
        refreshTypes={fetchData}
      />
    </div>
  );
};

export default InboundRequestCreate;
