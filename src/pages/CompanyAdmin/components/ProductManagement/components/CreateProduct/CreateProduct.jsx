import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  message,
  Row,
  Col,
  Modal,
  Tooltip,
  Popconfirm,
  Upload,
  Checkbox,
  Typography,
} from "antd";
import {
  PlusCircleOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  UploadOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../../../../../api/axios";
import { Layers } from "lucide-react";

const { TextArea } = Input;
const { Title, Text } = Typography;

const CreateProduct = () => {
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [masterCategoryForm] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMasterCategoryModalOpen, setIsMasterCategoryModalOpen] =
    useState(false);

  const [createCategoryLoading, setCreateCategoryLoading] = useState(false);
  const [createMasterCategoryLoading, setCreateMasterCategoryLoading] =
    useState(false);

  const [step, setStep] = useState(1);
  const [parentCategories, setParentCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState(null);

  // State lưu danh sách Suppliers
  const [suppliers, setSuppliers] = useState([]);

  // ==========================================
  // 1. FETCH DATA (Categories & Suppliers)
  // ==========================================
  const fetchData = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
      // Gọi đồng thời 2 API để lấy danh mục và nhà cung cấp
      const [catRes, supRes] = await Promise.all([
        api.get(`/Products/categories/company/${userId}`),
        api.get(`/Suppliers/get-all/${userId}`),
      ]);

      // Lọc ra các Master Category (không có parent)
      const parents = catRes.data.filter((cat) => !cat.parentCategoryId);
      setParentCategories(parents);

      // Lưu danh sách Suppliers
      setSuppliers(supRes.data || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      message.error("Failed to load initial data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchChildCategories = async (parentId) => {
    try {
      const res = await api.get(`/Products/categories/children/${parentId}`);
      setChildCategories(res.data || []);
    } catch (error) {
      console.error("Error fetching children:", error);
      message.error("Failed to load child categories.");
    }
  };

  // ==========================================
  // 2. XỬ LÝ CHUYỂN BƯỚC & CATEGORY LOGIC
  // ==========================================
  const handleNextStep = () => {
    if (!selectedParentId) {
      message.warning("Please select a Master Category first!");
      return;
    }
    fetchChildCategories(selectedParentId);
    setStep(2);
  };

  const handleParentChange = (val) => {
    setSelectedParentId(val);
    form.setFieldValue("category", undefined);
  };

  const handleDeleteCategory = async (e, catId) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/Products/categories/delete/${catId}`);
      message.success("Category deleted!");
      fetchChildCategories(selectedParentId);
      if (form.getFieldValue("category") === catId) {
        form.setFieldValue("category", undefined);
      }
    } catch (error) {
      message.error("Failed to delete category.");
    }
  };

  // TẠO MASTER CATEGORY
  const handleCreateMasterCategory = async () => {
    try {
      const values = await masterCategoryForm.validateFields();
      setCreateMasterCategoryLoading(true);

      const companyId = parseInt(localStorage.getItem("companyId")) || 0;
      const payload = {
        companyId: companyId,
        name: values.masterCategoryName,
        parentCategoryId: null,
      };

      await api.post("/Products/categories/create", payload);

      message.success("New master category created!");
      setIsMasterCategoryModalOpen(false);
      masterCategoryForm.resetFields();
      fetchData();
    } catch (error) {
      message.error("Failed to create master category");
    } finally {
      setCreateMasterCategoryLoading(false);
    }
  };

  // TẠO CHILD CATEGORY
  const handleCreateCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      setCreateCategoryLoading(true);

      const companyId = parseInt(localStorage.getItem("companyId")) || 0;
      const payload = {
        companyId: companyId,
        name: values.categoryName,
        parentCategoryId: selectedParentId,
      };

      await api.post("/Products/categories/create", payload);

      message.success("New child category created!");
      setIsCategoryModalOpen(false);
      categoryForm.resetFields();
      fetchChildCategories(selectedParentId);
    } catch (error) {
      message.error("Failed to create category");
    } finally {
      setCreateCategoryLoading(false);
    }
  };

  // ==========================================
  // 3. SUBMIT TẠO SẢN PHẨM (PAYLOAD MỚI)
  // ==========================================
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId") || "0";
      const formData = new FormData();

      // Cấu trúc API mới nhất yêu cầu PascalCase (chữ cái đầu viết hoa)
      formData.append("CompanyId", companyId);
      formData.append("Name", values.name);

      if (values.category) formData.append("CategoryId", values.category);
      if (values.unit) formData.append("Unit", values.unit);
      if (values.material) formData.append("Material", values.material);
      if (values.packageType)
        formData.append("PackageType", values.packageType);
      if (values.sizeStandard)
        formData.append("SizeStandard", values.sizeStandard);
      if (values.defaultSupplierId)
        formData.append("DefaultSupplierId", values.defaultSupplierId);

      // Kích thước & Trọng lượng (đảm bảo truyền số)
      formData.append("Weight", parseFloat(values.weight || 0));
      formData.append("Width", parseFloat(values.width || 0));
      formData.append("Length", parseFloat(values.length || 0));
      formData.append("Height", parseFloat(values.height || 0));

      if (values.description)
        formData.append("Description", values.description);

      // Cờ logic kho bãi (chuẩn hóa kiểu boolean cho C#)
      formData.append("IsEsd", values.isEsd ? "true" : "false");
      formData.append("IsMsd", values.isMsd ? "true" : "false");
      formData.append("IsCold", values.isCold ? "true" : "false");
      formData.append("IsVulnerable", values.isVulnerable ? "true" : "false");
      formData.append("IsHighValue", values.isHighValue ? "true" : "false");

      // Xử lý hình ảnh (file nhị phân)
      if (values.image && values.image.fileList && values.image.fileList[0]) {
        formData.append("Image", values.image.fileList[0].originFileObj);
      }

      const res = await api.post("/Products/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200 || res.status === 201) {
        message.success("Product created successfully!");
        form.resetFields();
        navigate("/company-admin/product-management");
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to create product",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="!pt-6 !pl-10 !pr-10 !max-w-[800px] !mx-auto">
      <Card
        title={
          <div className="!flex !items-center !gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                if (step === 2) setStep(1);
                else navigate("/company-admin/product-management");
              }}
              className="!flex !items-center !justify-center hover:!bg-slate-100 !rounded-full"
            />
            <span className="!font-bold !text-gray-700">
              CREATE NEW PRODUCT
            </span>
          </div>
        }
        bordered={false}
        className="!shadow-xl !rounded-2xl"
      >
        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <div className="!py-10 !flex !flex-col !items-center !justify-center animate-fade-in">
            <div className="!bg-[#39c6c6]/10 !p-6 !rounded-full !mb-6">
              <Layers className="!text-[#39c6c6]" size={48} />
            </div>
            <Title level={3} className="!mb-2 !text-slate-700">
              Select Master Category
            </Title>
            <Text className="!text-slate-500 !mb-8 !text-center !max-w-sm">
              To keep your warehouse organized, please select the main root
              category for this new product before adding technical details.
            </Text>

            <div className="!flex !items-center !gap-3 !w-full !max-w-md">
              <div className="!flex !items-center !gap-2 !flex-1">
                <Select
                  showSearch
                  size="large"
                  className="!w-full"
                  placeholder="Choose a parent category..."
                  optionFilterProp="label"
                  value={selectedParentId}
                  onChange={handleParentChange}
                  options={parentCategories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
                <Tooltip title="Add New Master Category">
                  <Button
                    type="dashed"
                    size="large"
                    icon={<PlusCircleOutlined />}
                    onClick={() => setIsMasterCategoryModalOpen(true)}
                    className="!text-[#39c6c6] !border-[#39c6c6] hover:!bg-[#39c6c6]/10"
                  />
                </Tooltip>
              </div>
              <Button
                type="primary"
                size="large"
                onClick={handleNextStep}
                className="!bg-[#39c6c6] !border-none !font-bold !px-6"
                icon={<RightOutlined />}
                iconPosition="end"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="!bg-slate-50 !border !border-slate-200 !rounded-xl !p-4 !mb-6 !flex !justify-between !items-center">
              <div>
                <Text className="!text-slate-400 !text-xs !font-bold !uppercase !tracking-widest">
                  Master Category
                </Text>
                <div className="!font-bold !text-slate-700 !text-base">
                  {parentCategories.find((c) => c.id === selectedParentId)
                    ?.name || "Unknown"}
                </div>
              </div>
              <Button
                type="link"
                onClick={() => setStep(1)}
                className="!text-[#39c6c6] !font-medium"
              >
                Change
              </Button>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Product Name"
                    name="name"
                    rules={[
                      { required: true, message: "Please input product name!" },
                    ]}
                  >
                    <Input placeholder="Enter product name" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={
                      <div className="!flex !items-center !gap-2">
                        <span>Child Category</span>
                        <Tooltip title="Add New Child Category">
                          <PlusCircleOutlined
                            onClick={() => setIsCategoryModalOpen(true)}
                            style={{
                              color: "#39c6c6",
                              fontSize: "16px",
                              cursor: "pointer",
                            }}
                          />
                        </Tooltip>
                      </div>
                    }
                    name="category"
                    rules={[
                      {
                        required: true,
                        message: "Please select a child category!",
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      size="large"
                      placeholder="Select child category"
                      optionFilterProp="label"
                      optionRender={(option) => (
                        <div className="!flex !justify-between !items-center !w-full">
                          <span>{option.label}</span>
                          <Popconfirm
                            title="Delete this category?"
                            onConfirm={(e) =>
                              handleDeleteCategory(e, option.value)
                            }
                            okText="Yes"
                            cancelText="No"
                          >
                            <DeleteOutlined
                              className="!text-slate-400 hover:!text-red-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Popconfirm>
                        </div>
                      )}
                      options={childCategories.map((c) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Các trường Material, Package Type, Unit, Size Standard, Default Supplier */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Material" name="material">
                    <Input
                      placeholder="e.g., Plastic, Aluminum..."
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Package Type" name="packageType">
                    <Input
                      placeholder="e.g., Box, Reel, Tray..."
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Unit" name="unit">
                    <Input placeholder="e.g., kg, pcs" size="large" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Size Standard" name="sizeStandard">
                    <Input placeholder="e.g., 0805, 1206..." size="large" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Default Supplier" name="defaultSupplierId">
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select default supplier"
                      size="large"
                      optionFilterProp="label"
                      options={suppliers.map((s) => ({
                        value: s.id,
                        label: s.name,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Kích thước & Trọng lượng */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Weight (kg)" name="weight">
                    <Input
                      type="number"
                      placeholder="0.00"
                      size="large"
                      step="0.01"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Width (cm)" name="width">
                    <Input type="number" placeholder="0" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Length (cm)" name="length">
                    <Input type="number" placeholder="0" size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Height (cm)" name="height">
                    <Input type="number" placeholder="0" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Cờ điều kiện bảo quản */}
              <div className="!mt-2 !mb-6 !p-4 !bg-slate-50 !rounded-xl !border !border-slate-100">
                <Text className="!block !font-bold !text-slate-700 !mb-4 !text-xs !uppercase !tracking-wider">
                  Storage Conditions & Attributes
                </Text>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Form.Item
                      name="isEsd"
                      valuePropName="checked"
                      initialValue={false}
                      className="!mb-0"
                    >
                      <Checkbox className="!font-medium !text-slate-700">
                        Requires ESD
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="isMsd"
                      valuePropName="checked"
                      initialValue={false}
                      className="!mb-0"
                    >
                      <Checkbox className="!font-medium !text-slate-700">
                        Requires MSD
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="isCold"
                      valuePropName="checked"
                      initialValue={false}
                      className="!mb-0"
                    >
                      <Checkbox className="!font-medium !text-slate-700">
                        Cold Storage
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="isVulnerable"
                      valuePropName="checked"
                      initialValue={false}
                      className="!mb-0"
                    >
                      <Checkbox className="!font-medium !text-slate-700">
                        Fragile / Vulnerable
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="isHighValue"
                      valuePropName="checked"
                      initialValue={false}
                      className="!mb-0"
                    >
                      <Checkbox className="!font-medium !text-slate-700">
                        High Value
                      </Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Hình ảnh & Mô tả */}
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Product Image"
                    name="image"
                    extra="Accepts JPG, PNG, GIF."
                  >
                    <Upload
                      listType="picture"
                      maxCount={1}
                      beforeUpload={() => false}
                    >
                      <Button icon={<UploadOutlined />} size="large" block>
                        Click to upload image
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Description" name="description">
                <TextArea rows={4} placeholder="Enter product description" />
              </Form.Item>

              <Form.Item className="!mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    height: "50px",
                    background: "#39c6c6",
                    borderColor: "#39c6c6",
                    fontWeight: "bold",
                    borderRadius: "10px",
                  }}
                >
                  CREATE PRODUCT
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Card>

      {/* MODAL TẠO MASTER CATEGORY */}
      <Modal
        title="Add New Master Category"
        open={isMasterCategoryModalOpen}
        onOk={handleCreateMasterCategory}
        onCancel={() => setIsMasterCategoryModalOpen(false)}
        confirmLoading={createMasterCategoryLoading}
        okText="Create"
        okButtonProps={{
          style: { background: "#39c6c6", borderColor: "#39c6c6" },
        }}
      >
        <Form form={masterCategoryForm} layout="vertical" className="!mt-4">
          <Form.Item
            name="masterCategoryName"
            label="Master Category Name"
            rules={[{ required: true, message: "Please enter category name!" }]}
          >
            <Input
              placeholder="e.g. Passive Components..."
              size="large"
              onPressEnter={handleCreateMasterCategory}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL TẠO CHILD CATEGORY */}
      <Modal
        title="Add New Child Category"
        open={isCategoryModalOpen}
        onOk={handleCreateCategory}
        onCancel={() => setIsCategoryModalOpen(false)}
        confirmLoading={createCategoryLoading}
        okText="Create"
        okButtonProps={{
          style: { background: "#39c6c6", borderColor: "#39c6c6" },
        }}
      >
        <Form form={categoryForm} layout="vertical" className="!mt-4">
          <Form.Item
            name="categoryName"
            label="Child Category Name"
            rules={[{ required: true, message: "Please enter category name!" }]}
          >
            <Input
              placeholder="e.g. Diodes, Resistors..."
              size="large"
              onPressEnter={handleCreateCategory}
            />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx="true">{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CreateProduct;
