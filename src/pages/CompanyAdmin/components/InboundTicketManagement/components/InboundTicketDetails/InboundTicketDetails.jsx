import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Spin, message } from "antd";
import { useReactToPrint } from "react-to-print"; // Import thư viện in
import api from "../../../../../../api/axios";

// Components
import DetailsHeader from "../InboundTicketCreate/components/DetailsHeader/DetailsHeader";
import DetailsProductList from "../InboundTicketCreate/components/DetailsProductList/DetailsProductList";
import DetailsSidebarInfo from "../InboundTicketCreate/components/DetailsSidebarInfo/DetailsSidebarInfo";
import DetailsPayment from "../InboundTicketCreate/components/DetailsPayment/DetailsPayment";
import DetailsNotes from "../InboundTicketCreate/components/DetailsNotes/DetailsNotes";
import InboundPrintTemplate from "./components/InboundPrintTemplate/InboundPrintTemplate"; // Import Template in

const InboundTicketDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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
      const [ticketRes, usersRes] = await Promise.all([
        api.get(`/InventoryInbound/tickets/${companyId}/${id}`),
        api.get(`/Users`),
      ]);

      const ticketData = ticketRes.data;
      setData(ticketData);
      setUsers(usersRes.data);

      if (ticketData.staffId) {
        setSelectedStaffId(ticketData.staffId);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to load ticket details");
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
      message.error("Failed to update ticket");
    } finally {
      setIsUpdating(false);
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
        onExportPDF={() => handlePrint()} // Truyền hàm in vào Header
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
