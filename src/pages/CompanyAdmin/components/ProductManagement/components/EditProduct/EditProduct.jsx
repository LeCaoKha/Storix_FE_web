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
} from "antd";
import {
  PlusCircleOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined, // Dùng icon Plus cho ô vuông
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
  const [fileList, setFileList] = useState([]); // Quản lý danh sách file

  const navigate = useNavigate();
  const { id } = useParams();

  // Hàm chuẩn hóa dữ liệu file cho Form.Item
  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  // 1. Fetch dữ liệu sản phẩm
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

      // Lấy URL ảnh (Cloudinary)
      const currentUrl = product.imageUrl || product.image;
      const initialImage = currentUrl
        ? [
            {
              uid: "-1",
              name: "product-image.png",
              status: "done",
              url: currentUrl,
              thumbUrl: currentUrl, // Hiển thị ảnh ngay trong ô vuông
            },
          ]
        : [];

      setFileList(initialImage);

      // Đổ dữ liệu vào Form
      form.setFieldsValue({
        name: product.name,
        sku: product.sku,
        typeId: product.typeId,
        unit: product.unit,
        category: product.category,
        description: product.description,
        image: initialImage, // Đồng bộ để Form.Item quản lý
      });
    } catch (error) {
      message.error("Could not load product details");
      navigate("/company-admin/product-management");
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // 2. Xử lý khi thay đổi ảnh
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 3. Xử lý Submit Form (FormData)
  const onFinish = async (values) => {
    setLoading(true);
    try {
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

      // Chỉ gửi file mới nếu có (kiểm tra qua originFileObj)
      if (fileList[0]?.originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      const res = await api.put(`/Products/update${id}`, formData, {
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

  // --- Logic Type (Giữ nguyên) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createTypeLoading, setCreateTypeLoading] = useState(false);

  const handleDeleteType = async (e, typeId) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/Products/delete-product-type/${typeId}`);
      message.success("Deleted!");
      fetchData();
    } catch (error) {
      message.error("Fail");
    }
  };

  const handleCreateType = async () => {
    try {
      const values = await typeForm.validateFields();
      setCreateTypeLoading(true);
      await api.post("/Products/create-new-product-type", {
        companyId: parseInt(localStorage.getItem("companyId")),
        name: values.typeName,
      });
      setIsModalOpen(false);
      typeForm.resetFields();
      fetchData();
    } catch (error) {
      message.error("Fail");
    } finally {
      setCreateTypeLoading(false);
    }
  };

  if (fetchingData)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="p-10 max-w-[800px] mx-auto font-sans">
      <Card
        title={
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className="hover:bg-slate-100 rounded-full"
            />
            <span className="font-bold text-gray-700 uppercase">
              Edit Product
            </span>
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
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Product Name"
                name="name"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter product name" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="SKU" name="sku" rules={[{ required: true }]}>
                <Input placeholder="Enter SKU" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <div className="flex items-center gap-2">
                    <span>Product Type</span>
                    <PlusCircleOutlined
                      onClick={() => setIsModalOpen(true)}
                      className="text-[#39c6c6] cursor-pointer"
                    />
                  </div>
                }
                name="typeId"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  size="large"
                  optionFilterProp="label"
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
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Category" name="category">
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>

          {/* Ô VUÔNG UPLOAD HÌNH ẢNH */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Product Image"
                name="image"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  listType="picture-card" // Đổi thành ô vuông
                  fileList={fileList}
                  onPreview={(file) => window.open(file.url || file.thumbUrl)}
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
            <TextArea rows={4} />
          </Form.Item>

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
        </Form>
      </Card>

      <Modal
        title="Add New Type"
        open={isModalOpen}
        onOk={handleCreateType}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={createTypeLoading}
      >
        <Form form={typeForm} layout="vertical">
          <Form.Item
            name="typeName"
            label="Type Name"
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        /* Tùy chỉnh bo góc cho ô vuông upload */
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
