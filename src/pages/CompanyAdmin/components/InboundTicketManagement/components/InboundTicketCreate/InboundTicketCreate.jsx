import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, message } from "antd";
import api from "../../../../../../api/axios";
import DetailsHeader from "./components/DetailsHeader/DetailsHeader";
import DetailsProductList from "./components/DetailsProductList/DetailsProductList";
import DetailsSidebarInfo from "./components/DetailsSidebarInfo/DetailsSidebarInfo";
import DetailsPayment from "./components/DetailsPayment/DetailsPayment";
import DetailsNotes from "./components/DetailsNotes/DetailsNotes";

const InboundTicketCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]); // Danh sách nhân viên
  const [selectedStaffId, setSelectedStaffId] = useState(null); // ID nhân viên được chọn
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const companyId = localStorage.getItem("companyId");
  const userId = localStorage.getItem("userId");

  // ===== FIX START =====
  // Lấy thêm warehouseId từ localStorage để gọi API nhân viên
  const warehouseId = localStorage.getItem("warehouseId");
  // ===== FIX END =====

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Lấy dữ liệu Inbound Request trước
      const requestRes = await api.get(
        `/InventoryInbound/requests/${companyId}/${id}`,
      );
      setData(requestRes.data);

      // 2. Lấy danh sách User (Bọc try...catch riêng để chống sập nếu Staff bị lỗi 403)
      try {
        // ===== FIX START =====
        // Sửa API endpoint để chỉ lấy những staff thuộc về warehouse hiện tại
        const usersRes = await api.get(
          `/Users/get-users-by-warehouse/${warehouseId}`,
        );
        // ===== FIX END =====
        setUsers(usersRes.data);
      } catch (userError) {
        console.warn(
          "Lỗi lấy danh sách Users (Có thể do Staff không có quyền):",
          userError,
        );
        setUsers([]); // Gán mảng rỗng để giao diện không bị crash
      }
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && companyId) {
      fetchData();
    }
  }, [id, companyId]);

  const handleCreateTicket = async () => {
    if (!userId) {
      message.error("User session expired. Please login again.");
      return;
    }

    if (!selectedStaffId) {
      message.warning("Please select a staff member to handle this ticket.");
      return;
    }

    try {
      setIsCreating(true);
      const payload = {
        createdBy: Number(userId),
        staffId: selectedStaffId, // Sử dụng giá trị từ Select
      };

      // 1. Gọi API tạo Inbound Ticket
      const res = await api.post(
        `/InventoryInbound/create-inbound-ticket/${id}/tickets`,
        payload,
      );

      if (res.status === 200 || res.status === 201) {
        const ticketData = res.data;

        // 2. NGAY LẬP TỨC GỌI WEBHOOK n8n ĐỂ CHẠY STORAGE RECOMMENDATION
        try {
          await api.post(
            "http://localhost:5678/webhook/storage-recommendation",
            {
              inboundTicketId: ticketData.id,
              userId: Number(userId),
              companyId: Number(companyId),
              warehouseId: ticketData.warehouseId,
            },
          );
          console.log("Đã trigger webhook n8n thành công!");
        } catch (webhookError) {
          console.error("Lỗi khi gọi n8n Webhook:", webhookError);
          message.warning(
            "Ticket created but AI recommendation trigger failed.",
          );
        }

        message.success("Inbound Ticket created & AI recommendation started!");

        // 3. Điều hướng dựa trên roleId
        const roleId = Number(localStorage.getItem("roleId"));
        const basePath =
          roleId === 2
            ? "/company-admin"
            : roleId === 4
              ? "/staff"
              : "/manager";

        navigate(`${basePath}/inbound-ticket-management`);
      }
    } catch (error) {
      console.error("Create ticket error:", error);
      message.error(error.response?.data?.message || "Failed to create ticket");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" tip="Loading Request Data..." />
      </div>
    );

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans">
      <DetailsHeader
        data={data}
        onApprove={handleCreateTicket}
        isApproving={isCreating}
      />

      <div className="mt-8 pb-20">
        <div className="flex justify-center gap-x-6">
          <div className="w-[60%] space-y-6">
            <div>
              <DetailsProductList items={data?.inboundOrderItems} />
            </div>
            <div>
              <DetailsPayment data={data} />
            </div>
          </div>

          <div className="w-[30%] space-y-6">
            <DetailsSidebarInfo
              data={data}
              users={users}
              selectedStaffId={selectedStaffId}
              onStaffChange={setSelectedStaffId}
            />
            <DetailsNotes note={data?.note} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboundTicketCreate;
