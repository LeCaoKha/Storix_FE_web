import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Tooltip,
  Popconfirm,
  Upload,
  message,
} from "antd";
import {
  PlusCircleOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Tag, Package, Layers, Scale, Info, PlusCircle } from "lucide-react";
import api from "../../../../../../../../api/axios";

const { TextArea } = Input;

const QuickCreateProductModal = ({
  isOpen,
  onCancel,
  onFinish, // Hàm handleCreateProduct từ parent
  submitting,
  productTypes,
  refreshTypes, // Hàm để load lại types từ parent
}) => {
  const [form] = Form.useForm();
  const [typeForm] = Form.useForm();
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [createTypeLoading, setCreateTypeLoading] = useState(false);

  // 1. Xử lý xóa Product Type (Copy logic từ CreateProduct)
  const handleDeleteType = async (e, typeId) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/Products/delete-product-type/${typeId}`);
      message.success("Product type deleted!");
      if (refreshTypes) await refreshTypes();
      if (form.getFieldValue("typeId") === typeId) {
        form.setFieldValue("typeId", undefined);
      }
    } catch (error) {
      message.error("Failed to delete product type. It might be in use.");
    }
  };

  // 2. Xử lý tạo Type mới bên trong Modal (Modal lồng Modal)
  const handleCreateType = async () => {
    try {
      const values = await typeForm.validateFields();
      setCreateTypeLoading(true);
      const companyId = parseInt(localStorage.getItem("companyId")) || 0;
      const payload = { companyId, name: values.typeName };

      await api.post("/Products/create-new-product-type", payload);
      message.success("New product type created!");
      setIsTypeModalOpen(false);
      typeForm.resetFields();
      if (refreshTypes) await refreshTypes();
    } catch (error) {
      message.error("Failed to create product type");
    } finally {
      setCreateTypeLoading(false);
    }
  };

  // 3. Chuẩn bị FormData trước khi gọi onFinish của parent
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const companyId = localStorage.getItem("companyId") || "0";
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("sku", values.sku);
      formData.append("typeId", values.typeId);
      formData.append("companyId", companyId);
      formData.append("weight", "0");
      if (values.unit) formData.append("unit", values.unit);
      if (values.category) formData.append("category", values.category);
      if (values.description)
        formData.append("description", values.description);

      if (values.image && values.image.fileList && values.image.fileList[0]) {
        formData.append("image", values.image.fileList[0].originFileObj);
      }

      // Gọi hàm onFinish của parent với dữ liệu FormData
      await onFinish(formData);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <PlusCircle className="!text-[#39c6c6]" size={24} />
            <span className="text-lg font-extrabold text-slate-800">
              Quick Create Product
            </span>
          </div>
        }
        open={isOpen}
        onCancel={() => {
          form.resetFields();
          onCancel();
        }}
        footer={null}
        centered
        width={700}
        className="custom-modal"
      >
        <Form
          form={form}
          layout="vertical"
          className="!mt-6"
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Package size={14} /> Product Name
                  </span>
                }
                name="name"
                rules={[
                  { required: true, message: "Please enter product name" },
                ]}
              >
                <Input
                  placeholder="Enter product name"
                  className="!h-11 !rounded-xl !bg-slate-50  "
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Tag size={14} /> SKU
                  </span>
                }
                name="sku"
                rules={[{ required: true, message: "Please enter SKU" }]}
              >
                <Input
                  placeholder="e.g. PROD-001"
                  className="!h-11 !rounded-xl !bg-slate-50  "
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600 flex items-center gap-2">
                      <Layers size={14} /> Product Type
                    </span>
                    <Tooltip title="Add New Type">
                      <PlusCircleOutlined
                        onClick={() => setIsTypeModalOpen(true)}
                        className="!text-[#39c6c6] !cursor-pointer"
                      />
                    </Tooltip>
                  </div>
                }
                name="typeId"
                rules={[{ required: true, message: "Please select a type" }]}
              >
                <Select
                  showSearch
                  placeholder="Select type"
                  optionFilterProp="label"
                  className="!w-full !h-11 !rounded-xl !bg-slate-50 custom-type-select"
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
                          className="!text-slate-400 hover:!text-red-500 !transition-colors"
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
              <Form.Item
                label={
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Scale size={14} /> Unit
                  </span>
                }
                name="unit"
              >
                <Input
                  placeholder="kg, pcs, box..."
                  className="!h-11 !rounded-xl !bg-slate-50  "
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Tag size={14} /> Category
                  </span>
                }
                name="category"
              >
                <Input
                  placeholder="Enter category"
                  className="!h-11 !rounded-xl !bg-slate-50  "
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <span className="font-bold text-slate-600 flex items-center gap-2">
                <Info size={14} /> Product Image
              </span>
            }
            name="image"
          >
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
              className="w-full"
            >
              <Button
                icon={<UploadOutlined />}
                className="!h-11 !w-full !rounded-xl !border-dashed !border-slate-300"
              >
                Click to upload image
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label={
              <span className="font-bold text-slate-600 flex items-center gap-2">
                <Info size={14} /> Description
              </span>
            }
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Add product details..."
              className="!rounded-xl !bg-slate-50   !p-3"
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={onCancel}
              className="!h-11 !px-6 !rounded-xl !font-bold"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={submitting}
              onClick={handleSubmit}
              className="!h-11 !px-10 !bg-[#39c6c6]   !rounded-xl !font-bold shadow-lg shadow-[#39c6c6]/20"
            >
              CREATE PRODUCT
            </Button>
          </div>
        </Form>
      </Modal>

      {/* MODAL LỒNG: TẠO TYPE MỚI */}
      <Modal
        title="Add New Product Type"
        open={isTypeModalOpen}
        onOk={handleCreateType}
        onCancel={() => setIsTypeModalOpen(false)}
        confirmLoading={createTypeLoading}
        centered
      >
        <Form form={typeForm} layout="vertical" className="!mt-4">
          <Form.Item
            name="typeName"
            label="Type Name"
            rules={[{ required: true, message: "Please enter type name!" }]}
          >
            <Input placeholder="e.g. Clothes, Electronic..." size="large" />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        .custom-type-select .ant-select-selector {
          border-radius: 12px !important;
          background-color: #f8fafc !important;
          border: none !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
        }
      `}</style>
    </>
  );
};

export default QuickCreateProductModal;
