import React, { useEffect, useState } from "react";
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
  Settings2, // Thêm icon mới
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
} from "antd";
import api from "../../../../../../api/axios";

const { Title, Text, Paragraph } = Typography;

const WarehouseDetails = () => {
  const { id: warehouseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);

  const companyId = localStorage.getItem("companyId");

  console.log("warehouse: ", assignments);
  console.log("warehouse id: ", warehouseId);
  console.log("comp id: ", companyId);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!companyId || !warehouseId) return;
      try {
        setLoading(true);
        const res = await api.get(
          `/company-warehouses/${companyId}/assignments/warehouse/${warehouseId}`,
        );
        setAssignments(res.data);
      } catch (error) {
        console.error("Fetch warehouse details error:", error);
        message.error("Failed to load warehouse information");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [companyId, warehouseId]);

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
              {/* NÚT CONFIG STRUCTURE MỚI THÊM */}
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
                <Card className="!shadow-2xl !shadow-slate-200/50 !rounded-[2rem] !border-none !h-full">
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

                  <div className="!space-y-4">
                    {assignments.map((item) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          navigate(
                            `/company-admin/account-management/details/${item.user.id}`,
                          )
                        }
                        className="!p-4 !bg-slate-50 !rounded-2xl !border !border-slate-100 !flex !items-start !gap-4 !transition-all hover:!bg-white hover:!shadow-md"
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

                  <Button
                    block
                    className="!mt-8 !h-12 !rounded-xl !font-bold !border-[#39c6c6] !text-[#39c6c6] hover:!bg-[#39c6c6]/5"
                  >
                    Manage Assignments
                  </Button>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default WarehouseDetails;
