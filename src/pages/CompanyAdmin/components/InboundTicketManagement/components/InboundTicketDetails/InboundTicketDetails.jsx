import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Spin, message } from "antd";
import { useReactToPrint } from "react-to-print";
import axios from "axios"; // Import thêm axios thuần
import api from "../../../../../../api/axios";

// Components
import DetailsHeader from "../InboundTicketCreate/components/DetailsHeader/DetailsHeader";
import DetailsProductList from "../InboundTicketCreate/components/DetailsProductList/DetailsProductList";
import DetailsSidebarInfo from "../InboundTicketCreate/components/DetailsSidebarInfo/DetailsSidebarInfo";
import DetailsPayment from "../InboundTicketCreate/components/DetailsPayment/DetailsPayment";
import DetailsNotes from "../InboundTicketCreate/components/DetailsNotes/DetailsNotes";
import InboundPrintTemplate from "./components/InboundPrintTemplate/InboundPrintTemplate";

const VITE_N8N_API_URL = import.meta.env.VITE_N8N_API_URL;

const InboundTicketDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // State quản lý loading cho nút Recommendation
  const [isCreatingRec, setIsCreatingRec] = useState(false);

  const companyId = localStorage.getItem("companyId");

  // Ref dành cho bản in PDF
  const printRef = useRef(null);

  // Cấu hình hàm in PDF
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ticket_${data?.referenceCode || id}`,
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Lấy thông tin Ticket trước để có warehouseId
      const ticketRes = await api.get(
        `/InventoryInbound/tickets/${companyId}/${id}`,
      );
      const ticketData = ticketRes.data;
      setData(ticketData);

      // 2. Lấy warehouseId từ dữ liệu ticket
      const warehouseId = ticketData.warehouseId;

      if (warehouseId) {
        // 3. Gọi API lấy users dựa trên warehouseId của ticket
        const usersRes = await api.get(
          `/Users/get-users-by-warehouse/${warehouseId}`,
        );
        setUsers(usersRes.data);
      } else {
        console.warn("Warehouse ID not found in ticket data");
      }

      if (ticketData.staffId) {
        setSelectedStaffId(ticketData.staffId);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to load ticket details or staff list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && companyId) {
      fetchData();
    }
  }, [id, companyId]);

  const handleUpdateTicket = async () => {
    if (!selectedStaffId) {
      message.warning("Please select a staff member.");
      return;
    }
    try {
      setIsUpdating(true);
      const payload = { staffId: selectedStaffId };
      await api.put(`/InventoryInbound/update-ticket/${id}`, payload);
      message.success("Ticket updated successfully!");
      fetchData();
    } catch (error) {
      message.error("Failed to update ticket", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Hàm xử lý gọi Webhook n8n
  const handleCreateRecommendation = async () => {
    const userId = localStorage.getItem("userId");
    const warehouseId =
      localStorage.getItem("warehouseId") || data?.warehouseId;

    // LẤY ACCESSTOKEN TỪ LOCALSTORAGE
    const accessToken = localStorage.getItem("accessToken");

    if (!userId || !companyId || !warehouseId || !accessToken) {
      message.error(
        "Missing necessary context data (User/Company/Warehouse ID or Token).",
      );
      return;
    }

    try {
      setIsCreatingRec(true);

      const payload = {
        inboundTicketId: Number(id),
        userId: Number(userId),
        companyId: Number(companyId),
        warehouseId: Number(warehouseId),
      };

      // TRUYỀN THÊM HEADER AUTHORIZATION
      await axios.post(`${VITE_N8N_API_URL}/storage-recommendation`, payload, {
        headers: {
          "x-api-token": `Bearer ${accessToken}`,
        },
      });

      message.success("AI Recommendation process started successfully!");
    } catch (error) {
      console.error("Webhook trigger error:", error);
      message.warning(
        "Recommendation triggered, but received an error from the webhook.",
      );
    } finally {
      setIsCreatingRec(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" tip="Loading Ticket Details..." />
      </div>
    );

  if (!data) return <div className="p-10 text-center">Ticket not found.</div>;

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans">
      <DetailsHeader
        data={{ ...data, code: data.referenceCode }}
        onApprove={handleUpdateTicket}
        isApproving={isUpdating}
        onExportPDF={() => handlePrint()}
        // Truyền props mới xuống Header
        onCreateRecommendation={handleCreateRecommendation}
        isCreatingRec={isCreatingRec}
      />

      <div className="mt-8 pb-20">
        <div className="flex justify-center gap-x-6">
          <div className="w-[60%] space-y-6">
            <DetailsProductList items={data.inboundOrderItems} />
            <DetailsPayment data={data} />
          </div>

          <div className="w-[30%] space-y-6">
            <DetailsSidebarInfo
              data={data}
              users={users}
              selectedStaffId={selectedStaffId}
              onStaffChange={setSelectedStaffId}
            />
            <DetailsNotes
              note={data.note || "No notes available for this ticket."}
            />
          </div>
        </div>
      </div>

      {/* Template ẩn dành cho việc in ấn */}
      <InboundPrintTemplate ref={printRef} data={data} />
    </div>
  );
};

export default InboundTicketDetails;
