import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Spin,
  Row,
  Col,
  ConfigProvider,
  Upload,
} from "antd";
import api from "../../../api/axios";

const EditProfilePage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // URL: /company-admin/profile/9/edit -> useParams sẽ lấy giá trị ứng với ":id"
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // State lưu trữ file ảnh avatar
  const [avatarFile, setAvatarFile] = useState(null);

  // Logic: Ưu tiên ID từ URL (id), nếu không có mới dùng trong localStorage
  const storedUserId = localStorage.getItem("userId");
  const effectiveUserId = id || storedUserId;

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      if (!effectiveUserId) {
        message.error("User ID not found!");
        navigate("/auth");
        return;
      }
      try {
        setFetching(true);
        // Gọi API lấy thông tin user hiện tại
        const res = await api.get(`/Users/get-user-profile/${effectiveUserId}`);
        const data = res.data;

        form.setFieldsValue({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
        });
      } catch (error) {
        console.error("Fetch profile error:", error);
        message.error("Failed to load profile data");
      } finally {
        setFetching(false);
      }
    };
    fetchCurrentProfile();
  }, [effectiveUserId, form, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Lấy companyId từ localStorage
      const storedCompanyId = parseInt(localStorage.getItem("companyId")) || 0;

      // Tạo FormData để hỗ trợ gửi file (multipart/form-data)
      const formData = new FormData();
      formData.append("CompanyId", storedCompanyId);
      formData.append("FullName", values.fullName);
      formData.append("Email", values.email);

      if (values.phone) {
        formData.append("Phone", values.phone);
      }

      // API yêu cầu trường tên là Password
      if (values.passwordHash) {
        formData.append("Password", values.passwordHash);
      }

      // Đính kèm file Avatar nếu người dùng có chọn ảnh mới
      if (avatarFile) {
        formData.append("Avatar", avatarFile);
      }

      const res = await api.put(
        `/Users/update-profile/${effectiveUserId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.status === 200 || res.status === 204 || res.status === 201) {
        message.success("Profile updated successfully!");
        // Quay lại trang profile tương ứng
        navigate(`/company-admin/profile/${effectiveUserId}`);
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="!min-h-screen !flex !items-center !justify-center !bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#39c6c6" } }}>
      <div className="!bg-slate-50 !min-h-screen !font-sans !py-12 !px-4 text-slate-900">
        <div className="!max-w-2xl !mx-auto">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="!mb-6 !flex !items-center !text-slate-500 hover:!text-[#39c6c6] !font-bold"
          >
            BACK
          </Button>

          <Card
            className="!shadow-2xl !shadow-slate-200/50 !rounded-[2.5rem] !border-none !p-4 md:!p-8"
            title={
              <div className="!py-4">
                <h1 className="!text-2xl !font-black !text-slate-800 !tracking-tight uppercase">
                  Edit Account
                </h1>
                <p className="!text-slate-400 !text-sm !font-medium">
                  Updating User ID:{" "}
                  <span className="!text-[#39c6c6]">{effectiveUserId}</span>
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
            >
              <Row gutter={24}>
                {/* UPLOAD AVATAR */}
                <Col span={24} className="!flex !justify-center !mb-6">
                  <Form.Item name="avatar">
                    <Upload
                      name="avatar"
                      listType="picture-circle"
                      className="avatar-uploader"
                      showUploadList={true}
                      maxCount={1}
                      beforeUpload={(file) => {
                        const isImage = file.type.startsWith("image/");
                        if (!isImage) {
                          message.error("You can only upload image files!");
                          return Upload.LIST_IGNORE;
                        }
                        const isLt2M = file.size / 1024 / 1024 < 2;
                        if (!isLt2M) {
                          message.error("Image must be smaller than 2MB!");
                          return Upload.LIST_IGNORE;
                        }

                        setAvatarFile(file);
                        return false;
                      }}
                      onRemove={() => {
                        setAvatarFile(null);
                      }}
                    >
                      {/* --- CHỈ SỬA ĐOẠN NÀY --- */}
                      {/* Nếu đã có avatarFile thì ẩn nút Upload đi, nếu chưa có thì hiện */}
                      {avatarFile ? null : (
                        <div className="!flex !flex-col !items-center !text-slate-400 hover:!text-[#39c6c6] transition-colors">
                          <UploadOutlined className="!text-2xl !mb-2" />
                          <div style={{ marginTop: 8 }}>Upload Avatar</div>
                        </div>
                      )}
                      {/* ------------------------- */}
                    </Upload>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label={
                      <span className="!font-bold !text-slate-600">
                        Full Name
                      </span>
                    }
                    name="fullName"
                    rules={[{ required: true, message: "Required!" }]}
                  >
                    <Input
                      prefix={
                        <UserOutlined className="!text-[#39c6c6] !mr-2" />
                      }
                      size="large"
                      className="!rounded-xl !h-12"
                    />
                  </Form.Item>
                </Col>

                <Col span={24} md={12}>
                  <Form.Item
                    label={
                      <span className="!font-bold !text-slate-600">Email</span>
                    }
                    name="email"
                    rules={[{ required: true, type: "email" }]}
                  >
                    <Input
                      prefix={
                        <MailOutlined className="!text-[#39c6c6] !mr-2" />
                      }
                      size="large"
                      className="!rounded-xl !h-12"
                    />
                  </Form.Item>
                </Col>

                <Col span={24} md={12}>
                  <Form.Item
                    label={
                      <span className="!font-bold !text-slate-600">Phone</span>
                    }
                    name="phone"
                  >
                    <Input
                      prefix={
                        <PhoneOutlined className="!text-[#39c6c6] !mr-2" />
                      }
                      size="large"
                      className="!rounded-xl !h-12"
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label={
                      <span className="!font-bold !text-slate-600">
                        New Password
                      </span>
                    }
                    name="passwordHash"
                    extra={
                      <span className="!text-[10px] !text-slate-400">
                        Leave blank to keep current
                      </span>
                    }
                  >
                    <Input.Password
                      prefix={
                        <LockOutlined className="!text-[#39c6c6] !mr-2" />
                      }
                      size="large"
                      className="!rounded-xl !h-12"
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
                  SAVE CHANGES
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default EditProfilePage;
