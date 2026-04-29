import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Warehouse,
  MapPin,
  BadgeInfo,
  Calendar,
  User,
  Mail,
  Phone,
  Users,
  Settings2,
} from "lucide-react";
import {
  Card,
  Tag,
  Row,
  Col,
  Spin,
  Typography,
  Button,
  Divider,
  Empty,
  message,
  ConfigProvider,
  Modal,
  Table,
} from "antd";
import api from "../../../../../../api/axios";

const { Title, Text, Paragraph } = Typography;

const WarehouseDetails = () => {
  const { id: warehouseId } = useParams();
  const navigate = useNavigate();

  // States cho chi tiết kho
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);

  // States cho Modal Assign User
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const companyId = localStorage.getItem("companyId");

  // --- ĐÃ THÊM: Lấy roleId từ localStorage ---
  const roleId = Number(localStorage.getItem("roleId"));

  // ========================================================
  // 1. FETCH WAREHOUSE DETAILS
  // ========================================================
  // Bọc trong useCallback để có thể gọi lại sau khi assign thành công
  const fetchDetails = useCallback(async () => {
    if (!companyId || !warehouseId) return;
    try {
      setLoading(true);
      const res = await api.get(
        `/company-warehouses/${companyId}/assignments/warehouse/${warehouseId}`,
      );
      setAssignments(res.data || []);
    } catch (error) {
      console.error("Fetch warehouse details error:", error);
      message.error("Failed to load warehouse information");
    } finally {
      setLoading(false);
    }
  }, [companyId, warehouseId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // ========================================================
  // 2. FETCH UNASSIGNED USERS KHI MỞ MODAL
  // ========================================================
  const fetchUnassignedUsers = async () => {
    setIsFetchingUsers(true);
    try {
      const res = await api.get(`/Users`);
      // Lọc: chưa có kho (warehouseId === null) VÀ role là Manager(3) hoặc Staff(4)
      const filteredUsers = (res.data || []).filter(
        (user) =>
          user.warehouseId === null && (user.roleId === 3 || user.roleId === 4),
      );
      setUnassignedUsers(filteredUsers);
    } catch (error) {
      console.error("Fetch users error:", error);
      message.error("Failed to load users list");
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const handleOpenAssignModal = () => {
    setIsModalOpen(true);
    fetchUnassignedUsers();
  };

  // ========================================================
  // 3. XỬ LÝ ASSIGN USER
  // ========================================================
  const handleAssignUser = async () => {
    if (!selectedUserId) {
      return message.warning("Please select a user to assign.");
    }

    setIsAssigning(true);
    try {
      const payload = {
        userId: Number(selectedUserId),
        warehouseId: Number(warehouseId),
      };

      await api.post(`/company-warehouses/${companyId}/assignments`, payload);

      message.success("Personnel assigned successfully!");
      setIsModalOpen(false);
      setSelectedUserId(null); // Reset lại state

      // Tải lại chi tiết kho để cập nhật danh sách
      fetchDetails();
    } catch (error) {
      console.error("Assign user error:", error);
      message.error(error.response?.data?.message || "Failed to assign user");
    } finally {
      setIsAssigning(false);
    }
  };

  // ========================================================
  // 4. CẤU HÌNH CỘT CHO BẢNG USERS
  // ========================================================
  const userColumns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <User size={14} />
          </div>
          <Text className="font-bold text-slate-700">{text}</Text>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <Text className="text-slate-500">{text}</Text>,
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      render: (role, record) => (
        <Tag
          color={record.roleId === 3 ? "blue" : "default"}
          className="!rounded-md !font-bold !border-none"
        >
          {role}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="!min-h-screen !flex !items-center !justify-center !bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  // Lấy thông tin chung của Warehouse từ bản ghi đầu tiên
  const warehouseInfo = assignments[0]?.warehouse;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#39c6c6" } }}>
      <div className="!bg-slate-50 !min-h-screen !font-sans !py-10 !px-4 md:!px-12 !text-slate-900">
        <div className="!max-w-6xl !mx-auto">
          {/* HEADER SECTION */}
          <div className="!flex !flex-col md:!flex-row !justify-between !items-start md:!items-center !mb-8 !gap-4">
            <div className="!flex !items-center !gap-4">
              <Button
                type="text"
                icon={<ArrowLeft size={20} />}
                onClick={() => navigate(-1)}
                className="hover:!text-[#39c6c6] !flex !items-center !justify-center"
              />
              <div>
                <Title level={2} className="!mb-0 !font-black !tracking-tight">
                  Warehouse Details
                </Title>
              </div>
            </div>

            <div className="!flex !items-center !gap-3">
              <Button
                type="primary"
                icon={<Settings2 size={18} />}
                onClick={() =>
                  navigate(
                    `/company-admin/warehouse-configuration/${warehouseId}`,
                  )
                }
                className="!bg-[#39c6c6] !border-none !rounded-xl !font-bold !h-10 !flex !items-center hover:!bg-[#2eb1b1] !shadow-lg !shadow-[#39c6c6]/20"
              >
                Config Structure
              </Button>

              {warehouseInfo && (
                <Tag
                  color={warehouseInfo.status === "Active" ? "cyan" : "red"}
                  className="!rounded-full !px-6 !py-1 !border-none !font-bold !uppercase !h-8 !flex !items-center"
                >
                  {warehouseInfo.status}
                </Tag>
              )}
            </div>
          </div>

          {!warehouseInfo ? (
            <Card className="!rounded-3xl !border-none !shadow-xl">
              <Empty description="No data found for this warehouse" />
            </Card>
          ) : (
            <Row gutter={[24, 24]}>
              {/* LEFT COLUMN: WAREHOUSE CORE INFO */}
              <Col span={24} lg={14}>
                <Card className="!shadow-2xl !shadow-slate-200/50 !rounded-[2rem] !border-none !h-full">
                  <div className="!flex !items-center !gap-3 !mb-6">
                    <div className="!p-3 !bg-[#39c6c6]/10 !rounded-2xl !text-[#39c6c6]">
                      <Warehouse size={24} />
                    </div>
                    <Title
                      level={4}
                      className="!mb-0 !font-bold !text-slate-800"
                    >
                      <Text className="!text-xl !font-bold !text-slate-700">
                        {warehouseInfo.name}
                      </Text>
                    </Title>
                  </div>

                  <div className="!space-y-6">
                    <div className="!flex !items-start !gap-3">
                      <MapPin size={18} className="!text-slate-400 !mt-1" />
                      <div>
                        <Text className="!text-slate-400 !text-xs !uppercase !font-bold !tracking-widest !block">
                          Address
                        </Text>
                        <Text className="!text-slate-600 !italic">
                          {warehouseInfo.address}
                        </Text>
                      </div>
                    </div>

                    <div className="!flex !items-start !gap-3">
                      <BadgeInfo size={18} className="!text-slate-400 !mt-1" />
                      <div>
                        <Text className="!text-slate-400 !text-xs !uppercase !font-bold !tracking-widest !block">
                          Description
                        </Text>
                        <Paragraph className="!text-slate-600 !mb-0">
                          {warehouseInfo.description ||
                            "No description provided."}
                        </Paragraph>
                      </div>
                    </div>

                    <Divider className="!my-4" />

                    <div className="!flex !items-center !gap-3">
                      <Calendar size={18} className="!text-slate-400" />
                      <Text className="!text-slate-400 !text-sm">
                        Registered on:{" "}
                        <span className="!text-slate-600 !font-medium">
                          {new Date(warehouseInfo.createdAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>

              {/* RIGHT COLUMN: PERSONNEL & ASSIGNMENTS */}
              <Col span={24} lg={10}>
                <Card className="!shadow-2xl !shadow-slate-200/50 !rounded-[2rem] !border-none !h-full flex flex-col">
                  <div className="!flex !items-center !gap-3 !mb-6">
                    <div className="!p-3 !bg-[#39c6c6]/10 !rounded-2xl !text-[#39c6c6]">
                      <Users size={24} />
                    </div>
                    <Title
                      level={4}
                      className="!mb-0 !font-bold !text-slate-800"
                    >
                      Assigned Personnel
                    </Title>
                  </div>

                  <div className="!space-y-4 !flex-1 !overflow-y-auto !max-h-[300px] !pr-2">
                    {assignments.map((item) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          navigate(
                            `/company-admin/account-management/details/${item.user.id}`,
                          )
                        }
                        className="!p-4 !bg-slate-50 !rounded-2xl !border !border-slate-100 !flex !items-start !gap-4 !transition-all hover:!bg-white hover:!shadow-md cursor-pointer"
                      >
                        <div className="!w-12 !h-12 !rounded-xl !bg-white !border !border-slate-200 !flex !items-center !justify-center !text-[#39c6c6] !shadow-sm">
                          <User size={20} />
                        </div>
                        <div className="!flex-1 !min-w-0">
                          <div className="!flex !justify-between !items-start !mb-1">
                            <Text className="!font-bold !text-slate-800 !truncate !block">
                              {item.user.fullName}
                            </Text>
                            <Tag
                              color="blue"
                              className="!mr-0 !rounded-md !font-bold !text-[10px]"
                            >
                              {item.roleInWarehouse}
                            </Tag>
                          </div>
                          <div className="!flex !items-center !gap-2 !text-slate-400 !text-xs !mb-1">
                            <Mail size={12} />
                            <span className="!truncate">{item.user.email}</span>
                          </div>
                          <div className="!flex !items-center !gap-2 !text-slate-400 !text-xs">
                            <Phone size={12} />
                            <span>{item.user.phone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {assignments.length === 0 && (
                      <Text className="!text-slate-400 !italic !text-center !block !py-8">
                        No staff assigned to this warehouse.
                      </Text>
                    )}
                  </div>

                  {/* --- ĐÃ CẬP NHẬT: CHỈ HIỂN THỊ KHI ROLE ID LÀ 2 --- */}
                  {roleId === 2 && (
                    <Button
                      block
                      onClick={handleOpenAssignModal}
                      className="!mt-8 !h-12 !rounded-xl !font-bold !border-[#39c6c6] !text-[#39c6c6] hover:!bg-[#39c6c6]/5"
                    >
                      Manage Assignments
                    </Button>
                  )}
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </div>

      {/* MODAL ASSIGN USER (DẠNG TABLE) */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Users className="text-[#39c6c6]" size={24} />
            <span className="font-bold text-lg text-slate-800">
              Assign Personnel
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedUserId(null);
        }}
        footer={null}
        centered
        width={700}
        className="custom-modal"
      >
        <div className="py-4">
          <Text className="block mb-6 text-slate-500">
            Select an unassigned Manager or Staff to add them to{" "}
            <Text strong>{warehouseInfo?.name}</Text>.
          </Text>

          <div className="border border-slate-100 rounded-xl overflow-hidden mb-6">
            <Table
              rowSelection={{
                type: "radio",
                selectedRowKeys: selectedUserId ? [selectedUserId] : [],
                onChange: (selectedRowKeys) => {
                  setSelectedUserId(selectedRowKeys[0]);
                },
              }}
              columns={userColumns}
              dataSource={unassignedUsers}
              rowKey="id"
              loading={isFetchingUsers}
              pagination={{ pageSize: 5, size: "small" }}
              className="custom-radio-table"
              size="middle"
              locale={{
                emptyText: (
                  <Empty description="No available unassigned personnel" />
                ),
              }}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedUserId(null);
              }}
              className="!h-10 !rounded-xl !font-bold hover:!bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={isAssigning}
              onClick={handleAssignUser}
              disabled={!selectedUserId}
              className="!h-10 !px-6 !rounded-xl !bg-[#39c6c6] !border-none !font-bold shadow-md shadow-[#39c6c6]/20"
            >
              Assign User
            </Button>
          </div>
        </div>
      </Modal>

      {/* CSS Tùy chỉnh cho Table Radio và Modal */}
      <style jsx global>{`
        .custom-modal .ant-modal-content {
          border-radius: 20px !important;
          padding: 24px !important;
        }
        .custom-radio-table .ant-radio-checked .ant-radio-inner {
          border-color: #39c6c6 !important;
          background-color: #39c6c6 !important;
        }
        .custom-radio-table .ant-radio-wrapper:hover .ant-radio-inner {
          border-color: #39c6c6 !important;
        }
        .custom-radio-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #64748b !important;
          font-size: 11px !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .custom-radio-table .ant-table-row:hover > td {
          background-color: #f1f5f9 !important;
          cursor: pointer;
        }
      `}</style>
    </ConfigProvider>
  );
};

export default WarehouseDetails;
