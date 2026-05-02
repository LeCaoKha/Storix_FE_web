import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, message, Modal, Typography } from "antd"; // Thêm Modal và Typography
import { Sparkles, Loader2 } from "lucide-react"; // Thêm icon cho Modal
import api from "../../../../../../api/axios";
import DetailsHeader from "./components/DetailsHeader/DetailsHeader";
import DetailsProductList from "./components/DetailsProductList/DetailsProductList";
import DetailsSidebarInfo from "./components/DetailsSidebarInfo/DetailsSidebarInfo";
import DetailsPayment from "./components/DetailsPayment/DetailsPayment";
import DetailsNotes from "./components/DetailsNotes/DetailsNotes";

const { Text, Title } = Typography;

const InboundTicketCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [loading, setLoading] = useState(true);

  // State cho việc submit ticket nói chung
  const [isCreating, setIsCreating] = useState(false);

  // State quản lý lựa chọn AI
  const [useAiRecommendation, setUseAiRecommendation] = useState(false);

  // ===== THÊM MỚI: States cho AI Confirmation Modal =====
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const companyId = localStorage.getItem("companyId");
  const userId = localStorage.getItem("userId");
  const warehouseId = localStorage.getItem("warehouseId");

  const VITE_N8N_API_URL = import.meta.env.VITE_N8N_API_URL;

  const fetchData = async () => {
    try {
      setLoading(true);

      const requestRes = await api.get(
        `/InventoryInbound/requests/${companyId}/${id}`,
      );
      setData(requestRes.data);

      try {
        const usersRes = await api.get(
          `/Users/get-users-by-warehouse/${warehouseId}`,
        );
        setUsers(usersRes.data);
      } catch (userError) {
        console.warn(
          "Lỗi lấy danh sách Users (Có thể do Staff không có quyền):",
          userError,
        );
        setUsers([]);
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

  // Hàm xử lý chung khi người dùng bấm nút ở Header
  const handleInitiateTicketCreation = () => {
    if (!userId) {
      message.error("User session expired. Please login again.");
      return;
    }

    if (!selectedStaffId) {
      message.warning("Please select a staff member to handle this ticket.");
      return;
    }

    // Nếu CÓ dùng AI -> Mở Modal xác nhận trước
    if (useAiRecommendation) {
      setIsConfirmModalOpen(true);
    } else {
      // Nếu KHÔNG dùng AI -> Chạy thẳng hàm tạo ticket
      executeTicketCreation();
    }
  };

  // Hàm thực thi tạo ticket (Được gọi thẳng hoặc sau khi Confirm Modal)
  const executeTicketCreation = async () => {
    try {
      // Bật trạng thái loading tương ứng
      if (useAiRecommendation) {
        setIsAiProcessing(true);
      } else {
        setIsCreating(true);
      }

      const payload = {
        createdBy: Number(userId),
        staffId: selectedStaffId,
      };

      // 1. Gọi API tạo Inbound Ticket bình thường
      const res = await api.post(
        `/InventoryInbound/create-inbound-ticket/${id}/tickets`,
        payload,
      );

      if (res.status === 200 || res.status === 201) {
        const ticketData = res.data;

        // 2. NẾU USER BẬT AI -> GỌI N8N WEBHOOK
        if (useAiRecommendation) {
          try {
            const token = localStorage.getItem("token");

            await api.post(
              `${VITE_N8N_API_URL}/storage-recommendation`,
              {
                inboundTicketId: ticketData.id,
                userId: Number(userId),
                companyId: Number(companyId),
                warehouseId: ticketData.warehouseId,
              },
              {
                // THÊM MỚI: Truyền custom header để n8n Cloud không bị redact (che dấu)
                headers: {
                  "x-api-token": `Bearer ${token}`,
                },
              },
            );
            console.log("Đã trigger webhook n8n thành công!");
            message.success(
              "Inbound Ticket created & AI recommendation successfully generated!",
            );
          } catch (webhookError) {
            console.error("Lỗi khi gọi n8n Webhook:", webhookError);
            message.warning(
              "Ticket created but AI recommendation trigger failed due to server timeout or error.",
            );
          }
        } else {
          // NẾU KHÔNG BẬT AI
          message.success("Inbound Ticket created successfully!");
        }

        // 3. Điều hướng
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
      // Đóng modal nếu có lỗi để user thao tác lại
      setIsConfirmModalOpen(false);
    } finally {
      setIsCreating(false);
      setIsAiProcessing(false);
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
        // Truyền hàm Initiate thay vì gọi thẳng API
        onApprove={handleInitiateTicketCreation}
        isApproving={isCreating}
        useAi={useAiRecommendation}
        onToggleAi={setUseAiRecommendation}
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

      {/* ========================================== */}
      {/* MODAL XÁC NHẬN KHI DÙNG AI RECOMMENDATION  */}
      {/* ========================================== */}
      <Modal
        open={isConfirmModalOpen}
        closable={!isAiProcessing} // Không cho đóng khi đang process
        maskClosable={!isAiProcessing}
        footer={null}
        centered
        className="custom-ai-modal"
        onCancel={() => setIsConfirmModalOpen(false)}
      >
        <div className="flex flex-col items-center text-center py-6 px-4">
          {isAiProcessing ? (
            // TRẠNG THÁI 2: ĐANG XỬ LÝ (SPINNING)
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mb-6 relative">
                {/* Vòng xoay bên ngoài */}
                <div className="absolute inset-0 border-4 border-transparent border-t-[#7C3AED] rounded-full animate-spin"></div>
                {/* Icon ở giữa */}
                <Sparkles className="text-[#7C3AED] animate-pulse" size={32} />
              </div>
              <Title level={3} className="!text-[#7C3AED] !mb-2 !font-black">
                AI is processing...
              </Title>
              <Text className="text-slate-500 text-base max-w-[300px]">
                We are generating the optimal storage plan for your inbound
                items. This might take a few moments.
              </Text>
            </div>
          ) : (
            // TRẠNG THÁI 1: XÁC NHẬN (CONFIRM)
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mb-5">
                <Sparkles className="text-[#7C3AED]" size={28} />
              </div>
              <Title
                level={3}
                className="!text-slate-800 !mb-2 !font-extrabold"
              >
                Start AI Recommendation?
              </Title>
              <Text className="text-slate-500 text-base mb-8 max-w-[350px]">
                The AI will analyze warehouse capacity and environmental rules
                to suggest the best bins. <br />
                <span className="font-bold text-amber-600 mt-2 block">
                  Please note: This process may take 10-20 seconds.
                </span>
              </Text>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeTicketCreation}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] transition-colors shadow-lg shadow-[#7C3AED]/30 flex justify-center items-center gap-2"
                >
                  <Sparkles size={18} /> Yes, Proceed
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* CSS Tùy chỉnh cho Modal AI */}
      <style jsx global>{`
        .custom-ai-modal .ant-modal-content {
          border-radius: 24px !important;
          padding: 24px !important;
          border: 1px solid #ede9fe; /* Màu viền tím nhạt */
        }
      `}</style>
    </div>
  );
};

export default InboundTicketCreate;
