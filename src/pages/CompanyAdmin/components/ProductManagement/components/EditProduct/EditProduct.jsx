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
  Spin,
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
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../../../api/axios";
import { Layers } from "lucide-react";

const { TextArea } = Input;
const { Title, Text } = Typography;

const EditProduct = () => {
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [masterCategoryForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [fileList, setFileList] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMasterCategoryModalOpen, setIsMasterCategoryModalOpen] =
    useState(false);

  const [createCategoryLoading, setCreateCategoryLoading] = useState(false);
  const [createMasterCategoryLoading, setCreateMasterCategoryLoading] =
    useState(false);

  // States cho Wizard 2 bước
  const [step, setStep] = useState(1);
  const [parentCategories, setParentCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState(null);

  // State lưu danh sách Suppliers
  const [suppliers, setSuppliers] = useState([]);

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const fetchChildCategories = async (parentId) => {
    try {
      const res = await api.get(`/Products/categories/children/${parentId}`);
      setChildCategories(res.data || []);
    } catch (error) {
      console.error("Error fetching children:", error);
      message.error("Failed to load child categories.");
    }
  };

  const fetchData = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      setFetchingData(true);
      // Gọi đồng thời 3 API: Lấy Danh mục, Sản phẩm, và Nhà cung cấp
      const [catRes, supRes, productRes] = await Promise.all([
        api.get(`/Products/categories/company/${userId}`),
        api.get(`/Suppliers/get-all/${userId}`),
        api.get(`/Products/get-by-id/${userId}/${id}`),
      ]);

      // Lọc danh mục gốc
      const allCats = catRes.data;
      const parents = allCats.filter((cat) => !cat.parentCategoryId);
      setParentCategories(parents);

      // Lưu danh sách Suppliers
      setSuppliers(supRes.data || []);

      const product = productRes.data;

      // Xử lý tìm Master Category (Cha) để hiển thị ở Step 1
      if (product.categoryId) {
        const currentCat = allCats.find((c) => c.id === product.categoryId);
        if (currentCat) {
          const masterId = currentCat.parentCategoryId || currentCat.id;
          setSelectedParentId(masterId);
          await fetchChildCategories(masterId);
        }
      }

      // Xử lý hình ảnh
      const currentUrl = product.imageUrl || product.image;
      const initialImage = currentUrl
        ? [
            {
              uid: "-1",
              name: "product-image.png",
              status: "done",
              url: currentUrl,
              thumbUrl: currentUrl,
            },
          ]
        : [];
      setFileList(initialImage);

      // Đổ dữ liệu vào Form (Cập nhật thêm các trường mới)
      form.setFieldsValue({
        name: product.name,
        unit: product.unit,
        category: product.categoryId,
        material: product.material,
        packageType: product.packageType,
        sizeStandard: product.sizeStandard,
        defaultSupplierId: product.defaultSupplierId,
        description: product.description,
        isEsd: product.isEsd || false,
        isMsd: product.isMsd || false,
        isCold: product.isCold || false,
        isVulnerable: product.isVulnerable || false,
        isHighValue: product.isHighValue || false,
        weight: product.weight,
        width: product.width,
        length: product.length,
        height: product.height,
        image: initialImage,
      });
    } catch (error) {
      console.error(error);
      message.error("Could not load product details");
      navigate("/company-admin/product-management");
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
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

  const handleCreateMasterCategory = async () => {
    try {
      const values = await masterCategoryForm.validateFields();
      setCreateMasterCategoryLoading(true);

      const companyId = parseInt(localStorage.getItem("companyId")) || 0;
      await api.post("/Products/categories/create", {
        companyId: companyId,
        name: values.masterCategoryName,
        parentCategoryId: null,
      });

      message.success("New master category created!");
      setIsMasterCategoryModalOpen(false);
      masterCategoryForm.resetFields();

      const catRes = await api.get(
        `/Products/categories/company/${localStorage.getItem("userId")}`,
      );
      const parents = catRes.data.filter((cat) => !cat.parentCategoryId);
      setParentCategories(parents);
    } catch (error) {
      message.error("Failed to create master category");
    } finally {
      setCreateMasterCategoryLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      setCreateCategoryLoading(true);

      const companyId = parseInt(localStorage.getItem("companyId")) || 0;
      await api.post("/Products/categories/create", {
        companyId: companyId,
        name: values.categoryName,
        parentCategoryId: selectedParentId,
      });

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

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId") || "0";
      const formData = new FormData();

      // Ép kiểu chuẩn PascalCase API mới
      formData.append("Id", parseInt(id)); // Đề phòng BE cần truyền ID vào body
      formData.append("CompanyId", parseInt(companyId));
      formData.append("Name", values.name);

      if (values.category)
        formData.append("CategoryId", parseInt(values.category));
      if (values.unit) formData.append("Unit", values.unit);
      if (values.material) formData.append("Material", values.material);
      if (values.packageType)
        formData.append("PackageType", values.packageType);
      if (values.sizeStandard)
        formData.append("SizeStandard", values.sizeStandard);
      if (values.defaultSupplierId)
        formData.append(
          "DefaultSupplierId",
          parseInt(values.defaultSupplierId),
        );

      // Kích thước & Trọng lượng
      formData.append("Weight", parseFloat(values.weight || 0));
      formData.append("Width", parseFloat(values.width || 0));
      formData.append("Length", parseFloat(values.length || 0));
      formData.append("Height", parseFloat(values.height || 0));

      if (values.description)
        formData.append("Description", values.description);

      // Cờ logic kho bãi
      formData.append("IsEsd", !!values.isEsd);
      formData.append("IsMsd", !!values.isMsd);
      formData.append("IsCold", !!values.isCold);
      formData.append("IsVulnerable", !!values.isVulnerable);
      formData.append("IsHighValue", !!values.isHighValue);

      // Xử lý hình ảnh (chỉ append khi user chọn ảnh mới)
      if (fileList[0]?.originFileObj) {
        formData.append("Image", fileList[0].originFileObj);
      }

      // Đảm bảo URL có đủ dấu gạch chéo
      const res = await api.put(`/Products/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200 || res.status === 204) {
        message.success("Product updated successfully!");
        navigate("/company-admin/product-management");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData)
    return (
      <div className="!flex !justify-center !items-center !h-screen">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="!pt-6 !pl-10 !pr-10 !max-w-[800px] !mx-auto !font-sans">
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
            <span className="!font-bold !text-gray-700 !uppercase">
              EDIT PRODUCT
            </span>
          </div>
        }
        bordered={false}
        className="!shadow-xl !rounded-2xl"
      >
        {step === 1 && (
          <div className="!py-10 !flex !flex-col !items-center !justify-center animate-fade-in">
            <div className="!bg-[#39c6c6]/10 !p-6 !rounded-full !mb-6">
              <Layers className="!text-[#39c6c6]" size={48} />
            </div>
            <Title level={3} className="!mb-2 !text-slate-700">
              Select Master Category
            </Title>
            <Text className="!text-slate-500 !mb-8 !text-center !max-w-sm">
              Update the master root category for this product if needed, then
              proceed to the next step to edit details.
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

              {/* CÁC TRƯỜNG MỚI: Material, Package Type, Unit, Size Standard, Default Supplier */}
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

              {/* KHU VỰC THUỘC TÍNH ĐIỀU KIỆN KHO LƯU TRỮ */}
              <div className="!mt-2 !mb-6 !p-4 !bg-slate-50 !rounded-xl !border !border-slate-100">
                <Text className="!block !font-bold !text-slate-700 !mb-4 !text-xs !uppercase !tracking-wider">
                  Storage Conditions & Attributes
                </Text>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Form.Item
                      name="isEsd"
                      valuePropName="checked"
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
                      className="!mb-0"
                    >
                      <Checkbox className="!font-medium !text-slate-700">
                        High Value
                      </Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Product Image"
                    name="image"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                  >
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onPreview={(file) =>
                        window.open(file.url || file.thumbUrl)
                      }
                      onChange={handleFileChange}
                      beforeUpload={() => false}
                      maxCount={1}
                    >
                      {fileList.length < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
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
                  UPDATE PRODUCT
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Card>

      {/* MODAL TẠO MASTER CATEGORY (STEP 1) */}
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

      {/* MODAL TẠO CHILD CATEGORY (STEP 2) */}
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

      <style jsx global>{`
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
        .ant-upload.ant-upload-select-picture-card {
          border-radius: 12px !important;
          background-color: #f8fafc !important;
        }
        .ant-upload-list-picture-card-container {
          width: 104px !important;
          height: 104px !important;
        }
        .ant-upload-list-item {
          border-radius: 12px !important;
        }
      `}</style>
    </div>
  );
};

export default EditProduct;
