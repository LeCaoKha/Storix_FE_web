import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Spin, message, Card, Typography, Input, Modal, Tag } from "antd";
import { useReactToPrint } from "react-to-print";
import { MapPinned, Box, Navigation } from "lucide-react";
import api from "../../../../../../api/axios";
import axios from "axios";

import DetailsHeader from "./components/DetailsHeader";
import DetailsProductList from "./components/DetailsProductList";
import DetailsSidebarInfo from "./components/DetailsSidebarInfo";
import DetailsPayment from "./components/DetailsPayment";
import OutboundPrintTemplate from "./components/OutboundPrintTemplate";

const { Text, Title } = Typography;
const { TextArea } = Input;
const VITE_N8N_API_URL = import.meta.env.VITE_N8N_API_URL;

// ==========================================
// COMPONENT VẼ BẢN ĐỒ KHO BẰNG SVG (ĐÃ FIX LỖI TỌA ĐỘ)
// ==========================================
const PathMapVisualizer = ({ structure, pathData }) => {
  if (!structure || !pathData || !pathData.payload?.[0]) return null;

  const { width: viewWidth, height: viewHeight, zones, nodes } = structure;
  const payload = pathData.payload[0];
  const optimizedPathIds = payload.fullOptimizedPath || [];

  // Lấy các Shelf Code cần lấy hàng để tô màu đánh dấu (highlight)
  const targetShelfCodes =
    payload.itemsToPick?.flatMap((item) =>
      item.locationData?.availableShelves?.map((s) => s.shelfCode),
    ) || [];

  // -------------------------------------------------------------
  // TÍNH TỌA ĐỘ TUYỆT ĐỐI ĐỂ SỬA LỖI ĐƯỜNG XÉO
  // -------------------------------------------------------------
  const absoluteNodesMap = new Map();

  // 1. Đưa các Navigational Nodes vào (bọn này đã là tọa độ tuyệt đối chuẩn)
  (nodes || []).forEach((n) => {
    absoluteNodesMap.set(n.id, { x: n.x, y: n.y });
  });

  // 2. Duyệt qua các Zone -> Shelves -> Access Nodes để tính tọa độ thực tế
  (zones || []).forEach((zone) => {
    (zone.shelves || []).forEach((shelf) => {
      (shelf.accessNodes || []).forEach((acc) => {
        // Cộng tọa độ gốc của Zone với tọa độ tương đối của Access Node
        absoluteNodesMap.set(acc.id, {
          x: zone.x + acc.x,
          y: zone.y + acc.y,
        });
      });
    });
  });

  // Tạo chuỗi tọa độ cho Polyline sử dụng bản đồ tọa độ tuyệt đối vừa tính
  const pathPoints = optimizedPathIds
    .map((id) => absoluteNodesMap.get(id))
    .filter(Boolean)
    .map((n) => `${n.x},${n.y}`)
    .join(" ");

  return (
    <div className="w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="w-full h-auto drop-shadow-sm"
        style={{ maxHeight: "60vh" }}
      >
        {/* Render Zones */}
        {zones.map((zone) => (
          <g key={zone.id}>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height} // Zone thường định nghĩa theo width/height mặt bằng
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="5,5"
              rx="8"
            />
            <text
              x={zone.x + 10}
              y={zone.y + 25}
              fontSize="20"
              fill="#64748b"
              fontWeight="bold"
            >
              {zone.code}
            </text>

            {/* Render Shelves inside Zone */}
            {zone.shelves?.map((shelf) => {
              const isTarget = targetShelfCodes.includes(shelf.code);
              return (
                <g key={shelf.id}>
                  <rect
                    x={zone.x + shelf.x}
                    y={zone.y + shelf.y}
                    width={shelf.width}
                    height={shelf.length} // SỬA ĐÚNG LOGIC: Chiều dọc SVG = shelf.length
                    fill={isTarget ? "#fce7f3" : "#e2e8f0"}
                    stroke={isTarget ? "#db2777" : "#94a3b8"}
                    strokeWidth="2"
                    rx="4"
                  />
                  <text
                    x={zone.x + shelf.x + shelf.width / 2}
                    y={zone.y + shelf.y + shelf.length / 2 + 5} // Căn giữa theo shelf.length
                    fontSize="16"
                    fill={isTarget ? "#db2777" : "#475569"}
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {shelf.code}
                  </text>
                </g>
              );
            })}
          </g>
        ))}

        {/* Render Optimized Path (Đường đi) */}
        {pathPoints && (
          <polyline
            points={pathPoints}
            fill="none"
            stroke="#db2777" // Màu hồng nổi bật
            strokeWidth="6"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="drop-shadow-md animate-pulse"
          />
        )}

        {/* Render Start and End Points */}
        {optimizedPathIds.length > 0 && (
          <>
            <circle
              cx={absoluteNodesMap.get(optimizedPathIds[0])?.x}
              cy={absoluteNodesMap.get(optimizedPathIds[0])?.y}
              r="12"
              fill="#22c55e" // Điểm bắt đầu (Màu xanh)
            />
            <circle
              cx={
                absoluteNodesMap.get(
                  optimizedPathIds[optimizedPathIds.length - 1],
                )?.x
              }
              cy={
                absoluteNodesMap.get(
                  optimizedPathIds[optimizedPathIds.length - 1],
                )?.y
              }
              r="12"
              fill="#ef4444" // Điểm kết thúc (Màu đỏ)
            />
          </>
        )}
      </svg>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const OutboundTicketDetails = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [ticketNote, setTicketNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingPath, setIsCreatingPath] = useState(false);

  // States cho View Path Modal
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [loadingPath, setLoadingPath] = useState(false);
  const [warehouseStructure, setWarehouseStructure] = useState(null);
  const [pathData, setPathData] = useState(null);

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
    const accessToken = localStorage.getItem("accessToken");

    if (!userId || !companyId || !warehouseId || !accessToken) {
      message.error("Missing context data.");
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

      await axios.post(`${VITE_N8N_API_URL}/path-optimization`, payload, {
        headers: { "x-api-token": `Bearer ${accessToken}` },
      });

      message.success("Path optimization process started successfully!");
    } catch (error) {
      console.error("Webhook trigger error:", error);
      message.warning("Path optimization triggered, but received an error.");
    } finally {
      setIsCreatingPath(false);
    }
  };

  // ===== HÀM MỞ MODAL XEM BẢN ĐỒ DI CHUYỂN =====
  const handleViewPath = async () => {
    const warehouseId =
      data?.warehouseId || localStorage.getItem("warehouseId");

    if (!companyId || !warehouseId || !id) {
      message.error("Missing required data to fetch path.");
      return;
    }

    setIsPathModalOpen(true);
    setLoadingPath(true);

    try {
      // Chạy 2 API đồng thời
      const [structureRes, pathRes] = await Promise.all([
        api.get(`/get-warehouse-structure/${companyId}/${warehouseId}`),
        api.get(`/InventoryOutbound/tickets/${id}/path-optimization`),
      ]);

      setWarehouseStructure(structureRes.data);
      setPathData(pathRes.data);
    } catch (error) {
      console.error("Failed to load path data:", error);
      message.error("Path has not been created yet or failed to load data.");
      setIsPathModalOpen(false); // Tự động đóng modal nếu lỗi
    } finally {
      setLoadingPath(false);
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
        onViewPath={handleViewPath} // Truyền hàm xuống Header
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

      {/* ================================================== */}
      {/* MODAL HIỂN THỊ PATH OPTIMIZATION (BẢN ĐỒ & CHI TIẾT) */}
      {/* ================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-pink-600">
            <MapPinned size={22} />
            <span className="font-extrabold text-xl">
              Optimized Picking Route
            </span>
          </div>
        }
        open={isPathModalOpen}
        onCancel={() => setIsPathModalOpen(false)}
        footer={null}
        width={1100} // Modal rộng hơn để nhét đủ bản đồ
        centered
        className="custom-path-modal"
      >
        <div className="min-h-[400px] mt-4">
          {loadingPath ? (
            <div className="flex flex-col justify-center items-center h-[300px] gap-3">
              <Spin size="large" />
              <Text className="text-slate-400">
                Rendering optimized path...
              </Text>
            </div>
          ) : !pathData?.payload?.[0] ? (
            <div className="p-10 text-center text-slate-500 italic">
              No optimized path data found. Please click "Create Path" first.
            </div>
          ) : (
            <div className="flex gap-6">
              {/* CỘT TRÁI: BẢN ĐỒ (65%) */}
              <div className="w-[65%]">
                <PathMapVisualizer
                  structure={warehouseStructure}
                  pathData={pathData}
                />

                {/* Chú thích màu sắc (Legend) */}
                <div className="flex gap-4 justify-center mt-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>{" "}
                    Start
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div> End
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-3 bg-pink-100 border border-pink-500 rounded-sm"></div>{" "}
                    Target Shelf
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: SUMMARY VÀ DANH SÁCH LẤY HÀNG (35%) */}
              <div className="w-[35%] flex flex-col gap-4">
                <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-pink-600 mb-2">
                    <Navigation size={18} />
                    <span className="font-bold">Path Summary</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <Text className="text-slate-400 text-xs uppercase font-bold">
                        Total Distance
                      </Text>
                      <div className="text-lg font-black text-slate-700">
                        {pathData.payload[0].summary?.totalDistance}{" "}
                        <span className="text-xs font-normal">units</span>
                      </div>
                    </div>
                    <div>
                      <Text className="text-slate-400 text-xs uppercase font-bold">
                        Shelves Visited
                      </Text>
                      <div className="text-lg font-black text-slate-700">
                        {pathData.payload[0].summary?.totalShelvesPicked}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                  <div className="bg-slate-50 py-3 px-4 border-b border-slate-200">
                    <Text className="font-bold text-slate-700">
                      Pick List Details
                    </Text>
                  </div>
                  <div className="p-4 space-y-4 overflow-y-auto max-h-[40vh] custom-scrollbar">
                    {pathData.payload[0].itemsToPick?.map((item) => (
                      <div
                        key={item.id}
                        className="pb-3 border-b border-slate-100 last:border-0 last:pb-0"
                      >
                        <Text className="font-bold text-slate-800 block leading-tight mb-1">
                          {item.productName}
                        </Text>
                        <Text className="text-xs text-slate-400 font-mono block mb-2">
                          SKU: {item.productSku}
                        </Text>

                        {item.locationData?.rawFifoSuggestions?.map(
                          (loc, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg mt-1"
                            >
                              <div className="flex items-center gap-2">
                                <Box size={14} className="text-pink-500" />
                                <Text className="text-sm font-semibold text-slate-600">
                                  {loc.shelfCode}{" "}
                                  <span className="font-normal text-slate-400">
                                    ({loc.binCode})
                                  </span>
                                </Text>
                              </div>
                              <Tag color="pink" className="!m-0 !font-bold">
                                Qty: {loc.suggestedPickQty}
                              </Tag>
                            </div>
                          ),
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <div style={{ display: "none" }}>
        <OutboundPrintTemplate ref={printRef} data={data} />
      </div>

      <style jsx global>{`
        .custom-path-modal .ant-modal-content {
          border-radius: 20px !important;
          padding: 24px !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
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

export default OutboundTicketDetails;
