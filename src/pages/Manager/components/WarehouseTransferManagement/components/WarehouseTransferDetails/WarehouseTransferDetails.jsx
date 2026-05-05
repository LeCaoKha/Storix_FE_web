import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Spin,
  message,
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Avatar,
  Divider,
} from "antd";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  Package,
  MapPin,
  ArrowRight,
  Truck,
  Calendar,
  User,
} from "lucide-react";
import api from "../../../../../../api/axios";

const { Title, Text } = Typography;

const WarehouseTransferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Lấy ID từ localStorage
  const companyId = localStorage.getItem("companyId");
  const warehouseId = localStorage.getItem("warehouseId");

  // ==========================================
  // 1. STATES
  // ==========================================
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States cho Staff Assigned (Nguồn) hiển thị ở thẻ bên phải
  const [sourceStaffList, setSourceStaffList] = useState([]);
  const [assignedStaffId, setAssignedStaffId] = useState(null);
  const [loadingSourceStaff, setLoadingSourceStaff] = useState(false);

  // ==========================================
  // 2. FETCH DATA
  // ==========================================
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/warehouse-transfers/${id}`);
      setDetails(res.data);
    } catch (error) {
      console.error("Fetch details error:", error);
      message.error("Failed to load transfer details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchSourceStaff = useCallback(async () => {
    if (!companyId) return;
    setLoadingSourceStaff(true);
    try {
      const res = await api.get(`/Users/get-staffs-by-companyId/${companyId}`);
      // Lọc lấy nhân viên (role 4) thuộc kho đang đăng nhập
      const staffOnly = (res.data || []).filter(
        (u) => u.roleId === 4 && String(u.warehouseId) === String(warehouseId),
      );
      setSourceStaffList(staffOnly);
    } catch (error) {
      console.error("Fetch staff error:", error);
      message.error("Failed to load source staff list");
    } finally {
      setLoadingSourceStaff(false);
    }
  }, [companyId, warehouseId]);

  useEffect(() => {
    fetchDetails();
    if (companyId) {
      fetchSourceStaff();
    }
  }, [fetchDetails, fetchSourceStaff, companyId]);

  // ==========================================
  // 3. ACTIONS: SUBMIT & APPROVE
  // ==========================================

  // Submit Transfer (Kho Nguồn)
  const handleSubmit = async () => {
    if (!details?.items || details.items.length === 0) {
      return message.warning("Transfer must have at least one item to submit");
    }
    if (!assignedStaffId) {
      return message.warning(
        "Please assign a staff member to handle this transfer",
      );
    }

    setIsSubmitting(true);
    try {
      await api.post(`/warehouse-transfers/${id}/submit`, {
        staffId: assignedStaffId,
      });
      message.success("Transfer request submitted successfully!");
      fetchDetails();
    } catch (error) {
      console.error("Submit error:", error);
      message.error(
        error.response?.data?.message || "Failed to submit transfer",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nút gọi API Approve (Gọi thẳng API Decide)
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await api.post(`/warehouse-transfers/${id}/decide`, {
        isApprove: true,
        reason: "Approved", // Bạn có thể tùy chỉnh reason nếu cần
      });

      message.success("Transfer approved successfully!");
      fetchDetails();
    } catch (error) {
      console.error("Approve error:", error);
      message.error(
        error.response?.data?.message || "Failed to approve transfer",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // 4. RENDER HELPERS
  // ==========================================
  const getStatusColor = (status) => {
    // Chuyển toàn bộ status về chữ thường (lowercase) để dễ check switch-case
    // Tránh bị lỗi case-sensitive (ví dụ: "PENDING_APPROVAL" vs "Pending_Approval")
    const safeStatus = (status || "").toLowerCase();

    switch (safeStatus) {
      case "draft":
        return "gold";
      case "submitted":
      case "pending_approval":
        return "blue";
      case "approved":
        return "green";
      case "completed":
        return "cyan";
      case "rejected":
        return "red";
      default:
        return "default";
    }
  };

  const formatStatus = (status) => {
    // Format lại chuỗi "PENDING_APPROVAL" thành "Pending Approval" cho đẹp mắt
    if (!status) return "Unknown";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (loading || !details) {
    return (
      <div className="h-screen flex justify-center items-center bg-[#F8FAFC]">
        <Spin size="large" tip="Loading transfer details..." />
      </div>
    );
  }

  // ĐÃ SỬA LẠI BIẾN KIỂM TRA TRẠNG THÁI Ở ĐÂY
  const isDraft = details.status === "DRAFT";
  const isPendingApproval = details.status === "PENDING_APPROVAL";

  const totalItems = details.items?.length || 0;
  const totalQuantity =
    details.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans pb-20">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-10">
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
                Transfer #{String(details.id).padStart(4, "0")}
              </Title>
              <Tag
                color={getStatusColor(details.status)}
                className="!rounded-full !px-3 !py-0.5 !font-bold !uppercase !border-none"
              >
                {formatStatus(details.status)}
              </Tag>
            </div>
            <Text className="text-slate-400 font-medium">
              Review and manage warehouse transfer details
            </Text>
          </div>
        </div>

        <Space size="middle">
          {/* Nút Submit hiển thị khi status là DRAFT */}
          {isDraft && (
            <Button
              icon={<Send size={18} />}
              onClick={handleSubmit}
              loading={isSubmitting}
              className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-slate-700 !bg-white !border-slate-200 hover:!border-[#39c6c6] hover:!text-[#39c6c6] !rounded-xl shadow-sm"
            >
              Submit Transfer
            </Button>
          )}

          {/* MỚI: Nút Approve hiển thị khi status là PENDING_APPROVAL */}
          {isPendingApproval && (
            <Button
              type="primary"
              icon={<CheckCircle size={18} />}
              onClick={handleApprove}
              loading={isSubmitting}
              className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-white !bg-[#39c6c6] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20 hover:!bg-[#2eb1b1]"
            >
              Approve Request
            </Button>
          )}
        </Space>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* CỘT TRÁI (65%): DANH SÁCH SẢN PHẨM */}
        <div className="flex-[2] space-y-6">
          <Card className="!rounded-2xl !shadow-sm !border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <Package size={18} className="text-[#38c6c6]" />
              <Text className="!text-xs !font-bold !text-slate-500 !tracking-widest !uppercase">
                Transferred Products
              </Text>
            </div>

            {details.items && details.items.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center px-4 text-[10px] !uppercase !font-bold text-slate-400 !tracking-widest mb-1">
                  <span className="flex-1">Product Details</span>
                  <span className="w-32 text-center">Transfer Qty</span>
                </div>

                {details.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar
                        shape="square"
                        size={48}
                        icon={<Package size={20} />}
                        src={item.productImage || item.imageUrl}
                        className="!bg-white !border !border-slate-200 !text-slate-300"
                      />
                      <div className="flex flex-col">
                        <Text className="!font-bold !text-slate-800">
                          {item.productName || `Product #${item.productId}`}
                        </Text>
                        <Text className="!text-[10px] !text-slate-400 !font-mono">
                          SKU: {item.productSku || "N/A"}
                        </Text>
                      </div>
                    </div>

                    <div className="w-32 flex justify-center">
                      <Tag
                        color="cyan"
                        className="!m-0 !px-4 !py-1 !rounded-lg !font-black !text-sm !border-none"
                      >
                        {item.quantity}
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 flex flex-col items-center justify-center text-slate-400">
                <Package size={40} className="mb-2 opacity-20" />
                <p>No products found in this transfer.</p>
              </div>
            )}
          </Card>
        </div>

        {/* CỘT PHẢI (35%): THÔNG TIN VẬN CHUYỂN & SUMMARY */}
        <div className="flex-1 space-y-6">
          {/* ROUTE INFO */}
          <div>
            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <div className="space-y-5">
                <div>
                  <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <MapPin size={14} className="text-[#38c6c6]" /> Transfer
                    From
                  </Text>
                  <div className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-bold">
                    {details.sourceWarehouseName ||
                      `Warehouse #${details.sourceWarehouseId}`}
                  </div>
                </div>

                <div className="flex justify-center -my-3 opacity-50">
                  <ArrowRight
                    size={20}
                    className="text-slate-400 rotate-90 lg:rotate-0"
                  />
                </div>

                <div>
                  <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <MapPin size={14} className="text-rose-400" /> Transfer To
                  </Text>
                  <div className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-bold">
                    {details.destinationWarehouseName ||
                      `Warehouse #${details.destinationWarehouseId}`}
                  </div>
                </div>

                <Divider className="!my-2 !border-slate-100" />

                <div>
                  <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <Truck size={14} className="text-slate-400" /> Assigned
                    Carrier
                  </Text>
                  {details.carrierName ? (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <Avatar
                        size="small"
                        icon={<User size={14} />}
                        className="!bg-[#38c6c6] !text-white"
                      />
                      <Text className="font-bold text-slate-700">
                        {details.carrierName}
                      </Text>
                    </div>
                  ) : (
                    <Text className="italic text-slate-400 text-sm">
                      No carrier assigned yet.
                    </Text>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* SUMMARY */}
          <Card className="!rounded-2xl !shadow-sm !border-slate-100">
            <Text className="!text-lg !font-bold !text-slate-800 !block !mb-5">
              Transfer Summary
            </Text>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                <Text className="!text-slate-500">Total Unique SKUs</Text>
                <Text className="!font-bold !text-slate-700">{totalItems}</Text>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                <Text className="!text-slate-500">Total Units</Text>
                <Text className="!font-black !text-lg !text-[#38c6c6]">
                  {totalQuantity}
                </Text>
              </div>
              <div className="flex items-center justify-between">
                <Text className="!text-slate-500 flex items-center gap-1">
                  <Calendar size={14} /> Created
                </Text>
                <Text className="!font-medium !text-slate-600">
                  {new Date(details.createdAt).toLocaleDateString("en-GB")}
                </Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WarehouseTransferDetails;
