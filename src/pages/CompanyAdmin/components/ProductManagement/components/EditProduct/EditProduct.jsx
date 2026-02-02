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
} from "antd";
import {
  PlusCircleOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../../../api/axios";

const { TextArea } = Input;

const EditProduct = () => {
  const [form] = Form.useForm();
  const [typeForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [productTypes, setProductTypes] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  // 1. Fetch Product Types & Product Detail
  const fetchData = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      setFetchingData(true);
      const [typesRes, productRes] = await Promise.all([
        api.get(`/Products/get-all-product-types/${userId}`),
        api.get(`/Products/get-by-id/${userId}/${id}`),
      ]);

      setProductTypes(typesRes.data);

      const product = productRes.data;
      form.setFieldsValue({
        name: product.name,
        sku: product.sku,
        typeId: product.typeId,
        unit: product.unit,
        category: product.category,
        description: product.description,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Could not load product details");
      navigate("/company-admin/product-management");
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // 2. Handle Delete Product Type
  const handleDeleteType = async (e, typeId) => {
    // Chặn sự kiện nổi bọt để Select không chọn giá trị này khi nhấn xóa
    if (e) e.stopPropagation();

    try {
      await api.delete(`/Products/delete-product-type/${typeId}`);
      message.success("Product type deleted!");

      const userId = localStorage.getItem("userId");
      const res = await api.get(`/Products/get-all-product-types/${userId}`);
      setProductTypes(res.data);

      if (form.getFieldValue("typeId") === typeId) {
        form.setFieldValue("typeId", undefined);
      }
    } catch (error) {
      message.error("Failed to delete product type. It might be in use.");
    }
  };

  // 3. Handle Create New Type
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createTypeLoading, setCreateTypeLoading] = useState(false);

  const handleCreateType = async () => {
    try {
      const values = await typeForm.validateFields();
      setCreateTypeLoading(true);
      const companyId = parseInt(localStorage.getItem("companyId")) || 0;
      const payload = { companyId, name: values.typeName };

      await api.post("/Products/create-new-product-type", payload);
      message.success("New product type created!");
      setIsModalOpen(false);
      typeForm.resetFields();

      const userId = localStorage.getItem("userId");
      const res = await api.get(`/Products/get-all-product-types/${userId}`);
      setProductTypes(res.data);
    } catch (error) {
      message.error("Failed to create product type");
    } finally {
      setCreateTypeLoading(false);
    }
  };

  // 4. Handle Update Product
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const companyId = parseInt(localStorage.getItem("companyId")) || 0;
      const payload = { ...values, companyId, weight: 0 };

      const res = await api.put(`/Products/update${id}`, payload);

      if (res.status === 200 || res.status === 204) {
        message.success("Product updated successfully!");
        navigate("/company-admin/product-management");
      }
    } catch (error) {
      message.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading product data..." />
      </div>
    );
  }

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
            <span className="font-bold text-gray-700">EDIT PRODUCT</span>
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
          {/* ROW 1: NAME */}
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

          {/* ROW 2: SKU & TYPE */}
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
              UPDATE PRODUCT
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* MODAL CREATE TYPE */}
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
              onPressEnter={handleCreateType} // NHẤN ENTER ĐỂ SUBMIT
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EditProduct;
