import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, message, Card, Typography, Input } from "antd";
import api from "../../../../../../api/axios";

// Đảm bảo bạn import đúng các components dùng chung cho Outbound
import DetailsHeader from "./components/DetailsHeader";
import DetailsProductList from "./components/DetailsProductList";
import DetailsSidebarInfo from "./components/DetailsSidebarInfo";
import DetailsPayment from "./components/DetailsPayment";
// ĐÃ XÓA: import DetailsNotes vì không còn dùng nữa

const { Text } = Typography;
const { TextArea } = Input;

const OutboundTicketCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  // Payload data cho Ticket Note
  const [ticketNote, setTicketNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const companyId = localStorage.getItem("companyId");
  const userId = localStorage.getItem("userId");

  // Xác định base path để điều hướng sau khi tạo xong
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

      // TỰ ĐỘNG ĐIỀN LÝ DO GỐC (ORIGINAL REASON) VÀO TICKET NOTE
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

  const handleCreateTicket = async () => {
    if (!userId) {
      message.error("User session expired. Please login again.");
      return;
    }

    if (!selectedStaffId) {
      message.warning("Please assign a staff member to handle this ticket.");
      return;
    }

    try {
      setIsCreating(true);
      const payload = {
        createdBy: Number(userId),
        staffId: selectedStaffId,
        note: ticketNote || "Outbound ticket generated from request.",
        // Fix cứng phương pháp xuất kho là Giá Đích Danh
        pricingMethod: "SpecificIdentification",
      };

      const res = await api.post(
        `/InventoryOutbound/create-outbound-ticket/${id}/tickets`,
        payload,
      );

      if (res.status === 200 || res.status === 201) {
        message.success("Outbound Ticket created successfully!");
        navigate(`${getBasePath()}/outbound-ticket-management`);
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
        <Spin size="large" tip="Loading Outbound Request Data..." />
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
          {/* CỘT TRÁI: Sản phẩm & Thanh toán */}
          <div className="w-[60%] space-y-6">
            <div>
              <DetailsProductList items={data?.items} />
            </div>
            <div>
              <DetailsPayment data={data} />
            </div>
          </div>

          {/* CỘT PHẢI: Thông tin phiếu & Form tạo Ticket */}
          <div className="w-[30%] space-y-6">
            {/* Component chọn Staff */}
            <DetailsSidebarInfo
              data={data}
              selectedStaffId={selectedStaffId}
              onStaffChange={setSelectedStaffId}
            />

            {/* FORM TICKET NOTE MỚI GỘP */}
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

            {/* Đã xóa component <DetailsNotes note={data?.reason} /> ở đây */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutboundTicketCreate;
