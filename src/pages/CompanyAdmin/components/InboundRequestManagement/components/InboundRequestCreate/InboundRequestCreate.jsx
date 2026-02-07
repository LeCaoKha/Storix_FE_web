import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../../../api/axios";
import {
  Button,
  Typography,
  Select,
  Input,
  Card,
  Space,
  List,
  Avatar,
  Skeleton,
  Empty,
  message,
  Modal,
  Form,
  InputNumber,
} from "antd";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  X,
  Truck,
  Warehouse,
  Info,
  StickyNote,
  Search,
  Plus,
  Package,
  PlusCircle,
  Tag,
  Layers,
  Scale,
} from "lucide-react";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const InboundRequestCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // States cho sản phẩm
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // States cho Modal tạo sản phẩm
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [productTypes, setProductTypes] = useState([]);

  // Lấy dữ liệu từ localStorage
  const userId = localStorage.getItem("userId");
  const companyId = localStorage.getItem("companyId");

  const fetchProductTypes = async () => {
    const uId = localStorage.getItem("userId");
    if (!uId) return;
    try {
      const response = await api.get(`/Products/get-all-product-types/${uId}`);
      setProductTypes(response.data);
    } catch (error) {
      console.error("Failed to fetch product types", error);
    }
  };

  const fetchProducts = async () => {
    if (!userId) return;
    setLoadingProducts(true);
    try {
      const response = await api.get(`/Products/get-all/${userId}`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      message.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProductTypes();
    fetchProducts();
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = products.filter(
      (p) =>
        p.name?.toLowerCase().includes(value) ||
        p.sku?.toLowerCase().includes(value),
    );
    setFilteredProducts(filtered);
    setIsSearching(true);
  };

  // Hàm xử lý tạo sản phẩm mới qua API
  const handleCreateProduct = async (values) => {
    setSubmitting(true);
    try {
      const body = {
        ...values,
        companyId: parseInt(companyId),
        typeId: parseInt(values.typeId) || 0,
      };

      await api.post("/Products/create", body);
      message.success("New product created successfully!");
      setIsModalOpen(false);
      form.resetFields();
      fetchProducts(); // Refresh danh sách sau khi tạo
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to create product",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans">
      {/* HEADER SECTION - Giữ nguyên */}
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
              Create Inbound Request
            </Title>
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em]">
              Inbound Management
            </Text>
          </div>
        </div>
        <Space size="middle">
          <Button
            type="text"
            icon={<X size={18} />}
            className="!flex !items-center !gap-2 !h-11 !px-5 !font-bold !text-slate-500 hover:!text-rose-500 hover:!bg-rose-50 !rounded-xl transition-all"
          >
            Cancel
          </Button>
          <Button
            icon={<Save size={18} />}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-slate-600 !bg-white !border-slate-200 !rounded-xl shadow-sm hover:!border-[#39c6c6] hover:!text-[#39c6c6]"
          >
            Create PO
          </Button>
          <Button
            type="primary"
            icon={<CheckCircle2 size={18} />}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !bg-[#39c6c6] hover:!bg-[#2eb1b1] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20"
          >
            Create & Approve
          </Button>
        </Space>
      </div>

      <div className="flex justify-center gap-x-6 pb-20">
        <div className="w-[60%] space-y-6">
          <Card
            title={
              <Space className="text-slate-700 uppercase text-xs tracking-wider font-bold py-2">
                <Search size={16} /> Product Information
              </Space>
            }
            className="!rounded-2xl !shadow-sm !border-slate-100 overflow-visible"
          >
            <div className="relative" ref={searchRef}>
              <Input
                placeholder="Search products by Name or SKU..."
                prefix={<Search size={20} className="text-slate-300 mr-2" />}
                className="!h-10 !rounded-2xl !bg-slate-50 !border-none focus:!bg-white focus:!ring-2 focus:!ring-[#39c6c6]/20 !text-base transition-all"
                onFocus={() => setIsSearching(true)}
                onChange={handleSearch}
              />

              {isSearching && (
                <div className="absolute top-13 left-0 w-full bg-white z-[100] rounded-2xl shadow-2xl border border-slate-100 max-h-[290px] overflow-y-auto p-2 transition-all">
                  {/* 1. Item: Create New Product (Cao khoảng 50px) */}
                  <div
                    onClick={() => {
                      setIsSearching(false);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 p-2 mb-2 bg-[#39c6c6]/5 hover:bg-[#39c6c6]/10 text-[#39c6c6] rounded-xl cursor-pointer transition-all border border-dashed border-[#39c6c6]/30 shrink-0"
                  >
                    <div className="p-1 bg-[#39c6c6] text-white rounded-full">
                      <Plus size={13} />
                    </div>
                    <div className="flex flex-col">
                      <Text className="!font-bold !text-[#39c6c6]">
                        Create New Product
                      </Text>
                    </div>
                  </div>

                  <Skeleton loading={loadingProducts} active className="p-4">
                    {filteredProducts.length > 0 ? (
                      <List
                        dataSource={filteredProducts}
                        renderItem={(item) => (
                          /* 2. Item: Product (Mỗi item cao khoảng 76px - 80px) */
                          <div
                            className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group mb-1 border border-transparent hover:border-slate-100"
                            onClick={() => {
                              message.success(`Added ${item.name}`);
                              setIsSearching(false);
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <Avatar
                                shape="square"
                                size={48}
                                icon={<Package size={24} />}
                                className="!bg-slate-100 !text-slate-400 shrink-0"
                                src={item.imageUrl}
                              />
                              <div className="flex flex-col">
                                <Text className="!text-md !text-slate-800 line-clamp-1">
                                  {item.name}
                                </Text>
                                <div className="flex mt-1 text-xs font-mono items-center">
                                  <span className="text-slate-500 mr-1">
                                    SKU:
                                  </span>
                                  <span className="text-slate-700">
                                    {item.sku || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-2 shrink-0">
                              <Text className="block !font-black !text-slate-700">
                                {item.price?.toLocaleString()} ₫
                              </Text>
                            </div>
                          </div>
                        )}
                      />
                    ) : (
                      <Empty
                        description="No existing products found"
                        className="py-5"
                      />
                    )}
                  </Skeleton>
                </div>
              )}
            </div>

            <div className="mt-8 h-48 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
              <Package size={40} className="mb-2 opacity-10" />
              <p className="font-medium text-sm">
                Select products using the search bar above
              </p>
            </div>
          </Card>
        </div>

        {/* Cột phải - Giữ nguyên */}
        <div className="w-[30%] space-y-6">
          {/* ... Supplier, Warehouse, Notes ... */}
          <Card className="!rounded-2xl !shadow-sm !border-slate-100 h-full text-slate-400 italic text-center py-10">
            Sidebar Configuration Area
          </Card>
        </div>
      </div>

      {/* ================= MODAL CREATE PRODUCT ================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <PlusCircle className="text-[#39c6c6]" size={24} />
            <span className="text-lg font-extrabold text-slate-800">
              Quick Create Product
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={600}
        className="custom-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProduct}
          className="mt-6"
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              label={
                <span className="font-bold text-slate-600 flex items-center gap-2">
                  SKU
                </span>
              }
              name="sku"
              rules={[{ required: true, message: "Please enter SKU" }]}
            >
              <Input
                placeholder="e.g. PROD-001"
                className="!h-11 !rounded-xl !bg-slate-50"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-bold text-slate-600 flex items-center gap-2">
                  Product Name
                </span>
              }
              name="name"
              rules={[{ required: true, message: "Please enter product name" }]}
            >
              <Input
                placeholder="Enter name"
                className="!h-11 !rounded-xl !bg-slate-50 "
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-bold text-slate-600 flex items-center gap-2">
                  Product Type
                </span>
              }
              name="typeId"
              rules={[{ required: true, message: "Please select a type" }]}
            >
              <Select
                showSearch
                placeholder="Select or search type"
                optionFilterProp="children"
                // listHeight: 128px tương đương khoảng 4 items (mỗi item ~32px)
                listHeight={130}
                className="!w-full !h-11 !rounded-xl !bg-slate-50 custom-type-select"
                // Cho phép tìm kiếm theo tên type
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={productTypes.map((type) => ({
                  value: type.id,
                  label: type.name,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-bold text-slate-600 flex items-center gap-2">
                  Category
                </span>
              }
              name="category"
            >
              <Input
                placeholder="Electronics, Fashion..."
                className="!h-11 !rounded-xl !bg-slate-50 "
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-bold text-slate-600 flex items-center gap-2">
                  Unit
                </span>
              }
              name="unit"
            >
              <Input
                placeholder="Box, Kg, Pcs..."
                className="!h-11 !rounded-xl !bg-slate-50 "
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-bold text-slate-600 flex items-center gap-2">
                  Description
                </span>
              }
              name="description"
              className="col-span-2"
            >
              <TextArea
                rows={3}
                placeholder="Add product details..."
                className="!rounded-xl !bg-slate-50 !p-3"
              />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="!h-11 !px-6 !rounded-xl !font-bold"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="!h-11 !px-10 !bg-[#39c6c6] !border-none !rounded-xl !font-bold shadow-lg shadow-[#39c6c6]/20"
            >
              Create Product
            </Button>
          </div>
        </Form>
      </Modal>

      <style jsx global>{`
        .ant-modal-content {
          border-radius: 24px !important;
          padding: 24px !important;
        }
        .ant-form-item-label {
          padding-bottom: 8px !important;
        }
        .custom-modal .ant-input-number-input {
          height: 44px !important;
        }
        .custom-type-select .ant-select-selector {
          border-radius: 12px !important;
          background-color: #f8fafc !important;
          border: none !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
        }

        /* Hiệu ứng khi focus vào ô Select */
        .custom-type-select.ant-select-focused .ant-select-selector {
          background-color: white !important;
          box-shadow: 0 0 0 2px rgba(57, 198, 198, 0.2) !important;
          border: 1px solid #39c6c6 !important;
        }
      `}</style>
    </div>
  );
};

export default InboundRequestCreate;
