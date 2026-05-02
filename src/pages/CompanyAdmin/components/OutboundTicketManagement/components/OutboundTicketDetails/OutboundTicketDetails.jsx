import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Spin, message, Card, Typography, Input } from "antd";
import { useReactToPrint } from "react-to-print";
import api from "../../../../../../api/axios";

import DetailsHeader from "./components/DetailsHeader";
import DetailsProductList from "./components/DetailsProductList";
import DetailsSidebarInfo from "./components/DetailsSidebarInfo";
import DetailsPayment from "./components/DetailsPayment";
import OutboundPrintTemplate from "./components/OutboundPrintTemplate";

const { Text } = Typography;
const { TextArea } = Input;
const VITE_N8N_API_URL = import.meta.env.VITE_N8N_API_URL;

const OutboundTicketDetails = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [ticketNote, setTicketNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingPath, setIsCreatingPath] = useState(false);

  const companyId = localStorage.getItem("companyId");
  const userId = localStorage.getItem("userId");
  const roleId = Number(localStorage.getItem("roleId"));

  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `OutboundTicket_OUT-${id}`,
  });

  const fetchData = async () => {
    if (!companyId || !id) {
      message.error("Missing Company ID or Ticket ID.");
      return;
    }

    try {
      setLoading(true);
      const ticketRes = await api.get(
        `/InventoryOutbound/tickets/${companyId}/${id}`,
      );
      const ticketData = ticketRes.data;

      setData(ticketData);

      if (ticketData.note) {
        setTicketNote(ticketData.note);
      }
      if (ticketData.staffId) {
        setSelectedStaffId(ticketData.staffId);
      }

      const warehouseId = ticketData.warehouseId;
      if (warehouseId) {
        const usersRes = await api.get(
          `/Users/get-users-by-warehouse/${warehouseId}`,
        );
        setUsers(usersRes.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to load outbound ticket details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, companyId]);

  const handleUpdateTicket = async () => {
    if (!selectedStaffId) {
      message.warning("Please select a staff member.");
      return;
    }

    try {
      setIsUpdating(true);
      const payload = {
        staffId: selectedStaffId,
        note: ticketNote,
      };

      await api.put(`/InventoryOutbound/update-ticket/${id}`, payload);
      message.success("Ticket updated successfully!");
      fetchData();
    } catch (error) {
      console.error("Update ticket error:", error);
      message.error("Failed to update ticket");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreatePath = async () => {
    const warehouseId =
      data?.warehouseId || localStorage.getItem("warehouseId");
    const token = localStorage.getItem("token");

    if (!userId || !companyId || !warehouseId) {
      message.error("Missing context data (User/Company/Warehouse ID).");
      return;
    }

    try {
      setIsCreatingPath(true);
      const payload = {
        outboundTicketId: Number(id),
        userId: Number(userId),
        companyId: Number(companyId),
        warehouseId: Number(warehouseId),
      };

      await api.post(`${VITE_N8N_API_URL}/webhook/path-optimization`, payload, {
        headers: {
          "x-api-token": `Bearer ${token}`,
        },
      });
      message.success("Path optimization process started successfully!");
    } catch (error) {
      console.error("Webhook trigger error:", error);
      message.warning(
        "Path optimization triggered, but received an error from the webhook.",
      );
    } finally {
      setIsCreatingPath(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" tip="Loading Outbound Ticket Details..." />
      </div>
    );

  if (!data) return <div className="p-10 text-center">Ticket not found.</div>;

  const isCompleted = data.status === "Completed";
  const isReadOnly = isCompleted || roleId === 4;

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans">
      <DetailsHeader
        data={{ ...data, code: `OUT-${data.id}` }}
        onApprove={handleUpdateTicket}
        isApproving={isUpdating}
        onExportPDF={() => handlePrint()}
        onCreatePath={handleCreatePath}
        isCreatingPath={isCreatingPath}
      />

      <div className="mt-8 pb-20">
        <div className="flex justify-center gap-x-6">
          <div className="w-[60%] space-y-6">
            <div>
              <DetailsProductList items={data.items} />
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

            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <Text className="font-bold text-lg text-slate-800 mb-4 block">
                Ticket Notes
              </Text>
              <div>
                <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest">
                  Instructions for Staff
                </Text>
                <TextArea
                  rows={5}
                  placeholder="No notes available..."
                  value={ticketNote}
                  onChange={(e) => setTicketNote(e.target.value)}
                  disabled={isReadOnly}
                  className={`!rounded-xl !border-none !p-4 transition-all ${
                    isReadOnly
                      ? "!bg-slate-100 !text-slate-500 !cursor-not-allowed"
                      : "!bg-slate-50 focus:!bg-white focus:!ring-2 focus:!ring-[#39c6c6]/20"
                  }`}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div style={{ display: "none" }}>
        <OutboundPrintTemplate ref={printRef} data={data} />
      </div>
    </div>
  );
};

export default OutboundTicketDetails;
