import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Card,
  Space,
  Row,
  Col,
} from "antd";
import {
  ArrowLeft,
  Save,
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../../../api/axios";

const { Title, Text } = Typography;

const CreateSupplier = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const companyId = localStorage.getItem("companyId");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSupplier = async (values) => {
    if (!companyId) {
      return message.error("Company ID is missing. Please log in again.");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        companyId: parseInt(companyId, 10),
        name: values.name?.trim(),
        contactPerson: values.contactPerson?.trim() || "",
        email: values.email?.trim() || "",
        phone: values.phone?.trim() || "",
        address: values.address?.trim() || "",
      };

      const res = await api.post("/Suppliers/add-new-supplier", payload);

      if (res.status === 200 || res.status === 201 || res.data) {
        message.success("Supplier created successfully!");
        navigate(-1); // Quay lại trang danh sách nhà cung cấp
      }
    } catch (error) {
      console.error("Create Supplier Error:", error);
      message.error(
        error.response?.data?.message || "Failed to create new supplier",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = () => {
    form.validateFields().then((values) => {
      handleCreateSupplier(values);
    });
  };

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans pb-20">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8">
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
              Add New Supplier
            </Title>
            <Text className="text-slate-400 font-medium">
              Register a new vendor/supplier to your company's network
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
            icon={
              isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )
            }
            loading={isSubmitting}
            onClick={onSubmit}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-white !bg-[#39c6c6] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20 hover:!bg-[#2eb1b1]"
          >
            Save Supplier
          </Button>
        </Space>
      </div>

      {/* FORM SECTION */}
      <div className="max-w-4xl mx-auto">
        <Card className="!rounded-2xl !shadow-sm !border-slate-100 !p-4">
          <Form
            form={form}
            layout="vertical"
            className="!mt-2"
            initialValues={{
              name: "",
              contactPerson: "",
              email: "",
              phone: "",
              address: "",
            }}
          >
            <Row gutter={24}>
              {/* CỘT TRÁI: Thông tin chính */}
              <Col span={12}>
                <div className="space-y-1">
                  <Text className="block !font-bold !text-slate-700 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Building2 size={14} className="text-[#38c6c6]" /> Company
                    Details
                  </Text>

                  <Form.Item
                    name="name"
                    label={
                      <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                        Supplier Name
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter the supplier's name",
                      },
                      { whitespace: true, message: "Name cannot be empty" },
                    ]}
                  >
                    <Input
                      placeholder="e.g. ABC Electronics Ltd."
                      prefix={
                        <Building2 size={18} className="text-slate-300 mr-2" />
                      }
                      className="custom-supplier-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="address"
                    label={
                      <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                        Address
                      </span>
                    }
                  >
                    <Input.TextArea
                      placeholder="Enter full address..."
                      autoSize={{ minRows: 4, maxRows: 6 }}
                      className="custom-supplier-textarea"
                    />
                  </Form.Item>
                </div>
              </Col>

              {/* CỘT PHẢI: Thông tin liên lạc */}
              <Col span={12}>
                <div className="space-y-1">
                  <Text className="block !font-bold !text-slate-700 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                    <User size={14} className="text-[#38c6c6]" /> Contact
                    Information
                  </Text>

                  <Form.Item
                    name="contactPerson"
                    label={
                      <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                        Contact Person
                      </span>
                    }
                  >
                    <Input
                      placeholder="e.g. John Doe"
                      prefix={
                        <User size={18} className="text-slate-300 mr-2" />
                      }
                      className="custom-supplier-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label={
                      <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                        Email Address
                      </span>
                    }
                    rules={[
                      {
                        type: "email",
                        message: "Please enter a valid email address",
                      },
                    ]}
                  >
                    <Input
                      placeholder="contact@supplier.com"
                      prefix={
                        <Mail size={18} className="text-slate-300 mr-2" />
                      }
                      className="custom-supplier-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label={
                      <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                        Phone Number
                      </span>
                    }
                  >
                    <Input
                      placeholder="+84 123 456 789"
                      prefix={
                        <Phone size={18} className="text-slate-300 mr-2" />
                      }
                      className="custom-supplier-input"
                    />
                  </Form.Item>
                </div>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>

      {/* Global CSS để bo cong và làm đẹp Input */}
      <style jsx global>{`
        .custom-supplier-input {
          height: 48px !important;
          border-radius: 12px !important;
          background-color: #f8fafc !important; /* bg-slate-50 */
          border: 1px solid #f1f5f9 !important;
          font-weight: 500;
          color: #334155;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }

        .custom-supplier-textarea {
          border-radius: 12px !important;
          background-color: #f8fafc !important;
          border: 1px solid #f1f5f9 !important;
          font-weight: 500;
          color: #334155;
          padding: 12px !important;
          transition: all 0.2s ease;
        }

        .custom-supplier-input:focus-within,
        .custom-supplier-textarea:focus {
          box-shadow: 0 0 0 2px rgba(57, 198, 198, 0.2) !important;
          border-color: #39c6c6 !important;
          background-color: #ffffff !important;
        }

        .custom-supplier-input input::placeholder,
        .custom-supplier-textarea::placeholder {
          color: #94a3b8 !important; /* text-slate-400 */
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default CreateSupplier;
