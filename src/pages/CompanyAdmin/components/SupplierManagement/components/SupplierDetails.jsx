import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Spin,
  message,
  Card,
  Typography,
  Button,
  Tag,
  Row,
  Col,
  Space,
  Divider,
} from "antd";
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Edit,
  Package,
  ShoppingCart,
} from "lucide-react";
import dayjs from "dayjs";
import api from "../../../../../api/axios"; // Đường dẫn API có thể thay đổi tùy cấu trúc thư mục của bạn

const { Title, Text } = Typography;

const SupplierDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState(null);

  // ==========================================
  // 1. FETCH DATA
  // ==========================================
  const fetchSupplierDetails = useCallback(async () => {
    if (!userId) {
      message.error("User ID not found. Please log in again.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/Suppliers/get-by-id/${userId}/${id}`);
      setSupplier(res.data);
    } catch (error) {
      console.error("Fetch supplier error:", error);
      message.error("Failed to load supplier details.");
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    fetchSupplierDetails();
  }, [fetchSupplierDetails]);

  // ==========================================
  // 2. RENDER HELPERS
  // ==========================================
  const getStatusTag = (status) => {
    const isActive = status?.toLowerCase() === "active";
    return (
      <Tag
        color={isActive ? "green" : "red"}
        className="!rounded-md !px-3 !py-0.5 !font-bold uppercase text-[10px] !m-0"
      >
        {status || "Unknown"}
      </Tag>
    );
  };

  if (loading || !supplier) {
    return (
      <div className="h-screen flex justify-center items-center bg-[#F8FAFC]">
        <Spin size="large" tip="Loading supplier details..." />
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              <Title
                level={2}
                className="!mb-0 !font-extrabold !tracking-tight !text-slate-800"
              >
                Supplier Details
              </Title>
              {getStatusTag(supplier.status)}
            </div>
            <Text className="text-slate-400 font-medium">
              View complete information and history for this vendor
            </Text>
          </div>
        </div>
        <Space size="middle">
          <Button
            type="primary"
            icon={<Edit size={16} />}
            onClick={() => message.info("Edit feature coming soon!")}
            className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-white !bg-[#39c6c6] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20 hover:!bg-[#2eb1b1]"
          >
            Edit Supplier
          </Button>
        </Space>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* QUICK STATS ROW */}
        <Row gutter={24}>
          <Col span={8}>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-[#39c6c6]">
                  <Package size={24} />
                </div>
                <div className="flex flex-col">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    Supplied Products
                  </Text>
                  <Text className="font-black text-2xl text-slate-800">
                    {supplier.defaultSupplierProducts?.length || 0}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <ShoppingCart size={24} />
                </div>
                <div className="flex flex-col">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    Inbound Orders
                  </Text>
                  <Text className="font-black text-2xl text-slate-800">
                    {supplier.inboundOrders?.length || 0}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                  <Activity size={24} />
                </div>
                <div className="flex flex-col">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    Inbound Requests
                  </Text>
                  <Text className="font-black text-2xl text-slate-800">
                    {supplier.inboundRequests?.length || 0}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={24}>
          {/* LEFT COLUMN: COMPANY DETAILS */}
          <Col span={14}>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100 h-full">
              <Text className="block !font-bold !text-slate-700 mb-6 uppercase text-[10px] tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 size={16} className="text-[#38c6c6]" /> Company
                Overview
              </Text>

              <div className="space-y-6">
                <div>
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1 block">
                    Company Name
                  </Text>
                  <Text className="font-bold text-slate-800 text-lg">
                    {supplier.name}
                  </Text>
                </div>

                <div>
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1 block">
                    Registered Address
                  </Text>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-slate-400 mt-0.5" />
                    <Text className="font-medium text-slate-700 text-base">
                      {supplier.address || (
                        <span className="italic text-slate-400">
                          No address provided
                        </span>
                      )}
                    </Text>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1 block">
                      Supplier ID
                    </Text>
                    <Text className="font-bold text-slate-700 text-base">
                      #{String(supplier.id).padStart(4, "0")}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1 block">
                      Registration Date
                    </Text>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      <Text className="font-medium text-slate-700 text-base">
                        {dayjs(supplier.createdAt).format("MMM DD, YYYY")}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* RIGHT COLUMN: CONTACT DETAILS */}
          <Col span={10}>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100 h-full !bg-gradient-to-br from-white to-slate-50/50">
              <Text className="block !font-bold !text-slate-700 mb-6 uppercase text-[10px] tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
                <User size={16} className="text-[#38c6c6]" /> Point of Contact
              </Text>

              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-cyan-100 text-[#39c6c6] flex items-center justify-center text-2xl font-black mb-3">
                  {supplier.contactPerson ? (
                    supplier.contactPerson.charAt(0).toUpperCase()
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <Title level={4} className="!mb-0 !text-slate-800">
                  {supplier.contactPerson || "Unknown Contact"}
                </Title>
                <Text className="text-slate-400 font-medium">
                  Primary Representative
                </Text>
              </div>

              <Divider className="!my-4" />

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Phone size={18} />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                      Phone Number
                    </Text>
                    <Text className="font-bold text-slate-700 text-base">
                      {supplier.phone || "---"}
                    </Text>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
                    <Mail size={18} />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                      Email Address
                    </Text>
                    <Text className="font-bold text-slate-700 text-base">
                      {supplier.email || "---"}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SupplierDetails;
