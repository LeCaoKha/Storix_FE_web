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
} from "antd";
import {
  PlusCircleOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../../../../../api/axios";

const { TextArea } = Input;

const CreateProduct = () => {
  const [form] = Form.useForm();
  const [typeForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [productTypes, setProductTypes] = useState([]);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createTypeLoading, setCreateTypeLoading] = useState(false);

  // 1. Fetch Product Types
  const fetchProductTypes = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
      const res = await api.get(`/Products/get-all-product-types/${userId}`);
      setProductTypes(res.data);
    } catch (error) {
      console.error("Error fetching product types:", error);
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  // 2. Handle Delete Product Type (Đồng bộ từ trang Edit)
  const handleDeleteType = async (e, typeId) => {
    if (e) e.stopPropagation(); // Chặn sự kiện nổi bọt để dropdown không đóng/chọn nhầm
    try {
      await api.delete(`/Products/delete-product-type/${typeId}`);
      message.success("Product type deleted!");

      // Refresh lại danh sách
      await fetchProductTypes();

      // Nếu type đang chọn bị xóa, reset giá trị typeId về undefined
      if (form.getFieldValue("typeId") === typeId) {
        form.setFieldValue("typeId", undefined);
      }
    } catch (error) {
      message.error("Failed to delete product type. It might be in use.");
    }
  };

  // 3. Handle Create New Type
  const handleCreateType = async () => {
    try {
      const values = await typeForm.validateFields();
      setCreateTypeLoading(true);

      const companyId = parseInt(localStorage.getItem("companyId")) || 0;
      const payload = {
        companyId: companyId,
        name: values.typeName,
      };

      await api.post("/Products/create-new-product-type", payload);

      message.success("New product type created!");
      setIsModalOpen(false);
      typeForm.resetFields();
      await fetchProductTypes();
    } catch (error) {
      message.error("Failed to create product type");
    } finally {
      setCreateTypeLoading(false);
    }
  };

  // 4. Handle Create Product
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const companyId = parseInt(localStorage.getItem("companyId")) || 0;
      const payload = {
        ...values,
        companyId: companyId,
        weight: 0,
      };
      const res = await api.post("/Products/create", payload);
      if (res.status === 200 || res.status === 201) {
        message.success("Product created successfully!");
        form.resetFields();
        navigate("/company-admin/product-management");
      }
    } catch (error) {
      message.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-[800px] mx-auto">
      <Card
        title={
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/company-admin/product-management")}
              className="flex items-center justify-center hover:bg-slate-100 rounded-full"
            />
            <span className="font-bold text-gray-700">CREATE NEW PRODUCT</span>
          </div>
        }
        bordered={false}
        className="shadow-xl rounded-2xl"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          {/* ROW 1: PRODUCT NAME */}
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

          {/* ROW 2: SKU & PRODUCT TYPE */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="SKU"
                name="sku"
                rules={[{ required: true, message: "Please input SKU!" }]}
              >
                <Input placeholder="Enter SKU" size="large" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <div className="flex items-center gap-2">
                    <span>Product Type</span>
                    <Tooltip title="Add New Type">
                      <PlusCircleOutlined
                        onClick={() => setIsModalOpen(true)}
                        style={{
                          color: "#39c6c6",
                          fontSize: "16px",
                          cursor: "pointer",
                        }}
                      />
                    </Tooltip>
                  </div>
                }
                name="typeId"
                rules={[{ required: true, message: "Please select a type!" }]}
              >
                <Select
                  showSearch
                  size="large"
                  placeholder="Select or search type"
                  optionFilterProp="label"
                  // Render custom option với icon xóa tương tự trang Edit
                  optionRender={(option) => (
                    <div className="flex justify-between items-center w-full">
                      <span>{option.label}</span>
                      <Popconfirm
                        title="Delete this type?"
                        onConfirm={(e) => handleDeleteType(e, option.value)}
                        onCancel={(e) => e.stopPropagation()}
                        okText="Yes"
                        cancelText="No"
                      >
                        <DeleteOutlined
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    </div>
                  )}
                  options={productTypes.map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ROW 3: UNIT & CATEGORY */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Unit" name="unit">
                <Input placeholder="e.g., kg, pcs, box" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Category" name="category">
                <Input placeholder="Enter category" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Description" name="description">
            <TextArea rows={4} placeholder="Enter product description" />
          </Form.Item>

          <Form.Item className="mb-0">
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
      </Card>

      {/* MODAL TẠO TYPE MỚI */}
      <Modal
        title="Add New Product Type"
        open={isModalOpen}
        onOk={handleCreateType}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={createTypeLoading}
        okText="Create"
        okButtonProps={{
          style: { background: "#39c6c6", borderColor: "#39c6c6" },
        }}
      >
        <Form form={typeForm} layout="vertical" className="mt-4">
          <Form.Item
            name="typeName"
            label="Type Name"
            rules={[{ required: true, message: "Please enter type name!" }]}
          >
            <Input
              placeholder="e.g. Clothes, Electronic..."
              size="large"
              onPressEnter={handleCreateType} // Kích hoạt khi nhấn Enter
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CreateProduct;
