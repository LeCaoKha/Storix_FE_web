import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, message, Card, Typography, Input, Modal } from "antd";
import { Route } from "lucide-react";
import api from "../../../../../../api/axios";
import axios from "axios";

import DetailsHeader from "./components/DetailsHeader";
import DetailsProductList from "./components/DetailsProductList";
import DetailsSidebarInfo from "./components/DetailsSidebarInfo";
import DetailsPayment from "./components/DetailsPayment";

const { Text, Title } = Typography;
const { TextArea } = Input;

const VITE_N8N_API_URL = import.meta.env.VITE_N8N_API_URL;

const OutboundTicketCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [ticketNote, setTicketNote] = useState("");

  const [loading, setLoading] = useState(true);

  // ===== ĐÃ SỬA: State quản lý AI Path Optimization bắt buộc =====
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const companyId = localStorage.getItem("companyId");
  const userId = localStorage.getItem("userId");
  const warehouseId = localStorage.getItem("warehouseId");

  const roleId = Number(localStorage.getItem("roleId"));
  const getBasePath = () => {
    if (roleId === 2) return "/company-admin";
    if (roleId === 4) return "/staff";
    return "/manager";
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const requestRes = await api.get(
        `/InventoryOutbound/requests/${companyId}/${id}`,
      );

      const requestData = requestRes.data;
      setData(requestData);

      if (requestData.reason) {
        setTicketNote(requestData.reason);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to load request data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && companyId) {
      fetchData();
    }
  }, [id, companyId]);

  // Hàm xử lý chung khi người dùng bấm nút Confirm ở Header
  const handleInitiateTicketCreation = () => {
    if (!userId) {
      message.error("User session expired. Please login again.");
      return;
    }

    if (!selectedStaffId) {
      message.warning("Please assign a staff member to handle this ticket.");
      return;
    }

    // Gọi thẳng hàm tạo ticket và tối ưu đường đi
    executeTicketCreation();
  };

  // Hàm thực thi việc tạo ticket và webhook
  const executeTicketCreation = async () => {
    try {
      // Bật modal xoay vòng AI
      setIsAiProcessing(true);

      const payload = {
        createdBy: Number(userId),
        staffId: selectedStaffId,
        note: ticketNote || "Outbound ticket generated from request.",
        pricingMethod: "SpecificIdentification",
      };

      // 1. GỌI API TẠO TICKET CHÍNH
      const res = await api.post(
        `/InventoryOutbound/create-outbound-ticket/${id}/tickets`,
        payload,
      );

      if (res.status === 200 || res.status === 201) {
        const ticketData = res.data;
        const ticketId = ticketData.id;

        // 2. BẮT BUỘC GỌI API PATH OPTIMIZATION (n8n)
        try {
          const token = localStorage.getItem("accessToken");

          await axios.post(
            `${VITE_N8N_API_URL}/path-optimization`,
            {
              outboundTicketId: Number(ticketId),
              userId: Number(userId),
              companyId: Number(companyId),
              warehouseId: Number(warehouseId),
            },
            {
              headers: {
                "x-api-token": `Bearer ${token}`,
              },
            },
          );
          message.success(
            "Outbound Ticket created & Path optimized successfully!",
          );
        } catch (optError) {
          console.error("Path optimization error:", optError);
          const aiErrorMessage =
            optError.response?.data?.message ||
            "AI Path Optimization failed due to server error.";
          message.warning({
            content: `Ticket created, but ${aiErrorMessage}`,
            duration: 5,
          });
        }

        // 3. ĐIỀU HƯỚNG VỀ TRANG QUẢN LÝ
        navigate(`${getBasePath()}/outbound-ticket-management`);
      }
    } catch (error) {
      console.error("Create ticket error:", error);
      message.error(error.response?.data?.message || "Failed to create ticket");
    } finally {
      setIsAiProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" tip="Loading Outbound Request Data..." />
      </div>
    );

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans">
      <DetailsHeader
        data={data}
        onApprove={handleInitiateTicketCreation}
        isApproving={isAiProcessing} // Chặn nút bấm nếu đang xử lý
      />

      <div className="mt-8 pb-20">
        <div className="flex justify-center gap-x-6">
          <div className="w-[60%] space-y-6">
            <div>
              <DetailsProductList items={data?.items} />
            </div>
            <div>
              <DetailsPayment data={data} />
            </div>
          </div>

          <div className="w-[30%] space-y-6">
            <div>
              <DetailsSidebarInfo
                data={data}
                selectedStaffId={selectedStaffId}
                onStaffChange={setSelectedStaffId}
              />
            </div>

            <div>
              <Card className="!rounded-2xl !shadow-sm !border-slate-100">
                <Text className="font-bold text-lg text-slate-800 mb-4 block">
                  Ticket Configuration
                </Text>

                <div>
                  <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest">
                    Ticket Note / Instructions
                  </Text>
                  <TextArea
                    rows={5}
                    placeholder="Enter instructions for warehouse staff..."
                    value={ticketNote}
                    onChange={(e) => setTicketNote(e.target.value)}
                    className="!rounded-xl !bg-slate-50 !border-none !p-4 transition-all focus:!bg-white focus:!ring-2 focus:!ring-[#39c6c6]/20"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL SPINNER CHO PATH OPTIMIZATION (Rút gọn) */}
      {/* ========================================== */}
      <Modal
        open={isAiProcessing}
        closable={false}
        maskClosable={false}
        footer={null}
        centered
        className="custom-ai-modal"
      >
        <div className="flex flex-col items-center text-center py-6 px-4 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-full bg-[#f59e0b]/10 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 border-4 border-transparent border-t-[#f59e0b] rounded-full animate-spin"></div>
            <Route className="text-[#f59e0b] animate-pulse" size={32} />
          </div>
          <Title level={3} className="!text-[#f59e0b] !mb-2 !font-black">
            Optimizing Route...
          </Title>
          <Text className="text-slate-500 text-base max-w-[300px]">
            The AI is calculating the shortest path for staff to pick up all
            items. This might take a few moments.
          </Text>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-ai-modal .ant-modal-content {
          border-radius: 24px !important;
          padding: 24px !important;
          border: 1px solid #fef3c7; /* Màu viền cam/vàng nhạt */
        }
      `}</style>
    </div>
  );
};

export default OutboundTicketCreate;
