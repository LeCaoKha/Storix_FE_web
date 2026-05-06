import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Spin, message, Modal, Typography, Tag, Empty } from "antd";
import { useReactToPrint } from "react-to-print";
import { Sparkles, MapPin, Box } from "lucide-react";
import axios from "axios";
import api from "../../../../../../api/axios";

// Components
import DetailsHeader from "../InboundTicketCreate/components/DetailsHeader/DetailsHeader";
import DetailsProductList from "../InboundTicketCreate/components/DetailsProductList/DetailsProductList";
import DetailsSidebarInfo from "../InboundTicketCreate/components/DetailsSidebarInfo/DetailsSidebarInfo";
import DetailsPayment from "../InboundTicketCreate/components/DetailsPayment/DetailsPayment";
import DetailsNotes from "../InboundTicketCreate/components/DetailsNotes/DetailsNotes";
import InboundPrintTemplate from "./components/InboundPrintTemplate/InboundPrintTemplate";

const { Text, Title } = Typography;
const VITE_N8N_API_URL = import.meta.env.VITE_N8N_API_URL;

const InboundTicketDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isCreatingRec, setIsCreatingRec] = useState(false);

  // States cho View Recommendation Modal
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [loadingRec, setLoadingRec] = useState(false);
  const [recommendationData, setRecommendationData] = useState([]);

  const companyId = localStorage.getItem("companyId");
  const userId = localStorage.getItem("userId");

  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ticket_${data?.referenceCode || id}`,
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const ticketRes = await api.get(
        `/InventoryInbound/tickets/${companyId}/${id}`,
      );
      const ticketData = ticketRes.data;
      setData(ticketData);

      const warehouseId = ticketData.warehouseId;

      if (warehouseId) {
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

  const handleAssignStaff = async () => {
    if (!selectedStaffId) {
      message.warning("Please select a staff member before assigning.");
      return;
    }

    if (!userId || !companyId) {
      message.error("Missing User ID or Company ID. Please log in again.");
      return;
    }

    try {
      setIsAssigning(true);
      const payload = {
        companyId: Number(companyId),
        managerId: Number(userId),
        staffId: Number(selectedStaffId),
      };

      await api.post(`/InventoryInbound/tickets/${id}/assign-staff`, payload);
      message.success("Staff assigned successfully!");
      fetchData();
    } catch (error) {
      console.error("Assign error:", error);
      message.error(error.response?.data?.message || "Failed to assign staff");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreateRecommendation = async () => {
    const warehouseId =
      localStorage.getItem("warehouseId") || data?.warehouseId;
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

      await axios.post(`${VITE_N8N_API_URL}/storage-recommendation`, payload, {
        headers: {
          "x-api-token": `Bearer ${accessToken}`,
        },
      });

      message.success("AI Recommendation process started successfully!");
    } catch (error) {
      console.error("Webhook trigger error:", error);
      const aiErrorMessage =
        error.response?.data?.message ||
        "Recommendation triggered, but received an error from the webhook.";

      message.warning({
        content: `${aiErrorMessage}`,
        duration: 5,
      });
    } finally {
      setIsCreatingRec(false);
    }
  };

  // ===== HÀM MỞ MODAL VÀ GỌI API LẤY RECOMMENDATION =====
  const handleViewRecommendation = async () => {
    setIsRecModalOpen(true);
    setLoadingRec(true);
    try {
      // Gọi API lấy dữ liệu recommendation
      const response = await api.get(
        `/InventoryInbound/get-inbound-orders/${id}/storage-recommendations`,
      );
      setRecommendationData(response.data || []);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      message.error("Could not load AI recommendations for this ticket.");
    } finally {
      setLoadingRec(false);
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
        onCreateRecommendation={handleCreateRecommendation}
        isCreatingRec={isCreatingRec}
        onAssign={handleAssignStaff}
        isAssigning={isAssigning}
        onViewRecommendation={handleViewRecommendation} // Truyền prop mới
      />

      <div className="mt-8 pb-20">
        <div className="flex justify-center gap-x-6">
          <div className="w-[60%] space-y-6">
            <div>
              <DetailsProductList items={data.inboundOrderItems} />
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
              ticketStatus={data.status}
            />
            <DetailsNotes
              note={data.note || "No notes available for this ticket."}
            />
          </div>
        </div>
      </div>

      <InboundPrintTemplate ref={printRef} data={data} />

      {/* ================================================== */}
      {/* MODAL HIỂN THỊ KẾT QUẢ AI RECOMMENDATION */}
      {/* ================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-indigo-700">
            <Sparkles size={20} />
            <span className="font-extrabold text-lg">
              AI Storage Recommendation
            </span>
          </div>
        }
        open={isRecModalOpen}
        onCancel={() => setIsRecModalOpen(false)}
        footer={null}
        width={750}
        centered
        className="custom-ai-result-modal"
      >
        <div className="min-h-[250px] mt-4">
          {loadingRec ? (
            <div className="flex flex-col justify-center items-center h-[200px] gap-3">
              <Spin size="large" />
              <Text className="text-slate-400">Loading AI insights...</Text>
            </div>
          ) : recommendationData.length === 0 ? (
            <Empty
              description="No products found in this ticket."
              className="mt-10"
            />
          ) : (
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {recommendationData.map((item, idx) => {
                const hasRecommendations =
                  item.storageRecommendations &&
                  item.storageRecommendations.length > 0;

                return (
                  <div
                    key={item.inboundOrderItemId || idx}
                    className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm"
                  >
                    {/* Header Item */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                        <Box size={20} />
                      </div>
                      <div className="flex-1">
                        <Title level={5} className="!mb-0 !text-slate-800">
                          {item.name || "Unknown Product"}
                        </Title>
                        <Text className="text-slate-400 text-sm font-mono">
                          SKU: {item.sku || "N/A"}
                        </Text>
                      </div>
                    </div>

                    {/* Logic hiển thị List Recommendation hoặc Empty */}
                    {!hasRecommendations ? (
                      <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                        <Text className="text-slate-500 italic">
                          No storage recommendations available for this item
                          yet.
                        </Text>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {item.storageRecommendations.map((rec) => (
                          <div
                            key={rec.id}
                            className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl"
                          >
                            {/* Layout Hàng đầu: Đường dẫn và Số lượng */}
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                                <MapPin size={16} />
                                <span>{rec.path}</span>
                              </div>
                              <Tag color="indigo" className="!m-0 !font-bold">
                                Qty: {rec.quantity}
                              </Tag>
                            </div>

                            {/* Distance */}
                            <div className="text-xs font-medium text-slate-500 mb-3 ml-6">
                              Distance: {rec.distanceInfo} units
                            </div>

                            {/* AI Reasoning */}
                            <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                              <div className="flex gap-2">
                                <Sparkles
                                  size={16}
                                  className="text-amber-500 shrink-0 mt-0.5"
                                />
                                <Text className="text-sm text-slate-700 leading-relaxed italic">
                                  "{rec.reason}"
                                </Text>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* CSS Tùy chỉnh cho Scrollbar và Modal */}
      <style jsx global>{`
        .custom-ai-result-modal .ant-modal-content {
          border-radius: 20px !important;
          padding: 24px !important;
        }
        .custom-ai-result-modal .ant-modal-header {
          margin-bottom: 16px;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default InboundTicketDetails;
