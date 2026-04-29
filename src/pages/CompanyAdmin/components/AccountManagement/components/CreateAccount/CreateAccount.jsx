import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  message,
  Row,
  Col,
  ConfigProvider,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../../../../../api/axios"; // Điều chỉnh đường dẫn theo project của bạn
import { ArrowLeft } from "lucide-react";

const CreateAccount = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- HANDLE CREATE USER ---
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Body: { fullName, email, phone, password, roleName }
      const res = await api.post("/Users", values);

      if (res.status === 200 || res.status === 201) {
        message.success("User created successfully!");
        form.resetFields();
        navigate("/company-admin/account-management"); // Quay lại trang quản lý tài khoản
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to create user";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#39c6c6" } }}>
      <div className="pt-6 pl-10 pr-10 pb-10">
        {/* --- NÚT BACK (Nằm ngoài Card) --- */}
        <div className=" h-20 relative">
          <button
            onClick={() => navigate(-1)}
            className="text-black absolute top-8 left-8 flex items-center gap-2 font-bold transition-all group"
          >
            <ArrowLeft
              size={20}
              className="!text-black group-hover:-translate-x-1 transition-transform"
            />
            BACK TO LIST
          </button>
        </div>

        <Card
          title={
            <div className="flex items-center gap-4">
              <span className="!font-bold !text-gray-700">
                CREATE NEW ACCOUNT
              </span>
            </div>
          }
          bordered={false}
          className="!max-w-[800px] !mx-auto  !shadow-xl !rounded-2xl"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            {/* ROW 1: FULL NAME */}
            <Form.Item
              label={
                <span className="font-semibold text-slate-600">Full Name</span>
              }
              name="fullName"
              rules={[{ required: true, message: "Please input full name!" }]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-400 !mr-2" />}
                placeholder="Enter full name (e.g. John Doe)"
                size="large"
                className="!rounded-xl"
              />
            </Form.Item>

            <Row gutter={16}>
              {/* ROW 2 - COL 1: EMAIL */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-slate-600">
                      Email Address
                    </span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Please input email!" },
                    { type: "email", message: "Invalid email format!" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-slate-400 !mr-2" />}
                    placeholder="example@gmail.com"
                    size="large"
                    className="!rounded-xl"
                  />
                </Form.Item>
              </Col>

              {/* ROW 2 - COL 2: PHONE */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-slate-600">
                      Phone Number
                    </span>
                  }
                  name="phone"
                  rules={[
                    { required: true, message: "Please input phone number!" },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-slate-400 !mr-2" />}
                    placeholder="0123456789"
                    size="large"
                    className="!rounded-xl"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {/* ROW 3 - COL 1: PASSWORD */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-slate-600">
                      Password
                    </span>
                  }
                  name="password"
                  rules={[
                    { required: true, message: "Please input password!" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-slate-400 !mr-2" />}
                    placeholder="Enter password"
                    size="large"
                    className="!rounded-xl"
                  />
                </Form.Item>
              </Col>

              {/* ROW 3 - COL 2: ROLE */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-slate-600">
                      Account Role
                    </span>
                  }
                  name="roleName"
                  rules={[{ required: true, message: "Please select a role!" }]}
                >
                  <Select
                    placeholder="Select role"
                    size="large"
                    className="!rounded-xl"
                    options={[
                      { value: "Manager", label: "Manager" },
                      { value: "Staff", label: "Staff" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* SUBMIT BUTTON */}
            <Form.Item className="!mb-0 !mt-4">
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
                  borderRadius: "12px",
                }}
                className="!shadow-lg !shadow-[#39c6c6]/20 hover:!bg-[#2eb1b1] transition-all"
              >
                CREATE ACCOUNT
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default CreateAccount;
