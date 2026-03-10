import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Warehouse,
  MapPin,
  User,
  CheckCircle,
  FileText,
} from "lucide-react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Row,
  Col,
  ConfigProvider,
  Select,
  Spin,
} from "antd";
import api from "../../../../../../api/axios";

const { TextArea } = Input;

const CreateWarehouse = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State để lưu danh sách Manager và trạng thái load
  const [managers, setManagers] = useState([]);
  const [fetchingManagers, setFetchingManagers] = useState(false);

  const companyId = localStorage.getItem("companyId");

  // --- FETCH MANAGERS LOGIC ---
  useEffect(() => {
    const fetchManagers = async () => {
      if (!companyId) return;

      try {
        setFetchingManagers(true);
        const res = await api.get("/Users");

        // Lọc user: cùng companyId và roleName là "Manager"
        const filteredManagers = res.data.filter(
          (user) =>
            user.roleName === "Manager" &&
            user.companyId === parseInt(companyId),
        );

        setManagers(filteredManagers);
      } catch (error) {
        console.error("Fetch managers error:", error);
        message.error("Failed to load manager list");
      } finally {
        setFetchingManagers(false);
      }
    };

    fetchManagers();
  }, [companyId]);

  const onFinish = async (values) => {
    if (!companyId) {
      message.error("Company ID not found. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: values.name,
        address: values.address,
        description: values.description || "",
        status: values.status || "Active",
        assignedManagerUserId: values.assignedManagerUserId, // Select trả về value là ID luôn
      };

      const res = await api.post(
        `/create-company-warehouse/${companyId}`,
        payload,
      );

      if (res.status === 200 || res.status === 201 || res.status === 204) {
        message.success("Warehouse registered successfully!");
        navigate("/company-admin/warehouse-management");
      }
    } catch (error) {
      console.error("Create warehouse error:", error);
      message.error(
        error.response?.data?.message || "Failed to register warehouse",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#39c6c6" } }}>
      <div className="!bg-slate-50 !min-h-screen !font-sans !py-12 !px-4 text-slate-900">
        <div className="!max-w-3xl !mx-auto">
          <Button
            type="text"
            icon={<ArrowLeft size={18} className="mr-1" />}
            onClick={() => navigate(-1)}
            className="!mb-6 !flex !items-center !text-slate-500 hover:!text-[#39c6c6] !font-bold"
          >
            BACK TO LIST
          </Button>

          <Card
            className="!shadow-2xl !shadow-slate-200/50 !rounded-[2.5rem] !border-none !p-4 md:!p-8"
            title={
              <div className="!py-4">
                <h1 className="!text-2xl !font-black !text-slate-800 !tracking-tight uppercase">
                  Register New Warehouse
                </h1>
                <p className="!text-slate-400 !text-sm !font-medium">
                  Establish a new logistics hub for your company
                </p>
              </div>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              requiredMark={false}
              initialValues={{ status: "Active" }}
            >
              <Row gutter={24}>
                {/* Tên nhà kho */}
                <Col span={24}>
                  <Form.Item
                    label={
                      <span className="!font-bold !text-slate-600">
                        Warehouse Name
                      </span>
                    }
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter warehouse name!",
                      },
                    ]}
                  >
                    <Input
                      prefix={
                        <Warehouse size={18} className="text-[#39c6c6] mr-2" />
                      }
                      placeholder="e.g. Central Logistics Hub A"
                      size="large"
                      className="!rounded-xl !h-12"
                    />
                  </Form.Item>
                </Col>

                {/* Địa chỉ */}
                <Col span={24}>
                  <Form.Item
                    label={
                      <span className="!font-bold !text-slate-600">
                        Physical Address
                      </span>
                    }
                    name="address"
                    rules={[
                      { required: true, message: "Address is required!" },
                    ]}
                  >
                    <Input
                      prefix={
                        <MapPin size={18} className="text-[#39c6c6] mr-2" />
                      }
                      placeholder="Enter full street address"
                      size="large"
                      className="!rounded-xl !h-12"
                    />
                  </Form.Item>
                </Col>

                {/* Assigned Manager (Chuyển thành Select) */}
                <Col span={24} md={12}>
                  <Form.Item
                    label={
                      <span className="!font-bold !text-slate-600">
                        Assigned Manager
                      </span>
                    }
                    name="assignedManagerUserId"
                    rules={[
                      { required: true, message: "Please select a manager!" },
                    ]}
                  >
                    <Select
                      placeholder="Select a warehouse manager"
                      size="large"
                      className="!rounded-xl !h-12 w-full"
                      loading={fetchingManagers}
                      showSearch
                      optionFilterProp="label"
                      suffixIcon={<User size={18} className="text-[#39c6c6]" />}
                    >
                      {managers.map((m) => (
                        <Select.Option
                          key={m.id}
                          value={m.id}
                          label={m.fullName}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">
                              {m.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {m.email}
                            </span>
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* Status */}
                <Col span={24} md={12}>
                  <Form.Item
                    label={
                      <span className="!font-bold !text-slate-600">
                        Initial Status
                      </span>
                    }
                    name="status"
                  >
                    <Select
                      size="large"
                      className="!rounded-xl !h-12 w-full"
                      suffixIcon={
                        <CheckCircle size={18} className="text-[#39c6c6]" />
                      }
                      options={[
                        { value: "Active", label: "Active" },
                        { value: "Inactive", label: "Inactive" },
                      ]}
                    />
                  </Form.Item>
                </Col>

                {/* Mô tả */}
                <Col span={24}>
                  <Form.Item
                    label={
                      <span className="!font-bold !text-slate-600">
                        Description
                      </span>
                    }
                    name="description"
                  >
                    <TextArea
                      placeholder="Additional notes about this facility..."
                      autoSize={{ minRows: 3, maxRows: 6 }}
                      className="!rounded-xl !p-3"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="!mt-10">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="!h-14 !rounded-2xl !bg-[#39c6c6] !border-none !font-bold !text-base hover:!bg-[#2eb1b1] !shadow-xl !shadow-[#39c6c6]/30 transition-all active:scale-[0.98]"
                >
                  CREATE WAREHOUSE
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default CreateWarehouse;
